const SUPABASE_URL = "https://cnwtlwzxuhjlpksfamls.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZYNP4_Bxls-1mv0znFnMhQ_zTQNYdtx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


const STORAGE_KEY = "hostelGatePassDemo_v1";
const starterData = [
  {id:"GP1001",student:"Ananya Sharma",studentId:"STU1024",destination:"City Hospital",reason:"Medical appointment",departureDate:"2026-10-14",departureTime:"10:00",returnDate:"2026-10-14",returnTime:"13:00",notes:"",status:"Pending",createdAt:Date.now()-600000},
  {id:"GP1002",student:"Rahul Kumar",studentId:"STU1042",destination:"Central Mall",reason:"Shopping",departureDate:"2026-10-15",departureTime:"15:30",returnDate:"2026-10-15",returnTime:"18:30",notes:"",status:"Approved",createdAt:Date.now()-3600000},
  {id:"GP1003",student:"Priya Nair",studentId:"STU1091",destination:"Home",reason:"Family visit",departureDate:"2026-10-16",departureTime:"09:00",returnDate:"2026-10-18",returnTime:"19:00",notes:"",status:"Rejected",createdAt:Date.now()-7200000}
];
let state;
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { state = null; }
if (!state || !Array.isArray(state.requests)) state = {requests:starterData, notifications:[
  {title:"Gate pass approved",message:"GP1002 for Rahul Kumar was approved.",time:Date.now()-3600000},
  {title:"Gate pass rejected",message:"GP1003 for Priya Nair was rejected.",time:Date.now()-7200000}
]};
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function showToast(message){const toast=$("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2800);}
function fmtDate(date){if(!date)return "—";const d=new Date(date+"T00:00:00");return Number.isNaN(d.getTime())?escapeHTML(date):d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function statusTag(status){return `<span class="status ${escapeHTML(status)}">${escapeHTML(status)}</span>`;}
function renderStats(){
  $("totalCount").textContent=state.requests.length;
  $("pendingCount").textContent=state.requests.filter(r=>r.status==="Pending").length;
  $("approvedCount").textContent=state.requests.filter(r=>r.status==="Approved").length;
  $("rejectedCount").textContent=state.requests.filter(r=>r.status==="Rejected").length;
}
      `${request.id} for ${request.student} was submitted and is awaiting review.`
    );

    render();
    form.reset();
    navigate("requests");
    showToast(`Request submitted successfully. Pass ID: ${request.id}`);
  });
}

if ($("allRows")) {
  $("allRows").addEventListener("click", event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    if (localStorage.getItem("userRole") !== "warden") {
      showToast("Only the warden can approve or reject gate passes.");
      return;
    }

    const request = state.requests.find(r => r.id === btn.dataset.id);

    if (!request || request.status !== "Pending") return;

    if (!["Approved", "Rejected"].includes(btn.dataset.action)) return;

    request.status = btn.dataset.action;

    notify(
      `Gate pass ${request.status.toLowerCase()}`,
      `${request.id} for ${request.student} was ${request.status.toLowerCase()}.`
    );

    render();
    showToast(`${request.id} ${request.status.toLowerCase()}.`);
  });
}

if ($("verifyForm")) {
  $("verifyForm").addEventListener("submit", event => {
    event.preventDefault();

    const id = $("verifyId").value.trim().toUpperCase();
    const result = $("verifyResult");
    if (!result) return;

    const request = state.requests.find(
      r => r.id.toUpperCase() === id
    );

    result.className = "verify-result";

    if (!request) {
      result.classList.add("bad");
      result.innerHTML =
        `Pass <strong>${escapeHTML(id)}</strong> was not found. Check the ID and try again.`;
      return;
    }

    if (request.status === "Approved") {
      result.classList.add("good");
      result.innerHTML = `
        <strong>PASS APPROVED</strong><br>
        ${escapeHTML(request.student)} (${escapeHTML(request.studentId)})<br>
        Destination: ${escapeHTML(request.destination)}<br>
        Departure: ${fmtDate(request.departureDate)} at ${escapeHTML(request.departureTime)}<br>
        Return: ${fmtDate(request.returnDate)} at ${escapeHTML(request.returnTime)}<br>
        Demo result: valid for gate review.
      `;
    } else {
      result.classList.add("bad");
      result.innerHTML = `
        <strong>ENTRY NOT AUTHORIZED</strong><br>
        ${escapeHTML(request.id)} is currently ${escapeHTML(request.status.toLowerCase())}.
      `;
    }
  });
}

if ($("clearNotifications")) {
  $("clearNotifications").addEventListener("click", () => {
    state.notifications = [];
    renderNotifications();
    save();
    showToast("Notifications cleared.");
  });
}

if ($("departureDate")) {
  $("departureDate").min = new Date().toISOString().slice(0, 10);

  $("departureDate").addEventListener("change", () => {
    if (!$("returnDate")) return;

    $("returnDate").min = $("departureDate").value;
    $("returnDate").value =
      $("returnDate").value || $("departureDate").value;
  });
}

render();
