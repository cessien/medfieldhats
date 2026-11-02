const PRODUCTS = [
  { id: "mom-hat",   name: "Medfield Mom Hat",   price: 28, tag: "Hat" },
  { id: "class-hat", name: "Class of 2039 Hat",  price: 28, tag: "Hat" },
  { id: "beanie",    name: "Varsity M Beanie",   price: 26, tag: "Beanie" },
  { id: "headband",  name: "Name Headband",      price: 16, tag: "Headband" },
  { id: "bow",       name: "Navy Hair Bow",      price: 14, tag: "Bow" },
  { id: "tote",      name: "Medfield Tote",      price: 20, tag: "Tote" }
];
const COLORS = ["#4aa3df", "#1f3a5f", "#e8603c", "#f4a6c0", "#8fb8e8", "#6a5acd"];

const cfg = window.MH_CONFIG || {};
window._learnq = window._learnq || [];

// Load Klaviyo onsite JS only when configured
if (cfg.klaviyoCompanyId) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=" + cfg.klaviyoCompanyId;
  document.head.appendChild(s);
}

const grid = document.getElementById("products");
PRODUCTS.forEach((p, i) => {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="img" style="background:${COLORS[i % COLORS.length]}"><span>M</span></div>
    <h3>${p.name}</h3>
    <p>$${p.price} · ${p.tag}</p>
    <button class="btn small" data-id="${p.id}">Order via DM</button>`;
  grid.appendChild(el);
});

grid.addEventListener("click", e => {
  const id = e.target.dataset && e.target.dataset.id;
  if (!id) return;
  const p = PRODUCTS.find(x => x.id === id);
  window._learnq.push(["track", "Clicked Order", { ProductID: p.id, ProductName: p.name, Price: p.price }]);
  window.open("https://ig.me/m/medfield_hats", "_blank", "noopener");
});

// Subscribe via Klaviyo client API (public key only)
async function subscribe(email, listId, properties) {
  if (!cfg.klaviyoCompanyId || !listId) {
    console.warn("Klaviyo not configured; skipping.", { email, properties });
    return true;
  }
  const res = await fetch("https://a.klaviyo.com/client/subscriptions/?company_id=" + cfg.klaviyoCompanyId, {
    method: "POST",
    headers: { "Content-Type": "application/json", revision: "2024-10-15" },
    body: JSON.stringify({
      data: {
        type: "subscription",
        attributes: {
          profile: { data: { type: "profile", attributes: { email, properties } } }
        },
        relationships: { list: { data: { type: "list", id: listId } } }
      }
    })
  });
  return res.ok;
}

function wire(formId, listId, extra) {
  const form = document.getElementById(formId);
  const msg = form.querySelector(".msg");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!/^\S+@\S+\.\S+$/.test(d.email || "")) { msg.textContent = "Please enter a valid email."; return; }
    const { email, ...props } = d;
    const ok = await subscribe(email, listId, { ...props, ...extra }).catch(() => false);
    msg.textContent = ok ? "Thank you! We'll be in touch." : "Something went wrong, try again.";
    if (ok) form.reset();
  });
}
wire("signup-form", cfg.signupListId, { source: "site-signup" });
wire("custom-form", cfg.customListId || cfg.signupListId, { source: "custom-order" });

document.getElementById("yr").textContent = new Date().getFullYear();
