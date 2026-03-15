/* ============================================
   Berg im Bahnhof - Main JavaScript
   ============================================ */

// --- Header Scroll ---
const header = document.getElementById('header');

function handleScroll() {
  if (window.scrollY > 60) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// --- Mobile Menu ---
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('nav__toggle--active');
    mobileMenu.classList.toggle('mobile-menu--active');
    document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('nav__toggle--active');
      mobileMenu.classList.remove('mobile-menu--active');
      document.body.style.overflow = '';
    });
  });
}

// --- Smooth Scroll for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- Scroll Reveal ---
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${i % 3 * 0.1}s`;
    observer.observe(el);
  });
}

initReveal();

// --- Multi-Step Form ---
let currentStep = 1;
const totalSteps = 4;

function updateProgress() {
  document.querySelectorAll('.form-progress__step').forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('form-progress__step--active', 'form-progress__step--complete');

    if (stepNum === currentStep) {
      step.classList.add('form-progress__step--active');
    } else if (stepNum < currentStep) {
      step.classList.add('form-progress__step--complete');
    }
  });

  document.querySelectorAll('.form-progress__bar').forEach((bar, i) => {
    bar.classList.toggle('form-progress__bar--active', i < currentStep - 1);
  });
}

function showStep(step) {
  document.querySelectorAll('.form-step').forEach(s => {
    s.classList.remove('form-step--active');
  });

  const target = document.querySelector(`.form-step[data-step="${step}"]`);
  if (target) {
    target.classList.add('form-step--active');
  }

  currentStep = step;
  updateProgress();
}

function nextStep(fromStep) {
  if (fromStep === 1) {
    const checked = document.querySelectorAll('input[name="services"]:checked');
    if (checked.length === 0) {
      highlightError('.service-select');
      return;
    }
  }

  if (fromStep === 3) {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!firstName || !lastName || !email) {
      if (!firstName) highlightField('first-name');
      if (!lastName) highlightField('last-name');
      if (!email) highlightField('email');
      return;
    }

    if (!isValidEmail(email)) {
      highlightField('email');
      return;
    }
  }

  if (fromStep === 3) {
    buildSummary();
  }

  showStep(fromStep + 1);
}

function prevStep(fromStep) {
  showStep(fromStep - 1);
}

function highlightError(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.outline = '2px solid var(--magenta)';
  el.style.borderRadius = '8px';
  setTimeout(() => {
    el.style.outline = '';
    el.style.borderRadius = '';
  }, 2000);
}

function highlightField(id) {
  const field = document.getElementById(id);
  if (!field) return;
  field.style.borderColor = '#E6007E';
  field.focus();
  setTimeout(() => {
    field.style.borderColor = '';
  }, 2000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildSummary() {
  const summary = document.getElementById('formSummary');
  if (!summary) return;

  const services = Array.from(document.querySelectorAll('input[name="services"]:checked'))
    .map(cb => cb.value).join(', ');
  const projectType = document.getElementById('project-type').value;
  const areaSize = document.getElementById('area-size').value;
  const timeframe = document.getElementById('timeframe').value;
  const message = document.getElementById('message').value;
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  let html = '';

  const addRow = (label, value) => {
    if (value) {
      html += `<div class="form-summary__row">
        <span class="form-summary__label">${label}</span>
        <span class="form-summary__value">${value}</span>
      </div>`;
    }
  };

  addRow('Leistungen', services);
  addRow('Objektart', projectType);
  addRow('Fläche', areaSize ? areaSize + ' m²' : '');
  addRow('Zeitraum', timeframe);
  addRow('Beschreibung', message ? (message.length > 80 ? message.substring(0, 80) + '...' : message) : '');
  addRow('Name', firstName + ' ' + lastName);
  addRow('E-Mail', email);
  addRow('Telefon', phone);
  addRow('Adresse', address);

  summary.innerHTML = html;
}

// Form Submit via own SMTP backend
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet...';

    const data = {
      services: Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value),
      projectType: document.getElementById('project-type').value,
      areaSize: document.getElementById('area-size').value,
      timeframe: document.getElementById('timeframe').value,
      message: document.getElementById('message').value,
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Fehler beim Senden');

      document.getElementById('formSuccess').style.display = 'block';
      contactForm.style.display = 'none';
      document.querySelector('.form-progress').style.display = 'none';
    } catch (err) {
      alert('Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut oder rufen Sie uns an.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// --- Before/After Slider ---
document.querySelectorAll('[data-ba-slider]').forEach(slider => {
  const container = slider.querySelector('.ba-slider__container');
  const range = slider.querySelector('.ba-slider__range');
  const afterImg = slider.querySelector('.ba-slider__img--after');
  const divider = slider.querySelector('.ba-slider__divider');

  function updateSlider(value) {
    afterImg.style.clipPath = `inset(0 0 0 ${value}%)`;
    divider.style.left = `${value}%`;
  }

  range.addEventListener('input', () => updateSlider(range.value));

  // Touch/mouse drag support for smoother interaction
  let isDragging = false;

  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    container.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    updateFromPointer(e);
  });

  container.addEventListener('pointerup', () => {
    isDragging = false;
  });

  function updateFromPointer(e) {
    const rect = container.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(0, Math.min(100, x));
    range.value = x;
    updateSlider(x);
  }

  // Initial position
  updateSlider(50);
});

// --- Lightbox ---
function openLightbox(el) {
  const img = el.querySelector('img');
  if (!img) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('lightbox--active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('lightbox--active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// --- Active Nav Link ---
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('nav__link--active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('nav__link--active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// --- Subpage: Active nav based on current page ---
function setActivePageNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.includes(href.replace('../', '').replace('.html', ''))) {
      link.classList.add('nav__link--active');
    }
  });
}

setActivePageNav();

// --- Expose functions used by inline onclick handlers ---
window.nextStep = nextStep;
window.prevStep = prevStep;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
