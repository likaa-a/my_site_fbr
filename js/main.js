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
    modalTitle.textContent = button.dataset.title;
    modalDate.textContent = button.dataset.date;
    modalDescription.textContent = button.dataset.text;
  });
});

function choosePerformance(title) {
  const option = [...performanceSelect.options].find((item) => item.text === title);
  if (option) {
    performanceSelect.value = option.value;
    performanceSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

document.querySelectorAll('.js-book-show').forEach((link) => {
  link.addEventListener('click', () => choosePerformance(link.dataset.performance));
});

modalBookButton.addEventListener('click', () => {
  choosePerformance(selectedPerformance);
  window.setTimeout(() => document.querySelector('#guestName').focus(), 450);
});

const bookingForm = document.querySelector('#bookingForm');
const bookingSuccess = document.querySelector('#bookingSuccess');

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    event.stopPropagation();
    bookingForm.classList.add('was-validated');
    return;
  }

  bookingForm.classList.add('was-validated');
  bookingSuccess.classList.remove('d-none');
  bookingSuccess.focus({ preventScroll: true });
});

document.querySelectorAll('#mainNavbar .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    const navbar = document.querySelector('#mainNavbar');
    if (navbar.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
    }
  });
});
