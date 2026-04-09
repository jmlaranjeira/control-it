document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('hours-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitIcon = document.getElementById('submit-icon');
  const loadingOverlay = document.getElementById('loading-overlay');
  const alertContainer = document.getElementById('alert-container');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const dryRunCheckbox = document.getElementById('dryRun');

  // --- Global simulation toggle ---

  const simulationToggleBtn = document.getElementById('simulation-toggle-btn');
  if (simulationToggleBtn && dryRunCheckbox) {
    function syncToggleUI() {
      const active = dryRunCheckbox.checked;
      simulationToggleBtn.classList.toggle('toggle-switch--active', active);
      simulationToggleBtn.setAttribute('aria-pressed', String(active));
      if (submitText) submitText.textContent = active ? 'Simular' : 'Registrar';
      if (submitIcon) {
        submitIcon.className = active ? 'fas fa-eye' : 'fas fa-paper-plane';
      }
    }

    simulationToggleBtn.addEventListener('click', function () {
      dryRunCheckbox.checked = !dryRunCheckbox.checked;
      syncToggleUI();
    });

    syncToggleUI();
  }

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

  // --- Single-day click-to-register + undo registered days ---

  const calendarContainer = document.querySelector('.calendar-container');
  const undoTooltip       = document.getElementById('undo-tooltip');
  const undoConfirmBtn    = document.getElementById('undo-confirm-btn');
  const undoCancelBtn     = document.getElementById('undo-cancel-btn');
  let   undoTargetDay     = null;

  function hideUndoTooltip() {
    if (undoTooltip) undoTooltip.hidden = true;
    undoTargetDay = null;
  }

  function showUndoTooltip(dayEl) {
    if (!undoTooltip) return;
    undoTargetDay = dayEl;

    // Position near the day cell
    const rect = dayEl.getBoundingClientRect();
    const tooltipW = 190;
    let left = rect.left + window.scrollX + rect.width / 2 - tooltipW / 2;
    let top  = rect.bottom + window.scrollY + 6;

    // Keep within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));

    undoTooltip.style.left  = `${left}px`;
    undoTooltip.style.top   = `${top}px`;
    undoTooltip.hidden      = false;
    undoConfirmBtn.focus();
  }

  if (undoCancelBtn) undoCancelBtn.addEventListener('click', hideUndoTooltip);

  // Close tooltip when clicking outside
  document.addEventListener('click', function (e) {
    if (undoTooltip && !undoTooltip.hidden &&
        !undoTooltip.contains(e.target) &&
        !e.target.closest('.calendar-day.registered')) {
      hideUndoTooltip();
    }
  });

  if (undoConfirmBtn) {
    undoConfirmBtn.addEventListener('click', async function () {
      if (!undoTargetDay) return;
      const dayEl = undoTargetDay;
      const date  = dayEl.dataset.date;
      hideUndoTooltip();

      undoConfirmBtn.disabled = true;
      clearAlerts();

      try {
        const body = new URLSearchParams();
        body.set('date', date);

        const response = await fetch('/disable-day', {
          method : 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body   : body.toString(),
        });

        const json = await response.json().catch(() => ({}));

        if (json.success) {
          dayEl.classList.replace('registered', 'pending');
          dayEl.dataset.status = 'pending';
          showAlert(`Registro del ${date} eliminado correctamente`, 'success');
        } else {
          showAlert(json.error ?? 'No se pudo eliminar el registro', 'error');
        }
      } catch {
        showAlert('Error al eliminar el registro', 'error');
      } finally {
        undoConfirmBtn.disabled = false;
      }
    });
  }

  if (calendarContainer) {
    calendarContainer.addEventListener('click', async function (event) {
      const dayEl = event.target.closest('.calendar-day');
      if (!dayEl) return;

      const status = dayEl.dataset.status;
      const date   = dayEl.dataset.date;
      if (!date) return;

      // Registered day → show undo tooltip
      if (status === 'registered') {
        showUndoTooltip(dayEl);
        return;
      }

      // Pending day → register
      if (status !== 'pending') return;

      startDateInput.value = date;
      endDateInput.value   = date;

      const body = new URLSearchParams();
      body.set('startDate', date);
      body.set('endDate', date);
      const isDryRun = document.getElementById('dryRun').checked;
      if (isDryRun) body.set('dryRun', 'on');

      try {
        const response = await fetch('/submit-day', {
          method : 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body   : body.toString(),
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
      } catch {
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
      // Weekend and empty cells are structural grid elements — never hide them
      // (hiding them with display:none removes them from the CSS grid and breaks alignment)
      if (day.classList.contains('weekend') || day.classList.contains('calendar-day--empty')) return;
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

  // --- 401 redirect helper ---

  function guardedFetch(url, options) {
    return fetch(url, options).then(res => {
      if (res.status === 401) { window.location.href = '/login'; }
      return res;
    });
  }

  // Patch existing fetch calls to use guardedFetch — replace references on calendarContainer
  // and undoConfirmBtn by overriding window.fetch for internal calls.
  // (Simpler: just patch window.fetch for same-origin calls)
  const _origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && !url.startsWith('http')) {
      return _origFetch(input, init).then(res => {
        if (res.status === 401) { window.location.href = '/login'; }
        return res;
      });
    }
    return _origFetch(input, init);
  };

  // --- Settings modal ---

  const settingsBtn      = document.getElementById('settings-btn');
  const settingsOverlay  = document.getElementById('settings-overlay');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsCancelBtn= document.getElementById('settings-cancel-btn');
  const settingsSaveBtn  = document.getElementById('settings-save-btn');
  const settingsResetBtn = document.getElementById('settings-reset-btn');
  const settingsAlert    = document.getElementById('settings-alert');

  function showSettingsAlert(msg, type = 'error') {
    if (!settingsAlert) return;
    settingsAlert.innerHTML = `<div class="alert alert-${type}" style="margin-bottom:1rem;"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><div>${msg}</div></div>`;
    setTimeout(() => { settingsAlert.innerHTML = ''; }, 4000);
  }

  function populateForm(cfg) {
    const s = id => document.getElementById(id);
    s('s-winter-start-hour').value    = cfg.workSchedule.winter.start.hour;
    s('s-winter-start-minute').value  = cfg.workSchedule.winter.start.minute;
    s('s-winter-length-hours').value  = cfg.workSchedule.winter.length.hours;
    s('s-winter-length-minutes').value= cfg.workSchedule.winter.length.minutes;
    s('s-lunch-start-hour').value     = cfg.workSchedule.lunch.start.hour;
    s('s-lunch-start-minute').value   = cfg.workSchedule.lunch.start.minute;
    s('s-lunch-length-hours').value   = cfg.workSchedule.lunch.length.hours;
    s('s-lunch-length-minutes').value = cfg.workSchedule.lunch.length.minutes;
    s('s-summer-start-hour').value    = cfg.workSchedule.summer.start.hour;
    s('s-summer-start-minute').value  = cfg.workSchedule.summer.start.minute;
    s('s-summer-length-hours').value  = cfg.workSchedule.summer.length.hours;
    s('s-summer-length-minutes').value= cfg.workSchedule.summer.length.minutes;
    s('s-summer-start-day').value     = cfg.summerStartDay;
    s('s-summer-start-month').value   = cfg.summerStartMonth;
    s('s-summer-end-day').value       = cfg.summerEndDay;
    s('s-summer-end-month').value     = cfg.summerEndMonth;
  }

  function collectForm() {
    const g = id => parseInt(document.getElementById(id).value, 10);
    return {
      workSchedule: {
        winter: {
          start:  { hour: g('s-winter-start-hour'),  minute: g('s-winter-start-minute') },
          length: { hours: g('s-winter-length-hours'), minutes: g('s-winter-length-minutes') },
        },
        lunch: {
          start:  { hour: g('s-lunch-start-hour'),   minute: g('s-lunch-start-minute') },
          length: { hours: g('s-lunch-length-hours'),  minutes: g('s-lunch-length-minutes') },
        },
        summer: {
          start:  { hour: g('s-summer-start-hour'),  minute: g('s-summer-start-minute') },
          length: { hours: g('s-summer-length-hours'), minutes: g('s-summer-length-minutes') },
        },
      },
      summerStartDay:   g('s-summer-start-day'),
      summerStartMonth: g('s-summer-start-month'),
      summerEndDay:     g('s-summer-end-day'),
      summerEndMonth:   g('s-summer-end-month'),
    };
  }

  async function openSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.hidden = false;
    try {
      const res = await fetch('/api/schedule-config');
      const json = await res.json();
      if (json.success) populateForm(json.config);
    } catch {
      showSettingsAlert('No se pudo cargar la configuración');
    }
  }

  function closeSettings() {
    if (settingsOverlay) settingsOverlay.hidden = true;
    if (settingsAlert) settingsAlert.innerHTML = '';
  }

  if (settingsBtn)       settingsBtn.addEventListener('click', openSettings);
  if (settingsCloseBtn)  settingsCloseBtn.addEventListener('click', closeSettings);
  if (settingsCancelBtn) settingsCancelBtn.addEventListener('click', closeSettings);

  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', function (e) {
      if (e.target === settingsOverlay) closeSettings();
    });
  }

  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener('click', async function () {
      settingsSaveBtn.disabled = true;
      try {
        const body = collectForm();
        const res = await fetch('/api/schedule-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.success) {
          showSettingsAlert('Configuración guardada correctamente', 'success');
          setTimeout(closeSettings, 1200);
        } else {
          showSettingsAlert(json.error || 'Error al guardar');
        }
      } catch {
        showSettingsAlert('Error al guardar la configuración');
      } finally {
        settingsSaveBtn.disabled = false;
      }
    });
  }

  if (settingsResetBtn) {
    settingsResetBtn.addEventListener('click', async function () {
      if (!confirm('¿Restaurar los valores por defecto del .env?')) return;
      settingsResetBtn.disabled = true;
      try {
        const res = await fetch('/api/schedule-config', { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          populateForm(json.config);
          showSettingsAlert('Valores restaurados a los valores por defecto', 'success');
        }
      } catch {
        showSettingsAlert('Error al restaurar la configuración');
      } finally {
        settingsResetBtn.disabled = false;
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && settingsOverlay && !settingsOverlay.hidden) {
      closeSettings();
    }
  });
});
