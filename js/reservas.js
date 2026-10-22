// Página pública: calendario, resumen de precios, cupón y reserva.

let publicCalInstance = null;

// Variables temporales de reserva
let currentSelection = { from: null, to: null, nights: 0, total: 0, deposit: 0, discount: 0 };
let activeCoupon = null;

function initCalendarioPublico() {
    if (!document.getElementById('public-calendar')) return;
    if (publicCalInstance) publicCalInstance.destroy();
    publicCalInstance = flatpickr('#public-calendar', {
        locale: 'es',
        mode: 'range',
        minDate: 'today',
        dateFormat: 'Y-m-d',
        disable: [isNightTaken],
        showMonths: window.innerWidth > 768 ? 2 : 1,
        inline: true,
        onChange: handleDateSelection
    });
}

function applyCoupon() {
    const codeInput = document.getElementById('coupon-input');
    const msgEl = document.getElementById('coupon-message');
    if(!codeInput || !msgEl) return;

    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;

    const found = cabinConfig.coupons.find(c => c.code === code);
    if (found) {
        activeCoupon = found;
        msgEl.className = "text-xs mt-1.5 text-green-700 font-medium block";
        msgEl.innerText = `¡Cupón ${found.code} aplicado con éxito!`;
    } else {
        activeCoupon = null;
        msgEl.className = "text-xs mt-1.5 text-red-600 font-medium block";
        msgEl.innerText = "Código de cupón inválido o expirado.";
    }

    if (publicCalInstance && publicCalInstance.selectedDates.length === 2) {
        handleDateSelection(publicCalInstance.selectedDates);
    }
}

