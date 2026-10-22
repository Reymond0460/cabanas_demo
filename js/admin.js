// Panel de administración: acceso con PIN, reservas, bloqueos, configuración, cupones y galería.

// ---------- Acceso con PIN (demo; en producción va en el backend) ----------
const ADMIN_FLAG = 'refugio_admin_ok';
let adminOK = false;

function adminDesbloqueado() {
    try { return adminOK || sessionStorage.getItem(ADMIN_FLAG) === '1'; } catch (e) { return adminOK; }
}
function mostrarPanel() {
    document.getElementById('admin-view').classList.remove('hidden');
    window.scrollTo(0, 0);
}
function pedirPin() {
    const m = document.getElementById('pin-modal'); m.classList.remove('hidden'); m.classList.add('flex');
    const i = document.getElementById('pin-input'); i.value = ''; i.focus();
}
function closePin() {
    const m = document.getElementById('pin-modal'); m.classList.add('hidden'); m.classList.remove('flex');
    document.getElementById('pin-error').textContent = '';
}
function cancelarPin() { location.href = 'index.html'; }
function submitPin(e) {
    e.preventDefault();
    if (document.getElementById('pin-input').value === CONFIG.adminPin) {
        adminOK = true;
        try { sessionStorage.setItem(ADMIN_FLAG, '1'); } catch (err) {}
        closePin(); mostrarPanel(); iniciarPanel();
    } else {
        document.getElementById('pin-error').textContent = 'PIN incorrecto';
    }
}

// ---------- Calendario de bloqueos ----------
let adminCalInstance = null;

function initAdminCalendar() {
    if (adminCalInstance) adminCalInstance.destroy();
    adminDates = [];
    adminCalInstance = flatpickr('#admin-calendar', {
        locale: 'es',
        mode: 'range',
        minDate: 'today',
        dateFormat: 'Y-m-d',
        disable: [isNightTaken],
        showMonths: window.innerWidth > 768 ? 2 : 1,
        onChange: d => adminDates = d
    });
}

// Pestañas dentro del Admin
function switchAdminTab(tab) {
    const bookingsTab = document.getElementById('admin-tab-bookings-content');
    const settingsTab = document.getElementById('admin-tab-settings-content');
    const btnBookings = document.getElementById('btn-tab-bookings');
    const btnSettings = document.getElementById('btn-tab-settings');

    if (!bookingsTab || !settingsTab) return;

    if (tab === 'bookings') {
        bookingsTab.classList.remove('hidden');
        settingsTab.classList.add('hidden');
        if (btnBookings) btnBookings.className = 'px-4 py-2 rounded-lg bg-white text-gray-900 shadow-sm transition';
        if (btnSettings) btnSettings.className = 'px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition';
    } else {
        bookingsTab.classList.add('hidden');
        settingsTab.classList.remove('hidden');
        if (btnSettings) btnSettings.className = 'px-4 py-2 rounded-lg bg-white text-gray-900 shadow-sm transition';
        if (btnBookings) btnBookings.className = 'px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition';
    }
}

function populateConfigForm() {
    const low = document.getElementById('input-rate-low');
    const high = document.getElementById('input-rate-high');
    const dep = document.getElementById('input-deposit-percent');
    const pet = document.getElementById('input-pet-friendly');
    const bath = document.getElementById('input-bath-type');
    const wifi = document.getElementById('input-wifi-type');

    if(low) low.value = cabinConfig.rateLow;
    if(high) high.value = cabinConfig.rateHigh;
    if(dep) dep.value = cabinConfig.depositPercent;
    if(pet) pet.checked = cabinConfig.petFriendly;
    if(bath) bath.value = cabinConfig.bathType;
    if(wifi) wifi.value = cabinConfig.wifiType;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('input-min-low', cabinConfig.minNightsLow);
    set('input-min-high', cabinConfig.minNightsHigh);
    set('input-tub-price', cabinConfig.tubPrice);
    set('input-holidays', (cabinConfig.holidays || []).join(', '));
}

