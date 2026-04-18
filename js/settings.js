document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const languageSelect = document.getElementById("languageSelect");
  const locationToggle = document.getElementById("locationToggle");
  const dataToggle = document.getElementById("dataToggle");
  const profileForm = document.getElementById("profileForm");

  // Load saved preferences
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.checked = true;
  }

  languageSelect.value = localStorage.getItem("language") || "en";
  locationToggle.checked = localStorage.getItem("locationTracking") === "true";
  dataToggle.checked = localStorage.getItem("dataSharing") === "true";

  // Theme toggle
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  // Language select
  languageSelect.addEventListener("change", () => {
    localStorage.setItem("language", languageSelect.value);
    alert(`Language set to ${languageSelect.value}`);
  });

  // Privacy toggles
  locationToggle.addEventListener("change", () => {
    localStorage.setItem("locationTracking", locationToggle.checked);
  });

  dataToggle.addEventListener("change", () => {
    localStorage.setItem("dataSharing", dataToggle.checked);
  });

  // Profile form
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();

    localStorage.setItem("profileName", name);
    localStorage.setItem("profilePhone", phone);
    if (password) localStorage.setItem("profilePassword", password);

    alert("Profile settings saved!");
  });

  // Back button navigation
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html"; // or whichever page you want to go back to
  });

  // Emergency button action
  document.getElementById("emergencyBtn").addEventListener("click", () => {
    window.location.href = "emergency.html"; // or use 'tel:112' if you want direct dialing
  });
});
