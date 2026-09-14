/*
  SKYESTONE TV DISPLAY
  --------------------
  Change the settings below to control each TV.

  Display names:
    HOA Business
    Fitness
    Social
    Conference Room Reservation
    Fitness Room Reservations

  The sample activities are intentionally easy to replace.
*/

const CONFIG = {
  display: "HOA Business",
  rotationSeconds: 12,
  timeFormat: "12-hour",
  refreshMinutes: 15
};

// Use ISO dates (YYYY-MM-DD). Times use 24-hour format.
// Add, remove, or change activities here.
const ACTIVITIES = [
  { date: "2026-09-14", time: "10:00", title: "Koffee with Kenny", location: "Lodge" },
  { date: "2026-09-14", time: "16:30", title: "Happy Hour", location: "Lodge" },
  { date: "2026-09-15", time: "09:00", title: "Fitness Class", location: "Fitness Center" },
  { date: "2026-09-16", time: "13:00", title: "Lifestyle Activity", location: "Lodge" },
  { date: "2026-09-17", time: "18:00", title: "Card Club", location: "Activity Room" },
  { date: "2026-09-18", time: "16:30", title: "Happy Hour", location: "Lodge" }
];

// Optional general information for the display.
const INFO = [
  ["Lodge", "Please check the resident website for current Lodge hours and facility information."],
  ["Lifestyle Activities", "Have an idea for a Lifestyle Activity? Submit a Resident Request through skyestone.org."],
  ["Reservations", "Conference Room and Fitness Room reservations are subject to current facility rules."],
  ["Community", "Please check the Skyestone website and weekly reminders for the latest information."]
];

const displayName = document.getElementById("displayName");
const slidesEl = document.getElementById("slides");
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const lastUpdatedEl = document.getElementById("lastUpdated");

displayName.textContent = CONFIG.display;

function pad(n) { return String(n).padStart(2, "0"); }
function localISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function parseDateTime(item) {
  const [h,m] = item.time.split(":").map(Number);
  const d = new Date(`${item.date}T00:00:00`);
  d.setHours(h,m,0,0);
  return d;
}
function formatTime(hhmm) {
  const [h,m] = hhmm.split(":").map(Number);
  if (CONFIG.timeFormat === "24-hour") return `${pad(h)}:${pad(m)}`;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = (h % 12) || 12;
  return `${hour}:${pad(m)} ${suffix}`;
}
function formatLongDate(d) {
  return new Intl.DateTimeFormat("en-US", {weekday:"long", month:"long", day:"numeric", year:"numeric"}).format(d);
}
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"});
  dateEl.textContent = formatLongDate(now);
}
function todayActivities() {
  const now = new Date();
  const today = localISODate(now);
  return ACTIVITIES
    .filter(a => a.date === today && parseDateTime(a) >= now)
    .sort((a,b) => parseDateTime(a)-parseDateTime(b));
}
function nextDays() {
  const now = new Date();
  const today = localISODate(now);
  const dates = [...new Set(ACTIVITIES.map(a => a.date))]
    .filter(d => d > today)
    .sort()
    .slice(0, 3);
  return dates.map(date => ({
    date,
    items: ACTIVITIES.filter(a => a.date === date).sort((a,b)=>parseDateTime(a)-parseDateTime(b))
  }));
}
function makeActivity(item) {
  return `<div class="activity">
    <div class="time">${formatTime(item.time)}</div>
    <div class="title">${escapeHTML(item.title)}</div>
    <div class="location">${escapeHTML(item.location || "")}</div>
  </div>`;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function buildSlides() {
  const today = new Date();
  const todayItems = todayActivities();
  const upcoming = nextDays();
  const slides = [];

  slides.push(`
    <section class="slide">
      <div class="kicker">Today's Schedule</div>
      <h1>${formatLongDate(today)}</h1>
      <div class="activity-list">
        ${todayItems.length ? todayItems.map(makeActivity).join("") : `<div class="empty">No remaining activities are scheduled for today.</div>`}
      </div>
    </section>
  `);

  upcoming.forEach(day => {
    const d = new Date(`${day.date}T00:00:00`);
    slides.push(`
      <section class="slide">
        <div class="kicker">Upcoming</div>
        <h1>${formatLongDate(d)}</h1>
        <div class="activity-list">${day.items.map(makeActivity).join("")}</div>
      </section>
    `);
  });

  slides.push(`
    <section class="slide">
      <div class="kicker">Community Information</div>
      <h1>Skyestone</h1>
      <div class="info-grid">
        ${INFO.map(([h,p]) => `<div class="info-card"><h2>${escapeHTML(h)}</h2><p>${escapeHTML(p)}</p></div>`).join("")}
      </div>
    </section>
  `);

  slidesEl.innerHTML = slides.join("");
  const allSlides = [...document.querySelectorAll(".slide")];
  let index = 0;
  allSlides[index]?.classList.add("active");

  if (window.rotationTimer) clearInterval(window.rotationTimer);
  window.rotationTimer = setInterval(() => {
    if (!allSlides.length) return;
    allSlides[index].classList.remove("active");
    index = (index + 1) % allSlides.length;
    allSlides[index].classList.add("active");
  }, CONFIG.rotationSeconds * 1000);
}

updateClock();
setInterval(updateClock, 1000);
buildSlides();
setInterval(buildSlides, CONFIG.refreshMinutes * 60 * 1000);
lastUpdatedEl.textContent = "Display updates automatically";
