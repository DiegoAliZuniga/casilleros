# Pagina de casilleros para GitHub Pages

Este sitio esta listo para subirlo a GitHub Pages. Incluye:

- `index.html`: mapa publico de casilleros.
- `admin.html`: panel administrativo para seleccionar reservas, asignar casillero, marcar pago y preparar contrato.
- `apps-script.gs`: codigo opcional para que el panel admin pueda escribir cambios en Google Sheets.

## Como publicarlo

1. Crea un repositorio en GitHub.
2. Sube estos archivos a la raiz del repositorio: `index.html`, `admin.html`, `styles.css`, `admin.css`, `app.js`, `admin.js`, `apps-script.gs` y `.nojekyll`.
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

## Escritura desde el admin

GitHub Pages no puede modificar Google Sheets directamente sin un endpoint de Google. Para activar el boton `Guardar en Sheet`:

1. Abre `Extensions > Apps Script` desde el Google Sheet.
2. Pega el contenido de `apps-script.gs`.
3. Cambia `ADMIN_TOKEN` por una palabra segura.
4. Publica con `Deploy > New deployment > Web app`.
5. Copia la URL del Web App.
6. En `admin.js`, pega esa URL en `APPS_SCRIPT_URL`.
7. En `admin.js`, pega el mismo token en `ADMIN_TOKEN`.

Cuando el estado sea `Pagado`, el panel actualiza la columna de casillero y pone `Pago` en `SI`. Cuando sea `Reservado`, deja `Pago` en `NO`. Cuando sea `Disponible`, libera el casillero.

Si cambia el formulario, edita `FORM_URL` en `app.js`. Si cambia la hoja, edita `SHEET_ID` y `SHEET_GID` en `app.js` y `admin.js`.
