# Despliegue en Hostinger

Este proyecto no es una pagina estatica. Usa Next.js con rutas API, Supabase, descargas privadas y checkout, asi que debe correr como aplicacion Node.js.

## Paquete listo

El paquete generado esta en:

```txt
deploy-hostinger/
```

Archivo comprimido recomendado para subir:

```txt
lancelotmet-hostinger.zip
```

## Requisitos en Hostinger

- Plan con soporte para Node.js.
- Node.js 20 o superior recomendado.
- Acceso para configurar variables de entorno.
- Dominio apuntando a la aplicacion Node, no solo a `public_html`.

Si tu plan de Hostinger solo permite subir archivos a `public_html`, esta app no va a funcionar completa ahi. Necesita Node.js para checkout, admin, webhooks y descargas protegidas.

## Comando de arranque

En Hostinger configura:

```bash
npm start
```

o directamente:

```bash
node server.js
```

El archivo principal es:

```txt
server.js
```

## Variables de entorno

Copia los valores desde `deploy-hostinger/.env.example` y configuralos en Hostinger.

Minimo para produccion real:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_URL=https://tudominio.com
DEFAULT_CURRENCY=USD
DEFAULT_TIMEZONE=America/Bogota
MARKETPLACE_DEMO_MODE=false
USE_REAL_SUPABASE_MARKETPLACE=true
ADMIN_ACCESS_TOKEN=
```

Para Stripe:

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Si aun no vas a cobrar real, deja demo temporal:

```txt
MARKETPLACE_DEMO_MODE=true
USE_REAL_SUPABASE_MARKETPLACE=false
```

## Supabase

1. Crea el proyecto en Supabase.
2. Ejecuta `deploy-hostinger/supabase/schema.sql` en SQL Editor.
3. Crea/verifica estos buckets:
   - `public-assets`
   - `product-previews`
   - `protected-products`
   - `user-uploads-future`
4. `protected-products` debe ser privado.
5. Sube los archivos premium solo al bucket privado.

## Flujo de subida

1. Sube `lancelotmet-hostinger.zip` a la carpeta de la app Node en Hostinger.
2. Descomprime el ZIP.
3. Configura las variables de entorno.
4. Configura el comando de arranque `node server.js`.
5. Reinicia la aplicacion.
6. Prueba estas rutas:
   - `/`
   - `/marketplace`
   - `/admin/products?adminToken=TU_TOKEN`
   - `/checkout`
   - `/my-library`

## Webhooks

Cuando el pago real este activo, la URL del webhook debe apuntar a:

```txt
https://tudominio.com/api/webhooks/payment
```

Sin webhook, el sistema no puede marcar automaticamente una orden como pagada ni liberar descargas.
