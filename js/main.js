const revealItems = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-in'));
}

const performanceSelect = document.querySelector('#performanceSelect');
const modalTitle = document.querySelector('#performanceModalTitle');
const modalDate = document.querySelector('.modal-date');
const modalDescription = document.querySelector('.modal-description');
const modalBookButton = document.querySelector('.js-modal-book');
let selectedPerformance = '';

document.querySelectorAll('.js-show-details').forEach((button) => {
  button.addEventListener('click', () => {
    selectedPerformance = button.dataset.title;
    if (modalTitle) modalTitle.textContent = button.dataset.title;
    if (modalDate) modalDate.textContent = button.dataset.date;
    if (modalDescription) modalDescription.textContent = button.dataset.text;
    if (modalBookButton) {
      modalBookButton.href = `order.html?performance=${encodeURIComponent(selectedPerformance)}`;
    }
  });
});

function choosePerformance(title) {
  if (!performanceSelect || !title) return;
  const option = [...performanceSelect.options].find((item) => item.text === title);
  if (option) {
    performanceSelect.value = option.value;
    performanceSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

document.querySelectorAll('.js-book-show').forEach((link) => {
  link.addEventListener('click', () => choosePerformance(link.dataset.performance));
});

const requestedPerformance = new URLSearchParams(window.location.search).get('performance');
choosePerformance(requestedPerformance);

const orderProduct = document.querySelector('#order-product');
if (orderProduct && requestedPerformance) {
  const requestedOption = [...orderProduct.options].find((item) => item.value === requestedPerformance);
  if (requestedOption) orderProduct.value = requestedOption.value;
}

const seatMap = document.querySelector('#seatMap');
const orderSeatsInput = document.querySelector('#order-seats');
const orderTicketsInput = document.querySelector('#order-tickets');
const seatSelectionText = document.querySelector('#seatSelectionText');
const seatTotal = document.querySelector('#seatTotal');
const seatError = document.querySelector('#seat-error');
const selectedSeats = new Map();
const occupiedSeats = new Set(['1-3', '1-7', '2-5', '3-2', '3-8', '4-4', '5-6', '6-1']);
const seatPriceByRow = [1500, 1500, 1200, 1200, 900, 900];
const moneyFormatter = new Intl.NumberFormat('ru-RU');

function seatSummary() {
  return [...selectedSeats.values()]
    .sort((a, b) => a.row - b.row || a.seat - b.seat)
    .map((item) => `${item.row} ряд, место ${item.seat}`)
    .join('; ');
}

function updateSeatSelection() {
  const summary = seatSummary();
  const total = [...selectedSeats.values()].reduce((sum, item) => sum + item.price, 0);

  if (orderSeatsInput) orderSeatsInput.value = summary;
  if (orderTicketsInput) orderTicketsInput.value = String(selectedSeats.size);
  if (seatSelectionText) seatSelectionText.textContent = summary || 'Места не выбраны';
  if (seatTotal) seatTotal.textContent = `${moneyFormatter.format(total)} руб.`;
  if (selectedSeats.size > 0 && seatError) seatError.hidden = true;
}

function clearSeatSelection() {
  selectedSeats.clear();
  seatMap?.querySelectorAll('.seat-map__seat.is-selected').forEach((seat) => {
    seat.classList.remove('is-selected');
    seat.setAttribute('aria-pressed', 'false');
  });
  if (seatError) seatError.hidden = true;
  updateSeatSelection();
}

if (seatMap) {
  for (let row = 1; row <= 6; row += 1) {
    const rowElement = document.createElement('div');
    rowElement.className = 'seat-map__row';

    const rowLabel = document.createElement('span');
    rowLabel.className = 'seat-map__row-label';
    rowLabel.textContent = `${row} ряд`;
    rowElement.append(rowLabel);

    for (let seat = 1; seat <= 8; seat += 1) {
      const key = `${row}-${seat}`;
      const price = seatPriceByRow[row - 1];
      const button = document.createElement('button');
      button.className = 'seat-map__seat';
      button.type = 'button';
      button.textContent = String(seat);
      button.dataset.key = key;
      button.setAttribute('aria-label', `${row} ряд, место ${seat}, ${moneyFormatter.format(price)} рублей`);
      button.setAttribute('aria-pressed', 'false');

      if (occupiedSeats.has(key)) {
        button.disabled = true;
        button.setAttribute('aria-label', `${row} ряд, место ${seat}, занято`);
      } else {
        button.addEventListener('click', () => {
          if (selectedSeats.has(key)) {
            selectedSeats.delete(key);
            button.classList.remove('is-selected');
            button.setAttribute('aria-pressed', 'false');
          } else if (selectedSeats.size < 4) {
            selectedSeats.set(key, { row, seat, price });
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
          } else if (seatError) {
            seatError.textContent = 'Можно выбрать не больше четырёх мест.';
            seatError.hidden = false;
            return;
          }
          updateSeatSelection();
        });
      }

      rowElement.append(button);
    }

    seatMap.append(rowElement);
  }
  updateSeatSelection();
}

orderProduct?.addEventListener('change', clearSeatSelection);

const bookingForm = document.querySelector('#bookingForm');
const bookingSuccess = document.querySelector('#bookingSuccess');

if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
      event.stopPropagation();
      bookingForm.classList.add('was-validated');
      return;
    }

    bookingForm.classList.add('was-validated');
    if (bookingSuccess) {
      bookingSuccess.classList.remove('d-none');
      bookingSuccess.focus({ preventScroll: true });
    }
  });
}

