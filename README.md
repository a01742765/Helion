# HELION — Landing page para GitHub Pages

**Lema original solicitado:** “Inovacion solar al alcance de tus manos”.

Esta es una página de presentación **estática, responsiva y funcional**. El simulador fotovoltaico aún está en desarrollo; la landing explica la visión del proyecto, sin mostrar cálculos inventados ni botones sin destino.

## Archivos

```text
HELION_Landing_GitHub_Pages/
├── index.html              ← Página inicial que abre GitHub Pages
├── styles.css              ← Diseño y versiones móvil / escritorio
├── script.js               ← Menú móvil, indicadores y animaciones
├── .nojekyll               ← Evita procesamiento innecesario
└── assets/
    ├── logo-horizontal.svg ← Logo oficial A del kit de HELION
    ├── logo-principal.svg
    ├── isotipo.svg
    ├── solar-visual.svg     ← Ilustración original del encabezado
    ├── favicon.ico
    └── apple-touch-icon.png
```

## Publicarlo paso a paso

1. En [github.com](https://github.com/) crea un repositorio nuevo, por ejemplo **helion-solar**. Puede ser público.
2. Abre el repositorio, usa **Add file → Upload files** y sube el **contenido de esta carpeta**, no el ZIP como un único archivo. `index.html` debe quedar en la raíz y `assets/` debe conservar su estructura.
3. Confirma los cambios (**Commit changes**) en la rama `main`.
4. Ve a **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige rama **main**, carpeta **/(root)** y guarda (**Save**).
7. Cuando termine la publicación, la dirección normalmente será `https://TU-USUARIO.github.io/helion-solar/`. GitHub también mostrará la URL exacta en **Settings → Pages**.

No necesitas instalar Node, npm, ni ninguna librería. Las rutas de las imágenes son relativas, así que sirven tanto en un dominio propio como en una URL de proyecto de GitHub Pages.

## Editar texto y colores

- Textos: `index.html`
- Colores: al inicio de `styles.css` en las variables `--blue`, `--gold`, `--teal`, etc.
- Imágenes y logos: carpeta `assets/`
- Comportamiento del menú: `script.js`

Para ver una vista previa sin subir nada, abre `index.html` en Chrome, Edge o Firefox.

**Importante:** la frase quedó exactamente como la proporcionaste. Si deseas corregirla ortográficamente en el futuro, cámbiala por “Innovación solar al alcance de tus manos” en `index.html`.
