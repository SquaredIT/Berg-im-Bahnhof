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

// --- Mobile Submenu Toggle ---
const mobileLeistungenToggle = document.getElementById('mobileLeistungenToggle');
const mobileLeistungenSub = document.getElementById('mobileLeistungenSub');

if (mobileLeistungenToggle && mobileLeistungenSub) {
  mobileLeistungenToggle.addEventListener('click', () => {
    const isOpen = mobileLeistungenToggle.getAttribute('aria-expanded') === 'true';
    mobileLeistungenToggle.setAttribute('aria-expanded', !isOpen);
    mobileLeistungenSub.classList.toggle('mobile-menu__sub--open');
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
  el.classList.add('service-select--error');
  setTimeout(() => {
    el.classList.remove('service-select--error');
  }, 3000);
}

function highlightField(id) {
  const field = document.getElementById(id);
  if (!field) return;
  const group = field.closest('.form-group');
  if (group) {
    group.classList.add('form-group--error');
    // Add error message if not already present
    let errorEl = group.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error form-error--visible';
      errorEl.setAttribute('role', 'alert');
      errorEl.textContent = 'Bitte füllen Sie dieses Feld aus.';
      if (id === 'email' && field.value && !isValidEmail(field.value)) {
        errorEl.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      }
      group.appendChild(errorEl);
    } else {
      errorEl.classList.add('form-error--visible');
    }
  }
  field.focus();

  // Clear error on input
  field.addEventListener('input', function clearError() {
    if (group) {
      group.classList.remove('form-group--error');
      const err = group.querySelector('.form-error');
      if (err) err.remove();
    }
    field.removeEventListener('input', clearError);
  }, { once: true });
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

// Form Submit via eigenen SMTP-Server
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Wird gesendet...</span>';

    try {
      const formData = new FormData(this);

      const response = await fetch('/api/contact.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      } else {
        alert('Fehler beim Senden: ' + (result.message || 'Bitte versuchen Sie es erneut.'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      alert('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// --- Image Upload Preview ---
const imageInput = document.getElementById('images');
const imagePreview = document.getElementById('imagePreview');
const fileUploadArea = document.getElementById('fileUploadArea');

if (imageInput && imagePreview) {
  let selectedFiles = new DataTransfer();

  imageInput.addEventListener('change', function() {
    addFiles(this.files);
  });

  // Drag & Drop
  if (fileUploadArea) {
    ['dragenter', 'dragover'].forEach(evt => {
      fileUploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('file-upload--dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      fileUploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('file-upload--dragover');
      });
    });

    fileUploadArea.addEventListener('drop', (e) => {
      addFiles(e.dataTransfer.files);
    });
  }

  function addFiles(files) {
    const maxFiles = 5;
    for (const file of files) {
      if (selectedFiles.items.length >= maxFiles) break;
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      selectedFiles.items.add(file);
    }
    imageInput.files = selectedFiles.files;
    renderPreviews();
  }

  function renderPreviews() {
    imagePreview.innerHTML = '';
    for (let i = 0; i < selectedFiles.files.length; i++) {
      const file = selectedFiles.files[i];
      const thumb = document.createElement('div');
      thumb.className = 'file-upload__thumb';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'file-upload__thumb-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', () => {
        const dt = new DataTransfer();
        for (let j = 0; j < selectedFiles.files.length; j++) {
          if (j !== i) dt.items.add(selectedFiles.files[j]);
        }
        selectedFiles = dt;
        imageInput.files = selectedFiles.files;
        renderPreviews();
      });

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      imagePreview.appendChild(thumb);
    }
  }
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

// Keyboard support for gallery items
document.querySelectorAll('.gallery__item[role="button"]').forEach(item => {
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(item);
    }
  });
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
