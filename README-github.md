# Cómo publicar el sitio gratis (sin dominio) y activar la sincronización

Esta guía es para dejar el sitio funcionando en una dirección provisoria gratuita
(algo como `tu-usuario.github.io/alma-baires`), y que el calendario de disponibilidad
se actualice solo, cada 1 hora, leyendo Airbnb y Booking.

No hace falta saber programar. Son todo clics en páginas web. Cualquier paso que no
te salga, decímelo y lo vemos juntos.

---

## Parte 1 — Crear la cuenta de GitHub (gratis)

1. Andá a [github.com](https://github.com) y hacé clic en "Sign up".
2. Poné tu email, una contraseña, y un nombre de usuario (por ejemplo `almabaires` o
   `gracielarentals`, el que quieras — va a formar parte de la dirección del sitio).
3. Confirmá tu email cuando te llegue el correo de GitHub.

Contame cuando lo tengas listo (o si ya tenías una cuenta de antes, decime el nombre
de usuario) y seguimos con el siguiente paso juntos.

## Parte 2 — Crear el repositorio y subir el sitio

1. Ya en GitHub, hacé clic en el botón verde "New" (o el "+" arriba a la derecha →
   "New repository").
2. Nombre del repositorio: `alma-baires` (o el que prefieras).
3. Dejalo en "Public" (público) — así puede funcionar gratis con GitHub Pages.
4. Hacé clic en "Create repository".
5. En la página del repositorio recién creado, buscá el link "uploading an existing
   file" (o el botón "Add file" → "Upload files").
6. Arrastrá ahí TODOS los archivos y carpetas que están dentro de la carpeta
   `sitio_graciela` que te mandé (incluida la carpeta `images`, y la carpeta oculta
   `.github` con el archivo `sync.yml` adentro — si tu computadora no te la muestra
   por ser "oculta", avisame y vemos cómo mostrarla).
7. Abajo de todo, hacé clic en "Commit changes".

## Parte 3 — Activar GitHub Pages (para que el sitio se vea online)

1. Dentro del repositorio, andá a "Settings" (arriba).
2. En el menú de la izquierda, buscá "Pages".
3. Donde dice "Branch", elegí `main` y la carpeta `/ (root)`, y guardá.
4. Esperá un minuto y refrescá — GitHub te va a mostrar la dirección donde quedó
   publicado el sitio (algo como `https://tu-usuario.github.io/alma-baires/`).

Esa es la dirección que le podés mandar a Aldana.

## Parte 4 — Habilitar que la sincronización pueda guardar cambios

1. Todavía en "Settings", andá a "Actions" → "General" (menú de la izquierda).
2. Bajá hasta "Workflow permissions".
3. Elegí la opción "Read and write permissions".
4. Guardá los cambios.

Sin este paso, el robot que actualiza `disponibilidad.json` no va a poder guardar
los cambios cada hora.

## Parte 5 — Cargar los links de calendario de Airbnb y Booking

Necesito, para cada uno de los 9 departamentos, el link de "exportar calendario"
(.ics) de Airbnb y de Booking (si un depto todavía no está en alguna de las dos
plataformas, no pasa nada, dejamos ese campo vacío).

**En Airbnb** (desde la app o la web, panel de anfitrión de cada departamento):
Calendario → ⚙️ (ícono de configuración, arriba a la derecha) → "Sincronización de
calendarios" → "Exportar calendario" → copiás el link que te da (empieza con
`https://www.airbnb.com/calendar/ical/...`).

**En Booking.com** (desde el Extranet, panel de cada propiedad):
Tarifas y disponibilidad → Sincronización de calendarios → "Exportar calendario" →
copiás el link (empieza con `https://admin.booking.com/hotel/hoteladmin/ical...`).

Una vez que tengas esos links, mandámelos (podés pegarlos acá en el chat, aclarando
a qué departamento corresponde cada uno) y yo los cargo en el archivo
`ical_urls.json` del repositorio por vos.

---

## ¿Qué pasa mientras tanto?

Hasta que no se carguen los links reales, el calendario del sitio va a mostrar
fechas de EJEMPLO (se ve un cartel que lo aclara). En cuanto se carguen los links
y pase la primera sincronización (hasta 1 hora), el cartel desaparece solo y
empieza a mostrar disponibilidad real.
