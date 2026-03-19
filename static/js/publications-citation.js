(function () {
  const buttons = Array.from(document.querySelectorAll(".citation-copy[data-cite-id]"));
  if (!buttons.length) {
    return;
  }

  const citations = window.PUBLICATION_CITATIONS || {};

  const modal = document.createElement("div");
  modal.className = "bibtex-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = [
    '<div class="bibtex-modal-backdrop" data-close="true"></div>',
    '<div class="bibtex-modal-dialog" role="dialog" aria-modal="true" aria-label="BibTeX citation">',
    '<div class="bibtex-modal-head">',
    '<strong>BibTeX Citation</strong>',
    '<button class="bibtex-close" type="button" aria-label="Close citation modal" data-close="true">&times;</button>',
    "</div>",
    '<pre class="bibtex-content"></pre>',
    '<div class="bibtex-modal-actions">',
    '<button class="button secondary bibtex-copy" type="button">Copy</button>',
    "</div>",
    "</div>"
  ].join("");
  document.body.appendChild(modal);

  const contentNode = modal.querySelector(".bibtex-content");
  const copyBtn = modal.querySelector(".bibtex-copy");
  let activeText = "";

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("bibtex-modal-open");
  }

  function openModal(text) {
    activeText = text;
    contentNode.textContent = text;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("bibtex-modal-open");
  }

  copyBtn.addEventListener("click", async function () {
    if (!activeText) {
      return;
    }

    try {
      await copyText(activeText);
      copyBtn.textContent = "Copied";
      window.setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1000);
    } catch (error) {
      copyBtn.textContent = "Copy failed";
      window.setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1200);
    }
  });

  modal.addEventListener("click", function (event) {
    const target = event.target;
    if (target && target.getAttribute("data-close") === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const citeId = button.getAttribute("data-cite-id");
      if (!citeId) {
        return;
      }

      const bibtex = (citations[citeId] || "").trim();
      if (!bibtex) {
        return;
      }

      openModal(bibtex);
    });
  });
})();
