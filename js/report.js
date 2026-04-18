const reportForm = document.getElementById('reportForm');
const stateInput = document.getElementById('state');
const cityInput = document.getElementById('city');
const areaInput = document.getElementById('area');
const issueTypeInput = document.getElementById('issueType');
const descriptionInput = document.getElementById('description');
const evidenceImageInput = document.getElementById('evidenceImage');
const formMessage = document.getElementById('formMessage');
const reportList = document.getElementById('reportList');
const locationHint = document.getElementById('locationHint');

function getSavedLocation() {
  const raw = localStorage.getItem('safeNestSelectedLocation');
  return raw ? JSON.parse(raw) : null;
}

function fillLocationDefaults() {
  const location = getSavedLocation();
  if (!location) {
    locationHint.textContent = 'No saved location found. Enter manually.';
    return;
  }

  stateInput.value = location.state || '';
  cityInput.value = location.city || '';
  areaInput.value = location.area || '';
  locationHint.textContent = 'Auto-filled from dashboard location';
}

function getReports() {
  const raw = localStorage.getItem('safeNestUnsafeReports');
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem('safeNestUnsafeReports', JSON.stringify(reports));
}

function fileToDataUrl(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = function () {
      reject(new Error('Unable to read selected image.'));
    };
    reader.readAsDataURL(file);
  });
}

function renderReports() {
  const reports = getReports();
  reportList.innerHTML = '';

  if (!reports.length) {
    reportList.innerHTML = '<div class="report-empty">No reports submitted yet.</div>';
    return;
  }

  const latest = reports.slice(-6).reverse();
  latest.forEach(function (report) {
    const item = document.createElement('article');
    item.className = 'report-item';

    const createdAt = new Date(report.createdAt).toLocaleString();
    item.innerHTML =
      '<div class="report-meta">' +
        '<span class="issue-chip">' + report.issueType + '</span>' +
        '<span class="report-location">' + report.area + ', ' + report.city + ' - ' + createdAt + '</span>' +
      '</div>' +
      '<p class="report-desc">' + report.description + '</p>';

    reportList.appendChild(item);
  });
}

function setMessage(text, tone) {
  formMessage.textContent = text;
  formMessage.className = 'form-message ' + tone;
}

async function submitReport(event) {
  event.preventDefault();

  const state = stateInput.value.trim();
  const city = cityInput.value.trim();
  const area = areaInput.value.trim();
  const issueType = issueTypeInput.value;
  const description = descriptionInput.value.trim();
  const imageFile = evidenceImageInput.files[0];

  if (!state || !city || !area) {
    setMessage('Please provide State, City, and Area.', 'error');
    return;
  }

  if (!issueType) {
    setMessage('Please select the issue type.', 'error');
    return;
  }

  if (description.length < 10) {
    setMessage('Please add at least 10 characters in description.', 'error');
    return;
  }

  if (imageFile && !imageFile.type.startsWith('image/')) {
    setMessage('Only image files are allowed.', 'error');
    return;
  }

  let imageDataUrl = '';
  try {
    imageDataUrl = await fileToDataUrl(imageFile);
  } catch (error) {
    setMessage(error.message, 'error');
    return;
  }

  const reports = getReports();
  reports.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    state: state,
    city: city,
    area: area,
    issueType: issueType,
    description: description,
    imageDataUrl: imageDataUrl,
    createdAt: new Date().toISOString()
  });

  saveReports(reports);

  // Keep location context in sync for map and next flows.
  localStorage.setItem('safeNestSelectedLocation', JSON.stringify({
    state: state,
    city: city,
    area: area,
    savedAt: new Date().toISOString()
  }));

  reportForm.reset();
  stateInput.value = state;
  cityInput.value = city;
  areaInput.value = area;
  setMessage('Report submitted successfully.', 'success');
  renderReports();
}

document.getElementById('backBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});

document.getElementById('emergencyBtn').addEventListener('click', function () {
  window.location.href = 'tel:112';
});

document.getElementById('viewMapBtn').addEventListener('click', function () {
  window.location.href = 'map.html?focus=alerts';
});

reportForm.addEventListener('submit', submitReport);

fillLocationDefaults();
renderReports();
