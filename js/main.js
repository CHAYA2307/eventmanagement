// Dark Mode Toggle
const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");
};

// Fetch Upcoming Events (Mock data)
const events = [
  { name: "Tech Conference 2025", price: "₹499", category: "Technology", img: "https://source.unsplash.com/400x300/?technology" },
  { name: "Music Fest", price: "₹999", category: "Entertainment", img: "https://source.unsplash.com/400x300/?concert" },
  { name: "Startup Meetup", price: "₹299", category: "Business", img: "https://source.unsplash.com/400x300/?startup" }
];

const eventList = document.getElementById("event-list");
if (eventList) {
  eventList.innerHTML = events.map(e => `
    <div class="event-card">
      <img src="${e.img}" alt="${e.name}" />
      <h3>${e.name}</h3>
      <p>${e.category}</p>
      <span>${e.price}</span>
    </div>
  `).join("");
}