function saveConfigSettings(e) {
    e.preventDefault();
    cabinConfig.rateLow = parseFloat(document.getElementById('input-rate-low')?.value) || 60000;
    cabinConfig.rateHigh = parseFloat(document.getElementById('input-rate-high')?.value) || 95000;
    cabinConfig.depositPercent = parseFloat(document.getElementById('input-deposit-percent')?.value) || 50;
    cabinConfig.petFriendly = document.getElementById('input-pet-friendly')?.checked || false;
    cabinConfig.bathType = document.getElementById('input-bath-type')?.value || 'tinaja';
    cabinConfig.wifiType = document.getElementById('input-wifi-type')?.value || 'starlink';
    cabinConfig.minNightsLow = Math.max(1, parseInt(document.getElementById('input-min-low')?.value) || 2);
    cabinConfig.minNightsHigh = Math.max(1, parseInt(document.getElementById('input-min-high')?.value) || 3);
    cabinConfig.tubPrice = Math.max(0, parseFloat(document.getElementById('input-tub-price')?.value) || 0);
    cabinConfig.holidays = (document.getElementById('input-holidays')?.value || '')
        .split(/[\s,;]+/).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));

    saveConfig();

    showToast("¡Configuración guardada exitosamente!");
}

function addCoupon(e) {
    e.preventDefault();
    const codeEl = document.getElementById('new-coupon-code');
    const typeEl = document.getElementById('new-coupon-type');
    const valEl = document.getElementById('new-coupon-value');

    if(!codeEl || !typeEl || !valEl) return;

    const code = codeEl.value.trim().toUpperCase();
    const type = typeEl.value;
    const val = parseFloat(valEl.value);

    if(!code || !val) return;

    cabinConfig.coupons.push({ code: code, type: type, value: val });
    saveConfig();
    const form = document.getElementById('add-coupon-form');
    if(form) form.reset();
    renderAdminCoupons();
    showToast(`Cupón ${code} creado exitosamente.`);
}

function deleteCoupon(code) {
    cabinConfig.coupons = cabinConfig.coupons.filter(c => c.code !== code);
    saveConfig();
    renderAdminCoupons();
    showToast(`Cupón ${code} eliminado.`, 'error');
}

