/* ============================================================
   SWENSEN'S — site.js
   Pulls page content from your Airtable base so you can edit
   text, prices, photos, and reviews without touching the code.
   ============================================================ */

const AIRTABLE_TOKEN = "patk7K1dOR9VAzSxd.269edad20aeeaed850a7da1630edaa10f9166fdeb8522749c1b76fbd2dd6d535";                 // ← paste your read-only token here
const AIRTABLE_BASE  = "appKFlb55fbhaT5GJ"; // Swensen's Website base

const TABLES = {
  flavors:  "Flavors",
  reviews:  "Reviews",
  gifts:    "Gifts & Merch",
  slideshow:"Slideshow",
  menu:     "Menu",
};

/* ---------- helpers ---------- */
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, c => (
    {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]
  ));
}
function money(n){
  if (n == null || isNaN(n)) return "";
  return "$" + (Number.isInteger(+n) ? (+n).toString() : (+n).toFixed(2));
}

async function fetchTable(name){
  if (!AIRTABLE_TOKEN) return null;
  try{
    let records = [], offset = "";
    do{
      const url = "https://api.airtable.com/v0/" + AIRTABLE_BASE + "/" +
        encodeURIComponent(name) +
        "?filterByFormula=" + encodeURIComponent("{Show on Site}=TRUE()") +
        (offset ? "&offset=" + offset : "");
      const res = await fetch(url, { headers: { Authorization: "Bearer " + AIRTABLE_TOKEN }});
      if (!res.ok) throw new Error("Airtable " + res.status);
      const data = await res.json();
      records = records.concat(data.records || []);
      offset = data.offset || "";
    } while (offset);
    return records.map(r => r.fields);
  }catch(err){
    console.warn("Airtable fetch failed for " + name + " — using built-in content.", err);
    return null;
  }
}

/* ---------- allergen badge icons (injected once) ---------- */
const BADGE_DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="ic-df" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#FBF6EC" stroke="#3A241A" stroke-width="2"/>
  <path d="M9 6 h6 l-1 12 h-4 z" fill="#FBF6EC" stroke="#3A241A" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M9.4 10 h5.2" stroke="#3A241A" stroke-width="1.4"/>
  <line x1="5" y1="19" x2="19" y2="5" stroke="#B5222B" stroke-width="2.4" stroke-linecap="round"/>
</symbol>
<symbol id="ic-nf" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#FBF6EC" stroke="#3A241A" stroke-width="2"/>
  <path d="M12 6 c2.4 0 3.4 1.6 3.4 3 c0 1 -.6 1.6 -.6 2.6 c0 1.6 1.2 2 1.2 3.6 c0 1.8 -1.6 3 -4 3 c-2.4 0 -4 -1.2 -4 -3 c0 -1.6 1.2 -2 1.2 -3.6 c0 -1 -.6 -1.6 -.6 -2.6 c0 -1.4 1 -3 3.4 -3z" fill="#EBCFA9" stroke="#3A241A" stroke-width="1.6"/>
  <line x1="5" y1="19" x2="19" y2="5" stroke="#B5222B" stroke-width="2.4" stroke-linecap="round"/>
</symbol>
<symbol id="ic-ef" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#FBF6EC" stroke="#3A241A" stroke-width="2"/>
  <path d="M12 5.5 c2.8 0 4.6 3.4 4.6 6.4 c0 3 -2 5 -4.6 5 c-2.6 0 -4.6 -2 -4.6 -5 c0 -3 1.8 -6.4 4.6 -6.4z" fill="#FBF6EC" stroke="#3A241A" stroke-width="1.6"/>
  <line x1="5" y1="19" x2="19" y2="5" stroke="#B5222B" stroke-width="2.4" stroke-linecap="round"/>
