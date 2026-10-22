// Configuración de la Cabaña (Estado Global)
let cabinConfig = {
    rateLow: 60000,
    rateHigh: 95000,
    depositPercent: 50,
    petFriendly: false,
    bathType: 'tinaja',
    wifiType: 'starlink',
    tubPrice: 25000,
    gallery: [
        { src: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80', alt: 'Dormitorio principal' },
        { src: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80', alt: 'Exterior de la cabaña' },
        { src: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80', alt: 'Interior y sala' },
        { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', alt: 'Baño y detalles' }
    ],
    minNightsLow: 2,
    minNightsHigh: 3,
    // Feriados / fines de semana largos que cobran tarifa alta (editable en el admin)
    holidays: ['2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31', '2026-12-08', '2026-12-25', '2027-01-01'],
    coupons: [
        { code: 'REFUGIO10', type: 'percent', value: 10 },
        { code: 'BIENVENIDA', type: 'fixed', value: 10000 }
    ]
};

// Parámetros fijos del negocio (editable)
const CONFIG = {
    highMonths: [0, 1],          // Ene, Feb = temporada alta
    whatsapp: '56900000000',     // reemplazar por el número real
    adminPin: '1234',            // demo; en producción va en el backend
};