function renderAdminCoupons() {
    const container = document.getElementById('admin-coupons-list');
    if(!container) return;
    container.innerHTML = '';

    if (cabinConfig.coupons.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 italic">No hay cupones creados.</p>';
        return;
    }

    cabinConfig.coupons.forEach(c => {
        const label = c.type === 'percent' ? `${c.value}% OFF` : `$${c.value.toLocaleString('es-CL')} OFF`;
        const html = `
            <div class="flex justify-between items-center p-2.5 bg-sand-50 rounded-lg border border-sand-200 text-xs">
                <div>
                    <span class="font-bold text-forest-900 tracking-wider">${esc(c.code)}</span>
                    <span class="ml-2 text-forest-600 font-medium">${label}</span>
                </div>
                <button onclick="deleteCoupon('${esc(c.code)}')" class="text-red-500 hover:text-red-700 transition" aria-label="Eliminar cupón"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function updateAdminDashboard() {
    let activeBookings = 0;
    let blockedDaysTotal = 0;
    let totalIncome = 0;

    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        if (occupiedRanges.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
        }
    }

    const sortedRanges = [...occupiedRanges].sort((a,b) => new Date(a.from) - new Date(b.from));

    sortedRanges.forEach(item => {
        const nights = nightsBetween(item.from, item.to);
        blockedDaysTotal += nights;

        let rowHTML = '';
        if (item.type === 'booking') {
            activeBookings++;
            totalIncome += item.deposit;

            rowHTML = `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-circle text-[8px] mr-1.5 mt-1"></i> Reserva</span></td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${esc(item.name)} <span class="text-gray-400 font-normal">· ${item.guests || '-'} pers.</span></div>
                        <div class="text-sm text-gray-500">${esc(item.email)} · ${esc(item.phone || '')}</div>
                        <div class="text-xs text-gray-400 mt-0.5">Abono: ${formatMoney(item.deposit)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${item.from} a ${item.to} <br><span class="font-normal text-xs text-gray-400">(${nights} noches)</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="deleteItem(${item.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition"><i class="fa-solid fa-trash mr-1"></i> Cancelar</button>
                    </td>
                </tr>
            `;
        } else {
            rowHTML = `
                <tr class="bg-gray-50/50">
                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-gray-100 text-gray-600 border border-gray-200"><i class="fa-solid fa-lock text-[10px] mr-1.5 mt-0.5"></i> Bloqueo</span></td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${esc(item.name || 'Sin motivo')}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${item.from} a ${item.to} <br><span class="font-normal text-xs text-gray-400">(${nights} noches)</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="deleteItem(${item.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition"><i class="fa-solid fa-unlock mr-1"></i> Desbloquear</button>
                    </td>
                </tr>
            `;
        }
        tbody.insertAdjacentHTML('beforeend', rowHTML);
    });

    const statBookings = document.getElementById('stat-bookings');
    const statBlocked = document.getElementById('stat-blocked');
    const statIncome = document.getElementById('stat-income');

    if(statBookings) statBookings.innerText = activeBookings;
    if(statBlocked) statBlocked.innerText = blockedDaysTotal;
    if(statIncome) statIncome.innerText = formatMoney(totalIncome);
}

async function deleteItem(id) {
    const r = occupiedRanges.find(x => x.id === id);
    if (!r || !confirm(r.type === 'booking' ? `¿Cancelar la reserva de ${r.name}?` : '¿Desbloquear estas fechas?')) return;
    try { await Repo.removeRange(id); } catch (err) { showToast('No se pudo eliminar el registro.', 'error'); return; }
    occupiedRanges = occupiedRanges.filter(item => item.id !== id);
    initAdminCalendar();
    updateAdminDashboard();
    showToast("Registro eliminado con éxito.");
}

async function resetDemo() {
    if (!confirm('¿Restablecer reservas, bloqueos y configuración de demostración?')) return;
    await Repo.reset();
    location.reload();
}

async function blockDates(e) {
    e.preventDefault();
    const reason = document.getElementById('block-reason')?.value || '';

    if (adminDates.length !== 2 || adminDates[1] <= adminDates[0]) {
        showToast('Elige fecha de inicio y de término.', 'error');
        return;
    }
    if (!rangeFree(adminDates[0], adminDates[1])) {
        showToast('El rango incluye noches ya ocupadas.', 'error');
        return;
    }

    try {
        const saved = await Repo.addRange({
            type: 'blocked',
            name: reason.trim() || 'Mantenimiento',
            from: iso(adminDates[0]),
            to: iso(adminDates[1])
        });
        occupiedRanges.push(saved);
    } catch (err) {
        showToast(err.message === 'conflict' ? 'El rango incluye noches ya ocupadas.' : 'No se pudo bloquear las fechas.', 'error');
        return;
    }

    const form = document.getElementById('block-dates-form');
    if(form) form.reset();
    initAdminCalendar();
    updateAdminDashboard();
    showToast("Fechas bloqueadas en el calendario.");
}

// ---------- Arranque ----------
async function iniciarPanel() {
    await cargarEstado();
    initAdminCalendar();
    updateAdminDashboard();
    populateConfigForm();
    renderAdminCoupons();
    renderGallery();
}

document.addEventListener('DOMContentLoaded', () => {
    initModalBackdropsAndKeys();
    if (adminDesbloqueado()) { mostrarPanel(); iniciarPanel(); }
    else pedirPin();
});
