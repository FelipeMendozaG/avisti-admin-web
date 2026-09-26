# Avisti Admin

Aplicacion web administrativa de Avistidata Chepita. Permite iniciar sesion y trabajar con los catalogos y procesos de datos desde una interfaz centralizada.

## Funcionalidades

- Acceso con autenticacion y rutas protegidas.
- Consulta y administracion de productos.
- Consulta y administracion de equipos.
- Importacion de datos.
- Consulta de cargas y sus registros (logs).

## Tecnologias

- React 19 y React Router.
- Vite para desarrollo y compilacion.
- Axios para comunicacion con la API.
- Tailwind CSS para estilos.
- Lucide React para iconos.

## Requisitos

- Node.js compatible con la version de Vite del proyecto.
- npm.
- Acceso a la API de Avistidata.

## Desarrollo local

Instala las dependencias y arranca el servidor de desarrollo:

```bash
npm install
npm run dev
```

Vite mostrara en la terminal la URL local. Para generar y revisar una compilacion de produccion:

```bash
npm run build
npm run preview
```

Para ejecutar ESLint:

```bash
npm run lint
```

## Configuracion de la API

La URL base de la API se configura mediante `VITE_API_BASE_URL`. Si no se define, la aplicacion usa `http://localhost:8000`.

En desarrollo, puede definirse en un archivo `.env.local` en la raiz del proyecto:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Vite incorpora esta variable durante la compilacion; para produccion debe establecerse con la URL correspondiente antes de ejecutar `npm run build`.

## Rutas principales

- `/login`: inicio de sesion.
- `/products`: productos.
- `/equipments`: equipos.
- `/import`: importacion de datos.
- `/data-loads`: cargas y logs.

Las rutas de administracion requieren autenticacion. La sesion usa un token Bearer almacenado en el navegador.

## Despliegue

El repositorio incluye un `Dockerfile` que compila la aplicacion y la sirve con Nginx. Se puede pasar la URL de la API como argumento de compilacion:

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.ejemplo.com -t avisti-admin .
docker run --rm -p 8080:80 avisti-admin
```

Tambien hay una configuracion `app.yaml` para despliegue en Google App Engine. Genera primero la carpeta `dist` con `npm run build` y despliega desde la raiz del proyecto usando la herramienta de Google Cloud configurada para el entorno.