(() => {
  const list = document.getElementById('projectsList');
  if (!list) return;

  const buttons = Array.from(document.querySelectorAll('.filter-button'));
  const entries = Array.from(list.querySelectorAll('.project-card'));
  const emptyMessage = document.getElementById('projectsEmpty');

  const setActive = (target) => {
    buttons.forEach((button) => {
      const isActive = button === target;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyFilter = (filter) => {
    let visibleCount = 0;
    entries.forEach((entry) => {
      const status = entry.dataset.status || 'completed';
      const show = filter === 'all' || status === filter;
      entry.style.display = show ? '' : 'none';
      if (show) visibleCount += 1;
    });

    if (emptyMessage) {
      const showEmpty = filter === 'active' && visibleCount === 0;
      emptyMessage.hidden = !showEmpty;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      setActive(button);
      applyFilter(filter);
    });
  });
})();
