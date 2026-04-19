// ── Element References ─────────────────────────────────────────────────────
const locationForm = document.getElementById("locationForm");
const stateInput = document.getElementById("state");
const cityInput = document.getElementById("city");
const areaInput = document.getElementById("area");
const formError = document.getElementById("formError");
const profileBtn = document.querySelector(".profile");
const profileMenu = document.getElementById("profileMenu");
const logoutBtn = document.getElementById("logoutBtn");

// ── Utility: Save location to localStorage ────────────────────────────────
function saveLocation() {
  const state = stateInput.value.trim();
  const city = cityInput.value.trim();
  const area = areaInput.value.trim();
  if (!state || !city || !area) return false;
  localStorage.setItem(
    "safeNestSelectedLocation",
    JSON.stringify({
      state,
      city,
      area,
      savedAt: new Date().toISOString(),
    }),
  );
  return true;
}

// ── Utility: Validate form and show error if needed ───────────────────────
function validateAndSave() {
  const saved = saveLocation();
  if (!saved) {
    formError.textContent =
      "Please fill in State, City, and Area before continuing.";
    formError.style.display = "block";
    return false;
  }
  formError.textContent = "";
  formError.style.display = "none";
  return true;
}

// ── Form Submit → Safety Map ───────────────────────────────────────────────
locationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (validateAndSave()) window.location.href = "map.html";
});

// ── Quick Card Click Handlers ──────────────────────────────────────────────
// These use event delegation so they work on both original + cloned cards
document.querySelector(".quick-access").addEventListener("click", (e) => {
  const card = e.target.closest(".quick-card");
  if (!card) return;

  const id = card.id || card.dataset.id; // clones use data-id

  if (id === "viewSafetyMapBtn") {
    if (validateAndSave()) window.location.href = "map.html";
  } else if (id === "womenFriendlyBtn") {
    window.location.href = "places.html";
  } else if (id === "emergencyContactsBtn") {
    window.location.href = "tel:112";
  } else if (id === "reportUnsafeBtn") {
    saveLocation();
    window.location.href = "report.html";
  } else if (id === "liveAlertsBtn") {
    saveLocation();
    window.location.href = "alerts.html";
  }
});

// ── Profile Menu: toggle + close on outside click ─────────────────────────
profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = profileMenu.style.display === "block";
  profileMenu.style.display = isOpen ? "none" : "block";
});

document.addEventListener("click", () => {
  profileMenu.style.display = "none";
});

// ── Logout ─────────────────────────────────────────────────────────────────
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html";
});

// ── Active Nav Link Highlight ──────────────────────────────────────────────
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.href === window.location.href) link.classList.add("active");
});

// ── Greeting by Time of Day ────────────────────────────────────────────────
function setGreeting() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const h1 = document.querySelector(".location-panel h1");
  if (h1) h1.textContent = `${greeting} — Dashboard`;
}
setGreeting();

// ── Infinite Auto-Scroll Carousel ─────────────────────────────────────────
function initInfiniteScroll() {
  const section = document.querySelector(".quick-access");
  if (!section) return;

  // 1. Clone all cards and append — creates seamless loop
  const originalCards = Array.from(section.querySelectorAll(".quick-card"));
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.removeAttribute("id"); // avoid duplicate IDs
    clone.dataset.id = card.id; // store original id for click delegation
    section.appendChild(clone);
  });

  const SPEED = 0.6; // px per frame — increase for faster scroll
  let paused = false;
  let rafId;

  function tick() {
    if (!paused) {
      section.scrollLeft += SPEED;

      // When we've scrolled through the first set, jump back silently
      const halfWidth = section.scrollWidth / 2;
      if (section.scrollLeft >= halfWidth) {
        section.scrollLeft -= halfWidth;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  // Pause on hover so user can read and click
  section.addEventListener("mouseenter", () => (paused = true));
  section.addEventListener("mouseleave", () => (paused = false));

  // Pause on touch so swipe still works
  section.addEventListener("touchstart", () => (paused = true), {
    passive: true,
  });
  section.addEventListener(
    "touchend",
    () => {
      setTimeout(() => (paused = false), 1500); // resume after 1.5s
    },
    { passive: true },
  );

  // Manual drag support
  let isDown = false,
    startX,
    scrollStart;

  section.addEventListener("mousedown", (e) => {
    isDown = true;
    paused = true;
    startX = e.pageX - section.offsetLeft;
    scrollStart = section.scrollLeft;
    section.classList.add("dragging");
  });

  section.addEventListener("mouseleave", () => {
    if (isDown) {
      isDown = false;
      paused = false;
    }
    section.classList.remove("dragging");
  });

  section.addEventListener("mouseup", () => {
    isDown = false;
    paused = false;
    section.classList.remove("dragging");
  });

  section.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - section.offsetLeft;
    section.scrollLeft = scrollStart - (x - startX) * 1.5;
  });

  rafId = requestAnimationFrame(tick);
}
initInfiniteScroll();
