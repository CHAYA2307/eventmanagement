// js/dashboard.js
// Shows events, handles registration, Razorpay demo and storing regs in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const EVENTS = [
    {id:1,title:'Music Night',date:'2025-11-12',venue:'Arena',price:299,image:'https://picsum.photos/seed/music/600/400'},
    {id:2,title:'Tech Meetup',date:'2025-11-05',venue:'Hall A',price:0,image:'https://picsum.photos/seed/tech/600/400'},
    {id:3,title:'Art Workshop',date:'2025-12-01',venue:'Studio',price:199,image:'https://picsum.photos/seed/art/600/400'}
  ];

  const eventsGrid = document.getElementById('eventsGrid');
  const regsList = document.getElementById('registeredList');
  const displayName = document.getElementById('displayName');
  const modalRoot = document.getElementById('modalRoot');
  const modalContent = document.getElementById('modalContent');

  // show user
  try {
    const user = JSON.parse(localStorage.getItem('es_user') || '{}');
    displayName.textContent = user.name || 'Guest';
  } catch(e){ displayName.textContent = 'Guest' }

  // render events
  function renderEvents(){
    eventsGrid.innerHTML = '';
    EVENTS.forEach(ev=>{
      const card = document.createElement('div');
      card.className = 'event-card card';
      card.innerHTML = `
        <img src="${ev.image}" alt="">
        <div class="event-meta">
          <div><div class="title">${ev.title}</div><div style="font-size:12px;color:var(--muted)">${ev.date} • ${ev.venue}</div></div>
          <div class="price">${ev.price? '₹'+ev.price:'Free'}</div>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn register" data-id="${ev.id}">Register</button>
          <button class="btn ghost view" data-id="${ev.id}">View</button>
        </div>
      `;
      eventsGrid.appendChild(card);
    });
  }
  renderEvents();

  // load registrations
  function loadRegs(){
    const regs = JSON.parse(localStorage.getItem('es_regs')||'[]');
    regsList.innerHTML = '';
    regs.forEach(r=>{
      const d = document.createElement('div');
      d.className='card';
      d.style.marginBottom='8px';
      d.innerHTML = `<strong>${r.eventName}</strong><div style="font-size:13px;color:var(--muted)">${r.name} • ${r.status}</div>`;
      regsList.appendChild(d);
    });
  }
  loadRegs();

  // modal helpers
  function openModal(html){ modalContent.innerHTML = html; modalRoot.style.display='flex'; }
  function closeModal(){ modalRoot.style.display='none'; modalContent.innerHTML=''; }
  modalRoot.addEventListener('click', (e)=>{ if(e.target===modalRoot) closeModal(); });

  // register handler
  document.body.addEventListener('click', (e)=>{
    if (e.target.matches('.register')) {
      const id = Number(e.target.dataset.id);
      const ev = EVENTS.find(x=>x.id===id);
      openModal(`
        <h3>${ev.title}</h3>
        <p>${ev.date} • ${ev.venue}</p>
        <input id="r_name" placeholder="Your name" style="width:100%;padding:8px;margin:8px 0;border-radius:8px">
        <input id="r_email" placeholder="Email" style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px">
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" id="cancelReg">Cancel</button>
          <button class="btn" id="payReg">${ev.price? 'Pay & Register':'Register'}</button>
        </div>
      `);
      document.getElementById('cancelReg').addEventListener('click', closeModal);
      document.getElementById('payReg').addEventListener('click', async ()=>{
        const name = document.getElementById('r_name').value.trim();
        const email = document.getElementById('r_email').value.trim();
        if (!name || !email) { alert('Enter name & email'); return; }
        const regs = JSON.parse(localStorage.getItem('es_regs')||'[]');
        const reg = {id:Date.now(), eventId:ev.id, eventName:ev.title, name, email, status: ev.price? 'pending':'registered', createdAt: new Date().toISOString()};
        regs.push(reg); localStorage.setItem('es_regs', JSON.stringify(regs));
        closeModal();
        loadRegs();
        // if paid event -> open Razorpay checkout demo
        if (ev.price) {
          const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag', // REPLACE with your key for real
            amount: ev.price * 100,
            currency: 'INR',
            name: 'EventSphere (demo)',
            description: ev.title,
            handler: function(response){
              // mark as paid locally
              const regs2 = JSON.parse(localStorage.getItem('es_regs')||'[]');
              const r = regs2.find(x=>x.id===reg.id);
              if (r) r.status = 'paid', r.paymentId = response.razorpay_payment_id;
              localStorage.setItem('es_regs', JSON.stringify(regs2));
              loadRegs();
              alert('Payment success (demo). Confirmation email would be sent by server.');
              // optional: POST to backend /api/send-email
            },
            prefill: {name,email}
          };
          const rzp = new Razorpay(options);
          rzp.open();
        } else {
          alert('Registered (Free). Confirmation email would be sent (demo).');
        }
      });
    }

    if (e.target.matches('.view')) {
      const id = Number(e.target.dataset.id);
      const ev = EVENTS.find(x=>x.id===id);
      openModal(`<h3>${ev.title}</h3><img src="${ev.image}" style="width:100%;border-radius:8px"><p>${ev.date} • ${ev.venue}</p><div style="text-align:right"><button class="btn" onclick="document.getElementById('modalRoot').style.display='none'">Close</button></div>`);
    }
  });

  // logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> {
    localStorage.removeItem('es_token');
    location.href = 'index.html';
  });

  // theme toggle
  const togg = document.getElementById('toggleTheme');
  if (togg) togg.addEventListener('click', ()=> document.body.classList.toggle('dark-mode'));

});
