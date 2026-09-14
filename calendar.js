/* SKYESTONE TV — MANUAL ENTRY VERSION
   Display URLs:
   ?display=hoa
   ?display=social
   ?display=fitness
   ?display=fitness-reservations
   ?display=conference
*/
const ACTIVITIES=[
 {display:"hoa",date:"2026-09-14",start:"08:00",end:"23:59",title:"Weekly Community Reminder",details:"Add important Skyestone notices and upcoming dates here."},
 {display:"social",date:"2026-09-14",start:"08:00",end:"23:59",title:"Live at the Lodge",details:"Registration is open. Join your neighbors for Live at the Lodge."},
 {display:"fitness",date:"2026-09-14",start:"08:00",end:"23:59",title:"Fitness Information",details:"Add today's fitness classes, activities or facility notices here."}
];
const RESERVATIONS=[
 // {room:"conference",date:"2026-09-15",start:"09:00",end:"10:30",title:"Board Meeting",reservedBy:"HOA"},
 // {room:"fitness",date:"2026-09-15",start:"14:00",end:"15:00",title:"Private Class",reservedBy:"Resident"}
];
const CONFIG={hoa:{title:"HOA BUSINESS"},social:{title:"SOCIAL"},fitness:{title:"FITNESS"},"fitness-reservations":{title:"FITNESS ROOM RESERVATIONS",room:"fitness"},conference:{title:"CONFERENCE ROOM RESERVATIONS",room:"conference"}};
const display=new URLSearchParams(location.search).get("display")||"hoa";const config=CONFIG[display]||CONFIG.hoa;document.getElementById("displayTitle").textContent=config.title;
const pad=n=>String(n).padStart(2,"0"),dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function dt(date,time){const [h,m]=time.split(":").map(Number),d=new Date(date+"T00:00:00");d.setHours(h,m,0,0);return d}
function ft(t){const [h,m]=t.split(":").map(Number),d=new Date();d.setHours(h,m,0,0);return d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}
function fd(s){return new Date(s+"T12:00:00").toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"})}
function clock(){const d=new Date();document.getElementById("time").textContent=d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});document.getElementById("date").textContent=d.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"})}
function general(){const now=new Date(),a=ACTIVITIES.filter(x=>x.display===display).map(x=>({...x,s:dt(x.date,x.start),e:dt(x.date,x.end)})).filter(x=>x.e>=now).sort((a,b)=>a.s-b.s),c=document.getElementById("content");if(!a.length){c.innerHTML='<div class="empty">No upcoming information at this time.</div>';return}const today=dateKey(now),t=a.filter(x=>x.date===today),f=a.filter(x=>x.date!==today);let h='<div class="slide">';if(t.length){h+='<div class="hero">TODAY</div><div class="card-grid">';t.forEach(x=>h+=`<div class="card"><div class="label">${ft(x.start)} – ${ft(x.end)}</div><div class="title">${x.title}</div><div class="details">${x.details||""}</div></div>`);h+='</div>'}if(f.length){h+=`<div style="height:3vh"></div><div class="subhero">UPCOMING</div><div class="card-grid">`;f.slice(0,4).forEach(x=>h+=`<div class="card"><div class="label">${fd(x.date)} · ${ft(x.start)}</div><div class="title">${x.title}</div><div class="details">${x.details||""}</div></div>`);h+='</div>'}c.innerHTML=h+'</div>'}
function reservations(room){const now=new Date(),r=RESERVATIONS.filter(x=>x.room===room).map(x=>({...x,s:dt(x.date,x.start),e:dt(x.date,x.end)})).filter(x=>x.e>=now).sort((a,b)=>a.s-b.s),today=dateKey(now),cur=r.find(x=>x.date===today&&x.s<=now&&x.e>now),next=r.find(x=>x.s>now);let h='<div class="slide"><div class="reservation">';if(cur){h+=`<div class="room-status reserved">RESERVED</div><div class="res-name">${cur.title}</div><div class="res-time">${ft(cur.start)} – ${ft(cur.end)}</div>${cur.reservedBy?`<div class="subhero" style="margin-top:1.5vh">Reserved by ${cur.reservedBy}</div>`:""}`}else h+='<div class="room-status">AVAILABLE</div><div class="subhero">The room is currently available.</div>';h+=next?`<div class="next-box"><div class="label">NEXT RESERVATION · ${fd(next.date)}</div><div class="next-time"><strong>${ft(next.start)} – ${ft(next.end)}</strong> · ${next.title}</div>${next.reservedBy?`<div class="next-time">Reserved by ${next.reservedBy}</div>`:""}</div>`:'<div class="next-box"><div class="label">NEXT RESERVATION</div><div class="next-time">No upcoming reservations.</div></div>';document.getElementById("content").innerHTML=h+'</div></div>'}
function render(){config.room?reservations(config.room):general();document.getElementById("lastUpdated").textContent="Updated "+new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}
clock();render();setInterval(()=>{clock();render()},30000);
