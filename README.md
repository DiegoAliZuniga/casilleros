# Pagina de casilleros para GitHub Pages

Este sitio esta listo para subirlo a GitHub Pages. Muestra el plano real del Excel `Casilleros.xlsx`, colorea los casilleros segun la hoja de respuestas y muestra el formulario de reserva.

## Como publicarlo

1. Crea un repositorio en GitHub.
2. Sube estos archivos a la raiz del repositorio: `index.html`, `styles.css`, `app.js` y `.nojekyll`.
3. En GitHub, entra a `Settings > Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Escoge la rama `main` y la carpeta `/root`, luego guarda.

## Formulario de reserva

El sitio ya apunta a este formulario:

`https://forms.gle/t8n4u23AVMQQapDR9`

El formulario aparece debajo del mapa y tambien queda disponible como boton `Reservar casillero`.

## Hoja de Google

El sitio sigue usando esta hoja para marcar `Disponible`, `Reservado` y `Pagado`:

`https://docs.google.com/spreadsheets/d/1sEH73Eyg8cRJe2as8wF0_YZA-TAYJbW2qq186MNIkhk/edit?usp=sharing`

Para que GitHub Pages pueda leerla, la hoja debe estar disponible para lectura publica. Usa una de estas opciones:

- `Compartir > Acceso general > Cualquier persona con el enlace > Lector`
- Si eso no carga en la pagina, usa `Archivo > Compartir > Publicar en la web`

Cada fila del formulario cuenta como reservado. Si la columna `Pago` tiene `SI`, el casillero aparece como pagado.

Si cambia el formulario, edita `FORM_URL` en `app.js`. Si cambia la hoja, edita `SHEET_ID` y `SHEET_GID` en `app.js`.