const orderForm = document.querySelector('#orderForm');
const orderSuccess = document.querySelector('#orderSuccess');

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const seatsAreValid = !seatMap || selectedSeats.size > 0;
    if (!seatsAreValid && seatError) {
      seatError.textContent = 'Выберите хотя бы одно свободное место.';
      seatError.hidden = false;
    }

    if (!orderForm.checkValidity() || !seatsAreValid) {
      event.stopPropagation();
      orderForm.classList.add('was-validated');
      if (!seatsAreValid) seatMap?.focus();
      return;
    }
    orderForm.classList.add('was-validated');
    if (orderSuccess) {
      orderSuccess.textContent = `Заявка подготовлена: ${seatSummary()}. Итоговая стоимость — ${seatTotal?.textContent || '0 руб.'} Отправка на сервер в учебной версии отключена.`;
    }
    orderSuccess?.classList.remove('d-none');
    orderSuccess?.focus({ preventScroll: true });
  });

  orderForm.addEventListener('reset', () => {
    window.setTimeout(() => {
      clearSeatSelection();
      orderForm.classList.remove('was-validated');
      orderSuccess?.classList.add('d-none');
    }, 0);
  });
}

const modalPerformance = document.querySelector('#modal-performance');
const modalSeatLink = document.querySelector('#modalSeatLink');
document.querySelectorAll('.js-quick-order').forEach((button) => {
  button.addEventListener('click', () => {
    if (modalPerformance) modalPerformance.value = button.dataset.performance;
    if (modalSeatLink) modalSeatLink.href = `order.html?performance=${encodeURIComponent(button.dataset.performance)}`;
  });
});

modalPerformance?.addEventListener('change', () => {
  if (modalSeatLink) modalSeatLink.href = `order.html?performance=${encodeURIComponent(modalPerformance.value)}`;
});

const quickOrderForm = document.querySelector('#quickOrderForm');
const quickOrderSuccess = document.querySelector('#quickOrderSuccess');
if (quickOrderForm) {
  quickOrderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quickOrderForm.checkValidity()) {
      event.stopPropagation();
      quickOrderForm.classList.add('was-validated');
      return;
    }
    quickOrderForm.classList.add('was-validated');
    quickOrderSuccess?.classList.remove('d-none');
  });
}

const genreFilter = document.querySelector('#genreFilter');
const ageFilter = document.querySelector('#ageFilter');
const catalogFilterReset = document.querySelector('#catalogFilterReset');
const catalogCards = [...document.querySelectorAll('#catalogGrid > article')];
const catalogResultCount = document.querySelector('#catalogResultCount');
const catalogEmpty = document.querySelector('#catalogEmpty');

function performanceWord(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'спектаклей';
  if (last === 1) return 'спектакль';
  if (last >= 2 && last <= 4) return 'спектакля';
  return 'спектаклей';
}

