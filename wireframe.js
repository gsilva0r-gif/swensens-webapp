(function(){
  "use strict";

  const pages = [
    {
      id:"overview", name:"Overview", path:"wireframe.html", summary:"Information architecture, reusable patterns, and rules shared by the entire Swensen's website.",
      sections:[
        {type:"overview",tone:"alt",eyebrow:"Website architecture",title:"One historic corner. Seven focused pages.",copy:"The navigation stays intentionally small. Each page has one clear job while shared actions keep directions, ordering, and store information close at hand.",items:["Home|Brand moment · promotions · favorites · reviews","Flavors|Seasonals · top flavors · classics · filter","Menu|Walkaway sundae · scoops · toppings · shakes","Gifts|Gift cards · shirts · hoodies · bulk orders","Reviews|Love notes · keepsakes · platform reviews","Our Story|Earle Swensen · timeline · living legacy","Contact|Location · hours · map · bulk ordering"]},
        {type:"components",eyebrow:"Shared interface",title:"A consistent system from page to page.",copy:"These pieces repeat across desktop and mobile. Their final visual styling stays Swensen's-specific; this document focuses on structure and behavior.",items:["Header + nav","Section heading","Image frame","Flavor card","Review note","Primary action","Side filter","Footer"]},
        {type:"split",tone:"dark",eyebrow:"Responsive rules",title:"Desktop tells the story. Mobile gets people there quickly.",copy:"Desktop layouts use editorial split screens and wider collages. Mobile stacks content, enables finger-swiping, opens a full-screen menu, and keeps Directions and Order Online accessible.",media:"DESKTOP + MOBILE BEHAVIOR"}
      ],
      notes:[
        ["Page structure","Seven customer-facing pages keep the site easy to understand without hiding important content."],
        ["Shared components","Header, footer, cards, notes, buttons, filters, and mobile actions should become reusable Figma components."],
        ["Responsive behavior","Mobile is a deliberate layout, not a compressed desktop page. Cards stack and carousels use touch gestures."],
        ["CMS ownership","Every customer photo, product image, promotion, review, price, and seasonal label remains replaceable through Airtable."],
        ["Final typography","Production uses Alfa Slab One, Yellowtail, and Karla. Neutral type here keeps attention on hierarchy and flow."]
      ]
    },
    {
      id:"home", name:"Homepage", path:"index.html", summary:"The front door: the animated original logo, seasonal promotions, signature flavors, guest reviews, history, and merchandise.",
      sections:[
        {type:"brand",eyebrow:"Opening brand moment",title:"THE Original  ·  SWENSEN'S",copy:"A quiet, full-screen introduction gives the hand-written wordmark room to animate before promotions begin.",media:"ONE-TIME CALLIGRAPHY ANIMATION"},
        {type:"hero",tone:"alt",eyebrow:"Seasonal promotions",title:"A little something to look forward to.",copy:"Large campaign image, short seasonal message, pagination dots, and a clear destination. The whole slide is clickable.",media:"PROMOTION CAROUSEL",buttons:["See fall flavors"]},
        {type:"cards",eyebrow:"Scooped daily",title:"House favorites, churned the slow way.",copy:"Three top flavors appear immediately, with generous imagery and complete outside frames.",items:["Cookies 'N Cream","Cookie Dough","Sticky Peanut Butter"],ornate:true,filter:true},
        {type:"reviews",tone:"redwash",eyebrow:"Guest reviews",title:"What our guests say.",copy:"Google, Yelp, and TripAdvisor remain separate. Swipe or advance through three reviews without changing platforms."},
        {type:"split",tone:"dark",eyebrow:"Since 1948",title:"The parlor that started it all.",copy:"A concise origin story connects the homepage to the full Our Story timeline.",media:"HISTORIC STOREFRONT PHOTO",buttons:["Read our story"]},
        {type:"cards",tone:"alt",eyebrow:"Gifts & merch",title:"Wear a little parlor history.",copy:"Gift cards and apparel get a compact preview before linking to the full Gifts page.",items:["Gift cards","Classic shirt","Swensen's hoodie"]},
        {type:"footer"}
      ],
      notes:[
        ["Logo animation","‘Original’ writes as one continuous hand stroke, including the g loop and tail. It plays once after load; Swensen's fades left-to-right afterward."],
        ["Intentional breathing room","Keep a large scrollable gap after the brand animation so the promotion area feels like the next chapter, not an overlay."],
        ["Promotion behavior","Campaign images are Airtable-editable and the entire slide links to its destination."],
        ["Flavor frames","The ornate frame sits outside each card so photos and lettering remain unobstructed on desktop and mobile."],
        ["Platform-specific reviews","A selected platform loops only its own three reviews. Changing platform requires clicking its tab."],
        ["Mobile gestures","Promotion and review rails support finger-swiping; no large previous/next arrows on mobile."],
        ["Footer utility","Hours highlight the current day and repeat Directions, Order Online, phone, and address."]
      ]
    },
    {
      id:"flavors", name:"Flavors", path:"flavors.html", summary:"A browsable flavor case with prominent filtering, complete ornamental frames, and distinct seasonal and everyday sections.",
      sections:[
        {type:"hero",eyebrow:"Flavor directory",title:"Our Flavors",copy:"A clear introduction explains handmade batches and allergen information without delaying access to the case.",media:"FEATURED SCOOPS",buttons:["Open filter"]},
        {type:"cards",tone:"autumn",eyebrow:"Seasonal case",title:"Autumn at Hyde & Union.",copy:"Warm orange paper, scattered fall leaves, and fully visible exterior frames distinguish limited flavors.",items:["Black Licorice","Pumpkin"],ornate:true,filter:true},
        {type:"cards",eyebrow:"Top flavors",title:"The ones people cross town for.",copy:"Wider cards prevent the frame from covering photos, names, descriptions, or allergen details.",items:["Cookies 'N Cream","Cookie Dough","Sticky Peanut Butter"],ornate:true,filter:true},
        {type:"cards",tone:"alt",eyebrow:"Always in the case",title:"The everyday classics.",copy:"The full selection uses a simpler card treatment for fast scanning.",items:["Vanilla","Chocolate","Mint Chip","Rocky Road","Strawberry","Coffee"],columns:3},
        {type:"split",tone:"dark",eyebrow:"Made in store",title:"Watch it being made.",copy:"Short production footage reinforces the handmade process and links visitors to the store.",media:"ICE CREAM MAKING VIDEO",buttons:["Plan your visit"]},
        {type:"footer"}
      ],
      notes:[
        ["Filter placement","Keep the bold Find Your Scoop tab docked to the side. It must remain noticeable without covering flavor names or controls."],
        ["Filter flow","Egg-Free and Nut-Free filters open in a side drawer, update the case, then move focus to the first matching flavor."],
        ["Seasonal atmosphere","Use the orange autumn leaf backdrop only around the fall section so the seasonal case feels special."],
        ["Frame construction","Frames wrap the outside of the whole card. All four edges remain visible regardless of content height."],
        ["Allergen details","Each card expands independently. Keep the label readable and the touch target at least 44px on mobile."],
        ["Airtable content","Flavor photo, name, description, category, seasonal tag, and allergens stay editable."]
      ]
    },
    {
      id:"menu", name:"Menu", path:"menu.html", summary:"A readable parlor menu ordered around how guests buy: signature sundae, scoops, toppings, sundaes, then shakes.",
      sections:[
        {type:"hero",eyebrow:"Parlor menu",title:"The Menu",copy:"Simple opening copy and pricing guidance lead directly into the signature item.",media:"COUNTER / MENU PHOTO"},
        {type:"split",tone:"dark",eyebrow:"Signature favorite",title:"Walkaway Waffle Cone Sundae",copy:"Large product photo, short explanation, included toppings, and price make this the visual anchor.",media:"WALKAWAY SUNDAE PHOTO",buttons:["See ingredients"]},
        {type:"menu",eyebrow:"Choose your scoop",title:"Scoops & Cups",items:["Single scoop|$","Double scoop|$","Triple scoop|$","Waffle cone|+"]},
        {type:"menu",tone:"alt",eyebrow:"Finish it your way",title:"Toppings & Extras",items:["Hot fudge|+","Chocolate dip|+","Whipped cream|+","Nuts or sprinkles|+","Cherry|+"]},
        {type:"menu",eyebrow:"Made your way",title:"Sundaes",items:["One-scoop sundae|$","Two-scoop sundae|$","Three-scoop sundae|$","Build-your-own includes|Sauce · cream · topping · cherry"]},
        {type:"menu",tone:"alt",eyebrow:"Blended at the counter",title:"Shakes & Malts",items:["Classic shake|$","Malt|$","Extra thick|+"]},
        {type:"footer"}
      ],
      notes:[
        ["Category order","Preserve the approved order: Walkaway, Scoops & Cups, Toppings & Extras, Sundaes, then Shakes & Malts."],
        ["Signature hierarchy","The Walkaway Sundae gets the only full-bleed product feature on this page."],
        ["Price maintenance","Prices and menu labels remain Airtable-editable so staff can update them without touching code."],
        ["Mobile readability","Use one menu column, generous row spacing, and prices aligned consistently at the right edge."],
        ["Allergen legend","Place a short shared legend near the menu ending rather than repeating a long warning in every row."]
      ]
    },
    {
      id:"gifts", name:"Gifts", path:"gifts.html", summary:"A compact storefront for gift cards and branded apparel, plus a clear route for office, party, and event orders.",
      sections:[
        {type:"hero",eyebrow:"Take the parlor home",title:"Gifts & Merch",copy:"Real merchandise imagery introduces gift cards, shirts, and hoodies without turning the page into a full ecommerce catalog.",media:"MERCHANDISE HERO"},
        {type:"cards",eyebrow:"From Hyde & Union",title:"A little Swensen's to keep.",copy:"Each product card shows a replaceable photo, available sizes or value, and an Ask In Store action.",items:["Gift cards","Classic T-shirt · S–2XL","Swensen's hoodie · S–2XL"],columns:3},
        {type:"split",tone:"dark",eyebrow:"Parties · offices · events",title:"Feeding a crowd?",copy:"Bulk orders receive a strong, dedicated callout with a simple contact path.",media:"BULK ORDER / PARTY PHOTO",buttons:["Ask about bulk orders"]},
        {type:"footer"}
      ],
      notes:[
        ["Real product photography","Use actual gift card, shirt, and hoodie photos. These are Airtable-editable like the rest of the site."],
        ["Product scope","Show only the approved products and apparel size range S–2XL."],
        ["Purchase path","Until ecommerce is added, every product uses the honest Ask In Store action rather than a fake checkout."],
        ["Bulk ordering","Separate large-order inquiries from individual merchandise so each audience has a clear next step."],
        ["Mobile cards","Stack merchandise cards with a fixed image ratio so products remain comparable while scrolling."]
      ]
    },
    {
      id:"reviews", name:"Reviews", path:"reviews.html", summary:"An expressive love-note scrapbook built from guest quotes, happy-customer Polaroids, children's drawings, and platform-specific review stacks.",
      sections:[
        {type:"reviews",tone:"redwash",eyebrow:"Guest book",title:"Love notes to the corner.",copy:"A red-washed customer-photo backdrop supports one featured handwritten-style review and two scattered keepsakes."},
        {type:"reviews",eyebrow:"Swipeable notes",title:"Little notes. Big love.",copy:"A horizontal paper-note rail keeps short reviews playful and easy to browse by touch."},
        {type:"collage",tone:"alt",eyebrow:"Community keepsakes",title:"Smiles, scoops & masterpieces.",copy:"Happy customer photos and kids' drawings overlap like a carefully arranged scrapbook—not a rigid gallery."},
        {type:"reviews",tone:"dark",eyebrow:"Review platforms",title:"More notes, straight from the source.",copy:"Google, Yelp, and TripAdvisor tabs each control their own three-review loop."},
        {type:"split",eyebrow:"A San Francisco legacy",title:"A legacy you can still taste.",copy:"Awards and a historic store image connect present-day love to the shop's long history.",media:"BEST OF BAY AREA / STOREFRONT",buttons:["Read our story"]},
        {type:"split",tone:"alt",eyebrow:"Guest video",title:"One sweet question.",copy:"A replaceable customer-video slot adds a living voice without overpowering written reviews.",media:"CUSTOMER VIDEO SLOT"},
        {type:"hero",tone:"dark",eyebrow:"Add to the guest book",title:"Leave a little love note.",copy:"End with direct links to the chosen review platforms.",media:"SCATTERED LOVE NOTES",buttons:["Review on Google","Review on Yelp"]},
        {type:"footer"}
      ],
      notes:[
        ["Creative direction","Treat the page like a beloved shop scrapbook: taped Polaroids, paper notes, kid art, and restrained red accents."],
        ["Real community imagery","Prioritize photos of guests smiling inside or in front of the store; avoid stock-looking ice cream photography."],
        ["Touch navigation","Note rails are finger-scrollable on mobile. Do not show bulky previous/next arrows."],
        ["Platform integrity","Swiping a Google review never changes to Yelp. A platform changes only when its tab is selected."],
        ["Kid drawings","Children's artwork appears as genuine keepsakes with enough whitespace to remain readable."],
        ["Video flexibility","The video block can be hidden cleanly if Airtable has no uploaded story."],
        ["Review links","Source labels and external review actions clearly state where the review came from."]
      ]
    },
    {
      id:"story", name:"Our Story", path:"about.html", summary:"A history-led narrative beginning with Earle Swensen, moving through a true Swensen's timeline, and ending with the living legacy at Hyde and Union.",
      sections:[
        {type:"split",tone:"dark",eyebrow:"The beginning",title:"Earle Swensen",copy:"Open with the founder, his 1948 start, and one clear statement of what he believed ice cream should be.",media:"FOUNDER / EARLY PARLOR PHOTO"},
        {type:"timeline",eyebrow:"Our timeline",title:"From one corner to generations of memories.",copy:"A horizontal desktop timeline becomes a clean vertical path on mobile.",items:["1948|Earle opens the original parlor","1950s|A neighborhood tradition grows","Decades|Handmade methods continue","Today|The Hyde & Union legacy lives on"]},
        {type:"split",tone:"alt",eyebrow:"Chapter 01",title:"The people behind the parlor.",copy:"Scroll-led chapters pair concise copy with a highlighted photo for each part of the story.",media:"TEAM / MAKING ICE CREAM"},
        {type:"split",eyebrow:"Chapter 02",title:"The corner that became a landmark.",copy:"The storefront and neighborhood establish a strong sense of place.",media:"HYDE & UNION STOREFRONT"},
        {type:"split",tone:"alt",eyebrow:"Chapter 03",title:"Still made with care.",copy:"Show the production process and explain what remains intentionally old-fashioned.",media:"HANDMADE PROCESS"},
        {type:"split",tone:"dark",eyebrow:"Living legacy",title:"History you can still walk into.",copy:"Close the story with recognition, continuity, and an invitation to visit—not a museum-style ending.",media:"LEGACY / AWARD PHOTO",buttons:["Explore flavors","See the menu"]},
        {type:"hero",eyebrow:"Visit the original",title:"The story tastes better in person.",copy:"Address, hours, and directions bridge directly into the Contact page.",media:"CURRENT STORE PHOTO",buttons:["Hours & contact"]},
        {type:"footer"}
      ],
      notes:[
        ["Founder first","Earle Swensen and the 1948 beginning must be the first story visitors encounter."],
        ["Swensen's timeline","Every milestone must be genuinely about Swensen's. Verify dates and details before final copy is published."],
        ["Scroll storytelling","Desktop chapters can pin or highlight one photo as visitors move through sections; mobile stacks them naturally."],
        ["Legacy emphasis","Keep the message that Swensen's is a living legacy business, not simply a nostalgic brand."],
        ["Photo ownership","Founder, historic, team, storefront, process, and award images remain separately editable in Airtable."],
        ["Visit conversion","The final chapter should naturally lead to directions and hours rather than ending abruptly."]
      ]
    },
    {
      id:"contact", name:"Contact", path:"contact.html", summary:"Everything needed to visit or reach the one Swensen's shop, plus a dedicated bulk-order inquiry path.",
      sections:[
        {type:"hero",eyebrow:"Visit the original",title:"Come Say Hi",copy:"Lead with the single-store message, the Hyde & Union address, and immediate directions.",media:"CURRENT STOREFRONT",buttons:["Get directions","Call the shop"]},
        {type:"contact",eyebrow:"One shop · one corner · since 1948",title:"Plan your visit.",copy:"Map, weekly hours, phone, accessibility notes, and transit context sit together."},
        {type:"split",tone:"alt",eyebrow:"Parties · offices · events",title:"Bulk orders, made easy.",copy:"Explain lead time and pickup details, then provide one direct inquiry action.",media:"BULK ICE CREAM ORDER",buttons:["Start an order"]},
        {type:"hero",tone:"dark",eyebrow:"From the parlor",title:"See what's in the case today.",copy:"Social links provide the most current behind-the-counter updates.",media:"SOCIAL PHOTO STRIP",buttons:["Follow Swensen's"]},
        {type:"footer"}
      ],
      notes:[
        ["Single location","Copy always makes clear that this is the original San Francisco shop—not a location finder."],
        ["Hours behavior","Highlight the current day automatically and make holiday exceptions easy to update."],
        ["Mobile priorities","Directions and phone actions appear before the map; the global bottom action bar remains reachable."],
        ["Bulk inquiry","Keep large-order information and the inquiry action together. Do not bury it in the general footer."],
        ["Editable details","Address, hours, phone, transit note, and bulk-order copy are CMS-controlled."]
      ]
    }
  ];

  const state = { page:"home", viewport:"desktop", notes:true, activeNote:null };
  const pageList = document.getElementById("page-list");
  const shell = document.getElementById("prototype-shell");
  const scroll = document.getElementById("prototype-scroll");
  const title = document.getElementById("canvas-title");
  const notesTitle = document.getElementById("notes-title");
  const notesSummary = document.getElementById("notes-summary");
  const notesList = document.getElementById("notes-list");
  const noteCount = document.getElementById("note-count");
  const notesToggle = document.getElementById("notes-toggle");
  const deviceName = document.getElementById("device-name");
  const deviceSize = document.getElementById("device-size");
  const chromeAddress = document.getElementById("chrome-address");

  const esc = value => String(value || "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const currentPage = () => pages.find(page => page.id === state.page) || pages[1];
  const callout = index => `<button class="wf-callout${state.activeNote === index ? " active" : ""}" type="button" data-note="${index}" aria-label="Open note ${index + 1}">${index + 1}</button>`;
  const buttons = labels => labels?.length ? `<div class="wf-button-row">${labels.map((label,i)=>`<span class="wf-button${i ? " secondary" : ""}">${esc(label)}</span>`).join("")}</div>` : "";
  const media = (label,extra="") => `<div class="wf-media ${extra}"><span>${esc(label || "Photo / media")}</span></div>`;
  const card = (name, ornate=false) => `<article class="wf-card${ornate ? " ornate" : ""}>${media(`${name} photo`)}<h3>${esc(name)}</h3><p>Short product or story description appears here.</p><div class="wf-card-meta"><span>Details</span><span>+</span></div></article>`;
  const header = page => `<div class="wf-offer">Bulk order savings available · Ask the parlor</div><header class="wf-nav"><div class="wf-logo"><span class="wf-logo-box">ICE<br>CREAM</span><span>SWENSEN'S</span></div><nav class="wf-nav-links"><span>Home</span><span>Our Story</span><span>Flavors</span><span>Menu</span><span>Gifts</span><span>Reviews</span><span>Contact</span></nav><span class="wf-nav-cta">Order online</span><span class="wf-menu-button">☰ Menu</span></header>`;
  const footer = () => `<footer class="wf-footer"><div><strong>SWENSEN'S</strong><span>The original San Francisco ice cream parlor.<br>Hyde & Union · Since 1948</span></div><div><strong>Visit</strong><span>Address<br>Directions<br>Phone</span></div><div><strong>Hours</strong><span>Today's hours<br>Weekly schedule</span></div><div><strong>Explore</strong><span>Flavors<br>Menu<br>Our Story</span></div></footer><div class="wf-mobile-actions"><span>Directions</span><span>Order online</span></div>`;

  function renderSection(section,index,page){
    if(section.type === "footer") return footer();
    const tone = section.tone ? ` ${section.tone}` : "";
    const marker = index < page.notes.length ? callout(index) : "";
    const intro = `<div class="wf-eyebrow">${esc(section.eyebrow)}</div><h2 class="wf-heading">${esc(section.title)}</h2><p class="wf-copy">${esc(section.copy)}</p>`;

    if(section.type === "brand") return `<section class="wf-section${tone}" data-section="${index}">${marker}<div class="wf-hero-layout"><div>${intro}${buttons(["Scroll to what's scooping ↓"])}</div>${media(section.media,"tall")}</div></section>`;
    if(section.type === "hero") return `<section class="wf-section${tone}" data-section="${index}">${marker}<div class="wf-hero-layout"><div>${intro}${buttons(section.buttons)}</div>${media(section.media,"tall")}</div></section>`;
    if(section.type === "split") return `<section class="wf-section${tone}" data-section="${index}">${marker}<div class="wf-split">${media(section.media,"tall")}<div>${intro}${buttons(section.buttons)}</div></div></section>`;
    if(section.type === "cards"){
      const cols = section.columns || Math.min(section.items.length,3);
      return `<section class="wf-section${tone}" data-section="${index}">${marker}${section.filter ? '<div class="wf-filter-tab">☰<br>Find your scoop<br>Filter</div>' : ""}${intro}<div class="wf-grid" style="--cols:${cols}">${section.items.map(item=>card(item,section.ornate)).join("")}</div></section>`;
    }
    if(section.type === "reviews") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-tabs"><span class="wf-tab active">Google</span><span class="wf-tab">Yelp</span><span class="wf-tab">TripAdvisor</span></div><div class="wf-review-note">“A handwritten-style guest review lives here. The selected platform remains active while visitors move through its review stack.”</div><div class="wf-polaroids"><div class="wf-polaroid">${media("Happy guests", "small")}<span>At the corner</span></div><div class="wf-polaroid">${media("Customer photo", "small")}<span>Sweet memories</span></div><div class="wf-polaroid">${media("Kid drawing", "small")}<span>Made for us</span></div></div></section>`;
    if(section.type === "collage") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-polaroids"><div class="wf-polaroid">${media("Guests outside store","tall")}<span>Hyde & Union</span></div><div class="wf-polaroid">${media("Counter selfie", "small")}<span>One happy crew</span></div><div class="wf-polaroid">${media("Child's sundae drawing", "small")}<span>A masterpiece</span></div></div></section>`;
    if(section.type === "timeline") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-timeline">${section.items.map(item=>{const [year,text]=item.split("|");return `<div class="wf-year"><b>${esc(year)}</b><span>${esc(text)}</span></div>`}).join("")}</div></section>`;
    if(section.type === "menu") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-menu-grid"><div class="wf-menu-block"><h3>${esc(section.title)}</h3>${section.items.map(item=>{const [name,price]=item.split("|");return `<div class="wf-menu-item"><span>${esc(name)}</span><b>${esc(price)}</b></div>`}).join("")}</div>${media(`${section.title} photo`,"tall")}</div></section>`;
    if(section.type === "contact") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-split"><div class="wf-map">Map / directions</div><div class="wf-menu-block"><h3>Store details</h3><div class="wf-menu-item"><span>Address</span><b>Hyde & Union</b></div><div class="wf-menu-item"><span>Phone</span><b>Call</b></div><div class="wf-menu-item"><span>Today</span><b>Open hours</b></div><div class="wf-menu-item"><span>Transit</span><b>Route notes</b></div></div></div></section>`;
    if(section.type === "overview") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-sitemap">${section.items.map(item=>{const [name,text]=item.split("|");return `<div class="wf-map-card"><strong>${esc(name)}</strong><span>${esc(text)}</span></div>`}).join("")}</div></section>`;
    if(section.type === "components") return `<section class="wf-section${tone}" data-section="${index}">${marker}${intro}<div class="wf-component-strip">${section.items.map(item=>`<div>${esc(item)}</div>`).join("")}</div></section>`;
    return "";
  }

  function renderPage(){
    const page = currentPage();
    title.textContent = page.name === "Overview" ? "Full website overview" : `${page.name} page`;
    notesTitle.textContent = `${page.name} notes`;
    notesSummary.textContent = page.summary;
    noteCount.textContent = `${page.notes.length} note${page.notes.length === 1 ? "" : "s"}`;
    chromeAddress.textContent = page.id === "overview" ? "swensensofsf.com / website map" : `swensensofsf.com / ${page.path.replace(".html","")}`;
    scroll.innerHTML = `<article class="wf-page">${header(page)}${page.sections.map((section,index)=>renderSection(section,index,page)).join("")}</article>`;
    scroll.scrollTop = 0;

    notesList.innerHTML = page.notes.map((note,index)=>`<button class="note-card${state.activeNote === index ? " active" : ""}" type="button" data-note="${index}"><span class="note-number">${index+1}</span><span><strong>${esc(note[0])}</strong><p>${esc(note[1])}</p></span></button>`).join("");
    bindNoteButtons();
  }

  function renderNavigation(){
    pageList.innerHTML = pages.map((page,index)=>`<button class="page-button" type="button" data-page="${page.id}" ${page.id === state.page ? 'aria-current="page"' : ""}><span class="page-index">${String(index).padStart(2,"0")}</span><span class="page-name">${esc(page.name)}</span><span class="page-sections">${page.sections.length}</span></button>`).join("");
    pageList.querySelectorAll("[data-page]").forEach(button=>button.addEventListener("click",()=>{
      state.page = button.dataset.page;
      state.activeNote = null;
      renderNavigation();
      renderPage();
      syncUrl();
    }));
  }

  function bindNoteButtons(){
    document.querySelectorAll("[data-note]").forEach(button=>button.addEventListener("click",()=>{
      const index = Number(button.dataset.note);
      state.activeNote = index;
      document.querySelectorAll("[data-note]").forEach(node=>node.classList.toggle("active",Number(node.dataset.note) === index));
      const section = scroll.querySelector(`[data-section="${index}"]`);
      if(section) section.scrollIntoView({behavior:"smooth",block:"start"});
      const note = notesList.querySelector(`[data-note="${index}"]`);
      if(note) note.scrollIntoView({behavior:"smooth",block:"nearest"});
    }));
  }

  function setViewport(viewport){
    state.viewport = viewport;
    shell.classList.toggle("mobile",viewport === "mobile");
    shell.classList.toggle("desktop",viewport === "desktop");
    deviceName.textContent = viewport === "mobile" ? "Mobile frame" : "Desktop frame";
    deviceSize.textContent = viewport === "mobile" ? "390 px" : "1440 px";
    document.querySelectorAll("[data-viewport]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.viewport === viewport)));
    scroll.scrollTop = 0;
    syncUrl();
  }

  function syncUrl(){
    const params = new URLSearchParams();
    params.set("page",state.page);
    params.set("view",state.viewport);
    history.replaceState(null,"",`${location.pathname}?${params.toString()}`);
  }

  const params = new URLSearchParams(location.search);
  if(pages.some(page=>page.id === params.get("page"))) state.page = params.get("page");
  if(["desktop","mobile"].includes(params.get("view"))) state.viewport = params.get("view");

  document.querySelectorAll("[data-viewport]").forEach(button=>button.addEventListener("click",()=>setViewport(button.dataset.viewport)));
  notesToggle.addEventListener("click",()=>{
    state.notes = !state.notes;
    notesToggle.setAttribute("aria-pressed",String(state.notes));
    notesToggle.lastChild.textContent = state.notes ? " Notes on" : " Notes off";
    document.body.classList.toggle("notes-hidden",!state.notes);
  });

  renderNavigation();
  setViewport(state.viewport);
  renderPage();
})();
