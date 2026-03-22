# SPACED - Tech Stack MVP

## Frontend
- **Web:** Next.js 15 (App Router) + TypeScript
- **Mobile:** React Native + Expo (iOS + Android)
- **Estilos:** NativeWind (Tailwind compartido web/mobile)
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod

## Backend
- **Core:** Supabase (Auth + Postgres + Realtime + Storage)
- **API:** tRPC sobre Next.js API Routes
- **Serverless:** Supabase Edge Functions (webhooks, logica critica)

## Pagos
- **Stripe Connect** (marketplace: split host / plataforma)

## Mapas y Geolocalizacion
- **Mapbox** (control de diseno, UX discreta)
- Alternativa: Google Maps (mejor cobertura LATAM)

## Notificaciones
- **Push:** OneSignal (mobile)
- **SMS:** Twilio (codigos de acceso, extensiones de sesion)
- **Email:** Resend (transaccionales)

## Infraestructura
- **Web/API deploy:** Vercel
- **DB/Storage:** Supabase Cloud
- **Mobile build + OTA:** Expo EAS

## Dev Tools
- **Lenguaje:** TypeScript (end-to-end)
- **Monorepo:** Turborepo
- **ORM:** Prisma o Drizzle (sobre Supabase Postgres)
- **Linting:** ESLint + Prettier
- **Testing:** Vitest (unit) + Playwright (e2e web)
