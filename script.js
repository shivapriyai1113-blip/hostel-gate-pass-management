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
function renderRecent(){
  const rows=[...state.requests].sort((a,b)=>b.createdAt-a.createdAt).slice(0,5);
  $("recentRows").innerHTML=rows.length?rows.map(r=>`<tr><td><span class="pass-id">${escapeHTML(r.id)}</span></td><td><div class="student-cell"><strong>${escapeHTML(r.student)}</strong><small>${escapeHTML(r.studentId)}</small></div></td><td>${escapeHTML(r.destination)}</td><td>${fmtDate(r.departureDate)}</td><td>${statusTag(r.status)}</td></tr>`).join(""):`<tr><td colspan="5" class="empty-state">No requests yet. Create your first gate pass request.</td></tr>`;
}
function renderRequests(){
  const filter=$("statusFilter").value;
  const rows=[...state.requests].sort((a,b)=>b.createdAt-a.createdAt).filter(r=>filter==="All"||r.status===filter);
  $("allRows").innerHTML=rows.length?rows.map(r=>{
    const actions=r.status==="Pending"?`<div class="action-group"><button class="action-btn approve" data-action="Approved" data-id="${escapeHTML(r.id)}">Approve</button><button class="action-btn reject" data-action="Rejected" data-id="${escapeHTML(r.id)}">Reject</button></div>`:`<span class="action-done">${escapeHTML(r.status)}</span>`;
    return `<tr><td><span class="pass-id">${escapeHTML(r.id)}</span></td><td><div class="student-cell"><strong>${escapeHTML(r.student)}</strong><small>${escapeHTML(r.studentId)}</small></div></td><td>${escapeHTML(r.destination)}</td><td>${fmtDate(r.departureDate)}<br>${escapeHTML(r.departureTime)}</td><td>${fmtDate(r.returnDate)}<br>${escapeHTML(r.returnTime)}</td><td>${actions}</td></tr>`;
  }).join(""):`<tr><td colspan="6" class="empty-state">No requests match this filter.</td></tr>`;
}
function renderNotifications(){
  const list=$("notificationList");
  list.innerHTML=state.notifications.length?[...state.notifications].sort((a,b)=>b.time-a.time).map(n=>`<div class="notification-item"><span class="notification-dot"></span><div><strong>${escapeHTML(n.title)}</strong><p>${escapeHTML(n.message)}</p><small>${new Date(n.time).toLocaleString("en-IN")}</small></div></div>`).join(""):`<div class="empty-state">You're all caught up. No notifications.</div>`;
}
function render(){renderStats();renderRecent();renderRequests();renderNotifications();save();}
function notify(title,message){state.notifications.push({title,message,time:Date.now()});}
function navigate(page){
  document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active",el.id===page));
  document.querySelectorAll(".nav-btn").forEach(el=>el.classList.toggle("active",el.dataset.page===page));
  const titles={dashboard:"Dashboard",request:"Request Gate Pass",requests:"Gate Pass Requests",security:"Security Verification",notifications:"Notifications"};
  $("pageTitle").textContent=titles[page]||"Dashboard";
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.go)));
$("statusFilter").addEventListener("change",renderRequests);
$("requestForm").addEventListener("reset",()=>setTimeout(()=>{$("departureDate").min=new Date().toISOString().slice(0,10);},0));
$("requestForm").addEventListener("submit",event=>{
  event.preventDefault();
  const form=event.currentTarget, data=Object.fromEntries(new FormData(form).entries());
  if(data.returnDate<data.departureDate){showToast("Return date must be on or after the departure date.");return;}
  if(data.returnDate===data.departureDate && data.returnTime<data.departureTime){showToast("Return time must be after departure time.");return;}
  const number=Math.max(1000,...state.requests.map(r=>Number(String(r.id).replace(/\D/g,""))||0))+1;
  const request={...data,id:`GP${number}`,status:"Pending",createdAt:Date.now()};
  state.requests.push(request);
  notify("Gate pass submitted",`${request.id} for ${request.student} was submitted and is awaiting review.`);
  render();form.reset();navigate("requests");showToast(`Request submitted successfully. Pass ID: ${request.id}`);
});
$("allRows").addEventListener("click",event=>{
  const btn=event.target.closest("button[data-action]");if(!btn)return;
  const request=state.requests.find(r=>r.id===btn.dataset.id);if(!request||request.status!=="Pending")return;
  request.status=btn.dataset.action;
  notify(`Gate pass ${request.status.toLowerCase()}`,`${request.id} for ${request.student} was ${request.status.toLowerCase()}.`);
  render();showToast(`${request.id} ${request.status.toLowerCase()}.`);
});
$("verifyForm").addEventListener("submit",event=>{
  event.preventDefault();
  const id=$("verifyId").value.trim().toUpperCase();
  const result=$("verifyResult");
  const request=state.requests.find(r=>r.id.toUpperCase()===id);
  result.className="verify-result";
  if(!request){result.classList.add("bad");result.innerHTML=`Pass <strong>${escapeHTML(id)}</strong> was not found. Check the ID and try again.`;return;}
  if(request.status==="Approved"){
    result.classList.add("good");result.innerHTML=`<strong>PASS APPROVED</strong><br>${escapeHTML(request.student)} (${escapeHTML(request.studentId)})<br>Destination: ${escapeHTML(request.destination)}<br>Departure: ${fmtDate(request.departureDate)} at ${escapeHTML(request.departureTime)}<br>Return: ${fmtDate(request.returnDate)} at ${escapeHTML(request.returnTime)}<br>Demo result: valid for gate review.`;
  }else{
    result.classList.add("bad");result.innerHTML=`<strong>ENTRY NOT AUTHORIZED</strong><br>${escapeHTML(request.id)} is currently ${escapeHTML(request.status.toLowerCase())}.`;
  }
});
$("clearNotifications").addEventListener("click",()=>{state.notifications=[];renderNotifications();save();showToast("Notifications cleared.");});
$("departureDate").min=new Date().toISOString().slice(0,10);
$("departureDate").addEventListener("change",()=>{$("returnDate").min=$("departureDate").value;$("returnDate").value=$("returnDate").value||$("departureDate").value;});
render();
