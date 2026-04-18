const locationDisplay = document.getElementById('locationDisplay');
const indicatorGrid = document.getElementById('indicatorGrid');
const scoreValue = document.getElementById('scoreValue');
const scoreFill = document.getElementById('scoreFill');
const scoreStars = document.getElementById('scoreStars');
const scoreNote = document.getElementById('scoreNote');
const reportCountBadge = document.getElementById('reportCount');
const reportList = document.getElementById('reportList');

const locationCoordinates = {
  'new delhi': [28.6139, 77.209],
  'mumbai': [19.076, 72.8777],
  'bengaluru': [12.9716, 77.5946],
  'lucknow': [26.8467, 80.9462],
  'chennai': [13.0827, 80.2707],
  default: [20.5937, 78.9629]
};

const severityWeight = {
  good: 1,
  moderate: 0.6,
  poor: 0.2
};

function getSavedLocation() {
  const raw = localStorage.getItem('safeNestSelectedLocation');
  return raw ? JSON.parse(raw) : null;
}

function cityToCoordinates(city) {
  if (!city) {
    return locationCoordinates.default;
  }
  const key = city.trim().toLowerCase();
  return locationCoordinates[key] || locationCoordinates.default;
}

function generateSafetyData(location) {
  const seedText = (location.area + location.city + location.state).toLowerCase();
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed += seedText.charCodeAt(i) * (i + 1);
  }

  const pick = function (items, multiplier) {
    const index = (seed * multiplier) % items.length;
    return items[index];
  };

  const data = {
    'Street Lighting': pick(['Good', 'Moderate', 'Poor'], 3),
    'Public Washrooms': pick(['Available', 'Not Available'], 5),
    'Alcohol Shops Nearby': pick(['Low', 'Medium', 'High'], 7),
    'Police Presence': pick(['Frequent', 'Occasional', 'Rare'], 11),
    'Crowd Density': pick(['High', 'Medium', 'Low'], 13),
    'CCTV Availability': pick(['Yes', 'No'], 17),
    'Transport Availability': pick(['Good', 'Limited'], 19),
    'Network Connectivity': pick(['Strong', 'Weak'], 23)
  };

  return data;
}

function indicatorToWeight(label, value) {
  const positiveMap = {
    'Street Lighting': { Good: severityWeight.good, Moderate: severityWeight.moderate, Poor: severityWeight.poor },
    'Public Washrooms': { Available: severityWeight.good, 'Not Available': severityWeight.poor },
    'Police Presence': { Frequent: severityWeight.good, Occasional: severityWeight.moderate, Rare: severityWeight.poor },
    'CCTV Availability': { Yes: severityWeight.good, No: severityWeight.poor },
    'Transport Availability': { Good: severityWeight.good, Limited: severityWeight.poor },
    'Network Connectivity': { Strong: severityWeight.good, Weak: severityWeight.poor },
    'Crowd Density': { High: severityWeight.good, Medium: severityWeight.moderate, Low: severityWeight.poor },
    'Alcohol Shops Nearby': { Low: severityWeight.good, Medium: severityWeight.moderate, High: severityWeight.poor }
  };

  return positiveMap[label][value];
}

function valueClass(label, value) {
  const weight = indicatorToWeight(label, value);
  if (weight >= 0.8) {
    return 'value-good';
  }
  if (weight >= 0.5) {
    return 'value-mid';
  }
  return 'value-bad';
}

function renderIndicators(indicators) {
  indicatorGrid.innerHTML = '';
  const entries = Object.entries(indicators);
  entries.forEach(function (entry) {
    const label = entry[0];
    const value = entry[1];
    const row = document.createElement('div');
    row.className = 'indicator-item';
    row.innerHTML =
      '<span>' + label + '</span>' +
      '<span class="indicator-value ' + valueClass(label, value) + '">' + value + '</span>';
    indicatorGrid.appendChild(row);
  });
}

function computeScore(indicators) {
  const entries = Object.entries(indicators);
  let sum = 0;
  entries.forEach(function (entry) {
    sum += indicatorToWeight(entry[0], entry[1]);
  });
  const scoreOutOfTen = (sum / entries.length) * 10;
  return Number(scoreOutOfTen.toFixed(1));
}

function scoreRemark(score) {
  if (score >= 7.5) {
    return 'This area is generally safe. Continue standard precautions.';
  }
  if (score >= 5) {
    return 'This area is moderately safe. Stay alert, especially after dark.';
  }
  return 'This area has elevated risk markers. Prefer safer alternatives if possible.';
}

