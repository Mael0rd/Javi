# Javi Surf Lessons: guía del proyecto

Sitio de una sola página para una escuela de surf en Jacó, Costa Rica (javisurflessons.com).
HTML/CSS/JS estático, sin build. Se publica en Vercel desde `main` del repo `Mael0rd/Javi`.
Archivos: `index.html`, `assets/css/site.css`, `assets/js/site.js`, imágenes en `assets/img/`.

## Cómo verlo

Servidor local configurado como `javi` en `D:\Proyectos\.claude\launch.json`
(`npx serve` en el puerto 5173). Abrir http://localhost:5173 en el panel del navegador.

## Reglas que no se rompen

- **No romper ningún enlace.** Reservas: `https://javisurflessons.getomnify.com/#!/home`,
  WhatsApp `https://wa.me/50687782146`, `tel:+50687782146`, `mailto:javisurflessons@gmail.com`,
  mapa de Calle Morales, y las anclas `#top #lesson #jaco #season #prices #photos #contact`.
  Antes de terminar un cambio, comparar la lista de `href` con la anterior.
- Mantener Google Analytics, AdSense, los meta tags y el JSON-LD (escuela, precios, FAQ).
- El sitio va **solo en inglés**. Precios: Shared $49, Big group $45, Private $60 (2 h, tabla incluida).
- No inventar reseñas, alumnos ni datos. Todo dato visible sale del texto que ya tiene la página.
- Antes de descargar una foto: decir archivo, fuente, licencia y peso, y esperar el sí del usuario.
- No hacer `push` ni publicar nada si el usuario no lo pide.

## Cómo trabaja el usuario

- Habla en español y quiere las respuestas en español.
- Él guía el diseño paso a paso. Ante un cambio grande, preguntar primero con opciones concretas
  (AskUserQuestion) y luego mostrar el resultado con capturas en computadora y celular.
- Quiere cambios **visibles**. Un pulido sutil le pareció "no veo ninguna mejora".
- Lo que **no** le gustó y se descartó:
  1. Pulido sutil del diseño original (no se notaba).
  2. Rediseño radical estilo "cyclorama" (bandas negro → cobalto → rosa, letras stencil): lo rechazó y se revirtió entero.
  3. Atardecer dibujado en SVG estilo caricatura: pidió algo más realista, así que se cambió por una foto real.
- Le gusta: atardecer, arena, sol, mar, diversión; colores sacados de la foto; transiciones suaves entre secciones.

## Estado actual del diseño (rama `rediseno-atardecer`)

- **Paleta** (sacada de la foto de portada): tinta `#2A1810` (arena oscura), ámbar `#723B1C`,
  óxido `#B4441E`/`#A54120`, naranja `#D8612B`/`#EF8A2C`, dorado del sol `#F7C548` (botones y la palabra "Jacó"),
  turquesa `#34C6B4` como acento (barras de progreso, líneas, iconos activos). Fondo claro: blanco.
  Tipos: Anybody (títulos) y Karla (texto).
- **Menú**: columna fija a la **derecha** en todas las pantallas (`.rail`). Arriba, una tabla de surf dorada con
  "Javi Surf" en vertical. Debajo, 6 iconos dibujados: Lesson, Jacó, When, Prices, Photos, Contact. Al final, "Jacó, CR".
  En celular la columna es delgada, con etiquetas de 11 px. El body tiene `padding-right: var(--rail)`.
- **Barra superior**: solo el botón "Book a lesson" y una ola fina con un **surfista dorado chiquito**
  que sigue el mouse (en celular o con el mouse quieto va y viene solo).
- **Portada** (ideas tomadas de un shot de Dribbble, "GoSurf"): foto enmarcada sobre una copia desenfocada,
  4 diapositivas que pasan cada 7 s con pestañas numeradas (barra turquesa que se llena), flechas ← →,
  y una "ficha" de datos abajo a la derecha que cambia con cada foto. Se pausa con el mouse encima o el foco.
  Fotos: `hero-sunset.jpg` (reflejada con `scaleX(-1)` para que el sol no quede detrás del título),
  `hero-bg.jpg` (clase en la arena), `portfolio-7.jpg` y `portfolio-5.jpg` (800 px, se ven algo suaves).
- **The lesson / Why Jacó**: fondo de océano al atardecer (cafés de la foto, resplandor dorado, líneas de agua sutiles).
- **When to come**: degradado ámbar; meses secos dorados y lluviosos ámbar.
- **Precios**: sobre blanco, montos en naranja quemado.
- **Fotos**: carrusel que flota sobre olas animadas (3 capas). Pasa solo, se detiene con el mouse, se arrastra,
  y al hacer clic abre el visor. Las copias del carrusel abren el visor por delegación.
- **Preguntas**: blanco. **Talk to Javi**: naranja. **Pie**: arena real recortada en forma de duna.
- **Uniones entre secciones**: todas difuminadas. Cada sección empieza con el color en que termina la anterior,
  y el cambio ocurre en su espacio superior (`--pad-y`), nunca detrás del texto.
- **Movimiento reducido**: sin autoplay ni animaciones; el carrusel se recorre a mano.

## Fotos descargadas (Licencia Unsplash, uso libre)

- `assets/img/hero-sunset.jpg`: bennoptic, Nosara, Guanacaste (unsplash.com/es/fotos/6ayqOjbqIiw).
- `assets/img/sand.jpg`: Julfo, arena con ondas (unsplash.com/es/fotos/H3Ko-mHRR70).

## Pendientes e ideas que quedaron

- El botón "Choose a date" de precios y el título "Talk to Javi" quedan un poco más a la izquierda que el resto
  (viene del diseño original: `section > *` centra con margin y no funciona con elementos inline).
- La foto `tabs-1.jpg` de "The lesson" parece una playa europea con edificios; se podría cambiar.
- Las fotos de 800 px de la portada se ven suaves en grande.

## Notas técnicas

- `index.html` usa finales de línea CRLF: los scripts que busquen texto con `\n` fallan. Usar Edit, o separar por `\r\n`.
- No repetir `id` (ya pasó: `id="sea"` chocaba con un gradiente SVG y rompió el carrusel).
- El detector de diseño Impeccable marca falsas alarmas conocidas: contraste del menú sobre la foto, degradados
  medidos en su color extremo, visor `img src=""`, padding de secciones a sangre, borde del botón tabla.
  El usuario pidió **no** crear archivos de configuración en `.impeccable/`. Solo existe `hook.cache.json`, que está ignorado.
