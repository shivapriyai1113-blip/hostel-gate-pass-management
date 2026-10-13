document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!loginForm || !message) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const selectedRole = document.getElementById("role").value;

        message.textContent = "Checking login...";
        
        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", data.user.id)
                    .single();

            if (profileError) throw profileError;

            if (profile.role !== selectedRole) {
                await supabaseClient.auth.signOut();
                throw new Error("The selected role does not match your account.");
            }

            message.textContent = "Login successful! Welcome, " +
                profile.full_name + ".";

            if (profile.role === "student") {
                window.location.href = "index.html";
            } else if (profile.role === "warden") {
                window.location.href = "warden.html";
            } else if (profile.role === "security") {
                window.location.href = "security.html";
            }

        } catch (error) {
            message.textContent = error.message ||
                "Login failed. Please try again.";
        }
    });
});
