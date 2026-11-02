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
    if (!orderForm.checkValidity()) {
      event.stopPropagation();
      orderForm.classList.add('was-validated');
      return;
    }
    orderForm.classList.add('was-validated');
    orderSuccess?.classList.remove('d-none');
    orderSuccess?.focus({ preventScroll: true });
  });

  orderForm.addEventListener('reset', () => {
    orderForm.classList.remove('was-validated');
    orderSuccess?.classList.add('d-none');
  });
}

const modalPerformance = document.querySelector('#modal-performance');
document.querySelectorAll('.js-quick-order').forEach((button) => {
  button.addEventListener('click', () => {
    if (modalPerformance) modalPerformance.value = button.dataset.performance;
  });
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

const performanceData = {
  'Вишнёвый сад': {
    image: 'images/cherry-orchard.png',
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
  }
  const orderLink = document.querySelector('#productOrderLink');
  if (orderLink) orderLink.href = `order.html?performance=${encodeURIComponent(productName)}`;
}

document.querySelectorAll('#mainNavbar .nav-link:not(.dropdown-toggle)').forEach((link) => {
  link.addEventListener('click', () => {
    const navbar = document.querySelector('#mainNavbar');
    if (navbar.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
    }
  });
});
