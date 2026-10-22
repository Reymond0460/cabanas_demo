# Cabañas El Refugio · Maqueta de reservas

Maqueta de un sitio de reservas para cabañas, hecha con HTML, CSS y JavaScript (sin base de datos real todavía).
Los datos de la demo (reservas, bloqueos, fotos y configuración) se guardan en el navegador de quien la abre.

- **Página de clientes:** `index.html` (la cabaña, tarifas, calendario y reserva)
- **Panel de administración:** `admin.html` (reservas, bloqueos, configuración, cupones y fotos). PIN de la demo: `1234`
- **Páginas legales:** `politica-de-privacidad.html`, `cookies.html`, `terminos.html`

## Estructura

| Carpeta o archivo | Qué contiene |
|---|---|
| `css/` | Estilos. Empieza por `css/estilos.css`, que importa el resto en orden. `tailwind.css` es **generado**, no se edita a mano |
| `js/config.js` | Tarifas, servicios, feriados, fotos y cupones por defecto, y datos fijos (WhatsApp, PIN) |
| `js/repo.js` | **Único** lugar que guarda y lee datos. Hoy usa el navegador; para producción se cambia por la API (ver `docs/API.md`) |
| `js/utils.js` | Fechas, moneda, avisos |
| `js/nucleo.js` | Disponibilidad de noches, temporada alta y carga de datos |
| `js/ui.js` | Animaciones, cookies, cierre de ventanas |
| `js/sitio.js` | Aplica la configuración a la página pública (textos e íconos según servicios) |
| `js/galeria.js` | Galería de fotos (pública y editor del panel) |
| `js/reservas.js` | Calendario, precios, cupón y reserva (página pública) |
| `js/admin.js` | Panel: acceso con PIN, reservas, bloqueos, configuración y cupones |
| `tailwind.config.js` | Colores y tipografías de la marca |
| `docs/` | `API.md` (contrato para el backend) y `MULTI_CABANA.md` (plan para varias cabañas) |

Cada página carga solo los `js/` que necesita (mira el final de cada `.html`). El orden importa.

## Probar en el computador

Opción 1: abrir la carpeta en VS Code y usar la extensión Live Server sobre `index.html`.
Opción 2: doble clic en `servir.bat` (necesita Python); abre http://localhost:5173.

## Cambiar estilos

Los estilos de diseño vienen de Tailwind y están ya compilados en `css/tailwind.css`.
Si cambias clases en los `.html` o `.js`, o colores en `tailwind.config.js`, vuelve a generarlo:

```
npm install      (solo la primera vez)
npm run css
```

## Datos de demostración

En el panel, el botón **Restablecer demo** borra las reservas, bloqueos y configuración guardados en el navegador.
Las fotos subidas desde el equipo se guardan en el navegador (límite aproximado: 15 a 20 fotos); en producción irían a un servidor.

## Antes de entregar a un cliente

- Cambiar el número de WhatsApp (`CONFIG.whatsapp` en `js/config.js`).
- Cambiar nombre, textos, fotos y datos legales.
- El PIN, el pago y el guardado son simulados: ver `docs/API.md` y `docs/MULTI_CABANA.md` para pasar a producción.
