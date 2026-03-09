document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('hours-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const loadingOverlay = document.getElementById('loading-overlay');
  const alertContainer = document.getElementById('alert-container');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  // --- Alert helpers ---

  function showAlert(message, type = 'info') {
    const iconMap = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle' };
    const icon = iconMap[type] || 'info-circle';
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.innerHTML = `<i class="fas fa-${icon}"></i><div>${message}</div>`;
    alertContainer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
  }

  function clearAlerts() {
    alertContainer.innerHTML = '';
  }

  // --- Form validation ---

  function validateForm() {
    clearAlerts();
    let isValid = true;

    if (!startDateInput.value) {
      showAlert('La fecha de inicio es obligatoria', 'error');
      isValid = false;
    }
    if (!endDateInput.value) {
      showAlert('La fecha de fin es obligatoria', 'error');
      isValid = false;
    }
    if (startDateInput.value && endDateInput.value && startDateInput.value > endDateInput.value) {
      showAlert('La fecha de inicio no puede ser posterior a la fecha de fin', 'error');
      isValid = false;
    }
    return isValid;
  }

  function validateDateRange() {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    const today = new Date();

    if (start > end) {
      endDateInput.setCustomValidity('La fecha de fin debe ser posterior a la fecha de inicio');
    } else if (end > today) {
      endDateInput.setCustomValidity('La fecha de fin no puede ser futura');
    } else {
      endDateInput.setCustomValidity('');
    }
  }

  startDateInput.addEventListener('change', validateDateRange);
  endDateInput.addEventListener('change', validateDateRange);

  // Mark form invalid only after first submit attempt
  form.addEventListener('submit', function () {
    if (!validateForm()) form.classList.add('validated');
  }, { capture: true });

  // Show loading on valid submit
  form.addEventListener('submit', function (e) {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitText.textContent = 'Procesando...';
    loadingOverlay.style.display = 'flex';

    setTimeout(() => {
      if (submitBtn.disabled) {
        showAlert('La solicitud está tardando más de lo esperado. Por favor, espera...', 'warning');
      }
    }, 10000);
  });

  // Auto-hide loading on back-navigation
  window.addEventListener('load', function () {
    loadingOverlay.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitText.textContent = 'Enviar Registro';
    }
  });

  // --- Single-day click-to-register ---

  const calendarContainer = document.querySelector('.calendar-container');

  if (calendarContainer) {
    calendarContainer.addEventListener('click', async function (event) {
      const dayEl = event.target.closest('.calendar-day');
      if (!dayEl || dayEl.dataset.status !== 'pending') return;

      const date = dayEl.dataset.date;
      if (!date) return;

      startDateInput.value = date;
      endDateInput.value = date;

      const body = new URLSearchParams();
      body.set('startDate', date);
      body.set('endDate', date);
      const isDryRun = document.getElementById('dryRun').checked;
      if (isDryRun) body.set('dryRun', 'on');

      try {
        const response = await fetch('/submit-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: body.toString(),
        });

        if (response.status === 200) {
          if (!isDryRun) {
            dayEl.classList.replace('pending', 'registered');
            dayEl.dataset.status = 'registered';
          } else {
            dayEl.classList.add('simulated');
            dayEl.dataset.status = 'simulated';
          }
        }
      } catch (error) {
        showAlert('Error al registrar el día', 'error');
      }
    });
  }

  // --- Fill-pending button ---

  const fillPendingBtn = document.getElementById('fill-pending-btn');
  if (fillPendingBtn) {
    fillPendingBtn.addEventListener('click', function () {
      const firstPending = fillPendingBtn.dataset.firstPending;
      const todayISO = new Date().toISOString().split('T')[0];
      if (firstPending) {
        startDateInput.value = firstPending;
        endDateInput.value = todayISO;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        form.submit();
      }
    });
  }

  // --- Legend filters ---

  const legendItems = Array.from(document.querySelectorAll('.legend .legend-item'));
  const defaultStatuses = ['registered', 'pending', 'holiday', 'vacation', 'leave', 'simulated'];
  const stored = (() => { try { return JSON.parse(localStorage.getItem('calendarFilters') || '[]'); } catch { return []; } })();
  const activeStatuses = new Set(Array.isArray(stored) && stored.length ? stored : defaultStatuses);

  function applyCalendarFilters() {
    document.querySelectorAll('.calendar-day').forEach(day => {
      const visible = Array.from(activeStatuses).some(s => day.classList.contains(s));
      day.style.display = visible ? '' : 'none';
    });
  }

  function toggleLegendItem(item) {
    const status = item.getAttribute('data-status');
    const next = item.getAttribute('aria-pressed') !== 'true';
    if (!next && activeStatuses.size === 1 && activeStatuses.has(status)) return;

    item.setAttribute('aria-pressed', String(next));
    if (next) activeStatuses.add(status); else activeStatuses.delete(status);
    try { localStorage.setItem('calendarFilters', JSON.stringify(Array.from(activeStatuses))); } catch {}
    applyCalendarFilters();
  }

  legendItems.forEach(item => {
    const status = item.getAttribute('data-status');
    item.setAttribute('aria-pressed', String(activeStatuses.has(status)));
    item.addEventListener('click', () => toggleLegendItem(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLegendItem(item); }
    });
  });

  applyCalendarFilters();

  // --- Keyboard navigation for calendar ---

  document.addEventListener('keydown', function (e) {
    const focused = document.activeElement;
    if (!focused.classList.contains('calendar-day')) return;

    const days = Array.from(document.querySelectorAll('.calendar-day'));
    const idx = days.indexOf(focused);
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };

    if (e.key in moves) {
      e.preventDefault();
      const next = idx + moves[e.key];
      if (next >= 0 && next < days.length) days[next].focus();
    }
  });
});
