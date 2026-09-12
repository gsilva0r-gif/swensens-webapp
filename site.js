/* ============================================================
   SWENSEN'S — site.js
   Pulls page content from your Airtable base so you can edit
   text, prices, photos, and reviews without touching the code.
   ============================================================ */

// Airtable is read through the secure Sites worker. GitHub Pages uses that
// worker cross-origin; the Sites deployment keeps using its same-origin route.
// The Airtable credential always stays server-side.
const AIRTABLE_LIVE_ORIGIN = "https://swensens-website-proposal.gsilva0r-sf.chatgpt.site";
const AIRTABLE_API_ENDPOINT = window.SWENSENS_AIRTABLE_API || (
  window.location.hostname === "gsilva0r-gif.github.io"
    ? AIRTABLE_LIVE_ORIGIN + "/api/airtable"
    : "/api/airtable"
);

const TABLES = {
  flavors:  "Flavors",
  reviews:  "Reviews",
  gifts:    "Gifts & Merch",
  slideshow:"Slideshow",
  menu:     "Menu",
  branding: "Website Branding",
  customerVideos: "Customer Videos",
  websiteImages: "Website Images",
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

function airtableImageSource(record, attachmentField = "Image", urlField = "Image URL"){
  const attachment = Array.isArray(record?.[attachmentField]) && record[attachmentField][0]?.url
    ? record[attachmentField][0].url
    : "";
  const remote = /^https?:\/\//i.test(record?.[urlField] || "") ? record[urlField] : "";
  return attachment || remote;
}

function cssImageValue(url){
  const safeURL = String(url || "").replace(/["'()\\]/g, "");
  return safeURL ? `url("${safeURL}")` : "";
}

function campaignHref(value, fallback = "index.html"){
  const href = String(value || "").trim();
  if (/^https:\/\//i.test(href)) return href;
  if (/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.html(?:[?#][^\s]*)?$/i.test(href)) return href;
  if (/^#[a-z0-9_-]+$/i.test(href)) return href;
  return fallback;
}

async function fetchTable(name){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try{
    const url = AIRTABLE_API_ENDPOINT + "?table=" + encodeURIComponent(name) + "&fresh=" + Date.now();
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("Content service " + res.status);
    const data = await res.json();
    return (data.records || []).map(r => r.fields || r);
  }catch(err){
    console.warn("Airtable fetch failed for " + name + " — using built-in content.", err);
    return null;
  }finally{
    clearTimeout(timeout);
  }
}

async function fetchBranding(){
  return fetchTable(TABLES.branding);
}

async function applyBrandLogo(){
  const image = document.querySelector("[data-site-logo]");
  if (!image) return;
  const logos = await fetchBranding();
  if (!logos || !logos.length) return;

  const selected = logos.find(logo => logo["Active"]) || logos[0];
  const attachment = Array.isArray(selected["Logo Image"]) && selected["Logo Image"][0]
    ? selected["Logo Image"][0].url
    : "";
  const source = attachment || selected["Logo URL"] || "";
  if (!/^https?:\/\//.test(source)) return;

  image.src = source;
  image.alt = selected["Alt Text"] || selected["Logo Name"] || "Swensen's";
}

async function applyWebsiteImages(){
  const rows = await fetchTable(TABLES.websiteImages);
  if (!rows?.length) return;

  const bySlot = new Map(rows.map(row => [row["Image Slot"], row]));

  document.querySelectorAll("[data-airtable-image]").forEach(image => {
    const row = bySlot.get(image.dataset.airtableImage);
    const source = airtableImageSource(row);
    if (!source) return;
    image.src = source;
    if (row["Alt Text"]) image.alt = row["Alt Text"];
  });

  document.querySelectorAll("[data-airtable-bg]").forEach(element => {
    const row = bySlot.get(element.dataset.airtableBg);
    const source = airtableImageSource(row);
    if (!source) return;
    element.style.setProperty("--airtable-bg-image", cssImageValue(source));
    if (row["Alt Text"] && element.getAttribute("role") === "img"){
      element.setAttribute("aria-label", row["Alt Text"]);
    }
  });

  const imageVariables = {
    "Global · Famous Flavor Frame": "--airtable-famous-frame",
    "Flavors · Autumn Seasonal Frame": "--airtable-autumn-frame",
    "Flavors · Autumn Backdrop Desktop": "--airtable-autumn-backdrop-desktop",
    "Flavors · Autumn Backdrop Mobile": "--airtable-autumn-backdrop-mobile",
  };
  Object.entries(imageVariables).forEach(([slot, variable]) => {
    const source = airtableImageSource(bySlot.get(slot));
    if (source) document.documentElement.style.setProperty(variable, cssImageValue(source));
  });

  const animatedSign = airtableImageSource(bySlot.get("Home · Animated Sign Intro"));
  const staticSign = airtableImageSource(bySlot.get("Home · Static Sign Intro"));
  const sign = document.querySelector(".brand-logo-animation");
  if (sign){
    if (animatedSign) sign.dataset.animationSrc = animatedSign;
    if (staticSign){
      sign.dataset.staticSrc = staticSign;
      sign.src = staticSign;
    }
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

function allergenDetailsHTML(f){
  const badges = badgesHTML(f);
  const content = badges || `<p class="allergen-unlisted">No Nut-Free or Egg-Free designation is listed for this flavor. Please ask our team before ordering.</p>`;
  return `<details class="allergen-details">
    <summary>Allergen details</summary>
    ${content}
  </details>`;
}

function allergenDataAttributes(f){
  return `data-flavor-card data-nut-free="${Boolean(f["Nut-Free"])}" data-egg-free="${Boolean(f["Egg-Free"])}"`;
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

const FLAVOR_PHOTO_FALLBACKS = Object.freeze({
  "Sticky Chewy Chocolate": "assets/flavor-sticky-chewy-chocolate-v1.webp",
  "Fresh Strawberry": "assets/flavor-fresh-strawberry-v1.webp",
  "Swiss Orange Chip": "assets/flavor-swiss-orange-chip-v1.webp",
  "Old-Fashioned Vanilla": "assets/flavor-old-fashioned-vanilla-v1.webp"
});

function photoOrCone(f){
  const ph = f["Photo"];
  const attachment = Array.isArray(ph) && ph[0] && ph[0].url ? ph[0].url : "";
  const remote = /^https?:\/\//.test(f["Photo URL"] || "") ? f["Photo URL"] : "";
  const source = attachment || remote || FLAVOR_PHOTO_FALLBACKS[f["Flavor Name"]] || "";
  if (source){
    return `<img class="card-photo" src="${esc(source)}" alt="${esc(f["Flavor Name"] || f["Item Name"] || "")}" loading="lazy" decoding="async">`;
  }
  return coneSVG(f["Scoop Color"]);
}

function flavorCard(f, options = {}){
  const allergenMode = options.allergenMode || "badges";
  const extraClass = options.extraClass ? " " + options.extraClass : "";
  const filterAttrs = allergenMode === "details" ? " " + allergenDataAttributes(f) : "";
  const allergenContent = allergenMode === "details" ? allergenDetailsHTML(f) : badgesHTML(f);
  if (options.portraitMode){
    return `<div class="card${extraClass}"${filterAttrs}>
      <div class="popular-portrait">${photoOrCone(f)}</div>
      <div class="popular-card-copy">
        <h3>${esc(f["Flavor Name"])}</h3>
        <p>${esc(f["Description"] || "")}</p>
        ${allergenContent}
      </div>
    </div>`;
  }
  if (options.ovalMode){
    return `<div class="card${extraClass}"${filterAttrs}>
      <div class="regular-portrait">${photoOrCone(f)}</div>
      <div class="regular-card-copy">
        <h3>${esc(f["Flavor Name"])}</h3>
        <p>${esc(f["Description"] || "")}</p>
        ${allergenContent}
      </div>
    </div>`;
  }
  return `<div class="card${extraClass}"${filterAttrs}>
    ${photoOrCone(f)}
    <h3>${esc(f["Flavor Name"])}</h3>
    <p>${esc(f["Description"] || "")}</p>
    ${allergenContent}
  </div>`;
}

/* ---------- SLIDESHOW ---------- */
function promotionSlidesHTML(records){
  return records.map(r => {
    const attachedImage = airtableImageSource(r);
    const isFall = /pumpkin|black licorice|fall flavor/i.test(`${r["Promo Label"] || ""} ${r["Caption"] || ""}`);
    const image = attachedImage || (isFall ? "assets/swensens-autumn-landscape.png" : "");
    if (!image) return "";
    // A phone-specific attachment is optional. Replacing the desktop image
    // without one must NOT leave the old fall artwork showing on phones.
    const mobileImage = airtableImageSource(r, "Mobile Image", "Mobile Image URL") ||
      (!attachedImage && isFall ? "assets/swensens-autumn-portrait.png" : "");
    const title = r["Caption"] || "Discover Swensen’s";
    const label = r["Promo Label"] || "From the parlor";
    const action = r["Button Label"] || "Explore";
    const alt = r["Alt Text"] || (isFall
      ? "Swensen’s — A taste of autumn. Pumpkin + Black Licorice. Handmade at Hyde & Union. Pumpkin and black licorice ice cream in cups and a waffle cone."
      : title);
    return `<a class="slide promotion-slide" href="${esc(campaignHref(r["Destination"]))}" aria-label="${esc(action + ": " + title)}" data-title="${esc(title)}" data-label="${esc(label)}" data-action="${esc(action)}" tabindex="-1" aria-hidden="true" inert>
      <picture>
        ${mobileImage ? `<source media="(max-width: 700px)" srcset="${esc(mobileImage)}">` : ""}
        <img src="${esc(image)}" alt="${esc(alt)}" decoding="async">
      </picture>
    </a>`;
  }).filter(Boolean).join("");
}

function buildSlideshow(container, records){
  if (!container) return;
  const slidesBox = container.querySelector(".slides");
  const dotsBox   = container.querySelector(".dots");
  if (!slidesBox || !dotsBox) return;
  if (records && records.length){
    const markup = promotionSlidesHTML(records);
    if (markup) slidesBox.innerHTML = markup;
  }
  const slides = Array.from(container.querySelectorAll(".slide"));
  if (!slides.length) return;
  let current = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stage = container.querySelector(".promotion-stage") || container;
  const status = container.querySelector("[data-promotion-status]");
  let timer = null;
  let controlsTimer = null;
  let hovered = false;
  let focused = false;
  let inView = !("IntersectionObserver" in window);
  let touchStartX = 0;
  let touchStartY = 0;
  let suppressSlideClick = false;

  dotsBox.innerHTML = "";
  slides.forEach((slide, i) => {
    const b = document.createElement("button");
    b.className = "dot-btn";
    b.type = "button";
    b.setAttribute("aria-label", `Promotion ${i + 1} of ${slides.length}: ${slide.dataset.title || "Discover Swensen’s"}`);
    b.addEventListener("click", () => { go(i, true); restart(); });
    dotsBox.appendChild(b);
  });
  const dots = Array.from(dotsBox.children);
  dotsBox.hidden = slides.length < 2;

  function wakeControls(){
    clearTimeout(controlsTimer);
    container.classList.add("controls-awake");
    controlsTimer = setTimeout(() => container.classList.remove("controls-awake"), 900);
  }
  function go(i, announce = false){
    current = (i + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.tabIndex = active ? 0 : -1;
      slide.toggleAttribute("inert", !active);
      dots[index].classList.toggle("active", active);
      dots[index].setAttribute("aria-current", String(active));
    });
    const slide = slides[current];
    const label = container.querySelector("[data-promotion-label]");
    const title = container.querySelector("[data-promotion-title]");
    const action = container.querySelector("[data-promotion-action]");
    const link = container.querySelector("[data-promotion-link]");
    if (label) label.textContent = slide.dataset.label || "From the parlor";
    if (title) title.textContent = slide.dataset.title || "Discover Swensen’s";
    if (action) action.textContent = slide.dataset.action || "Explore";
    if (link) link.setAttribute("href", slide.getAttribute("href"));
    if (announce && status) status.textContent = `Promotion ${current + 1} of ${slides.length}: ${slide.dataset.title}`;
    wakeControls();
  }
  function restart(){
    clearInterval(timer);
    if (slides.length < 2 || motionPreference.matches || hovered || focused || !inView || document.hidden) return;
    timer = setInterval(() => go(current + 1), 6500);
  }
  container.querySelectorAll("[data-dir]").forEach(btn => {
    btn.hidden = slides.length < 2;
    btn.addEventListener("click", () => { go(current + Number(btn.dataset.dir), true); restart(); });
  });
  container.addEventListener("mouseenter", () => { hovered = true; restart(); });
  container.addEventListener("mouseleave", () => { hovered = false; restart(); });
  container.addEventListener("focusin", () => { focused = true; restart(); });
  container.addEventListener("focusout", event => { focused = container.contains(event.relatedTarget); restart(); });
  container.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const slideWasFocused = slides.includes(document.activeElement);
    go(current + (event.key === "ArrowRight" ? 1 : -1), true);
    if (slideWasFocused) slides[current].focus({ preventScroll:true });
    restart();
  });
  stage.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    suppressSlideClick = false;
    clearInterval(timer);
    wakeControls();
  }, { passive:true });
  stage.addEventListener("touchend", event => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2){
      suppressSlideClick = true;
      go(current + (dx < 0 ? 1 : -1), true);
    }
    restart();
  }, { passive:true });
  stage.addEventListener("touchcancel", () => { suppressSlideClick = false; restart(); }, { passive:true });
  container.addEventListener("click", event => {
    if (suppressSlideClick && event.target.closest(".promotion-slide")){
      event.preventDefault();
      suppressSlideClick = false;
    }
  }, true);
  document.addEventListener("visibilitychange", restart);
  motionPreference.addEventListener("change", restart);
  if ("IntersectionObserver" in window){
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) wakeControls();
      restart();
    }, { threshold:.2 }).observe(stage);
  }
  go(current);
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
    const featuredNames = ["Cookies 'N Cream", "Cookie Dough", "Sticky Peanut Butter"];
    const picks = featuredNames
      .map(name => flavors.find(f => f["Flavor Name"] === name))
      .filter(Boolean);
    if (picks.length) favBox.innerHTML = picks.map(f => flavorCard(f, {
      extraClass:"popular-card",
      allergenMode:"details",
      portraitMode:true
    })).join("");
  }

  await renderReviews(3);
}

async function renderReviews(limit){
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;
  const pageIsReviews = document.body.dataset.page === "reviews";
  const reviews = await fetchTable(TABLES.reviews);

  const sourceName = review => {
    const source = review["Source"];
    return source && typeof source === "object" ? (source.name || "") : (source || "");
  };
  const platformFor = review => {
    const source = sourceName(review);
    if (/google/i.test(source)) return "Google";
    if (/yelp/i.test(source)) return "Yelp";
    if (/trip/i.test(source)) return "Tripadvisor";
    return source || "Guest Book";
  };
  const isSample = review => /sample|replace with a real review/i.test(review["Customer Name"] || "");
  const fallbackHomeReviews = [
    { "Customer Name":"Sample · Google 1", "Source":"Google", "Rating":5, "Featured":true, "Quote":"Worth the climb up the hill, every single time." },
    { "Customer Name":"Sample · Google 2", "Source":"Google", "Rating":5, "Quote":"You can taste the difference when it's made by hand in the same shop. My kids love it as much as I did growing up." },
    { "Customer Name":"Sample · Google 3", "Source":"Google", "Rating":5, "Quote":"A true San Francisco classic with welcoming service and flavors you remember long after the last scoop." },
    { "Customer Name":"Sample · Yelp 1", "Source":"Yelp", "Rating":5, "Quote":"The sticky chewy chocolate lives up to the hype. An SF institution that still feels like 1948 inside." },
    { "Customer Name":"Sample · Yelp 2", "Source":"Yelp", "Rating":5, "Quote":"The old-fashioned parlor charm is still here, and every flavor tastes like someone took the time to make it right." },
    { "Customer Name":"Sample · Yelp 3", "Source":"Yelp", "Rating":5, "Quote":"Friendly people, generous scoops, and the kind of neighborhood ice cream shop you want to keep coming back to." },
    { "Customer Name":"Sample · Tripadvisor 1", "Source":"Tripadvisor", "Rating":5, "Quote":"We take every visitor here. Cable car ride, a cone at Swensen's, then walk down to the bay. Perfect afternoon." },
    { "Customer Name":"Sample · Tripadvisor 2", "Source":"Tripadvisor", "Rating":5, "Quote":"A wonderful stop in San Francisco. The historic setting and handmade ice cream made it feel truly special." },
    { "Customer Name":"Sample · Tripadvisor 3", "Source":"Tripadvisor", "Rating":5, "Quote":"A delicious piece of local history at Hyde and Union. It was one of the sweetest memories from our trip." }
  ];
  if (!reviews || !reviews.length){
    if (!pageIsReviews){
      renderHomeReviewShowcase(fallbackHomeReviews, { sourceName, platformFor, isSample, ratingFor:() => 5, starsFor:() => "★★★★★" });
    }
    return;
  }
  const realReviews = reviews.filter(review => !isSample(review));
  const displayReviews = realReviews.length ? realReviews : reviews;
  const featured = displayReviews.find(r => r["Featured"]) || displayReviews[0];
  const featuredIsSample = isSample(featured);
  const ratingFor = review => Math.max(1, Math.min(5, Number(review["Rating"]) || 5));
  const starsFor = review => "★".repeat(ratingFor(review)) + "☆".repeat(5 - ratingFor(review));
  const fq = document.getElementById("featured-quote");
  const fs = document.getElementById("featured-src");
  if (fq && featured){
    fq.textContent = "\u201C" + (featured["Quote"] || "") + "\u201D";
    if (fs){
      const byline = featuredIsSample
        ? (pageIsReviews ? "Sample note" : "Layout preview")
        : (featured["Customer Name"] || "A happy customer");
      fs.textContent = (pageIsReviews ? "" : "— ") + byline +
        (sourceName(featured) ? " · " + sourceName(featured) : "");
    }
  }
  const featuredStars = document.getElementById("featured-stars");
  if (featuredStars){
    featuredStars.textContent = starsFor(featured);
    featuredStars.setAttribute("aria-label", ratingFor(featured) + " out of 5 stars");
  }
  const previewLabel = document.getElementById("featured-preview-label");
  if (previewLabel){
    previewLabel.hidden = !featuredIsSample;
    previewLabel.textContent = pageIsReviews ? "Sample note" : "Layout preview";
  }
  const featuredCard = document.getElementById("featured-review-card");
  if (featuredCard) featuredCard.classList.toggle("featured-review-card--sample", featuredIsSample);

  const rest = displayReviews.filter(r => r !== featured);
  const list = (limit ? rest.slice(0, limit) : rest);
  if (pageIsReviews){
    renderPlatformReviewHub(displayReviews, { sourceName, isSample, ratingFor, starsFor });
    grid.innerHTML = list.map((r, index) => {
      const sample = isSample(r);
      const source = sourceName(r) || "In Store";
      const byline = sample ? "Sample note" : (r["Customer Name"] || "A happy customer");
      return `<article class="review${sample ? " review--sample" : ""}">
        <div class="review-topline">
          <span class="stars" aria-label="${ratingFor(r)} out of 5 stars">${starsFor(r)}</span>
          <span class="review-source-badge">${esc(source)}</span>
        </div>
        <blockquote>\u201C${esc(r["Quote"] || "")}\u201D</blockquote>
        <footer><span class="src">${esc(byline)}</span><span class="review-number">${String(index + 1).padStart(2,"0")}</span></footer>
      </article>`;
    }).join("");

    const status = document.getElementById("reviews-status");
    if (status){
      status.innerHTML = realReviews.length
        ? `<strong>${realReviews.length} guest ${realReviews.length === 1 ? "story" : "stories"}:</strong> selected for this page from notes shared with Swensen's.`
        : `<strong>Preview notes:</strong> approved guest reviews can be added to this collection at any time.`;
    }
  }else{
    const homeReviewPool = [featured, ...rest].filter(Boolean);
    ["Google", "Yelp", "Tripadvisor"].forEach(platform => {
      fallbackHomeReviews
        .filter(review => platformFor(review) === platform)
        .forEach(fallback => {
          const platformCount = homeReviewPool.filter(review => platformFor(review) === platform).length;
          const alreadyIncluded = homeReviewPool.some(review =>
            platformFor(review) === platform && String(review["Quote"] || "") === fallback["Quote"]
          );
          if (platformCount < 3 && !alreadyIncluded) homeReviewPool.push(fallback);
        });
    });
    renderHomeReviewShowcase(homeReviewPool, { sourceName, platformFor, isSample, ratingFor, starsFor });
  }
}

function renderHomeReviewShowcase(reviews, helpers){
  const showcase = document.getElementById("home-review-showcase");
  const rail = document.getElementById("reviews-grid");
  const quote = document.getElementById("featured-quote");
  const source = document.getElementById("featured-src");
  const platformLabel = document.getElementById("featured-platform");
  const stars = document.getElementById("featured-stars");
  const counter = document.getElementById("home-review-counter");
  if (!showcase || !rail || !quote || !source || !platformLabel || !stars || !counter || !reviews.length) return;

  const platformOrder = ["Google", "Yelp", "Tripadvisor"];
  const platformFor = helpers.platformFor || (review => {
    const value = helpers.sourceName(review) || "";
    if (/google/i.test(value)) return "Google";
    if (/yelp/i.test(value)) return "Yelp";
    if (/trip/i.test(value)) return "Tripadvisor";
    return value || "Guest Book";
  });
  const groups = Object.fromEntries(platformOrder.map(name => [name, []]));
  reviews.filter(Boolean).forEach(review => {
    const platform = platformFor(review);
    if (groups[platform]) groups[platform].push(review);
  });
  platformOrder.forEach(platform => {
    groups[platform] = groups[platform]
      .map((review, order) => ({ review, order }))
      .sort((a, b) =>
        Number(Boolean(b.review["Featured"])) - Number(Boolean(a.review["Featured"])) ||
        helpers.ratingFor(b.review) - helpers.ratingFor(a.review) ||
        a.order - b.order
      )
      .slice(0, 3)
      .map(item => item.review);
  });

  const availablePlatforms = platformOrder.filter(name => groups[name].length);
  if (!availablePlatforms.length) return;

  let activePlatform = availablePlatforms.includes("Google") ? "Google" : availablePlatforms[0];
  let entries = groups[activePlatform];
  let current = 0;
  let fitFrame = 0;
  let touchOrigin = null;

  const fitFeaturedQuote = () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      quote.style.removeProperty("font-size");
      let size = Number.parseFloat(getComputedStyle(quote).fontSize);
      const minimum = window.innerWidth <= 650 ? 17 : 20;
      while ((quote.scrollHeight > quote.clientHeight || quote.scrollWidth > quote.clientWidth) && size > minimum){
        size -= 1;
        quote.style.fontSize = size + "px";
      }
    });
  };

  const draw = index => {
    const next = (index + entries.length) % entries.length;
    showcase.dataset.direction = index < current ? "previous" : "next";
    current = next;
    const review = entries[current];
    const byline = helpers.isSample(review)
      ? "Preview note"
      : (review["Customer Name"] || "A happy guest");

    quote.textContent = "\u201C" + String(review["Quote"] || "A sweet note from a Swensen's guest.") + "\u201D";
    source.textContent = "— " + byline;
    platformLabel.textContent = activePlatform;
    platformLabel.dataset.source = activePlatform.toLowerCase();
    stars.textContent = helpers.starsFor(review);
    stars.setAttribute("aria-label", helpers.ratingFor(review) + " out of 5 stars");
    counter.textContent = String(current + 1).padStart(2,"0") + " / " + String(entries.length).padStart(2,"0");

    rail.querySelectorAll("[data-review-platform]").forEach(button => {
      const buttonPlatform = button.dataset.reviewPlatform;
      const active = buttonPlatform === activePlatform;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      button.disabled = !groups[buttonPlatform]?.length;
    });

    showcase.classList.remove("is-swapping");
    void showcase.offsetWidth;
    showcase.classList.add("is-swapping");
    fitFeaturedQuote();
  };

  const selectPlatform = nextPlatform => {
    if (!groups[nextPlatform]?.length) return;
    activePlatform = nextPlatform;
    entries = groups[activePlatform];
    current = 0;
    draw(0);
  };

  rail.querySelectorAll("[data-review-platform]").forEach(button => {
    button.addEventListener("click", () => selectPlatform(button.dataset.reviewPlatform));
    button.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const platformIndex = availablePlatforms.indexOf(activePlatform);
      const nextPlatform = availablePlatforms[(platformIndex + direction + availablePlatforms.length) % availablePlatforms.length];
      selectPlatform(nextPlatform);
      rail.querySelector(`[data-review-platform="${nextPlatform}"]`)?.focus();
    });
  });

  showcase.querySelectorAll("[data-home-review-dir]").forEach(button => {
    button.addEventListener("click", () => draw(current + Number(button.dataset.homeReviewDir)));
  });

  showcase.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchOrigin = { x:touch.clientX, y:touch.clientY };
    showcase.classList.add("is-touching");
  }, { passive:true });
  showcase.addEventListener("touchend", event => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - touchOrigin.x;
    const distanceY = touch.clientY - touchOrigin.y;
    showcase.classList.remove("is-touching");
    touchOrigin = null;
    if (Math.abs(distanceX) >= 48 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2){
      draw(current + (distanceX < 0 ? 1 : -1));
    }
  }, { passive:true });
  showcase.addEventListener("touchcancel", () => {
    touchOrigin = null;
    showcase.classList.remove("is-touching");
  }, { passive:true });
  window.addEventListener("resize", fitFeaturedQuote);

  showcase.dataset.sources = availablePlatforms.join(",");
  draw(0);
}