function handleDateSelection(dates) {
    const summaryDiv = document.getElementById('booking-summary');
    const noDatesMsg = document.getElementById('no-dates-msg');
    const form = document.getElementById('booking-form');
    showDateError('');
    currentSelection = { from: null, to: null, nights: 0, total: 0, deposit: 0, discount: 0 };

    if (dates && dates.length === 2) {
        const startDate = dates[0];
        const endDate = dates[1];

        const nights = nightsBetween(iso(startDate), iso(endDate));
        if (nights <= 0) return;

        const minNights = isHigh(startDate) ? cabinConfig.minNightsHigh : cabinConfig.minNightsLow;
        const free = rangeFree(startDate, endDate);
        if (!free || nights < minNights) {
            publicCalInstance.clear();
            showDateError(!free
                ? 'Ese rango incluye noches ya ocupadas. Elige otras fechas.'
                : `La estadía mínima en estas fechas es de ${minNights} noches.`);
            return;
        }

        let subtotal = 0;
        let highNights = 0;
        let currentDate = new Date(startDate);

        for(let i=0; i<nights; i++) {
            subtotal += getNightlyRate(currentDate);
            if (isHigh(currentDate)) highNights++;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Tinaja: 1 uso incluido si la estadía toca temporada alta; en baja es un extra pagado
        const wantsTub = cabinConfig.bathType === 'tinaja' && !!document.getElementById('opt-tub')?.checked;
        const tubFree = highNights > 0;
        const tubCost = wantsTub && !tubFree ? cabinConfig.tubPrice : 0;

        let discount = 0;
        if (activeCoupon) {
            if (activeCoupon.type === 'percent') {
                discount = subtotal * (activeCoupon.value / 100);
            } else {
                discount = activeCoupon.value;
            }
        }

        discount = Math.min(discount, subtotal + tubCost);
        const total = Math.max(0, subtotal + tubCost - discount);
        const depositMultiplier = (cabinConfig.depositPercent / 100);
        const deposit = Math.round(total * depositMultiplier);

        currentSelection = {
            from: flatpickr.formatDate(startDate, "Y-m-d"),
            to: flatpickr.formatDate(endDate, "Y-m-d"),
            nights: nights,
            total: total,
            deposit: deposit,
            discount: discount,
            tub: wantsTub
        };

        const datesEl = document.getElementById('summary-dates');
        const nightsEl = document.getElementById('summary-nights');
        const totalCalcEl = document.getElementById('summary-total-calc');
        const totalEl = document.getElementById('summary-total');
        const depositEl = document.getElementById('summary-deposit');

        if(datesEl) datesEl.innerText = `${flatpickr.formatDate(startDate, "d/m/Y")} - ${flatpickr.formatDate(endDate, "d/m/Y")}`;
        if(nightsEl) nightsEl.innerText = nights;
        if(totalCalcEl) totalCalcEl.innerText = formatMoney(subtotal);
        if(totalEl) totalEl.innerText = formatMoney(total);
        if(depositEl) depositEl.innerText = formatMoney(deposit);

        const tubRow = document.getElementById('tub-row');
        const tubVal = document.getElementById('summary-tub');
        if (tubRow) tubRow.classList.toggle('hidden', !wantsTub);
        if (tubVal) tubVal.innerText = tubFree ? 'Incluida' : formatMoney(tubCost);

        const discountRow = document.getElementById('discount-row');
        const discountVal = document.getElementById('summary-discount');
        if (discountRow) {
            if (discount > 0) {
                discountRow.classList.remove('hidden');
                if(discountVal) discountVal.innerText = `-${formatMoney(discount)}`;
            } else {
                discountRow.classList.add('hidden');
            }
        }

        if(summaryDiv) summaryDiv.classList.remove('hidden');
        if(noDatesMsg) noDatesMsg.classList.add('hidden');
        if(form) form.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        if(summaryDiv) summaryDiv.classList.add('hidden');
        if(noDatesMsg) noDatesMsg.classList.remove('hidden');
        if(form) form.classList.add('opacity-50', 'pointer-events-none');
    }
}

async function processBooking(e) {
    e.preventDefault();
    if (!currentSelection.from) return;
    if (!rangeFree(parse(currentSelection.from), parse(currentSelection.to))) {
        publicCalInstance.clear();
        showDateError('Esas fechas se acaban de ocupar. Elige otras.');
        return;
    }
    const field = id => (document.getElementById(id)?.value || '').trim();
    const newBooking = {
        id: Date.now(),
        type: 'booking',
        name: field('client-name'),
        email: field('client-email'),
        phone: field('client-phone'),
        guests: parseInt(field('client-guests')) || 1,
        from: currentSelection.from,
        to: currentSelection.to,
        total: currentSelection.total,
        deposit: currentSelection.deposit,
        tub: currentSelection.tub
    };

    try {
        const saved = await Repo.addRange(newBooking);
        occupiedRanges.push(saved);
    } catch (err) {
        if (err.message === 'conflict') {
            const state = await Repo.load().catch(() => null);
            if (state) occupiedRanges = state.ranges;
    initCalendarioPublico();
            showDateError('Esas fechas se acaban de ocupar. Elige otras.');
        } else {
            showToast('No pudimos registrar tu reserva. Intenta nuevamente.', 'error');
        }
        return;
    }

    const detail = document.getElementById('success-detail');
    if (detail) detail.textContent = `${currentSelection.nights} noches · abono ${formatMoney(newBooking.deposit)}. Te enviamos las instrucciones a ${newBooking.email}.`;
    const waLink = document.getElementById('success-wa');
    if (waLink) waLink.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Hola, acabo de reservar en El Refugio.\nNombre: ${newBooking.name}\nFechas: ${newBooking.from} al ${newBooking.to} (${currentSelection.nights} noches)\nHuéspedes: ${newBooking.guests}${newBooking.tub ? '\nIncluye tinaja' : ''}\nAbono: ${formatMoney(newBooking.deposit)}`)}`;

    const modal = document.getElementById('success-modal');
    const content = document.getElementById('modal-content');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    if(content) {
        setTimeout(() => {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    }

    const form = document.getElementById('booking-form');
    if(form) form.reset();
    handleDateSelection([]);
    initCalendarioPublico();
}

// Recalcula el resumen con las fechas ya elegidas (por ejemplo al marcar la tinaja)
function refreshSelection() {
    if (publicCalInstance) handleDateSelection(publicCalInstance.selectedDates);
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstado();
    initCalendarioPublico();
    initCookies();
    applyConfigToUI();
    initGalleryZoom();
    initScrollAnimations();
    initModalBackdropsAndKeys();
    const wa = document.getElementById('wa-float');
    if (wa) wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hola, quiero consultar por una cabaña')}`;
});
