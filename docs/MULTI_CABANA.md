# Tiforti Cabañas: de una cabaña a muchas

Hoy la demo es **una cabaña** con datos en el navegador. Para vender esto a dueños de cabañas, la idea es que cada dueño tenga su propia página y su propio panel, sobre el mismo código.

## Modelo de datos (mínimo)

```
owner      id, nombre, email, password_hash
cabin      id, owner_id, slug, nombre, descripcion, fotos[], config (JSON: tarifas, abono, mínimos, feriados, extras, cupones)
range      id, cabin_id, type (booking|blocked), from, to, estado, datos del huésped, total, abono
payment    id, range_id, proveedor, estado, monto
```

Una `cabin` es lo que hoy está en `cabinConfig`; un `range` es lo que hoy está en `occupiedRanges`.
Si un dueño tiene 3 cabañas, son 3 `cabin` con el mismo `owner_id`: cada una con su calendario.

## URLs

- `tiforti.cl/cabanas/el-refugio` → página pública de la cabaña (la actual `index.html`, leyendo `slug` de la URL).
- `tiforti.cl/panel` → login del dueño; ve solo sus cabañas.
- Opcional, plan pago: dominio propio (`cabanaselrefugio.cl`) apuntando a la misma app.

## Qué cambia en el código

| Hoy | Multi-cabaña |
|---|---|
| `Repo = LocalRepo` | `Repo = RemoteRepo('/v1/cabanas/' + slug)` (ya preparado, ver [API.md](API.md)) |
| Textos, fotos y nombre escritos en el HTML | Salen de `cabin` (`nombre`, `descripcion`, `fotos`) y se pintan con JS |
| PIN `1234` | Login real del dueño |
| Admin dentro de la misma página | `/panel` separado, con selector de cabaña |
| Un número de WhatsApp fijo | `cabin.whatsapp` |
| Textos legales con "Cabañas El Refugio" | Plantilla con el nombre y datos del dueño |

## Qué hay que decidir (negocio, no código)

1. **Cómo se cobra Tiforti**: suscripción mensual, comisión por reserva, o ambas.
2. **Quién recibe el pago**: ¿va directo a la cuenta del dueño (Mercado Pago / Flow con la cuenta del dueño) o pasa por Tiforti? Lo primero evita problemas legales y de custodia.
3. **Quién es responsable de los términos y la política de cancelación**: cada dueño debería poder editar los suyos.
4. **Sincronización con Airbnb/Booking** (iCal): casi todos los dueños ya tienen sus cabañas ahí. Sin sincronizar calendarios habrá doble reserva. Es la función más pedida en este tipo de producto.

## Orden sugerido de construcción

1. Backend mínimo + base de datos con `/state`, `/ranges`, `/config` (según API.md) y una sola cabaña real en producción.
2. Pago real con webhook (reserva pendiente → confirmada).
3. Login del dueño y `/panel`.
4. Varias cabañas por `slug`.
5. Sincronización iCal con Airbnb/Booking.
6. Dominio propio y plantillas de diseño.