function applyCatalogFilters() {
  if (!genreFilter || !ageFilter || catalogCards.length === 0) return;

  const selectedGenre = genreFilter.value;
  const selectedAge = ageFilter.value;
  let visibleCount = 0;

  catalogCards.forEach((card) => {
    const matchesGenre = selectedGenre === 'all' || card.dataset.genre === selectedGenre;
    const matchesAge = selectedAge === 'all' || card.dataset.age === selectedAge;
    const isVisible = matchesGenre && matchesAge;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (catalogResultCount) {
    catalogResultCount.textContent = `Найдено: ${visibleCount} ${performanceWord(visibleCount)}`;
  }
  if (catalogEmpty) catalogEmpty.hidden = visibleCount !== 0;
}

genreFilter?.addEventListener('change', applyCatalogFilters);
ageFilter?.addEventListener('change', applyCatalogFilters);
catalogFilterReset?.addEventListener('click', () => {
  if (genreFilter) genreFilter.value = 'all';
  if (ageFilter) ageFilter.value = 'all';
  applyCatalogFilters();
});

const performanceData = {
  'Вишнёвый сад': {
    image: 'images/cherry-orchard.png',
    imagePosition: '50% 58%',
    alt: 'Сцена из спектакля Вишнёвый сад',
    badge: 'Премьера',
    description: 'История о доме, памяти и переменах в современной сценической форме.',
    price: 'от 1 200 руб.',
    genre: 'Драма',
    duration: '2 часа 20 минут с антрактом',
    age: '16+',
    stage: 'Большая сцена'
  },
  'Последний гость': {
    image: 'images/last-guest.png',
    imagePosition: '50% 48%',
    alt: 'Сцена из спектакля Последний гость',
    badge: 'Малая сцена',
    description: 'Камерная история о семейном ужине, на котором прошлое занимает свободное место.',
    price: 'от 900 руб.',
    genre: 'Психологическая драма',
    duration: '1 час 35 минут',
    age: '18+',
    stage: 'Малая сцена'
  },
  'Соседи': {
    image: 'images/neighbours.png',
    imagePosition: '50% 18%',
    alt: 'Сцена из спектакля Соседи',
    badge: 'Комедия',
    description: 'Комедия о тонких стенах, громких разговорах и неожиданной дружбе.',
    price: 'от 1 000 руб.',
    genre: 'Комедия',
    duration: '1 час 50 минут с антрактом',
    age: '12+',
    stage: 'Большая сцена'
  }
};

const productTitle = document.querySelector('#productTitle');
if (productTitle) {
  const productName = requestedPerformance && performanceData[requestedPerformance]
    ? requestedPerformance
    : 'Вишнёвый сад';
  const data = performanceData[productName];
  const fields = {
    productTitle: productName,
    productBreadcrumb: productName,
    productBadge: data.badge,
    productDescription: data.description,
    productPrice: data.price,
    productGenre: data.genre,
    productDuration: data.duration,
    productAge: data.age,
    productStage: data.stage,
    productTablePrice: data.price
  };
  Object.entries(fields).forEach(([id, value]) => {
    const element = document.querySelector(`#${id}`);
    if (element) element.textContent = value;
  });
  const image = document.querySelector('#productImage');
  if (image) {
    image.src = data.image;
    image.alt = data.alt;
    image.style.objectPosition = data.imagePosition;
  }
  const orderLink = document.querySelector('#productOrderLink');
  if (orderLink) orderLink.href = `order.html?performance=${encodeURIComponent(productName)}`;
}

document.body.id ||= 'top';

const backToTop = document.createElement('a');
backToTop.className = 'back-to-top';
backToTop.href = '#top';
const backToTopIcon = document.createElement('span');
backToTopIcon.className = 'back-to-top__icon';
backToTopIcon.setAttribute('aria-hidden', 'true');
for (let arrowIndex = 0; arrowIndex < 2; arrowIndex += 1) {
  const chevron = document.createElement('span');
  chevron.className = 'back-to-top__chevron';
  backToTopIcon.append(chevron);
}
backToTop.append(backToTopIcon);
backToTop.setAttribute('aria-label', 'Вернуться наверх страницы');
document.body.append(backToTop);

document.querySelectorAll('#mainNavbar .nav-link:not(.dropdown-toggle)').forEach((link) => {
  link.addEventListener('click', () => {
    const navbar = document.querySelector('#mainNavbar');
    if (navbar.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
    }
  });
});

const mapToggle = document.querySelector('.contact-map__toggle');
if (mapToggle) {
  const mapVisual = mapToggle.closest('.contact-map__visual');
  const mapFrame = mapVisual?.querySelector('.contact-map__iframe');

  mapToggle.addEventListener('click', () => {
    if (!mapFrame || !mapVisual) return;

    const isInteractive = mapToggle.getAttribute('aria-pressed') === 'true';
    if (isInteractive) {
      mapFrame.hidden = true;
      mapVisual.classList.remove('is-interactive');
      mapToggle.setAttribute('aria-pressed', 'false');
      mapToggle.textContent = 'Интерактивная карта';
      return;
    }

    if (!mapFrame.hasAttribute('src')) mapFrame.src = mapFrame.dataset.src;
    mapFrame.hidden = false;
    mapVisual.classList.add('is-interactive');
    mapToggle.setAttribute('aria-pressed', 'true');
    mapToggle.textContent = 'Показать схему';
  });
}
