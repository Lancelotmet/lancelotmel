# Arquitectura de despliegue LANCELOT

## Objetivo

Trabajar el proyecto con Git y publicar automaticamente cada cambio aprobado:

```txt
Codex/local -> GitHub -> Render Web Service -> dominio en Hostinger
```

Hostinger queda como proveedor del dominio/DNS. Render corre la aplicacion Next.js completa con Node.js.

## Por que Render y no public_html

El proyecto usa:

- Rutas API en `/api`.
- Checkout.
- Webhooks de pago.
- Admin de productos.
- Descargas privadas.
- Supabase server-side.

Eso necesita Node.js. El plan actual de Hostinger sin Node.js solo sirve para la version estatica/manual.

## Componentes

### 1. GitHub

Repositorio fuente del proyecto.

Flujo:

```txt
main branch -> Render auto deploy
```

Cada vez que se haga `git push` a `main`, Render reconstruye y publica.

### 2. Render

Servicio recomendado:

```txt
Type: Web Service
Runtime: Node
Plan inicial: Free
Build Command: npm install && npm run build
Start Command: npm start
```

El archivo `render.yaml` ya contiene esta configuracion como Blueprint.

### 3. Supabase

Base de datos, Auth y Storage privado.

Antes de produccion:

1. Crear proyecto Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Crear/verificar buckets:
   - `public-assets`
   - `product-previews`
   - `protected-products`
   - `user-uploads-future`
4. Mantener `protected-products` privado.

### 4. Hostinger

Hostinger no corre la app. Solo apunta el dominio hacia Render.

En Render:

1. Ir al Web Service.
2. Abrir Settings.
3. Agregar Custom Domain, por ejemplo:
   - `lancelotmet.com`
   - `www.lancelotmet.com`
4. Render mostrara los registros DNS exactos.

En Hostinger:

1. Ir a DNS Zone Editor.
2. Crear/modificar los registros que Render indique.
3. Eliminar registros `AAAA` si interfieren.
4. Volver a Render y hacer Verify.

Render gestiona HTTPS automaticamente para dominios verificados.

## Variables de entorno en Render

Minimas:

```txt
NODE_VERSION=20
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=https://TU-DOMINIO-O-URL-RENDER
DEFAULT_CURRENCY=USD
DEFAULT_TIMEZONE=America/Bogota
MARKETPLACE_DEMO_MODE=false
USE_REAL_SUPABASE_MARKETPLACE=true
ADMIN_ACCESS_TOKEN=
```

Pago y email:

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_USE_SANDBOX=true
DEMO_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_PROVIDER_KEY=
```

Citas legacy:

```txt
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
APPOINTMENT_NOTIFY_EMAILS=
```

## Flujo de trabajo conmigo

Cuando el repo este conectado:

1. Yo hago cambios localmente.
2. Ejecuto validaciones (`npm run typecheck`, `npm run build`, tests cuando aplique).
3. Hago commit.
4. Hago push a GitHub.
5. Render detecta el push y despliega automaticamente.

Lo que no puedo hacer sin tu autorizacion/cuentas:

- Crear tu repo GitHub si no tengo acceso.
- Conectar Render a GitHub.
- Configurar DNS dentro de Hostinger.
- Pegar secretos reales de Supabase, pagos o email.

## Primer montaje

1. Crear repo en GitHub: `lancelotmet-marketplace`.
2. Desde este proyecto:

```bash
git remote add origin https://github.com/TU-USUARIO/lancelotmet-marketplace.git
git push -u origin main
```

3. En Render:
   - New -> Blueprint o Web Service.
   - Conectar el repo.
   - Confirmar que detecta `render.yaml`.
   - Cargar variables secretas.

4. En Hostinger:
   - Apuntar dominio a Render con los registros que Render muestre.

## Validacion despues del deploy

Probar:

```txt
/
/marketplace
/admin/products?adminToken=TU_TOKEN
/checkout
/my-library
/api/events
```

Si hay 502 en Render, revisar Logs del servicio.

## Mercado Pago

La integracion usa Checkout Pro:

```txt
Cliente -> /api/checkout -> preferencia Mercado Pago -> pago en Mercado Pago -> /api/webhooks/payment?provider=mercado_pago
```

Variables en Render:

```txt
MERCADO_PAGO_PUBLIC_KEY=TEST-...
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_USE_SANDBOX=true
```

Para produccion, reemplazar las credenciales `TEST-...` por credenciales productivas y cambiar:

```txt
MERCADO_PAGO_USE_SANDBOX=false
```

Webhook en Mercado Pago:

```txt
https://TU-DOMINIO.com/api/webhooks/payment?provider=mercado_pago
```

Mientras no tengas dominio propio apuntado a Render, usar:

```txt
https://TU-SERVICIO.onrender.com/api/webhooks/payment?provider=mercado_pago
```

Para Colombia, configura los productos reales en Supabase con moneda `COP`.

## Costos

Render Free sirve para validar. Puede dormir, ser lento o tener limites. Para ventas reales, el primer upgrade razonable es una instancia Starter.
