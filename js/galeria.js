// ---------- Galería (administrable) ----------
// Distribución en escritorio: la primera foto en grande y el resto rellena la grilla sin dejar huecos.
function galleryClasses(n, i) {
    if (n === 1) return 'md:col-span-4 md:row-span-2';
    if (i === 0) return 'md:col-span-2 md:row-span-2';
    const m = n - 1, k = i - 1;            // k = posición entre las fotos que no son la primera
    if (m <= 4) {
        if (m === 1) return 'md:col-span-2 md:row-span-2';
        if (m === 2) return 'md:col-span-2';
        if (m === 3 && k === 2) return 'md:col-span-2';
        return '';
    }
    const rest = m - 4, partial = rest % 4;
    if (partial && k === m - 1) return { 1: 'md:col-span-4', 2: 'md:col-span-3', 3: 'md:col-span-2' }[partial];
    return '';
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const list = cabinConfig.gallery || [];
    if (grid) {
        grid.innerHTML = list.length
            ? list.map((g, i) => `
                <div class="${galleryClasses(list.length, i)} h-64 md:h-auto overflow-hidden rounded-2xl group cursor-zoom-in">
                    <img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-700">
                </div>`).join('')
            : '<p class="md:col-span-4 text-center text-forest-600 py-16">Pronto agregaremos fotos de la cabaña.</p>';
    }
    const admin = document.getElementById('admin-gallery-list');
    if (admin) {
        admin.innerHTML = list.length
            ? list.map((g, i) => `
                <div class="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[4/3]">
                    <img src="${esc(g.src)}" alt="${esc(g.alt || '')}" class="w-full h-full object-cover">
                    ${i === 0 ? '<span class="absolute top-2 left-2 bg-forest-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Principal</span>' : ''}
                    <div class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] px-2 py-1 truncate">${esc(g.alt || 'Sin descripción')}</div>
                    <div class="absolute top-2 right-2 flex gap-1">
                        ${i > 0 ? `<button type="button" onclick="makeGalleryMain(${i})" title="Poner como principal" aria-label="Poner como principal" class="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-forest-800 text-xs shadow"><i class="fa-solid fa-star"></i></button>` : ''}
                        <button type="button" onclick="removeGalleryImage(${i})" title="Eliminar foto" aria-label="Eliminar foto" class="w-7 h-7 rounded-full bg-white/90 hover:bg-red-600 hover:text-white text-red-600 text-xs shadow transition"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`).join('')
            : '<p class="col-span-full text-sm text-gray-400 italic">No hay fotos. Agrega la primera abajo.</p>';
    }
}

async function persistGallery(okMessage) {
    try {
        await Repo.saveConfig(cabinConfig);
        showToast(okMessage);
    } catch (err) {
        showToast('No se pudo guardar: el navegador se quedó sin espacio. Elimina alguna foto o usa enlaces.', 'error');
    }
    renderGallery();
}

function removeGalleryImage(i) {
    if (!confirm('¿Eliminar esta foto de la galería?')) return;
    cabinConfig.gallery.splice(i, 1);
    persistGallery('Foto eliminada.');
}

function makeGalleryMain(i) {
    const [g] = cabinConfig.gallery.splice(i, 1);
    cabinConfig.gallery.unshift(g);
    persistGallery('Foto principal actualizada.');
}

function addGalleryUrl(e) {
    e.preventDefault();
    const url = document.getElementById('gallery-url').value.trim();
    const alt = document.getElementById('gallery-alt').value.trim();
    if (!/^https?:\/\//i.test(url)) { showToast('El enlace debe empezar con http:// o https://', 'error'); return; }
    cabinConfig.gallery.push({ src: url, alt: alt || 'Foto de la cabaña' });
    e.target.reset();
    persistGallery('Foto agregada.');
}

// Reduce la imagen a un máximo de 1400 px (JPEG) para no llenar el almacenamiento del navegador
function compressImage(file, maxSide = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
        img.src = url;
    });
}

async function addGalleryFiles(input) {
    const files = [...input.files];
    for (const f of files) {
        try {
            const src = await compressImage(f);
            cabinConfig.gallery.push({ src, alt: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') });
        } catch (err) {
            showToast(`No se pudo leer "${f.name}".`, 'error');
        }
    }
    input.value = '';
    if (files.length) persistGallery(files.length > 1 ? 'Fotos agregadas.' : 'Foto agregada.');
}

function initGalleryZoom() {
    renderGallery();
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.addEventListener('click', e => {
        const img = e.target.closest('img');
        if (img) openLightbox(img.src, img.alt);
    });
}

function openLightbox(src, alt) {
    let lb = document.getElementById('image-lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'image-lightbox';
        lb.className = 'fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4 cursor-zoom-out';
        lb.innerHTML = `<img id="lb-img" class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain transition-transform duration-300 scale-95" src="" alt=""><p id="lb-caption" class="absolute bottom-6 text-white text-sm bg-black/60 px-4 py-2 rounded-full font-light"></p>`;
        document.body.appendChild(lb);
        lb.addEventListener('click', () => {
            lb.classList.add('hidden');
            lb.classList.remove('flex');
        });
    }
    const lbImg = document.getElementById('lb-img');
    const lbCap = document.getElementById('lb-caption');
    if(lbImg) { lbImg.src = src; lbImg.alt = alt || ''; }
    if(lbCap) { lbCap.innerText = alt || ''; }
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    setTimeout(() => {
        if(lbImg) {
            lbImg.classList.remove('scale-95');
            lbImg.classList.add('scale-100');
        }
    }, 10);
}
