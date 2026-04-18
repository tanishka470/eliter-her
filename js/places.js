const placesData = [
  {
    id: 1,
    name: 'Pantaloons Fashion',
    location: 'Connaught Place, New Delhi',
    category: 'clothing',
    rating: 4.5,
    reviews: 24,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: true, security: true }
  },
  {
    id: 2,
    name: 'The Brew Company',
    location: 'MG Road, Bengaluru',
    category: 'cafes',
    rating: 4.3,
    reviews: 18,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: false, security: true }
  },
  {
    id: 3,
    name: 'FitActive Gym',
    location: 'Sector 18, Noida',
    category: 'gyms',
    rating: 4.7,
    reviews: 31,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: true, security: true }
  },
  {
    id: 4,
    name: 'Apollo Hospital',
    location: 'Bandra, Mumbai',
    category: 'hospitals',
    rating: 4.6,
    reviews: 52,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: false, security: true }
  },
  {
    id: 5,
    name: 'Restora Cafe',
    location: 'Indiranagar, Bengaluru',
    category: 'cafes',
    rating: 4.2,
    reviews: 15,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: false, security: true }
  },
  {
    id: 6,
    name: 'SafeStay Hostel',
    location: 'Paharganj, New Delhi',
    category: 'hostels',
    rating: 4.1,
    reviews: 27,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: true, security: true }
  },
  {
    id: 7,
    name: 'Zara Store',
    location: 'DLF Mall, Gurgaon',
    category: 'clothing',
    rating: 4.4,
    reviews: 22,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: true, security: true }
  },
  {
    id: 8,
    name: 'Yoga Hub Studio',
    location: 'Koramangala, Bengaluru',
    category: 'gyms',
    rating: 4.8,
    reviews: 41,
    features: { femaleStaff: true, washrooms: true, lighting: true, changingRooms: true, security: true }
  }
];

let selectedCategory = 'all';
let selectedPlaceId = null;
let selectedRating = 0;

const placesGrid = document.getElementById('placesGrid');
const searchInput = document.getElementById('searchInput');
const reviewModal = document.getElementById('reviewModal');
const reviewForm = document.getElementById('reviewForm');
const starPicker = document.getElementById('starPicker');
const modalPlaceName = document.getElementById('modalPlaceName');
const reviewComment = document.getElementById('reviewComment');

function renderStarPicker() {
  starPicker.innerHTML = '';
  for (let i = 1; i <= 5; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'star-btn';
    btn.textContent = '★';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      selectedRating = i;
      updateStarPicker();
    });
    starPicker.appendChild(btn);
  }
}

function updateStarPicker() {
  const btns = starPicker.querySelectorAll('.star-btn');
  btns.forEach(function (btn, index) {
    btn.classList.toggle('selected', index < selectedRating);
  });
}

function getReviews(placeId) {
  const stored = localStorage.getItem('safeNestPlaceReviews');
  const allReviews = stored ? JSON.parse(stored) : {};
  return allReviews[placeId] || [];
}

function saveReview(placeId, review) {
  const stored = localStorage.getItem('safeNestPlaceReviews');
  const allReviews = stored ? JSON.parse(stored) : {};
  if (!allReviews[placeId]) {
    allReviews[placeId] = [];
  }
  allReviews[placeId].push(review);
  localStorage.setItem('safeNestPlaceReviews', JSON.stringify(allReviews));
}

function renderPlaces() {
  placesGrid.innerHTML = '';
  const query = searchInput.value.toLowerCase();
  const filtered = placesData.filter(function (place) {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(query) || place.location.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    placesGrid.innerHTML = '<div class="no-results">No places found matching your search and filters.</div>';
    return;
  }

  filtered.forEach(function (place) {
    const card = document.createElement('div');
    card.className = 'place-card';

    const starStr = '★'.repeat(Math.floor(place.rating)) + (place.rating % 1 >= 0.5 ? '☆' : '');
    const featureCount = Object.values(place.features).filter(Boolean).length;

    card.innerHTML =
      '<div class="place-header">' +
        '<div class="place-name">' + place.name + '</div>' +
        '<div class="place-location">📍 ' + place.location + '</div>' +
        '<div class="rating-row">' +
          '<span class="stars">' + starStr + '</span>' +
          '<span class="rating-num">' + place.rating + '</span>' +
          '<span style="font-size: 11px; color: var(--muted);">(' + place.reviews + ' reviews)</span>' +
        '</div>' +
      '</div>' +
      '<div class="place-body">' +
        '<div class="feature-list">' +
          (place.features.femaleStaff ? '<div class="feature-item"><div class="feature-check">✓</div>Female Staff</div>' : '') +
          (place.features.washrooms ? '<div class="feature-item"><div class="feature-check">✓</div>Clean Washrooms</div>' : '') +
          (place.features.lighting ? '<div class="feature-item"><div class="feature-check">✓</div>Good Lighting</div>' : '') +
          (place.features.changingRooms ? '<div class="feature-item"><div class="feature-check">✓</div>Changing Rooms</div>' : '') +
          (place.features.security ? '<div class="feature-item"><div class="feature-check">✓</div>Security Presence</div>' : '') +
        '</div>' +
        '<button class="add-review-btn" type="button">Add Review</button>' +
      '</div>';

    card.querySelector('.add-review-btn').addEventListener('click', function () {
      selectedPlaceId = place.id;
      selectedRating = 0;
      modalPlaceName.textContent = 'Review - ' + place.name;
      reviewComment.value = '';
      updateStarPicker();
      reviewModal.classList.add('show');
    });

    placesGrid.appendChild(card);
  });
}

document.querySelectorAll('.chip').forEach(function (chip) {
  chip.addEventListener('click', function () {
    document.querySelectorAll('.chip').forEach(function (c) {
      c.classList.remove('active');
    });
    chip.classList.add('active');
    selectedCategory = chip.dataset.category;
    renderPlaces();
  });
});

searchInput.addEventListener('input', renderPlaces);

document.getElementById('closeModalBtn').addEventListener('click', function () {
  reviewModal.classList.remove('show');
});

reviewForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!selectedRating) {
    alert('Please select a rating.');
    return;
  }

  const comment = reviewComment.value.trim();
  if (!comment) {
    alert('Please write a review.');
    return;
  }

  const review = {
    rating: selectedRating,
    comment: comment,
    date: new Date().toISOString()
  };

  saveReview(selectedPlaceId, review);
  reviewModal.classList.remove('show');
  alert('Review added successfully!');
  renderPlaces();
});

document.getElementById('backBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});

document.getElementById('emergencyBtn').addEventListener('click', function () {
  window.location.href = 'tel:112';
});

renderStarPicker();
renderPlaces();
