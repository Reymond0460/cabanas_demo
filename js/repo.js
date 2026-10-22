// Capa de datos de la app.
//
// El resto de la app NO toca localStorage ni fetch: todo pasa por `Repo`. Hoy usa LocalRepo (datos en el
// navegador, para la demo). Para producción basta con cambiar la última línea a RemoteRepo(...)
// y exponer los endpoints descritos en docs/API.md. La interfaz es la misma en ambos casos:
//
//   Repo.load()            -> { config: object|null, ranges: Range[] }
//   Repo.addRange(range)   -> Range          (rechaza con Error('conflict') si se cruza con otra)
//   Repo.removeRange(id)   -> void
//   Repo.saveConfig(cfg)   -> void
//   Repo.reset()           -> void           (solo demo)
//
// Range = { id, type: 'booking'|'blocked', from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', name, ... }
// Las noches ocupadas son [from, to): el día `to` queda libre.

(function () {
    const pad = n => String(n).padStart(2, '0');
    const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const plusDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return isoDate(d); };
    const overlaps = (a, b) => a.from < b.to && b.from < a.to;

    function demoRanges() {
        return [
            { id: 1, type: 'booking', name: 'Juan Pérez', email: 'juan@test.com', phone: '+56 9 1111 1111', guests: 3, from: plusDays(4), to: plusDays(7), total: 180000, deposit: 90000 },
            { id: 2, type: 'blocked', name: 'Mantenimiento General', from: plusDays(15), to: plusDays(17) },
        ];
    }

    // ---------- Demo: localStorage ----------
    const RANGES_KEY = 'refugio_ranges_v1', CONFIG_KEY = 'refugio_config_v1';
    const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (e.name === 'QuotaExceededError') throw e; } };   // solo avisa si no hay cupo

    const LocalRepo = {
        async load() {
            const ranges = read(RANGES_KEY);
            return { config: read(CONFIG_KEY), ranges: Array.isArray(ranges) ? ranges : demoRanges() };
        },
        async addRange(range) {
            const { ranges } = await this.load();
            if (ranges.some(r => overlaps(r, range))) throw new Error('conflict');
            const saved = { ...range, id: range.id || Date.now() };
            write(RANGES_KEY, [...ranges, saved]);
            return saved;
        },
        async removeRange(id) {
            const { ranges } = await this.load();
            write(RANGES_KEY, ranges.filter(r => r.id !== id));
        },
        async saveConfig(cfg) { write(CONFIG_KEY, cfg); },
        async reset() { try { localStorage.removeItem(RANGES_KEY); localStorage.removeItem(CONFIG_KEY); } catch (e) {} },
    };

    // ---------- Producción: REST ----------
    // `getToken` devuelve el token del dueño para las operaciones de admin (null en la web pública).
    function RemoteRepo(baseUrl, getToken = () => null) {
        async function call(method, path, body) {
            const headers = { 'Content-Type': 'application/json' };
            const token = getToken();
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(baseUrl + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
            if (res.status === 409) throw new Error('conflict');
            if (!res.ok) throw new Error(`http_${res.status}`);
            return res.status === 204 ? null : res.json();
        }
        return {
            load: () => call('GET', '/state'),
            addRange: range => call('POST', '/ranges', range),
            removeRange: id => call('DELETE', `/ranges/${encodeURIComponent(id)}`),
            saveConfig: cfg => call('PUT', '/config', cfg),
            reset: async () => {},
        };
    }

    window.LocalRepo = LocalRepo;
    window.RemoteRepo = RemoteRepo;
    window.Repo = LocalRepo;   // <- cambiar a RemoteRepo('https://api.tiforti.cl/v1/cabanas/el-refugio') en producción
})();
