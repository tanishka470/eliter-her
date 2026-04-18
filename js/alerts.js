const alertsList = document.getElementById('alertsList');
const timeFilter = document.getElementById('timeFilter');
const locationFilter = document.getElementById('locationFilter');
const resultsSummary = document.getElementById('resultsSummary');
const locationDisplay = document.getElementById('locationDisplay');

function getSavedLocation() {
  const raw = localStorage.getItem('safeNestSelectedLocation');
  return raw ? JSON.parse(raw) : null;
}

function getUnsafeReportsAsAlerts() {
  const raw = localStorage.getItem('safeNestUnsafeReports');
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(function (report) {
      const type = (report.issueType || '').toLowerCase();
      const severity = type.includes('harassment') ? 'high' : (type.includes('unsafe') ? 'high' : (type.includes('lack of police') ? 'medium' : 'medium'));

      return {
        id: 'rep-' + report.id,
        title: report.issueType + ' reported',
        state: report.state,
        city: report.city,
        area: report.area,
        time: report.createdAt,
        source: 'Community report',
        description: report.description,
        severity: severity
      };
    });
  } catch (error) {
    return [];
  }
}

function getStaticAlerts() {
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  return [
    {
      id: 'a1',
      title: 'Unsafe after 10 PM',
      state: 'Delhi',
      city: 'New Delhi',
      area: 'Kashmere Gate',
      time: new Date(now - 3 * hour).toISOString(),
      source: 'City control room',
      description: 'Low crowd movement and poor street visibility reported late at night.',
      severity: 'high'
    },
    {
      id: 'a2',
      title: 'Dim street lights on main road',
      state: 'Maharashtra',
      city: 'Mumbai',
      area: 'Andheri East',
      time: new Date(now - 10 * hour).toISOString(),
      source: 'Patrol update',
      description: 'Multiple light poles near transit stop are currently non-functional.',
      severity: 'medium'
    },
    {
      id: 'a3',
      title: 'Crowd surge near market lane',
      state: 'Karnataka',
      city: 'Bengaluru',
      area: 'Indiranagar',
      time: new Date(now - 30 * hour).toISOString(),
      source: 'Traffic desk',
      description: 'Heavy crowding and route blockage reported around evening peak hours.',
      severity: 'medium'
    },
    {
      id: 'a4',
      title: 'Sparse police visibility',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      area: 'Hazratganj',
      time: new Date(now - 4 * 24 * hour).toISOString(),
      source: 'Community watch',
      description: 'Reduced routine patrol presence observed in side streets.',
      severity: 'high'
    },
    {
      id: 'a5',
      title: 'Network weak in underpass',
      state: 'Tamil Nadu',
      city: 'Chennai',
      area: 'T Nagar',
      time: new Date(now - 11 * 24 * hour).toISOString(),
      source: 'Transit alert',
      description: 'Mobile signal drops in underpass stretch during night commute.',
      severity: 'low'
    },
    {
      id: 'a6',
      title: 'Public washroom temporarily closed',
      state: 'Delhi',
      city: 'New Delhi',
      area: 'Connaught Place',
      time: new Date(now - 18 * hour).toISOString(),
      source: 'Municipal update',
      description: 'Closest public washroom is under maintenance until further notice.',
      severity: 'low'
    }
  ];
}

function severityClass(severity) {
  if (severity === 'high') {
    return 'severity-high';
  }
  if (severity === 'medium') {
    return 'severity-medium';
  }
  return 'severity-low';
}

function severityLabel(severity) {
  if (severity === 'high') {
    return 'High';
  }
  if (severity === 'medium') {
    return 'Medium';
  }
  return 'Low';
}

function getAllAlerts() {
  const alerts = getStaticAlerts().concat(getUnsafeReportsAsAlerts());
  return alerts.sort(function (a, b) {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}

function formatTime(value) {
  return new Date(value).toLocaleString();
}

function matchesTimeFilter(alert, selectedTime) {
  if (selectedTime === 'all') {
    return true;
  }

  const now = Date.now();
  const alertTime = new Date(alert.time).getTime();
  const diff = now - alertTime;

  if (selectedTime === '24h') {
    return diff <= 24 * 60 * 60 * 1000;
  }
  if (selectedTime === '7d') {
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }
  if (selectedTime === '30d') {
    return diff <= 30 * 24 * 60 * 60 * 1000;
  }

  return true;
}

function matchesLocationFilter(alert, selectedLocation) {
  if (selectedLocation === 'all') {
    return true;
  }

  const cityKey = (alert.city || '').toLowerCase();
  const areaKey = (alert.area || '').toLowerCase();
  return cityKey === selectedLocation || areaKey === selectedLocation;
}

function renderAlerts(alerts) {
  alertsList.innerHTML = '';

  if (!alerts.length) {
    alertsList.innerHTML = '<div class="empty">No alerts found for selected filters.</div>';
    return;
  }

  alerts.forEach(function (alert) {
    const item = document.createElement('article');
    item.className = 'alert-item';
    item.innerHTML =
      '<div class="alert-head">' +
        '<h3 class="alert-title">' + alert.title + '</h3>' +
        '<span class="alert-time">' + formatTime(alert.time) + '</span>' +
      '</div>' +
      '<div class="alert-meta">' +
        '<span class="location-badge">' + alert.area + ', ' + alert.city + '</span>' +
        '<span class="severity-badge ' + severityClass(alert.severity) + '">' + severityLabel(alert.severity) + '</span>' +
        '<span class="source-badge">' + alert.source + '</span>' +
      '</div>' +
      '<p class="alert-desc">' + alert.description + '</p>';
    alertsList.appendChild(item);
  });
}

function updateResultsSummary(total) {
  resultsSummary.textContent = total + (total === 1 ? ' alert found' : ' alerts found');
}

function applyFilters() {
  const allAlerts = getAllAlerts();
  const selectedTime = timeFilter.value;
  const selectedLocation = locationFilter.value;

  const filtered = allAlerts.filter(function (alert) {
    return matchesTimeFilter(alert, selectedTime) && matchesLocationFilter(alert, selectedLocation);
  });

  renderAlerts(filtered);
  updateResultsSummary(filtered.length);
}

function setupLocationFilterOptions() {
  const allAlerts = getAllAlerts();
  const values = new Set();

  allAlerts.forEach(function (alert) {
    if (alert.city) {
      values.add(alert.city.trim());
    }
    if (alert.area) {
      values.add(alert.area.trim());
    }
  });

  const sorted = Array.from(values).sort(function (a, b) {
    return a.localeCompare(b);
  });

  sorted.forEach(function (value) {
    const option = document.createElement('option');
    option.value = value.toLowerCase();
    option.textContent = value;
    locationFilter.appendChild(option);
  });
}

function initLocationContext() {
  const location = getSavedLocation();
  if (!location) {
    locationDisplay.textContent = 'Live alerts for all locations';
    return;
  }

  locationDisplay.textContent = 'Live alerts near ' + location.city + ', ' + location.area;

  if (location.city) {
    locationFilter.value = location.city.toLowerCase();
  }
}

timeFilter.addEventListener('change', applyFilters);
locationFilter.addEventListener('change', applyFilters);

document.getElementById('backBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});

document.getElementById('emergencyBtn').addEventListener('click', function () {
  window.location.href = 'tel:112';
});

document.getElementById('viewMapBtn').addEventListener('click', function () {
  window.location.href = 'map.html?focus=alerts';
});

setupLocationFilterOptions();
initLocationContext();
applyFilters();
