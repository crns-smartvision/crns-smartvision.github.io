(() => {
  const list = document.getElementById('projectsList');
  if (!list) return;

  const buttons = Array.from(document.querySelectorAll('.filter-button'));
  const entries = Array.from(list.querySelectorAll('.project-entry'));

  const setActive = (target) => {
    buttons.forEach((button) => {
      const isActive = button === target;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyFilter = (filter) => {
    entries.forEach((entry) => {
      const status = entry.dataset.status || 'completed';
      const show = filter === 'all' || status === filter;
      entry.style.display = show ? '' : 'none';
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      setActive(button);
      applyFilter(filter);
    });
  });
})();