function scoreToStars(score) {
  const filled = Math.max(0, Math.min(5, Math.round(score / 2)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function addZoneOverlays(map, center) {
  const unsafeZone = [center[0] + 0.008, center[1] - 0.012];
  const moderateZone = [center[0] - 0.006, center[1] + 0.011];
  const safeZone = [center[0] + 0.004, center[1] + 0.008];

  L.circle(unsafeZone, {
    color: '#dc2626',
    fillColor: '#ef4444',
    fillOpacity: 0.35,
    radius: 550
  }).addTo(map).bindPopup('Unsafe Zone (Red)');

  L.circle(moderateZone, {
    color: '#d97706',
    fillColor: '#f59e0b',
    fillOpacity: 0.35,
    radius: 520
  }).addTo(map).bindPopup('Moderate Zone (Yellow)');

  L.circle(safeZone, {
    color: '#15803d',
    fillColor: '#22c55e',
    fillOpacity: 0.3,
    radius: 600
  }).addTo(map).bindPopup('Safe Zone (Green)');
}

function getUnsafeReports() {
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

function hashOffset(seedText, radius) {
  let hash = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash % 1000) / 1000;
  return (normalized * 2 - 1) * radius;
}

function reportMarkerPoint(center, report) {
  const latOffset = hashOffset(report.id + report.area, 0.018);
  const lngOffset = hashOffset(report.id + report.city, 0.018);
  return [center[0] + latOffset, center[1] + lngOffset];
}

function getLocalCityReports(location) {
  const reports = getUnsafeReports();
  return reports.filter(function (report) {
    const sameState = report.state && location.state && report.state.toLowerCase() === location.state.toLowerCase();
    const sameCity = report.city && location.city && report.city.toLowerCase() === location.city.toLowerCase();
    return sameState && sameCity;
  });
}

function formatDateText(dateIso) {
  if (!dateIso) {
    return 'Unknown time';
  }
  return new Date(dateIso).toLocaleString();
}

function renderReportPanel(reports, markerIndex, map) {
  reportCountBadge.textContent = String(reports.length);
  reportList.innerHTML = '';

  if (!reports.length) {
    reportList.innerHTML = '<div class="report-empty">No local unsafe reports available for this location.</div>';
    return;
  }

  const latest = reports.slice().sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 8);

  latest.forEach(function (report) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'report-item';
    item.innerHTML =
      '<div class="report-item-head">' +
      '<span class="report-issue">' + report.issueType + '</span>' +
      '<span class="report-time">' + formatDateText(report.createdAt) + '</span>' +
      '</div>' +
      '<p class="report-place">' + report.area + ', ' + report.city + '</p>' +
      '<p class="report-desc">' + report.description + '</p>';

    item.addEventListener('click', function () {
      const marker = markerIndex[report.id];
      if (!marker) {
        return;
      }

      const markerPoint = marker.getLatLng();
      map.setView(markerPoint, 15, { animate: true });
      marker.openPopup();
    });

    reportList.appendChild(item);
  });
}

function addUnsafeReportMarkers(map, center, reports) {
  const markerIndex = {};

  if (!reports.length) {
    return markerIndex;
  }

  reports.forEach(function (report) {
    const point = reportMarkerPoint(center, report);
    const reportedAt = new Date(report.createdAt).toLocaleString();
    const imagePreview = report.imageDataUrl
      ? '<div style="margin-top:8px;"><img src="' + report.imageDataUrl + '" alt="Report evidence" style="max-width:160px;border-radius:8px;border:1px solid #cbd5e1;" /></div>'
      : '';

    const marker = L.circleMarker(point, {
      radius: 8,
      color: '#991b1b',
      fillColor: '#ef4444',
      fillOpacity: 0.85,
      weight: 2
    }).addTo(map).bindPopup(
      '<strong>Reported Issue:</strong> ' + report.issueType + '<br />' +
      '<strong>Location:</strong> ' + report.area + ', ' + report.city + '<br />' +
      '<strong>Details:</strong> ' + report.description + '<br />' +
      '<strong>Time:</strong> ' + reportedAt +
      imagePreview
    );

    markerIndex[report.id] = marker;
  });

  return markerIndex;
}

function getFocusMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('focus') || '';
}

function initPage() {
  const location = getSavedLocation();
  const focusMode = getFocusMode();

  if (!location) {
    locationDisplay.textContent = 'No location selected - please choose from dashboard';
    scoreNote.textContent = 'Location missing. Redirecting to dashboard...';
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 1200);
    return;
  }

  const formattedLocation = location.city + ', ' + location.area;
  locationDisplay.textContent = formattedLocation;

  const center = cityToCoordinates(location.city);

  const map = L.map('map').setView(center, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker(center).addTo(map).bindPopup('Selected Location: ' + location.area).openPopup();
  addZoneOverlays(map, center);

  const localReports = getLocalCityReports(location);
  const markerIndex = addUnsafeReportMarkers(map, center, localReports);
  renderReportPanel(localReports, markerIndex, map);
  const reportCount = localReports.length;

  const indicators = generateSafetyData(location);
  renderIndicators(indicators);

  const score = computeScore(indicators);
  scoreValue.textContent = score.toFixed(1) + ' / 10';
  scoreFill.style.width = String(score * 10) + '%';
  scoreStars.textContent = scoreToStars(score);
  scoreNote.textContent = scoreRemark(score);

  if (focusMode === 'women-friendly') {
    scoreNote.textContent = 'Focused on women-friendly places near your selected area.';
  } else if (focusMode === 'alerts') {
    if (reportCount > 0) {
      scoreNote.textContent = 'Showing live safety alerts with ' + reportCount + ' reported issue(s) in your city.';
    } else {
      scoreNote.textContent = 'Showing location context for live alerts and safety monitoring.';
    }
  } else if (reportCount > 0) {
    scoreNote.textContent = scoreRemark(score) + ' Also showing ' + reportCount + ' reported issue(s) for this city.';
  }
}

document.getElementById('backBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});

document.getElementById('emergencyBtn').addEventListener('click', function () {
  window.location.href = 'tel:112';
});

initPage();
