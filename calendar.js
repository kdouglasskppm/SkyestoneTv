/* SKYESTONE TV — GITHUB CALENDAR VERSION */

const CONFIG = {
  hoa: {
    title: "HOA BUSINESS"
  },

  social: {
    title: "SOCIAL"
  },

  fitness: {
    title: "FITNESS"
  },

  "fitness-reservations": {
    title: "FITNESS ROOM RESERVATIONS",
    room: "fitness"
  },

  conference: {
    title: "CONFERENCE ROOM RESERVATIONS",
    room: "conference"
  }
};

const display =
  new URLSearchParams(location.search).get("display") || "hoa";

const config = CONFIG[display] || CONFIG.hoa;

document.getElementById("displayTitle").textContent = config.title;

let ACTIVITIES = [];

const pad = n => String(n).padStart(2, "0");

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dt(date, time) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date + "T00:00:00");

  d.setHours(h, m, 0, 0);

  return d;
}

function ft(t) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();

  d.setHours(h, m, 0, 0);

  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function fd(s) {
  return new Date(s + "T12:00:00").toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function clock() {
  const d = new Date();

  document.getElementById("time").textContent =
    d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

  document.getElementById("date").textContent =
    d.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

function general() {
  const now = new Date();

  const a = ACTIVITIES
    .filter(x => x.display.toLowerCase() === display.toLowerCase())
    .map(x => ({
      ...x,
      s: dt(x.date, x.start),
      e: dt(x.date, x.end)
    }))
    // Keep activities visible until they actually end.
    .filter(x => x.e >= now)
    .sort((a, b) => a.s - b.s);

  const c = document.getElementById("content");

  if (!a.length) {
    c.innerHTML =
      '<div class="empty">No upcoming information at this time.</div>';

    return;
  }

  const today = dateKey(now);

  const t = a.filter(x => x.date === today);
  const f = a.filter(x => x.date !== today);

  let h = '<div class="slide">';

  if (t.length) {
    h +=
      '<div class="hero">TODAY</div>' +
      '<div class="card-grid">';

    t.forEach(x => {
      h += `
        <div class="card">
          <div class="label">${ft(x.start)} – ${ft(x.end)}</div>
          <div class="title">${x.title}</div>
          <div class="details">${x.details || ""}</div>
        </div>
      `;
    });

    h += "</div>";
  }

  if (f.length) {
    h +=
      '<div style="height:3vh"></div>' +
      '<div class="subhero">UPCOMING</div>' +
      '<div class="card-grid">';

    f.slice(0, 4).forEach(x => {
      h += `
        <div class="card">
          <div class="label">${fd(x.date)} · ${ft(x.start)}</div>
          <div class="title">${x.title}</div>
          <div class="details">${x.details || ""}</div>
        </div>
      `;
    });

    h += "</div>";
  }

  h += "</div>";

  c.innerHTML = h;
}

function reservations(room) {
  const now = new Date();

  const r = ACTIVITIES
    .filter(x => {
      const d = x.display.toLowerCase();

      if (room === "conference") {
        return d === "conference";
      }

      if (room === "fitness") {
        return d === "fitness-reservations";
      }

      return false;
    })
    .map(x => ({
      ...x,
      s: dt(x.date, x.start),
      e: dt(x.date, x.end)
    }))
    .filter(x => x.e >= now)
    .sort((a, b) => a.s - b.s);

  const today = dateKey(now);

  const cur = r.find(
    x =>
      x.date === today &&
      x.s <= now &&
      x.e > now
  );

  const next = r.find(x => x.s > now);

  let h = '<div class="slide"><div class="reservation">';

  if (cur) {
    h += `
      <div class="room-status reserved">RESERVED</div>
      <div class="res-name">${cur.title}</div>
      <div class="res-time">
        ${ft(cur.start)} – ${ft(cur.end)}
      </div>
      ${
        cur.reservedBy
          ? `<div class="subhero" style="margin-top:1.5vh">
               Reserved by ${cur.reservedBy}
             </div>`
          : ""
      }
    `;
  } else {
    h += `
      <div class="room-status">AVAILABLE</div>
      <div class="subhero">
        The room is currently available.
      </div>
    `;
  }

  h += next
    ? `
      <div class="next-box">
        <div class="label">
          NEXT RESERVATION · ${fd(next.date)}
        </div>

        <div class="next-time">
          <strong>${ft(next.start)} – ${ft(next.end)}</strong>
          · ${next.title}
        </div>

        ${
          next.reservedBy
            ? `<div class="next-time">
                 Reserved by ${next.reservedBy}
               </div>`
            : ""
        }
      </div>
    `
    : `
      <div class="next-box">
        <div class="label">NEXT RESERVATION</div>
        <div class="next-time">
          No upcoming reservations.
        </div>
      </div>
    `;

  document.getElementById("content").innerHTML =
    h + "</div></div>";
}

function render() {
  if (config.room) {
    reservations(config.room);
  } else {
    general();
  }

  document.getElementById("lastUpdated").textContent =
    "Updated " +
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
}

async function loadCalendar() {
  try {
    const response = await fetch("./calendar.json?" + Date.now());

    if (!response.ok) {
      throw new Error("Unable to load calendar.json");
    }

    ACTIVITIES = await response.json();

    render();

  } catch (error) {
    console.error(error);

    document.getElementById("content").innerHTML =
      '<div class="empty">Unable to load the Skyestone TV calendar.</div>';
  }
}

clock();
loadCalendar();

setInterval(() => {
  clock();
  render();
}, 30000);

setInterval(() => {
  loadCalendar();
}, 60000);
