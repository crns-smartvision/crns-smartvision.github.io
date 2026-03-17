(() => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;

  if (prefersReducedMotion || !canHover) return;

  const cards = Array.from(document.querySelectorAll('.project-card'));
  if (cards.length === 0) return;

  const MAX_TILT_DEG = 12; // stronger 3D
  const MAX_SHIFT_PX = 18; // watermark parallax

  for (const card of cards) {
    let rafId = 0;
    let lastEvent = null;

    const apply = () => {
      rafId = 0;
      if (!lastEvent) return;

      const rect = card.getBoundingClientRect();
      const x = (lastEvent.clientX - rect.left) / rect.width; // 0..1
      const y = (lastEvent.clientY - rect.top) / rect.height; // 0..1

      const dx = x - 0.5;
      const dy = y - 0.5;

      // tilt: move mouse right => rotateY positive, move down => rotateX negative
      const tiltY = dx * MAX_TILT_DEG;
      const tiltX = -dy * MAX_TILT_DEG;

      const shiftX = Math.max(-MAX_SHIFT_PX, Math.min(MAX_SHIFT_PX, dx * MAX_SHIFT_PX * 2));
      const shiftY = Math.max(-MAX_SHIFT_PX, Math.min(MAX_SHIFT_PX, dy * MAX_SHIFT_PX * 2));

      card.style.setProperty('--tilt-x', tiltX.toFixed(2));
      card.style.setProperty('--tilt-y', tiltY.toFixed(2));
      card.style.setProperty('--mask-shift-x', `${shiftX.toFixed(1)}px`);
      card.style.setProperty('--mask-shift-y', `${shiftY.toFixed(1)}px`);
    };

    const onMove = (ev) => {
      lastEvent = ev;
      if (rafId) return;
      rafId = window.requestAnimationFrame(apply);
    };

    const reset = () => {
      lastEvent = null;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--mask-shift-x');
      card.style.removeProperty('--mask-shift-y');
    };

    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', reset, { passive: true });
  }
})();

(() => {
  const button = document.querySelector('.back-to-top');
  if (!button) return;

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const SHOW_AFTER_PX = 50;

  const update = () => {
    button.classList.toggle('is-visible', window.scrollY >= SHOW_AFTER_PX);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });

  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const toEmail = 'achraf.benhamadou@crns.rnrt.tn';

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();

    if (!name || !email || !message) {
      form.reportValidity?.();
      return;
    }

    const subject = `SmartVision website contact — ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;

    const mailto = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
})();

(() => {
  const toggleButton = document.getElementById('togglePublications');
  const extraPublications = document.getElementById('publicationsExtra');
  const primaryPublications = document.getElementById('publicationsPrimary');

  if (!toggleButton || !extraPublications || !primaryPublications) return;

  const sortAndDistributePublications = () => {
    const allCards = Array.from(document.querySelectorAll('#publications .publication-card'));
    if (allCards.length === 0) return;

    const parseYear = (card) => {
      const yearText = card.querySelector('.publication-year')?.textContent?.trim() || '';
      const year = Number.parseInt(yearText, 10);
      return Number.isFinite(year) ? year : -1;
    };

    allCards.sort((a, b) => parseYear(b) - parseYear(a));

    primaryPublications.replaceChildren();
    extraPublications.replaceChildren();

    allCards.forEach((card, index) => {
      if (index < 6) {
        primaryPublications.appendChild(card);
      } else {
        extraPublications.appendChild(card);
      }
    });
  };

  sortAndDistributePublications();

  const openLabel = 'Hide selected papers';
  const closedLabel = 'View full selected papers';

  toggleButton.addEventListener('click', (event) => {
    event.preventDefault();
    const isHidden = extraPublications.hasAttribute('hidden');

    if (isHidden) {
      extraPublications.removeAttribute('hidden');
      toggleButton.textContent = openLabel;
      toggleButton.setAttribute('aria-expanded', 'true');
    } else {
      extraPublications.setAttribute('hidden', '');
      toggleButton.textContent = closedLabel;
      toggleButton.setAttribute('aria-expanded', 'false');
    }

    document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
