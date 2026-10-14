```javascript
document.addEventListener("DOMContentLoaded", async function () {
    const message = document.getElementById("message");

    // Check Supabase connection
    if (typeof supabaseClient === "undefined") {
        alert("Supabase connection missing. Check supabase.js.");
        return;
    }

    // Check whether the user is logged in
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return;
    }

    const user = sessionData.session.user;

    // Get the user's profile and role
    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();

    if (profileError || !profile) {
        alert("Profile not found. Please contact the administrator.");
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
        return;
    }

    // Redirect users to the correct page
    if (profile.role === "warden") {
        window.location.href = "warden.html";
        return;
    }

    if (profile.role === "security") {
        window.location.href = "security.html";
        return;
    }

    if (profile.role !== "student") {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
        return;
    }

    // Find the student request form
    const passForm = document.getElementById("passForm");
    const requestList = document.getElementById("requestList");

    // Display the student's name if an element exists
    const studentName = document.getElementById("studentName");
    if (studentName) {
        studentName.textContent = profile.full_name;
    }

    // Submit a new gate pass request
    if (passForm) {
        passForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const reason =
                document.getElementById("reason").value.trim();
            const destination =
                document.getElementById("destination").value.trim();
            const departure =
                document.getElementById("departure").value;
            const returnTime =
                document.getElementById("return").value;

            if (!reason || !destination || !departure || !returnTime) {
                if (message) message.textContent = "Fill in all fields.";
                return;
            }

            if (new Date(returnTime) <= new Date(departure)) {
                if (message) {
                    message.textContent =
                        "Return time must be later than departure time.";
                }
                return;
            }

            if (message) message.textContent = "Submitting request...";

            const { error } = await supabaseClient
                .from("gate_passes")
                .insert({
                    student_id: user.id,
                    reason: reason,
                    destination: destination,
                    departure_time: new Date(departure).toISOString(),
                    return_time: new Date(returnTime).toISOString(),
                    status: "pending"
                });

            if (error) {
                if (message) message.textContent = error.message;
                return;
            }

            if (message) {
                message.textContent = "Gate pass request submitted successfully.";
            }

            passForm.reset();
            await loadRequests();
        });
    }

    // Load the student's requests
    async function loadRequests() {
        if (!requestList) return;

        requestList.textContent = "Loading requests...";

        const { data, error } = await supabaseClient
            .from("gate_passes")
            .select("*")
            .eq("student_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            requestList.textContent = "Error loading requests: " + error.message;
            return;
        }

        if (!data || data.length === 0) {
            requestList.textContent = "No gate pass requests found.";
            return;
        }

        requestList.innerHTML = data.map(function (pass) {
            return `
                <div class="pass-card">
                    <h3>Gate Pass Request</h3>
                    <p><strong>Reason:</strong> ${escapeHTML(pass.reason)}</p>
                    <p><strong>Destination:</strong> ${escapeHTML(pass.destination)}</p>
                    <p><strong>Departure:</strong> ${formatDate(pass.departure_time)}</p>
                    <p><strong>Return:</strong> ${formatDate(pass.return_time)}</p>
                    <p><strong>Status:</strong> ${escapeHTML(pass.status)}</p>
                </div>
                <hr>
            `;
        }).join("");
    }

    // Safely display text
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function formatDate(value) {
        return new Date(value).toLocaleString();
    }

    // Logout
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html";
        });
    }

    await loadRequests();
});