</symbol>
</defs></svg>`;
document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("afterbegin", BADGE_DEFS);
});

function badgesHTML(f){
  let out = "";
  if (f["Dairy-Free"]) out += `<span class="badge b-df"><svg><use href="#ic-df"/></svg>Dairy-Free</span>`;
  if (f["Nut-Free"])   out += `<span class="badge b-nf"><svg><use href="#ic-nf"/></svg>Nut-Free</span>`;
  if (f["Egg-Free"])   out += `<span class="badge b-ef"><svg><use href="#ic-ef"/></svg>Egg-Free</span>`;
  return out ? `<div class="badges-row">${out}</div>` : "";
}

/* cone illustration with a custom scoop color */
function coneSVG(color){
  const c = /^#[0-9A-Fa-f]{3,8}$/.test(color || "") ? color : "#F0D2CD";
  return `
  <svg class="cone" viewBox="0 0 96 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 46 a28 26 0 0 1 56 0 q2 12 -8 14 h-40 q-10 -2 -8 -14z" fill="${c}" stroke="#3A241A" stroke-width="4"/>
    <path d="M34 58 q2 10 -4 14 M48 58 q0 12 -4 16 M62 58 q0 10 4 12" fill="none" stroke="#3A241A" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 62 L48 114 L70 62" fill="#C68B4E" stroke="#3A241A" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32 72 h32 M36 84 h24 M41 96 h14" stroke="#3A241A" stroke-width="3"/>
  </svg>`;
}

function photoOrCone(f){
  const ph = f["Photo"];
  if (Array.isArray(ph) && ph[0] && ph[0].url){
    return `<img class="card-photo" src="${esc(ph[0].url)}" alt="${esc(f["Flavor Name"] || f["Item Name"] || "")}">`;
  }
  return coneSVG(f["Scoop Color"]);
}

function flavorCard(f){
  return `<div class="card">
    ${photoOrCone(f)}
    <h3>${esc(f["Flavor Name"])}</h3>
    <p>${esc(f["Description"] || "")}</p>
    ${badgesHTML(f)}
  </div>`;
}

/* ---------- SLIDESHOW ---------- */
function buildSlideshow(container, records){
  const slidesBox = container.querySelector(".slides");
  const dotsBox   = container.querySelector(".dots");
  if (records && records.length){
    const phStyles = ["ph-red","ph-tan"];
    slidesBox.innerHTML = records.map((r,i) => {
      const img = Array.isArray(r["Image"]) && r["Image"][0] ? r["Image"][0].url : null;
      if (img){
        return `<div class="slide${i===0?" active":""}">
          <img src="${esc(img)}" alt="${esc(r["Caption"]||"Swensen's")}">
          ${r["Caption"] ? `<div class="cap">${esc(r["Caption"])}</div>` : ""}
        </div>`;
      }
      return `<div class="slide ph ${phStyles[i % phStyles.length]}${i===0?" active":""}">
        <span class="ph-icon">📷</span>
        <h4>${esc(r["Caption"] || "Add a photo")}</h4>
        <p>Attach an image to this row in Airtable to fill this slide.</p>
      </div>`;
    }).join("");
  }
  const slides = Array.from(container.querySelectorAll(".slide"));
  if (!slides.length) return;
  let current = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
  if (current === -1){ current = 0; slides[0].classList.add("active"); }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;

  dotsBox.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot-btn" + (i === current ? " active" : "");
    b.type = "button";
    b.setAttribute("aria-label", "Go to slide " + (i + 1));
    b.addEventListener("click", () => { go(i); restart(); });
    dotsBox.appendChild(b);
  });
  const dots = Array.from(dotsBox.children);

  function go(i){
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }
  function restart(){
    if (reduced) return;
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 4500);
  }
  container.querySelectorAll("[data-dir]").forEach(btn => {
    btn.addEventListener("click", () => { go(current + Number(btn.dataset.dir)); restart(); });
  });
  container.addEventListener("mouseenter", () => clearInterval(timer));
  container.addEventListener("mouseleave", restart);
  restart();
}

/* ---------- PAGE RENDERERS ---------- */
async function initHome(){
  const show = document.getElementById("slideshow");
  const slidesData = await fetchTable(TABLES.slideshow);
  if (slidesData) slidesData.sort((a,b) => (a["Order"]||99) - (b["Order"]||99));
  buildSlideshow(show, slidesData);

  const favBox = document.getElementById("home-favorites");
  const flavors = await fetchTable(TABLES.flavors);
  if (favBox && flavors){
    const favs = flavors.filter(f => f["Category"] === "Favorite");
    const seasonal = flavors.filter(f => f["Category"] === "Seasonal");
    const picks = [...seasonal.slice(0,1), ...favs].slice(0,4);
    if (picks.length) favBox.innerHTML = picks.map(flavorCard).join("");
  }

  await renderReviews(3);
}

async function renderReviews(limit){
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;
  const reviews = await fetchTable(TABLES.reviews);
  if (!reviews || !reviews.length) return;

  const featured = reviews.find(r => r["Featured"]) || reviews[0];
  const fq = document.getElementById("featured-quote");
  const fs = document.getElementById("featured-src");
  if (fq && featured){
    fq.textContent = "\u201C" + (featured["Quote"] || "") + "\u201D";
    if (fs) fs.textContent = "— " + (featured["Customer Name"] || "A happy customer") +
      (featured["Source"] ? " · " + featured["Source"] : "");
  }
  const rest = reviews.filter(r => r !== featured);
  const list = (limit ? rest.slice(0, limit) : rest);
  if (list.length){
    grid.innerHTML = list.map(r => `<div class="review">
      <span class="stars">${"★".repeat(Math.max(1, Math.min(5, r["Rating"] || 5)))}</span>
      <p>\u201C${esc(r["Quote"] || "")}\u201D</p>
      <span class="src">${esc(r["Customer Name"] || "")}${r["Source"] ? " · " + esc(r["Source"]) : ""}</span>
    </div>`).join("");
  }
}

async function initFlavorsPage(){
  const flavors = await fetchTable(TABLES.flavors);
  if (!flavors || !flavors.length) return;

  const seasonalBox = document.getElementById("flavors-seasonal");
  const favBox = document.getElementById("flavors-favorites");
  const regBox = document.getElementById("flavors-regular");

  const seasonal = flavors.filter(f => f["Category"] === "Seasonal");
  const favs     = flavors.filter(f => f["Category"] === "Favorite");
  const regs     = flavors.filter(f => f["Category"] === "Regular");

  if (seasonalBox && seasonal.length){
    const s = seasonal[0];
    seasonalBox.innerHTML = `<div class="feature-card">
      <div>${photoOrCone(s)}</div>
      <div>
        ${s["Season / Note"] ? `<span class="season-tag">${esc(s["Season / Note"])}</span>` : ""}
        <h3>${esc(s["Flavor Name"])}</h3>
        <p>${esc(s["Description"] || "")}</p>
        ${badgesHTML(s)}
      </div>
    </div>`;
  }
  if (favBox && favs.length) favBox.innerHTML = favs.map(flavorCard).join("");
  if (regBox && regs.length){
    regBox.innerHTML = regs.map(flavorCard).join("") + `
      <div class="card ghost">
        <span class="plus">+</span>
        <h3>Add the next flavor</h3>
        <p>Add a row in the Airtable "Flavors" table and it appears here.</p>
      </div>`;
  }
}

async function initMenuPage(){
  const root = document.getElementById("menu-root");
  if (!root) return;
  const items = await fetchTable(TABLES.menu);
  if (!items || !items.length) return;
  items.sort((a,b) => (a["Sort"]||99) - (b["Sort"]||99));

  const order = ["Specialties","Sundaes","Cones & Cups","Shakes & Malts"];
  const featured = items.find(i => i["Item Name"] === "The Earthquake");
  let html = "";

  if (featured){
    html += `<div class="menu-featured reveal">
      <div>
        <span class="kicker">The Legend</span>
        <h3>${esc(featured["Item Name"])}</h3>
        <p>${esc(featured["Description"] || "")}</p>
      </div>
      <div class="mf-price">${money(featured["Price"])}</div>
    </div>`;
  }
  order.forEach(cat => {
    const group = items.filter(i => i["Category"] === cat && i !== featured);
    if (!group.length) return;
    html += `<div class="menu-cat reveal">
      <div class="menu-cat-head"><h2>${esc(cat)}</h2></div>
      <div class="menu-items">` +
      group.map(i => `<div class="menu-item">
        <div class="mi-text"><h3>${esc(i["Item Name"])}</h3><p>${esc(i["Description"] || "")}</p></div>
        <div class="mi-dots"></div>
        <div class="mi-price">${money(i["Price"])}</div>
      </div>`).join("") +
      `</div></div>`;
  });
  root.innerHTML = html;
  observeReveals();
}

async function initGiftsPage(){
  const grid = document.getElementById("gifts-grid");
  if (!grid) return;
  const gifts = await fetchTable(TABLES.gifts);
  if (!gifts || !gifts.length) return;
  const art = { "Gift Card":["🎁","ga-red"], "Apparel":["👕","ga-tan"], "Accessory":["🧢","ga-cream"], "Ice Cream":["🍨","ga-red"] };
  grid.innerHTML = gifts.map(g => {
    const [icon, cls] = art[g["Type"]] || ["🎁","ga-cream"];
    const photo = Array.isArray(g["Photo"]) && g["Photo"][0] ? g["Photo"][0].url : null;
    const link = g["Button Link"] && /^https?:\/\//.test(g["Button Link"]) ? g["Button Link"] : null;
    return `<div class="gift">
      <div class="gift-art ${cls}">${photo ? `<img src="${esc(photo)}" alt="${esc(g["Item Name"])}">` : icon}</div>
      <h3>${esc(g["Item Name"])}</h3>
      ${g["Price"] ? `<div class="gift-price">${money(g["Price"])}</div>` : ""}
      <p>${esc(g["Description"] || "")}</p>
      ${g["Sizes"] ? `<span class="sizes">${esc(g["Sizes"])}</span>` : ""}
      ${link ? `<a class="btn btn-red" href="${esc(link)}">${esc(g["Button Text"] || "Learn More")}</a>` : ""}
    </div>`;
  }).join("");
}

async function initReviewsPage(){
  await renderReviews(0); // 0 = show all
}

/* ---------- scroll reveals ---------- */
let _io = null;
function observeReveals(){
  if (!_io){
    _io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){ e.target.classList.add("in"); _io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
  }
  document.querySelectorAll(".reveal:not(.in), .reveal-stagger:not(.in)").forEach(el => _io.observe(el));
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  observeReveals();
  const page = document.body.dataset.page;
  if (page === "home")    initHome();
  if (page === "flavors") initFlavorsPage();
  if (page === "menu")    initMenuPage();
  if (page === "gifts")   initGiftsPage();
  if (page === "reviews") initReviewsPage();
});