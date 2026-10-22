// Aplica la configuración guardada (tarifas, servicios, textos) a la página pública
function applyConfigToUI() {
    const lowEl = document.getElementById('display-rate-low');
    const highEl = document.getElementById('display-rate-high');
    const depositEl = document.getElementById('display-deposit-percent');

    if(lowEl) lowEl.innerText = formatMoney(cabinConfig.rateLow);
    if(highEl) highEl.innerText = formatMoney(cabinConfig.rateHigh);
    if(depositEl) depositEl.innerText = `${cabinConfig.depositPercent}%`;

    const petTitle = document.getElementById('feature-pet-title');
    const petDesc = document.getElementById('feature-pet-desc');
    const faqPetAns = document.getElementById('faq-pet-answer');

    if (cabinConfig.petFriendly) {
        if(petTitle) petTitle.innerText = "Pet Friendly";
        if(petDesc) petDesc.innerText = "Tus mascotas son muy bienvenidas a disfrutar de la naturaleza con respeto.";
        if(faqPetAns) faqPetAns.innerText = "¡Sí! Somos un recinto Pet Friendly. Te solicitamos traer la camita de tu mascota y velar por el cuidado de la fauna local.";
    } else {
        if(petTitle) petTitle.innerText = "Libre de Mascotas";
        if(petDesc) petDesc.innerText = "Ambiente libre de alergias para garantizar la máxima tranquilidad.";
        if(faqPetAns) faqPetAns.innerText = "Lamentablemente, para proteger la fauna nativa del sector y por políticas del recinto, no podemos aceptar mascotas en esta propiedad.";
    }

    const bathTitle = document.getElementById('feature-bath-title');
    const bathDesc = document.getElementById('feature-bath-desc');
    const faqBathTitle = document.getElementById('faq-bath-title');
    const faqBathAns = document.getElementById('faq-bath-answer');
    const lowBathText = document.getElementById('display-bath-low-text');
    const highBathText = document.getElementById('display-bath-high-text');

    const BATH_ICONS = { tinaja: 'fa-hot-tub-person', jacuzzi: 'fa-bath', sauna: 'fa-spa', none: 'fa-tree' };
    const WIFI_ICONS = { starlink: 'fa-satellite-dish', fibra: 'fa-wifi', none: 'fa-mobile-screen-button' };
    const setIcon = (id, name) => {
        const el = document.getElementById(id);
        if (el) el.className = `fa-solid ${name} text-2xl text-forest-800 opacity-80`;
    };
    const setListIcon = (itemId, name, color) => {
        const el = document.querySelector(`#${itemId} i`);
        if (el) el.className = `fa-solid ${name} ${color} mr-3`;
    };
    setIcon('feature-bath-icon', BATH_ICONS[cabinConfig.bathType] || BATH_ICONS.none);
    setIcon('feature-wifi-icon', WIFI_ICONS[cabinConfig.wifiType] || WIFI_ICONS.none);
    setIcon('feature-pet-icon', cabinConfig.petFriendly ? 'fa-paw' : 'fa-ban');
    const isTub = cabinConfig.bathType === 'tinaja';
    setListIcon('display-bath-low-item', isTub ? 'fa-plus' : 'fa-check', 'text-sand-300');
    setListIcon('display-bath-high-item', isTub ? 'fa-gift' : 'fa-check', 'text-wood-600');

    if (cabinConfig.bathType === 'tinaja') {
        if(bathTitle) bathTitle.innerText = "Tinaja de Leña";
        if(bathDesc) bathDesc.innerText = "Relájate bajo las estrellas en nuestra tinaja privada de ciprés.";
        if(faqBathTitle) faqBathTitle.innerText = "¿Cómo funciona la tinaja de leña?";
        if(faqBathAns) faqBathAns.innerText = "En temporada alta incluimos 1 uso sin costo. Nos encargamos de encenderla y prepararla a la temperatura ideal.";
        if(lowBathText) lowBathText.innerText = `Tinaja opcional (${formatMoney(cabinConfig.tubPrice)} x uso)`;
        if(highBathText) highBathText.innerText = "1 Uso de tinaja incluido por estadía";
    } else if (cabinConfig.bathType === 'jacuzzi') {
        if(bathTitle) bathTitle.innerText = "Jacuzzi Hidromasaje";
        if(bathDesc) bathDesc.innerText = "Disfruta de un baño de burbujas reparador con vista al bosque nativo.";
        if(faqBathTitle) faqBathTitle.innerText = "¿Cómo funciona el Jacuzzi?";
        if(faqBathAns) faqBathAns.innerText = "El jacuzzi está listo para usarse dentro de la cabaña con agua caliente ilimitada y control de temperatura digital.";
        if(lowBathText) lowBathText.innerText = "Jacuzzi hidromasaje incluido";
        if(highBathText) highBathText.innerText = "Jacuzzi hidromasaje incluido";
    } else if (cabinConfig.bathType === 'sauna') {
        if(bathTitle) bathTitle.innerText = "Sauna Seco";
        if(bathDesc) bathDesc.innerText = "Desintoxícate y relájate en nuestro sauna de madera nativa.";
        if(faqBathTitle) faqBathTitle.innerText = "¿El uso del Sauna está incluido?";
        if(faqBathAns) faqBathAns.innerText = "El sauna seco se encuentra disponible para su uso coordinando previamente con la administración.";
        if(lowBathText) lowBathText.innerText = "Sauna seco bajo reserva";
        if(highBathText) highBathText.innerText = "Uso ilimitado de Sauna seco";
    } else {
        if(bathTitle) bathTitle.innerText = "Entorno Natural";
        if(bathDesc) bathDesc.innerText = "Hermosos senderos y terraza privada rodeada de árboles nativos.";
        if(faqBathTitle) faqBathTitle.innerText = "¿Tienen servicio de spa o tinaja?";
        if(faqBathAns) faqBathAns.innerText = "Actualmente priorizamos la experiencia de desconexión en la naturaleza sin servicios de aguas termales.";
        if(lowBathText) lowBathText.innerText = "Terraza y quincho privado";
        if(highBathText) highBathText.innerText = "Terraza y quincho privado";
    }

    const wifiTitle = document.getElementById('feature-wifi-title');
    const wifiDesc = document.getElementById('feature-wifi-desc');
    const lowWifiText = document.getElementById('display-wifi-low-text');
    const highWifiText = document.getElementById('display-wifi-high-text');

    if (cabinConfig.wifiType === 'starlink') {
        if(wifiTitle) wifiTitle.innerText = "Conexión Starlink";
        if(wifiDesc) wifiDesc.innerText = "Desconéctate de la rutina, no del mundo. Internet satelital de alta velocidad.";
        if(lowWifiText) lowWifiText.innerText = "WiFi Starlink incluido";
        if(highWifiText) highWifiText.innerText = "WiFi Starlink incluido";
    } else if (cabinConfig.wifiType === 'fibra') {
        if(wifiTitle) wifiTitle.innerText = "Fibra Óptica";
        if(wifiDesc) wifiDesc.innerText = "Internet de ultra velocidad perfecto para teletrabajo y streaming sin interrupciones.";
        if(lowWifiText) lowWifiText.innerText = "Fibra Óptica 500 Mega incluido";
        if(highWifiText) highWifiText.innerText = "Fibra Óptica 500 Mega incluido";
    } else {
        if(wifiTitle) wifiTitle.innerText = "Zona de Desconexión";
        if(wifiDesc) wifiDesc.innerText = "Espacio diseñado para apagar las pantallas y reconectar con la naturaleza.";
        if(lowWifiText) lowWifiText.innerText = "Libre de pantallas y WiFi";
        if(highWifiText) highWifiText.innerText = "Libre de pantallas y WiFi";
    }

    const tubOpt = document.getElementById('tub-option');
    const tubPrice = document.getElementById('tub-option-price');
    if (tubOpt) {
        tubOpt.classList.toggle('hidden', cabinConfig.bathType !== 'tinaja');
        tubOpt.classList.toggle('flex', cabinConfig.bathType === 'tinaja');
    }
    if (tubPrice) tubPrice.innerText = `+${formatMoney(cabinConfig.tubPrice)}`;

}
