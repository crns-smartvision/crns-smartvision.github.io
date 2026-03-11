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
