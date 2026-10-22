// Utilidades
const iso = d => flatpickr.formatDate(d, 'Y-m-d');
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 2. Formateador de moneda (CLP)
const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
};

// Sistema de notificaciones Toast (remplaza alert)
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-forest-900 text-sand-50' : 'bg-red-800 text-white';
    toast.className = `${bgColor} p-4 rounded-xl shadow-2xl text-sm flex items-center justify-between border border-sand-200 pointer-events-auto transform transition-all duration-300 translate-y-[-10px] opacity-0`;
    toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="ml-4 text-xs opacity-70 hover:opacity-100">&times;</button>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-[-10px]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
