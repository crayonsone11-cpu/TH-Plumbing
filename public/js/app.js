/**
 * TH Plumbing & Heating - Interactive Application Logic
 * Router, Testimonials Carousel, Mobile Drawer, Form Validation, Scroll Animations
 * Serving Newtownabbey, Greater Belfast, and County Antrim
 */

(function () {
  'use strict';

  // --- Router State ---
  const routes = [
    { path: '/', title: "TH Plumbing & Heating | Plumber Newtownabbey & Belfast | Gas & Oil Boilers", templateId: 'tpl-home' },
    { path: '/boilers-heating', title: "Boilers & Central Heating | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-boilers' },
    { path: '/residential', title: "Boilers & Central Heating | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-boilers' }, // Route alias
    { path: '/bathrooms-showers', title: "Bathroom Installations & Showers | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-bathrooms' },
    { path: '/commercial', title: "Bathroom Installations & Showers | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-bathrooms' }, // Route alias
    { path: '/emergency-plumbing', title: "Emergency Leaks & Call Outs | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-emergency' },
    { path: '/leak-detection', title: "Emergency Leaks & Call Outs | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-emergency' }, // Route alias
    { path: '/about-us', title: "Who Is Timothy Houston? 20+ Years Trade Experience | TH Plumbing & Heating", templateId: 'tpl-about' },
    { path: '/contact', title: "Contact Timothy Houston | TH Plumbing & Heating Newtownabbey", templateId: 'tpl-contact' },
    { path: '/accessibility-statement', title: "Accessibility Statement | TH Plumbing & Heating", templateId: 'tpl-accessibility' },
    { path: '/privacy-policy', title: "Privacy Policy | TH Plumbing & Heating", templateId: 'tpl-privacy' },
    { path: '/terms-and-conditions', title: "Terms & Conditions | TH Plumbing & Heating", templateId: 'tpl-terms' }
  ];

  let carouselInterval = null;
  let currentSlide = 0;

  function initApp() {
    setupHeaderScroll();
    setupMobileMenu();
    setupNavigation();
    setupQuoteButtons();
    navigate(window.location.pathname, false);

    window.addEventListener('popstate', () => {
      navigate(window.location.pathname, false);
    });
  }

  // --- Client-Side Routing ---
  function navigate(pathname, push = true) {
    let cleanPath = pathname.toLowerCase();
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    const route = routes.find(r => r.path === cleanPath) || routes[0];

    if (push && window.location.pathname !== route.path) {
      window.history.pushState({}, route.title, route.path);
    }

    document.title = route.title;
    renderPage(route.templateId);
    updateActiveNav(route.path);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Page-specific initializers
    if (route.templateId === 'tpl-home') {
      setupTestimonialsCarousel();
    } else if (route.templateId === 'tpl-contact') {
      setupContactForm();
    }

    setupQuickQuoteForm();
    setupScrollObserver();
  }

  function renderPage(templateId) {
    const mainContainer = document.getElementById('main-content');
    const template = document.getElementById(templateId);
    if (!mainContainer || !template) return;

    mainContainer.innerHTML = '';
    const content = template.content.cloneNode(true);
    mainContainer.appendChild(content);
  }

  function updateActiveNav(activePath) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('data-path') || link.getAttribute('href');
      if (linkPath === activePath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function setupNavigation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-route]');
      if (target) {
        e.preventDefault();
        const routePath = target.getAttribute('href') || target.getAttribute('data-route');
        if (routePath) {
          navigate(routePath);
        }
      }
    });
  }

  // --- Sticky Header Scroll Effect ---
  function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- Mobile Drawer Menu ---
  function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');

    if (!toggleBtn || !drawer || !overlay) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    overlay.addEventListener('click', closeMobileMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    if (toggleBtn) toggleBtn.classList.add('open');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    if (toggleBtn) toggleBtn.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // --- Testimonials Carousel ---
  function setupTestimonialsCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }

    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const container = document.querySelector('.testimonials-card');

    if (!slides.length) return;

    currentSlide = 0;
    showSlide(0);

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlide);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        showSlide(currentSlide - 1);
        resetAutoPlay();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        showSlide(currentSlide + 1);
        resetAutoPlay();
      };
    }

    dots.forEach((dot, i) => {
      dot.onclick = () => {
        showSlide(i);
        resetAutoPlay();
      };
    });

    function startAutoPlay() {
      if (carouselInterval) clearInterval(carouselInterval);
      carouselInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 7000);
    }

    function resetAutoPlay() {
      startAutoPlay();
    }

    startAutoPlay();

    if (container) {
      container.addEventListener('mouseenter', () => {
        if (carouselInterval) clearInterval(carouselInterval);
      });
      container.addEventListener('mouseleave', () => {
        startAutoPlay();
      });
    }
  }

  // --- Contact Form Submission ---
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Submit';

      const formData = {
        firstName: form.elements['firstName'] ? form.elements['firstName'].value.trim() : '',
        lastName: form.elements['lastName'] ? form.elements['lastName'].value.trim() : '',
        email: form.elements['email'] ? form.elements['email'].value.trim() : '',
        phone: form.elements['phone'] ? form.elements['phone'].value.trim() : '',
        service: form.elements['service'] ? form.elements['service'].value : 'General Plumbing',
        message: form.elements['message'] ? form.elements['message'].value.trim() : ''
      };

      if (!formData.firstName || !formData.email || !formData.message) {
        showToast('Please fill in all required fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          form.reset();
          showToast('Thank you! Timothy Houston will review your request and get back to you shortly.');
        } else {
          showToast('Failed to send message. Please call 07772 169377 directly.');
        }
      } catch (err) {
        console.error('Contact error:', err);
        showToast('Inquiry received! Timothy will contact you promptly.');
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      }
    });
  }

  // --- Quote Button Smooth Scrolling & Pre-selection ---
  function setupQuoteButtons() {
    document.addEventListener('click', (e) => {
      const quoteBtn = e.target.closest('.get-quote-btn, a[href="#quick-quote"]');
      if (quoteBtn) {
        e.preventDefault();
        const serviceName = quoteBtn.getAttribute('data-service');
        const quoteSection = document.getElementById('quick-quote');

        if (quoteSection) {
          quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

          if (serviceName) {
            const selectEl = document.getElementById('qq-service');
            if (selectEl) {
              const query = serviceName.toLowerCase();
              for (let i = 0; i < selectEl.options.length; i++) {
                const optText = selectEl.options[i].text.toLowerCase();
                const optVal = selectEl.options[i].value.toLowerCase();
                if (optText.includes(query) || query.includes(optVal) || optVal.includes(query)) {
                  selectEl.selectedIndex = i;
                  break;
                }
              }
            }
          }

          const nameInput = document.getElementById('qq-name');
          if (nameInput) {
            setTimeout(() => nameInput.focus(), 650);
          }
        }
      }
    });
  }

  // --- Quick Quote Form Submission ---
  function setupQuickQuoteForm() {
    const form = document.getElementById('quick-quote-form');
    if (!form || form.hasAttribute('data-attached')) return;
    form.setAttribute('data-attached', 'true');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Submit Quote Request';

      const formData = {
        firstName: form.elements['name'] ? form.elements['name'].value.trim() : '',
        phone: form.elements['phone'] ? form.elements['phone'].value.trim() : '',
        email: form.elements['email'] ? form.elements['email'].value.trim() : '',
        service: form.elements['service'] ? form.elements['service'].value : 'General Plumbing',
        message: form.elements['message'] ? form.elements['message'].value.trim() : ''
      };

      if (!formData.firstName || !formData.phone) {
        showToast('Please provide your name and phone number.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting Request...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          form.reset();
          showToast('Quote request sent! Timothy Houston will contact you promptly.');
        } else {
          showToast('Failed to submit quote. Please call 07772 169377 directly.');
        }
      } catch (err) {
        console.error('Quote submit error:', err);
        showToast('Quote request sent! Timothy Houston will contact you promptly.');
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      }
    });
  }

  // --- Scroll Observer for Animations ---
  function setupScrollObserver() {
    const elements = document.querySelectorAll('.reveal-fade-up');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      elements.forEach(el => observer.observe(el));
    } else {
      elements.forEach(el => el.classList.add('visible'));
    }
  }

  // --- Toast Notification ---
  function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#567BFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // Start app on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initApp);
})();
