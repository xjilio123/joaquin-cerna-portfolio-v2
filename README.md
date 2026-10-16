# Joaquín Cerna Rojas — Portfolio (v2)

Portfolio personal bilingüe (ES/EN) de Data Analytics y Business Intelligence.
Rediseño completo del [portfolio anterior](https://github.com/xjilio123/joaquin-cerna-portfolio).

**Concepto:** «datos dispersos → decisiones claras». El sitio ordena puntos
dispersos hasta formar un gráfico mientras se hace scroll.

## Stack

- Next.js 16 (App Router, Cache Components) · React 19 · TypeScript
- Tailwind CSS v4 con tokens de color registrados con `@property`
- Fuentes: Bricolage Grotesque (títulos), Geist (texto), Geist Mono (datos)
- Despliegue: GitHub → Vercel (vista previa por rama, producción en `main`)

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run lint
npm run typecheck
npm run check:contrast   # WCAG AA en los 10 temas (2 modos × 5 colores)
npm run verify           # los tres anteriores
```

## Dónde está cada cosa

```
app/[lang]/       layout y página por idioma (/es, /en)
app/global-not-found.tsx   404 para URLs que no existen
components/
  layout/         encabezado y pie
  sections/       una sección de la página por archivo
  theme/          controles de modo, color e idioma
content/          TODO el contenido, tipado y bilingüe
lib/              idiomas, preferencias y URL del sitio
public/           certificados, CV y fotos
```

Regla: ningún texto visible se escribe en el JSX. El contenido vive en `content/`
y los textos de la interfaz en `lib/i18n.ts`. Cada entrada es `{ es, en }`, así que
olvidar una traducción es un error de TypeScript.

## Temas

Dos ejes independientes en `<html>`:

| Eje | Atributo | Valores |
| --- | --- | --- |
| Modo | `data-theme` | `dark`, `light` (sin elección: sigue al sistema) |
| Color | `data-accent` | `cobalt`, `violet`, `crimson`, `emerald`, `graphite` |

- Un script en `<head>` aplica la preferencia guardada antes del primer pintado (sin parpadeo).
- El cambio de modo se revela con un círculo que crece desde el botón y el de color con un
  fundido; ambos con View Transitions, que anima capturas en la GPU. Los tokens nunca se
  animan: animarlos recalcularía los estilos de toda la página en cada cuadro.
- Con «reducir movimiento» activado en el sistema, los cambios son instantáneos.

## Movimiento

`components/motion/MotionLayer.tsx` carga GSAP y Lenis después del primer pintado: scroll
suave (solo con mouse), bio que se ilumina, experiencia horizontal fijada (lg+), contadores
e inclinación 3D. Marca `<html data-motion>`; la variante `fx:` de Tailwind aplica estilos
solo entonces. Sin JavaScript o con «reducir movimiento», la página estática queda completa.

## Calidad (fase 5)

- Lighthouse local: escritorio 99 / 100 / 100 / 100, móvil 94 / 100 / 100 / 100
  (rendimiento / accesibilidad / buenas prácticas / SEO).
- Contraste AA verificado en los 10 temas con `npm run check:contrast`.
- SEO: `sitemap.xml`, `robots.txt`, `hreflang` es/en, JSON-LD `Person` e imagen Open Graph
  generada por idioma (`app/[lang]/opengraph-image.tsx`, fuentes en `assets/og/`, OFL).

## Privacidad

El CV publicado en `public/cv/` no contiene el DNI. Si se reemplaza el CV, hay que
verificar que la versión nueva tampoco lo tenga antes de subirla.

## Plan

1. **Base** — repo, Next.js 16, colores, idiomas y modo claro/oscuro ✅
2. **Hero y menú** — partículas, preloader, navegación y Ctrl + K ✅
3. **Secciones** — las 8 secciones con contenido real, certificados y CV ✅
4. **Movimiento** — scroll, efectos al pasar el mouse y transiciones ✅
5. **Lanzamiento** — rendimiento, accesibilidad, SEO y revisión final ✅
