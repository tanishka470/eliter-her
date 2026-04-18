const locationForm = document.getElementById('locationForm');
const stateInput = document.getElementById('state');
const cityInput = document.getElementById('city');
const areaInput = document.getElementById('area');
const formError = document.getElementById('formError');

function saveLocationAndGoToMap() {
  const state = stateInput.value.trim();
  const city = cityInput.value.trim();
  const area = areaInput.value.trim();

  if (!state || !city || !area) {
    formError.textContent = 'Please fill State, City, and Area / Locality.';
    return;
  }

  const selectedLocation = {
    state: state,
    city: city,
    area: area,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem('safeNestSelectedLocation', JSON.stringify(selectedLocation));
  formError.textContent = '';
  window.location.href = 'map.html';
}

locationForm.addEventListener('submit', function (event) {
  event.preventDefault();
  saveLocationAndGoToMap();
});

document.getElementById('viewSafetyMapBtn').addEventListener('click', function () {
  saveLocationAndGoToMap();
});

document.getElementById('womenFriendlyBtn').addEventListener('click', function () {
  window.location.href = 'places.html';
});

document.getElementById('emergencyContactsBtn').addEventListener('click', function () {
  window.location.href = 'tel:112';
});

document.getElementById('reportUnsafeBtn').addEventListener('click', function () {
  const subject = encodeURIComponent('Unsafe area report - Safe Nest');
  const body = encodeURIComponent('Location details:\nState: ' + stateInput.value.trim() + '\nCity: ' + cityInput.value.trim() + '\nArea: ' + areaInput.value.trim());
  window.location.href = 'mailto:safenest@example.com?subject=' + subject + '&body=' + body;
});

document.getElementById('liveAlertsBtn').addEventListener('click', function () {
  const state = stateInput.value.trim();
  const city = cityInput.value.trim();
  const area = areaInput.value.trim();

  if (state && city && area) {
    const selectedLocation = {
      state: state,
      city: city,
      area: area,
      savedAt: new Date().toISOString(),
      focus: 'alerts'
    };

    localStorage.setItem('safeNestSelectedLocation', JSON.stringify(selectedLocation));
    window.location.href = 'map.html?focus=alerts';
    return;
  }

  window.location.href = 'map.html';
});
