(function () {
  const selectors = "#news .news-media img";
  const images = Array.from(document.querySelectorAll(selectors));
  if (!images.length) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "news-zoom-overlay";
  document.body.appendChild(overlay);

  const preview = document.createElement("img");
  preview.className = "news-zoom-preview";
  preview.alt = "";
  document.body.appendChild(preview);

  let activeImg = null;
  let closeTimer = null;

  function clearCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getTargetRect(sourceRect, naturalWidth, naturalHeight) {
    const pad = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const aspect = naturalWidth > 0 && naturalHeight > 0
      ? naturalWidth / naturalHeight
      : sourceRect.width / sourceRect.height;

    const maxW = Math.min(vw * 0.68, naturalWidth || vw * 0.68);
    const maxH = Math.min(vh * 0.82, naturalHeight || vh * 0.82);

    let targetW = sourceRect.width * 4;
    let targetH = targetW / aspect;

    if (targetW > maxW) {
      targetW = maxW;
      targetH = targetW / aspect;
    }
    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH * aspect;
    }

    const centerX = sourceRect.left + sourceRect.width / 2;
    const centerY = sourceRect.top + sourceRect.height / 2;

    const left = clamp(centerX - targetW / 2, pad, vw - targetW - pad);
    const top = clamp(centerY - targetH / 2, pad, vh - targetH - pad);

    return { left, top, width: targetW, height: targetH };
  }

  function openZoom(img) {
    clearCloseTimer();

    if (activeImg && activeImg !== img) {
      activeImg.classList.remove("is-zoom-source");
    }

    activeImg = img;
    const rect = img.getBoundingClientRect();
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    preview.src = img.currentSrc || img.src;
    preview.style.display = "block";
    preview.style.left = rect.left + "px";
    preview.style.top = rect.top + "px";
    preview.style.width = rect.width + "px";
    preview.style.height = rect.height + "px";

    img.classList.add("is-zoom-source");
    overlay.classList.add("is-active");

    const target = getTargetRect(rect, naturalWidth, naturalHeight);
    requestAnimationFrame(function () {
      preview.style.left = target.left + "px";
      preview.style.top = target.top + "px";
      preview.style.width = target.width + "px";
      preview.style.height = target.height + "px";
    });
  }

  function scheduleClose() {
    if (!activeImg) {
      return;
    }

    clearCloseTimer();
    closeTimer = window.setTimeout(function () {
      const stillOnSource = Boolean(activeImg && activeImg.matches(":hover"));
      const stillOnPreview = preview.matches(":hover");
      if (stillOnSource || stillOnPreview) {
        closeTimer = null;
        return;
      }
      closeZoom();
    }, 90);
  }

  function closeZoom() {
    if (!activeImg) {
      return;
    }

    clearCloseTimer();

    const img = activeImg;
    const rect = img.getBoundingClientRect();
    overlay.classList.remove("is-active");

    preview.style.left = rect.left + "px";
    preview.style.top = rect.top + "px";
    preview.style.width = rect.width + "px";
    preview.style.height = rect.height + "px";

    closeTimer = window.setTimeout(function () {
      preview.style.display = "none";
      img.classList.remove("is-zoom-source");
      activeImg = null;
      closeTimer = null;
    }, 340);
  }

  images.forEach(function (img) {
    img.addEventListener("mouseenter", function () {
      openZoom(img);
    });

    img.addEventListener("mouseleave", function () {
      scheduleClose();
    });
  });

  preview.addEventListener("mouseenter", function () {
    clearCloseTimer();
  });

  preview.addEventListener("mouseleave", function () {
    scheduleClose();
  });

  window.addEventListener("scroll", function () {
    closeZoom();
  }, { passive: true });

  window.addEventListener("resize", function () {
    closeZoom();
  });
})();
