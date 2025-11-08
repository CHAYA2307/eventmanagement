// js/admin.js
// Full Admin Dashboard – Manage Events (Add, Edit, Delete) + Registrations + CSV Export

document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("btnAddEvent");
  const eventsList = document.getElementById("eventsList");
  const regsList = document.getElementById("regsList");
  const exportCSV = document.getElementById("exportCSV");
  const adminSecretInput = document.getElementById("adminSecret");

  // ----------------------------
  // Load Events from Backend or Local
  // ----------------------------
  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Server not responding");
      const data = await res.json();
      renderEvents(data);
      localStorage.setItem("es_events", JSON.stringify(data));
    } catch (e) {
      // fallback to local data
      const data = JSON.parse(localStorage.getItem("es_events") || "[]");
      renderEvents(data);
    }
  }

  // ----------------------------
  // Render events in dashboard
  // ----------------------------
  function renderEvents(events) {
    eventsList.innerHTML = events.length
      ? events
          .map(
            (e) => `
        <div class="card" style="margin:10px 0;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
          <strong>${e.title}</strong>
          <p style="font-size:13px;color:var(--muted)">Date: ${e.date} | Price: ₹${e.price}</p>
          <button class="btn small editBtn" data-id="${e.id}">Edit</button>
          <button class="btn small danger delBtn" data-id="${e.id}">Delete</button>
        </div>
      `
          )
          .join("")
      : `<p style="color:var(--muted)">No events found.</p>`;
  }

  // ----------------------------
  // Add New Event
  // ----------------------------
  btnAdd.addEventListener("click", async () => {
    const secret = adminSecretInput.value.trim();
    const title = prompt("Enter Event Title:");
    const date = prompt("Enter Date (YYYY-MM-DD):");
    const price = prompt("Enter Price:");
    if (!title || !date || !price) return alert("All fields required!");

    const payload = {
      title,
      date,
      price: parseFloat(price),
      image: "https://picsum.photos/seed/" + Date.now() + "/600/400",
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server Error");
      alert("✅ Event added successfully!");
      loadEvents();
    } catch (e) {
      // Fallback local
      const evs = JSON.parse(localStorage.getItem("es_events") || "[]");
      payload.id = Date.now();
      evs.push(payload);
      localStorage.setItem("es_events", JSON.stringify(evs));
      alert("⚠️ No server — event added locally!");
      loadEvents();
    }
  });

  // ----------------------------
  // Edit / Delete Buttons
  // ----------------------------
  eventsList.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("editBtn")) {
      const evs = JSON.parse(localStorage.getItem("es_events") || "[]");
      const event = evs.find((ev) => ev.id == id);
      if (!event) return alert("Event not found.");

      const newTitle = prompt("New Title:", event.title);
      const newDate = prompt("New Date (YYYY-MM-DD):", event.date);
      const newPrice = prompt("New Price:", event.price);
      if (!newTitle || !newDate || !newPrice) return;

      event.title = newTitle;
      event.date = newDate;
      event.price = parseFloat(newPrice);
      localStorage.setItem("es_events", JSON.stringify(evs));
      alert("✅ Event updated (local).");
      loadEvents();
    }

    if (e.target.classList.contains("delBtn")) {
      if (!confirm("Are you sure to delete this event?")) return;
      try {
        await fetch(`/api/events/${id}`, {
          method: "DELETE",
          headers: {
            "x-admin-secret": adminSecretInput.value.trim(),
          },
        });
      } catch {}
      let evs = JSON.parse(localStorage.getItem("es_events") || "[]");
      evs = evs.filter((ev) => ev.id != id);
      localStorage.setItem("es_events", JSON.stringify(evs));
      alert("🗑️ Event deleted.");
      loadEvents();
    }
  });

  // ----------------------------
  // Export CSV of Registrations
  // ----------------------------
  exportCSV.addEventListener("click", () => {
    const regs = JSON.parse(localStorage.getItem("es_regs") || "[]");
    if (!regs.length) return alert("No registrations yet!");
    const csv = [
      ["id", "eventId", "eventName", "name", "email", "status"].join(","),
      ...regs.map((r) =>
        [r.id, r.eventId, r.eventName, r.name, r.email, r.status]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Load data initially
  loadEvents();
});
