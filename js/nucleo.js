// Estado Global (los datos viven en Repo; ver repo.js)
let occupiedRanges = [];
const saveConfig = () => Repo.saveConfig(cabinConfig).catch(() => showToast('No se pudo guardar la configuración.', 'error'));

// Una noche ocupada es [from, to): el día de salida queda libre para el siguiente huésped.
const isNightTaken = d => { const k = iso(d); return occupiedRanges.some(r => k >= r.from && k < r.to); };
const rangeFree = (a, b) => { for (let d = new Date(a); d < b; d = addDays(d, 1)) if (isNightTaken(d)) return false; return true; };
const isHigh = d => CONFIG.highMonths.includes(d.getMonth()) || (cabinConfig.holidays || []).includes(iso(d));
let adminDates = [];

function showDateError(msg) {
    const el = document.getElementById('date-error');
    if (!el) return;
    el.textContent = msg || ''; el.classList.toggle('hidden', !msg);
}

// 3. Determinar tarifa según el mes
function getNightlyRate(date) {
    const month = date.getMonth();
    return isHigh(date) ? cabinConfig.rateHigh : cabinConfig.rateLow;
}

// Carga reservas y configuración desde Repo (lo usan la página pública y el panel)
async function cargarEstado() {
    try {
        const state = await Repo.load();
        occupiedRanges = state.ranges || [];
        if (state.config && typeof state.config === 'object') cabinConfig = { ...cabinConfig, ...state.config };
    } catch (e) {
        showToast('No se pudo cargar la disponibilidad. Intenta recargar la página.', 'error');
    }
}
