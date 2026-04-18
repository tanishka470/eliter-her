/* ── TOAST ── */
function showToast(msg, duration) {
  duration = duration || 2800;
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () {
    t.classList.remove("show");
  }, duration);
}

/* ── SOS TOGGLE ── */
var sosBtn = document.getElementById("sosBtn");
var sosActions = document.getElementById("sosActions");
var sosOpen = false;

sosBtn.addEventListener("click", function () {
  sosOpen = !sosOpen;
  sosActions.classList.toggle("visible", sosOpen);
  sosBtn.style.background = sosOpen
    ? "linear-gradient(140deg,#b91c1c,#991b1b)"
    : "linear-gradient(140deg,#ef4444,#dc2626)";
});

/* ── SOS → SHARE LOCATION ── */
document
  .getElementById("sosShareLocation")
  .addEventListener("click", function () {
    handleShareLocation();
  });

/* ── SOS → ALERT CONTACTS ── */
document.getElementById("sosSendAlert").addEventListener("click", function () {
  var contacts = getPersonalContacts();
  if (contacts.length === 0) {
    showToast("No personal contacts saved. Add them below first.");
    return;
  }
  var names = contacts
    .map(function (c) {
      return c.name;
    })
    .join(", ");
  showToast("Alert sent to: " + names, 3500);
});

/* ── PERSONAL CONTACTS ── */
function getPersonalContacts() {
  var raw = localStorage.getItem("safeNestEmergencyContacts");
  return raw ? JSON.parse(raw) : [];
}

function savePersonalContacts(list) {
  localStorage.setItem("safeNestEmergencyContacts", JSON.stringify(list));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPersonalContacts() {
  var list = document.getElementById("personalList");
  var emptyEl = document.getElementById("emptyNote");
  var contacts = getPersonalContacts();

  list.querySelectorAll(".personal-item").forEach(function (el) {
    el.remove();
  });

  if (contacts.length === 0) {
    emptyEl.style.display = "";
    return;
  }
  emptyEl.style.display = "none";

  contacts.forEach(function (contact, index) {
    var item = document.createElement("div");
    item.className = "personal-item";
    item.innerHTML =
      '<div class="contact-info">' +
      '<span class="contact-emoji">&#128100;</span>' +
      "<div>" +
      '<div class="contact-name">' +
      escapeHtml(contact.name) +
      "</div>" +
      '<div class="contact-number">' +
      escapeHtml(contact.phone) +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="personal-actions">' +
      '<a class="icon-btn call-icon" href="tel:' +
      escapeHtml(contact.phone) +
      '" title="Call">&#128222;</a>' +
      '<button class="icon-btn del-icon" data-index="' +
      index +
      '" title="Delete">&#128465;</button>' +
      "</div>";
    list.appendChild(item);
  });

  list.querySelectorAll(".del-icon").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = parseInt(btn.getAttribute("data-index"), 10);
      var c = getPersonalContacts();
      c.splice(idx, 1);
      savePersonalContacts(c);
      renderPersonalContacts();
      showToast("Contact removed.");
    });
  });
}

document.getElementById("addContactBtn").addEventListener("click", function () {
  var nameInput = document.getElementById("pName");
  var phoneInput = document.getElementById("pPhone");
  var errorEl = document.getElementById("contactError");
  var name = nameInput.value.trim();
  var phone = phoneInput.value.trim();

  if (!name || name.length < 2) {
    errorEl.textContent = "Name must be at least 2 characters.";
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errorEl.textContent = "Phone must be exactly 10 digits.";
    return;
  }

  errorEl.textContent = "";
  var contacts = getPersonalContacts();
  contacts.push({ name: name, phone: phone });
  savePersonalContacts(contacts);
  nameInput.value = "";
  phoneInput.value = "";
  renderPersonalContacts();
  showToast("Contact added successfully!");
});

/* ── SHARE LIVE LOCATION ── */
function handleShareLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser.");
    return;
  }
  showToast("Fetching your location...", 4000);
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude.toFixed(6);
      var lng = pos.coords.longitude.toFixed(6);
      var link = "https://maps.google.com/?q=" + lat + "," + lng;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(link)
          .then(function () {
            showToast("Location link copied! " + lat + ", " + lng, 4500);
          })
          .catch(function () {
            prompt("Copy this location link:", link);
          });
      } else {
        prompt("Copy this location link:", link);
      }
    },
    function () {
      showToast("Location access denied. Please allow in browser settings.");
    },
  );
}

document
  .getElementById("shareLocationBtn")
  .addEventListener("click", handleShareLocation);

/* ── ALARM ── */
var alarmInterval = null;
var alarmActive = false;
var alarmBtn = document.getElementById("alarmBtn");

function beep(freq, dur) {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 1;
    osc.frequency.value = freq;
    osc.type = "square";
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur / 1000);
    setTimeout(function () {
      ctx.close();
    }, dur + 100);
  } catch (e) {
    /* no audio context */
  }
}

alarmBtn.addEventListener("click", function () {
  if (!alarmActive) {
    alarmActive = true;
    alarmBtn.classList.add("alarm-active");
    alarmBtn.querySelector(".util-text h3").textContent =
      "Alarm ON — Tap to Stop";
    beep(880, 300);
    alarmInterval = setInterval(function () {
      beep(880, 200);
      setTimeout(function () {
        beep(660, 200);
      }, 250);
    }, 600);
    showToast("Alarm activated! Tap again to stop.", 3000);
  } else {
    alarmActive = false;
    clearInterval(alarmInterval);
    alarmInterval = null;
    alarmBtn.classList.remove("alarm-active");
    alarmBtn.querySelector(".util-text h3").textContent = "Trigger Alarm Sound";
    showToast("Alarm stopped.", 2000);
  }
});

/* ── INIT ── */
renderPersonalContacts();