function renderPlatformReviewHub(reviews, helpers){
  const feed = document.getElementById("platform-review-feed");
  const tabs = Array.from(document.querySelectorAll("[data-review-platform]"));
  const liveLink = document.getElementById("platform-live-link");
  const status = document.getElementById("platform-review-status");
  if (!feed || !tabs.length) return;

  const platformLinks = {
    Google: "https://www.google.com/maps/place/Swensen's,+1999+Hyde+St,+San+Francisco,+CA+94109",
    Yelp: "https://www.yelp.com/biz/swensens-ice-cream-san-francisco",
    Tripadvisor: "https://www.tripadvisor.com/Restaurant_Review-g60713-d370452-Reviews-Swensen_s-San_Francisco_California.html"
  };

  const draw = platform => {
    tabs.forEach(tab => {
      const active = tab.dataset.reviewPlatform === platform;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    const matching = reviews.filter(review =>
      helpers.sourceName(review).toLowerCase() === platform.toLowerCase()
    ).slice(0, 2);

    if (matching.length){
      feed.innerHTML = matching.map(review => {
        const sample = helpers.isSample(review);
        const byline = sample ? "Sample note" : (review["Customer Name"] || "A happy customer");
        return `<article class="platform-review-item${sample ? " review--sample" : ""}">
          <span class="stars" aria-label="${helpers.ratingFor(review)} out of 5 stars">${helpers.starsFor(review)}</span>
          <blockquote>\u201C${esc(review["Quote"] || "")}\u201D</blockquote>
          <div class="platform-review-meta"><span>${esc(byline)}</span><span>${esc(platform)}</span></div>
        </article>`;
      }).join("");
    }else{
      feed.innerHTML = `<div class="platform-review-empty"><p>No ${esc(platform)} review has been added to Airtable yet. Open the live platform to read the newest guest notes.</p></div>`;
    }

    if (liveLink){
      liveLink.href = platformLinks[platform];
      liveLink.textContent = `Open live ${platform} reviews \u2197`;
    }
    if (status){
      status.textContent = matching.some(review => !helpers.isSample(review))
        ? `${matching.length} recent ${platform} ${matching.length === 1 ? "review" : "reviews"}`
        : `Preview notes from ${platform}`;
    }
  };

  tabs.forEach(tab => { tab.onclick = () => draw(tab.dataset.reviewPlatform); });
  draw(tabs.find(tab => tab.classList.contains("active"))?.dataset.reviewPlatform || "Google");
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
    seasonalBox.innerHTML = seasonal.map(s => `<div class="feature-card seasonal-medallion" ${allergenDataAttributes(s)}>
      <div class="seasonal-portrait">${photoOrCone(s)}</div>
      <div class="seasonal-card-copy">
        ${s["Season / Note"] ? `<span class="season-tag">${esc(s["Season / Note"])}</span>` : ""}
        <h3>${esc(s["Flavor Name"])}</h3>
        <p>${esc(s["Description"] || "")}</p>
        ${allergenDetailsHTML(s)}
      </div>
    </div>`).join("");
  }
  if (favBox && favs.length) favBox.innerHTML = favs.map(f => flavorCard(f, {
    extraClass:"popular-card",
    allergenMode:"details",
    portraitMode:true
  })).join("");
  if (regBox && regs.length){
    regBox.innerHTML = regs.map(f => flavorCard(f, {
      extraClass:"regular-card",
      allergenMode:"details",
      ovalMode:true
    })).join("") + `
      <div class="card ghost">
        <span class="plus">+</span>
        <h3>Add the next flavor</h3>
        <p>Add a row in the Airtable "Flavors" table and it appears here.</p>
      </div>`;
  }
  applyFlavorFilters();
}

async function initMenuPage(){
  const root = document.getElementById("menu-root");
  if (!root) return;
  const items = await fetchTable(TABLES.menu);
  if (!items || !items.length) return;
  items.sort((a,b) => (a["Sort"]||99) - (b["Sort"]||99));

  const featured = items.find(i => i["Item Name"] === "Walkaway Waffle Cone Sundae");
  const categoryHTML = (cat, heading = cat) => {
    const group = items.filter(i => i["Category"] === cat && i !== featured);
    if (!group.length) return "";
    return `<div class="menu-cat reveal">
      <div class="menu-cat-head"><h2>${esc(heading)}</h2></div>
      <div class="menu-items">${group.map(i => `<div class="menu-item${i["Price"] == null ? " no-price" : ""}">
        <div class="mi-text"><h3>${esc(i["Item Name"])}</h3><p>${esc(i["Description"] || "")}</p></div>
        ${i["Price"] != null ? `<div class="mi-dots"></div><div class="mi-price">${money(i["Price"])}</div>` : ""}
      </div>`).join("")}</div>
    </div>`;
  };
  const sundaeItems = items.filter(i => i["Category"] === "Custom Sundaes");
  const sundaeRowsHTML = [
    ["Single Scoop Sundae","1 Scoop"],
    ["Double Scoop Sundae","2 Scoops"],
    ["Triple Scoop Sundae","3 Scoops"]
  ].map(([name,label]) => {
    const item = sundaeItems.find(i => i["Item Name"] === name);
    return `<div class="menu-item sundae-price-row">
      <div class="mi-text"><h3>${label}</h3><p>${esc(item?.["Description"] || "Choose any flavor and finish it your way.")}</p></div>
      <div class="mi-dots"></div>
      <div class="mi-price">${item?.["Price"] != null ? money(item["Price"]) : "—"}</div>
    </div>`;
  }).join("");
  const featuredPhoto = airtableImageSource(featured, "Photo", "Photo URL") ||
    "https://s.hdnux.com/photos/01/26/50/61/22711370/6/ratio3x2_1920.jpg";

  let html = `<article class="walkaway-feature reveal">
    <figure class="walkaway-photo">
      <img src="${esc(featuredPhoto)}" alt="A real Walkaway Waffle Cone Sundae being made at Swensen's San Francisco" loading="lazy">
      <span class="walkaway-seal"><b>The</b> Legend</span>
      <figcaption class="walkaway-photo-credit"><a href="https://www.sfgate.com/food/article/how-swensens-ice-cream-survived-17317342.php" target="_blank" rel="noopener">Real Swensen's photo · Adam Pardee / SFGATE ↗</a></figcaption>
    </figure>
    <div class="walkaway-copy">
      <span class="kicker">Made For The Hill</span>
      <h2>Walkaway Waffle Cone Sundae</h2>
      <p>${esc(featured?.["Description"] || "A two-scoop sundae served in a house-made waffle cone. Choose your flavors and sauce, then finish it with whipped cream, nuts or sprinkles, and a cherry.")}</p>
      <div class="walkaway-details">
        <span>2 scoops</span><span>House-made waffle cone</span><span>Finished your way</span>
      </div>
      <div class="walkaway-price"><span>Walk it away for</span><strong>${featured?.["Price"] != null ? money(featured["Price"]) : "$9.85"}</strong></div>
    </div>
  </article>

  <div class="menu-pair">
    ${categoryHTML("Cones & Cups", "Scoops & Cups")}
    ${categoryHTML("Toppings & Extras")}
  </div>

  <div class="menu-cat sundae-menu reveal">
    <div class="menu-cat-head"><h2>Sundaes</h2><span class="script">made your way</span></div>
    <p class="sundae-menu-lede">Pick any flavor, then choose hot fudge, hot caramel, strawberry, chocolate—or combine your sauces.</p>
    <div class="menu-items sundae-price-list">${sundaeRowsHTML}</div>
    <div class="sundae-includes">
      <strong>Every sundae includes</strong>
      <span>Whipped cream · your choice of nuts, chocolate sprinkles, or rainbow sprinkles · a cherry on top</span>
    </div>
  </div>`;

  html += categoryHTML("Shakes & Malts");
  root.innerHTML = html;
  observeReveals();
}

async function initGiftsPage(){
  const grid = document.getElementById("gifts-grid");
  if (!grid) return;
  const gifts = await fetchTable(TABLES.gifts);
  if (!gifts || !gifts.length) return;
  const order = {"Gift Cards":0,"Swensen's T-Shirt":1,"Swensen's Hoodie":2};
  const fallbackPhotos = {
    "Gift Cards":"assets/logo-cup.png",
    "Swensen's T-Shirt":"assets/swensens-real-tshirt.jpg",
    "Swensen's Hoodie":"assets/swensens-real-hoodie.jpg",
  };
  gifts.sort((a,b) => (order[a["Item Name"]] ?? 99) - (order[b["Item Name"]] ?? 99));
  const lifestyleRecord = gifts.find(g => airtableImageSource(g, "Lifestyle Photo", "Lifestyle Photo URL"));
  const lifestyleURL = airtableImageSource(lifestyleRecord, "Lifestyle Photo", "Lifestyle Photo URL");
  const merchHero = document.querySelector(".merch-hero");
  if (merchHero && lifestyleURL){
    const safeLifestyleURL = lifestyleURL.replace(/["'()\\]/g, "");
    merchHero.style.setProperty("--merch-hero-image", `url("${safeLifestyleURL}")`);
  }
  grid.innerHTML = gifts.map(g => {
    const airtablePhoto = Array.isArray(g["Photo"]) && g["Photo"][0] ? g["Photo"][0].url : null;
    const photoURL = /^https?:\/\//.test(g["Photo URL"] || "") ? g["Photo URL"] : null;
    const photo = airtablePhoto || photoURL || fallbackPhotos[g["Item Name"]] || "assets/logo-cup.png";
    const link = g["Button Link"] && /^https?:\/\//.test(g["Button Link"]) ? g["Button Link"] : null;
    const giftClass = g["Item Name"] === "Gift Cards" ? " gift-card" : " merch-apparel";
    return `<div class="gift${giftClass}">
      <div class="gift-art"><img src="${esc(photo)}" alt="${esc(g["Item Name"])}" loading="lazy"></div>
      <h3>${esc(g["Item Name"])}</h3>
      ${g["Price"] ? `<div class="gift-price">${money(g["Price"])}</div>` : ""}
      <p>${esc(g["Description"] || "")}</p>
      ${g["Sizes"] ? `<span class="sizes">${esc(g["Sizes"])}</span>` : ""}
      ${link ? `<a class="btn btn-red" href="${esc(link)}">${esc(g["Button Text"] || "Learn More")}</a>` : ""}
    </div>`;
  }).join("");
}

function customerVideoSource(value){
  const raw = String(value || "").trim();
  if (!/^https:\/\//i.test(raw)) return null;
  try{
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be"){
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (/^[A-Za-z0-9_-]{6,}$/.test(id || "")) return { type:"embed", src:`https://www.youtube.com/embed/${id}` };
    }
    if (host === "youtube.com" || host === "m.youtube.com"){
      const id = url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : url.searchParams.get("v");
      if (/^[A-Za-z0-9_-]{6,}$/.test(id || "")) return { type:"embed", src:`https://www.youtube.com/embed/${id}` };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com"){
      const id = url.pathname.split("/").filter(Boolean).find(part => /^\d+$/.test(part));
      if (id) return { type:"embed", src:`https://player.vimeo.com/video/${id}` };
    }
    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(raw)) return { type:"video", src:raw };
    return { type:"link", src:raw };
  }catch(_err){
    return null;
  }
}

function customerVideoPoster(video){
  const attachment = Array.isArray(video["Poster"]) && video["Poster"][0]?.url ? video["Poster"][0].url : "";
  const remote = /^https:\/\//i.test(video["Poster URL"] || "") ? video["Poster URL"] : "";
  return attachment || remote;
}

function renderCustomerVideoStage(stage, video){
  const source = customerVideoSource(video["Video URL"]);
  const poster = customerVideoPoster(video);
  const title = video["Title"] || "A note from the parlor";
  const guest = video["Guest Name"] || "A Swensen's guest";
  const caption = video["Caption"] || "What keeps you coming back to Hyde & Union?";
  let media = "";

  if (source?.type === "embed"){
    media = `<iframe src="${esc(source.src)}" title="${esc(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }else if (source?.type === "video"){
    media = `<video controls playsinline preload="metadata"${poster ? ` poster="${esc(poster)}"` : ""}><source src="${esc(source.src)}"></video>`;
  }else if (source?.type === "link"){
    media = `<a class="customer-video-external" href="${esc(source.src)}" target="_blank" rel="noopener">${poster ? `<img src="${esc(poster)}" alt="">` : ""}<span class="customer-video-play" aria-hidden="true">▶</span><span>Watch this guest story ↗</span></a>`;
  }

  stage.innerHTML = `<div class="customer-video-media">${media}</div>
    <div class="customer-video-caption">
      <div><span class="kicker">In Their Own Words</span><h3>${esc(title)}</h3></div>
      <p>${esc(caption)}</p>
      <span class="customer-video-guest">— ${esc(guest)}</span>
    </div>`;
}

async function initCustomerVideos(){
  const stage = document.getElementById("customer-video-stage");
  const list = document.getElementById("customer-video-list");
  if (!stage || !list) return;
  const rows = await fetchTable(TABLES.customerVideos);
  const videos = (rows || [])
    .filter(video => customerVideoSource(video["Video URL"]))
    .sort((a,b) => (a["Sort"] ?? 99) - (b["Sort"] ?? 99));
  if (!videos.length) return;

  const select = index => {
    renderCustomerVideoStage(stage, videos[index]);
    Array.from(list.children).forEach((button, i) => {
      button.classList.toggle("active", i === index);
      button.setAttribute("aria-pressed", String(i === index));
    });
  };

  list.innerHTML = videos.map((video, index) => `<button type="button" class="customer-video-choice${index === 0 ? " active" : ""}" aria-pressed="${index === 0}">
    <span>${String(index + 1).padStart(2,"0")}</span>
    <b>${esc(video["Title"] || video["Guest Name"] || "Guest story")}</b>
  </button>`).join("");
  list.hidden = videos.length < 2;
  Array.from(list.children).forEach((button, index) => button.addEventListener("click", () => select(index)));
  select(0);
}

async function initReviewsPage(){
  await Promise.all([renderReviews(0), initCustomerVideos()]); // 0 = show all
}

/* ---------- FLAVOR ALLERGEN FILTERS ---------- */
const flavorFilterState = { nut:false, egg:false };

function applyFlavorFilters(){
  const cards = Array.from(document.querySelectorAll("[data-flavor-card]"));
  if (!cards.length) return;
  const active = flavorFilterState.nut || flavorFilterState.egg;
  let visibleCount = 0;

  cards.forEach(card => {
    const matchesNut = !flavorFilterState.nut || card.dataset.nutFree === "true";
    const matchesEgg = !flavorFilterState.egg || card.dataset.eggFree === "true";
    const visible = matchesNut && matchesEgg;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  document.body.classList.toggle("flavor-filters-active", active);
  document.querySelectorAll("[data-flavor-section]").forEach(section => {
    const hasVisibleFlavor = Array.from(section.querySelectorAll("[data-flavor-card]")).some(card => !card.hidden);
    section.hidden = !hasVisibleFlavor;
  });

  const count = document.querySelector("[data-filter-count]");
  if (count){
    count.textContent = active
      ? `${visibleCount} matching flavor${visibleCount === 1 ? "" : "s"}`
      : `Showing all ${visibleCount} flavors`;
  }

  const activeCount = Number(flavorFilterState.nut) + Number(flavorFilterState.egg);
  const activeBadge = document.querySelector("[data-filter-active-count]");
  const drawerButton = document.querySelector("[data-filter-drawer-open]");
  if (activeBadge){
    activeBadge.hidden = activeCount === 0;
    activeBadge.textContent = String(activeCount);
  }
  if (drawerButton) drawerButton.classList.toggle("has-active-filters", activeCount > 0);

  const jump = document.querySelector("[data-jump-to-results]");
  if (jump){
    jump.hidden = !active;
    jump.disabled = visibleCount === 0;
    jump.innerHTML = visibleCount
      ? `View ${visibleCount} matching flavor${visibleCount === 1 ? "" : "s"} <span aria-hidden="true">↓</span>`
      : "No matching flavors";
  }
  window.dispatchEvent(new Event("flavor-layout-change"));
}

function initFlavorFilters(){
  const drawer = document.getElementById("flavor-filter-drawer");
  const openButton = document.querySelector("[data-filter-drawer-open]");
  const closeButtons = document.querySelectorAll("[data-filter-drawer-close]");
  let lastFocused = null;

  const closeDrawer = ({ restoreFocus = true } = {}) => {
    if (!drawer) return;
    document.body.classList.remove("flavor-filter-drawer-open");
    drawer.setAttribute("aria-hidden", "true");
    openButton?.setAttribute("aria-expanded", "false");
    if (restoreFocus) (lastFocused || openButton)?.focus({ preventScroll:true });
  };
  const openDrawer = () => {
    if (!drawer) return;
    lastFocused = document.activeElement;
    document.body.classList.add("flavor-filter-drawer-open");
    drawer.setAttribute("aria-hidden", "false");
    openButton?.setAttribute("aria-expanded", "true");
    drawer.querySelector(".filter-toggle")?.focus({ preventScroll:true });
  };

  openButton?.addEventListener("click", openDrawer);
  closeButtons.forEach(button => button.addEventListener("click", () => closeDrawer()));
  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("flavor-filter-drawer-open") || !drawer) return;
    if (event.key === "Escape"){
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key === "Tab"){
      const focusable = Array.from(drawer.querySelectorAll("button:not([disabled]), a[href]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first){
        event.preventDefault();
        last.focus();
      }else if (!event.shiftKey && document.activeElement === last){
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll("[data-allergen-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.allergenFilter;
      flavorFilterState[key] = !flavorFilterState[key];
      button.setAttribute("aria-pressed", String(flavorFilterState[key]));
      applyFlavorFilters();
    });
  });
  const clear = document.querySelector("[data-clear-filters]");
  if (clear){
    clear.addEventListener("click", () => {
      flavorFilterState.nut = false;
      flavorFilterState.egg = false;
      document.querySelectorAll("[data-allergen-filter]").forEach(button => button.setAttribute("aria-pressed", "false"));
      applyFlavorFilters();
    });
  }
  const jump = document.querySelector("[data-jump-to-results]");
  if (jump){
    jump.addEventListener("click", () => {
      const firstVisibleSection = Array.from(document.querySelectorAll("[data-flavor-section]"))
        .find(section => !section.hidden);
      if (firstVisibleSection){
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        closeDrawer({ restoreFocus:false });
        firstVisibleSection.scrollIntoView({ behavior, block:"start" });
      }
    });
  }
  applyFlavorFilters();
}

/* Keep the edge filter attached to the flavor case instead of covering the
   craft section and footer after the final flavor scrolls past. */
function initFlavorFilterBoundary(){
  const button = document.querySelector("[data-filter-drawer-open]");
  const sections = Array.from(document.querySelectorAll("[data-flavor-section]"));
  if (!button || !sections.length) return;

  let frame = 0;
  let previousShift = 0;

  const update = () => {
    frame = 0;
    const lastVisibleSection = sections.filter(section => !section.hidden).at(-1) || sections.at(-1);
    if (!lastVisibleSection) return;

    const buttonRect = button.getBoundingClientRect();
    const naturalBottom = buttonRect.bottom - previousShift;
    const sectionBottom = lastVisibleSection.getBoundingClientRect().bottom;
    const edgeGap = window.innerWidth <= 600 ? 16 : 22;
    const nextShift = Math.min(0, Math.floor(sectionBottom - edgeGap - naturalBottom));

    previousShift = nextShift;
    button.style.setProperty("--flavor-filter-boundary-shift", `${nextShift}px`);
    button.classList.toggle("is-boundary-stopped", nextShift < 0);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive:true });
  window.addEventListener("resize", schedule);
  window.addEventListener("flavor-layout-change", schedule);
  if ("ResizeObserver" in window){
    const observer = new ResizeObserver(schedule);
    sections.forEach(section => observer.observe(section));
  }
  schedule();
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

/* ---------- current parlor hours (San Francisco time) ---------- */
function highlightTodayHours(){
  const today = new Intl.DateTimeFormat("en-US", {
    weekday:"long",
    timeZone:"America/Los_Angeles",
  }).format(new Date());

  document.querySelectorAll(".hours").forEach(card => {
    card.querySelectorAll("tr[data-day]").forEach(row => {
      row.classList.remove("today");
      row.removeAttribute("aria-current");
    });
    const row = card.querySelector(`tr[data-day="${today}"]`);
    if (!row) return;
    row.classList.add("today");
    row.setAttribute("aria-current", "date");
    const dayLabel = card.querySelector("[data-current-day]");
    const hoursLabel = card.querySelector("[data-current-hours]");
    if (dayLabel) dayLabel.textContent = `Today · ${today}`;
    if (hoursLabel) hoursLabel.textContent = row.cells[1].textContent;
  });
}

/* ---------- footer location + business hours ---------- */
function enhanceFooter(){
  const footer = document.querySelector("body > footer");
  const grid = footer?.querySelector(".foot-grid");
  if (!footer || !grid) return;

  grid.classList.add("foot-grid-with-hours");
  const identity = grid.firstElementChild;
  identity?.classList.add("footer-identity");

  Array.from(grid.children).forEach(section => {
    const label = section.querySelector("h4")?.textContent.trim().toLowerCase();
    if (label === "explore") section.classList.add("footer-explore");
    if (label === "fans") section.classList.add("footer-fans");
    if (label === "connect") section.classList.add("footer-connect");
  });

  const socialIcons = {
    Instagram:`<svg class="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.1"></circle><circle class="footer-social-dot" cx="17.4" cy="6.7" r="1.1"></circle></svg>`,
    Facebook:`<svg class="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.1 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H8V13h2.7v8h3.4Z"></path></svg>`,
    Yelp:`<svg class="footer-social-icon footer-social-icon-yelp" viewBox="0 0 24 24" aria-hidden="true"><path d="m11 2 2 .1-.1 7.5-2.4.7L7 3.7 11 2Zm4.1 8.4 5-2.9 1.6 3.9-6.1 2.1-1.5-1.9 1-1.2Zm.2 4.7 6.3 2.3-2.5 3.5-5.1-4.1.5-2.3.8.6Zm-4.3 1.3-.2 6.6-4.2-1.1 2.2-6.3 2.4-.1-.2.9Zm-3.3-3.1-4.1 5.1L1 15l5.6-3.7 1.9 1.5-.8.5Z"></path></svg>`
  };
  grid.querySelectorAll(".footer-connect a").forEach(link => {
    const label = link.textContent.trim();
    const icon = socialIcons[label];
    if (!icon || link.classList.contains("footer-social-link")) return;
    link.classList.add("footer-social-link");
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    link.innerHTML = `${icon}<span class="footer-social-name">${label}</span>`;
  });

  if (identity && !identity.querySelector(".footer-location")){
    identity.insertAdjacentHTML("beforeend", `<div class="footer-location">
      <a href="https://goo.gl/maps/P2N2HEAVufNcdwCVA">1999 Hyde St<br>San Francisco, CA 94109</a>
      <a href="tel:+14157756818">(415) 775-6818</a>
    </div>`);
  }

  if (grid.querySelector(".footer-hours")) return;
  grid.insertAdjacentHTML("beforeend", `<div class="hours footer-hours">
    <h3>Business Hours</h3>
    <div class="hours-current" aria-live="polite">
      <span data-current-day>Today</span>
      <strong data-current-hours>12 – 10 PM</strong>
    </div>
    <table>
      <tr class="closed" data-day="Monday"><td>Monday</td><td>Closed</td></tr>
      <tr data-day="Tuesday"><td>Tuesday</td><td>12 – 10 PM</td></tr>
      <tr data-day="Wednesday"><td>Wednesday</td><td>12 – 10 PM</td></tr>
      <tr data-day="Thursday"><td>Thursday</td><td>12 – 10 PM</td></tr>
      <tr data-day="Friday"><td>Friday</td><td>12 – 10 PM</td></tr>
      <tr data-day="Saturday"><td>Saturday</td><td>12 – 10 PM</td></tr>
      <tr data-day="Sunday"><td>Sunday</td><td>12 – 10 PM</td></tr>
    </table>
  </div>`);
}

/* ---------- iPhone / small-screen navigation ---------- */
function initMobileNavigation(){
  const nav = document.querySelector("nav.site-nav");
  const navInner = nav?.querySelector(".nav-inner");
  const desktopLinks = nav?.querySelector(".nav-links");
  if (!nav || !navInner || !desktopLinks) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && !viewport.content.includes("viewport-fit=cover")){
    viewport.content += ", viewport-fit=cover";
  }

  const toggle = document.createElement("button");
  toggle.className = "mobile-menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "mobile-site-menu");
  toggle.setAttribute("aria-label", "Open site menu");
  toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><b>Menu</b>';

  const backdrop = document.createElement("button");
  backdrop.className = "mobile-menu-backdrop";
  backdrop.type = "button";
  backdrop.tabIndex = -1;
  backdrop.setAttribute("aria-label", "Close site menu");

  const panel = document.createElement("div");
  panel.className = "mobile-menu-panel";
  panel.id = "mobile-site-menu";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Site navigation");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `<div class="mobile-menu-head">
      <div class="mobile-menu-intro"><span>Explore the parlor</span><strong>Hyde &amp; Union · Since 1948</strong></div>
      <button class="mobile-menu-close" type="button" aria-label="Close site menu"><span aria-hidden="true">&times;</span></button>
    </div>
    <div class="mobile-menu-links">${desktopLinks.innerHTML}</div>
    <a class="mobile-menu-directions" href="https://goo.gl/maps/P2N2HEAVufNcdwCVA"><span aria-hidden="true">⌖</span> Get Directions</a>
    <p class="mobile-menu-address">1999 Hyde Street · San Francisco</p>`;

  const quickActions = document.createElement("nav");
  quickActions.className = "mobile-quick-actions";
  quickActions.setAttribute("aria-label", "Quick actions");
  quickActions.innerHTML = `<a href="https://goo.gl/maps/P2N2HEAVufNcdwCVA"><span aria-hidden="true">⌖</span>Directions</a>
    <a class="mobile-order-action" href="https://swensensofsf.com/order-online/"><span aria-hidden="true">🍨</span>Order Online</a>`;

  const close = () => {
    document.body.classList.remove("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open site menu");
    panel.setAttribute("aria-hidden", "true");
    toggle.focus({ preventScroll:true });
  };
  const open = () => {
    document.body.classList.add("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close site menu");
    panel.setAttribute("aria-hidden", "false");
    panel.querySelector(".mobile-menu-close")?.focus({ preventScroll:true });
  };

  toggle.addEventListener("click", () => document.body.classList.contains("mobile-menu-open") ? close() : open());
  backdrop.addEventListener("click", close);
  panel.querySelector(".mobile-menu-close")?.addEventListener("click", close);
  panel.addEventListener("click", event => { if (event.target.closest("a")) close(); });
  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("mobile-menu-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "Tab"){
      const focusable = Array.from(panel.querySelectorAll("a, button:not([disabled])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first){
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last){
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) close(); });

  navInner.append(toggle);
  nav.append(backdrop, panel);
  document.body.append(quickActions);
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  observeReveals();
  applyBrandLogo();
  window.swensensImagesReady = applyWebsiteImages();
  enhanceFooter();
  highlightTodayHours();
  setInterval(highlightTodayHours, 60000);
  const page = document.body.dataset.page;
  if (page === "home")    initHome();
  if (page === "flavors"){
    initFlavorFilters();
    initFlavorFilterBoundary();
    initFlavorsPage();
  }
  if (page === "menu")    initMenuPage();
  if (page === "gifts")   initGiftsPage();
  if (page === "reviews") initReviewsPage();
});
