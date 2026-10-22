# Contrato de API (para reemplazar `LocalRepo` por `RemoteRepo`)

En [js/repo.js](../js/repo.js) la app llama solo a `Repo.*`. Para pasar a producción:

1. Implementar los endpoints de abajo.
2. En `repo.js`, última línea: `window.Repo = RemoteRepo('https://api.tiforti.cl/v1/cabanas/el-refugio', () => token)`.

Base: `/v1/cabanas/{slug}`. Fechas en `YYYY-MM-DD`. Las noches ocupadas son `[from, to)`: el día `to` queda libre.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/state` | pública | `{ config, ranges }`. A la web pública **no** se le deben enviar nombre, correo ni teléfono de los huéspedes: solo `{id, type, from, to}`. El admin (con token) recibe el detalle completo. |
| POST | `/ranges` | pública para `type: "booking"`, token para `"blocked"` | Crea reserva o bloqueo. **409** si se cruza con otro rango (el servidor valida siempre, la web no es confiable). Devuelve el rango con su `id`. |
| DELETE | `/ranges/{id}` | token | Cancela reserva o desbloquea. `204`. |
| PUT | `/config` | token | Guarda la configuración (tarifas, abono, mínimos, feriados, cupones, extras). |

## Reglas que el servidor debe aplicar (no confiar en el navegador)

- **Precio**: recalcular total y abono desde la configuración, ignorando los montos que mande el cliente.
- **Disponibilidad y estadía mínima**: validar en la misma transacción que inserta la reserva.
- **Cupones**: validar el código en el servidor. Hoy la lista de cupones viaja en `config`, así que cualquiera podría leerla: en producción deben ir solo en el endpoint de admin.
- **Pago**: la reserva nace `pendiente` y pasa a `confirmada` cuando la pasarela (Webpay, Flow, Mercado Pago) notifica el pago por webhook. Si no paga en X minutos, se libera.
- **PIN de admin**: reemplazar por login real (el PIN actual es solo demo).
- **Rate limit** y captcha en `POST /ranges`.

## Forma de los datos

```json
// Range (reserva)
{ "id": "bk_123", "type": "booking", "from": "2026-12-07", "to": "2026-12-09",
  "name": "Ana", "email": "a@b.cl", "phone": "+569...", "guests": 4,
  "tub": false, "total": 155000, "deposit": 77500, "status": "pending|confirmed" }

// Range (bloqueo)
{ "id": "bl_9", "type": "blocked", "from": "2026-11-05", "to": "2026-11-07", "name": "Mantenimiento" }

// config
{ "rateLow": 60000, "rateHigh": 95000, "depositPercent": 50, "tubPrice": 25000,
  "minNightsLow": 2, "minNightsHigh": 3, "holidays": ["2026-12-08"],
  "petFriendly": false, "bathType": "tinaja", "wifiType": "starlink", "coupons": [] }
```
