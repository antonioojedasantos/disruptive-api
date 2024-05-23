## Manual de la API Disruptive

## Introducción

Bienvenido al manual de la API Disruptive. En esta guía, encontrará información detallada sobre cómo configurar, ejecutar y utilizar la API Disruptive, que es una parte fundamental de la plataforma Disruptive.

## Configuración

Antes de ejecutar la API, asegúrese de haber configurado correctamente el entorno. Copie el archivo `.env.example` y renómbrelo como `.env`. En este archivo, proporcione las siguientes credenciales y configuraciones necesarias:

- **CONFIG**: 
  - `PORT`: Puerto en el que se ejecutará la API.
  - `CORS`: Configuración para permitir el acceso a la API desde diferentes orígenes.

- **MONGO**: 
  - `DB_USER`: Nombre de usuario de MongoDB.
  - `DB_PASSWORD`: Contraseña de MongoDB.
  - `DB_HOST`: Dirección de host de MongoDB.
  - `DB_NAME`: Nombre de la base de datos en MongoDB.

- **AUTH**: 
  - `AUTH_JWT_SECRET`: Clave secreta para generar tokens JWT.

- `PRODUCTION`: Configuración para especificar si la API se ejecuta en un entorno de producción.

Asegúrese de reemplazar los valores de ejemplo con las credenciales y configuraciones específicas de su entorno.

## Ejecución

Para ejecutar la API, primero instale todas las dependencias utilizando el siguiente comando en la terminal:

npm install

Una vez que se hayan instalado todas las dependencias, puede ejecutar la API en modo de desarrollo con el siguiente comando en la terminal:

npm run dev


O en modo de producción con:

npm run start


## Creación de Usuarios

Para crear un usuario administrador, puede utilizar el siguiente endpoint:

- **Método**: `POST`
- **URL**: `http://127.0.0.1:3000/api/auth/security/admin/sign-up`
- **Cuerpo de la solicitud**:

```json
{
    "user_name": "Admin",
    "email": "admin@admin.com"
}


Tenga en cuenta que esto creará un usuario administrador con las credenciales proporcionadas en el cuerpo de la solicitud.

Ejecución del Seeder
Para insertar datos iniciales en la base de datos, ejecute los siguientes comandos:

Para Windows:

set DEBUG=app:* node scripts/mongo/seedApiKeys.js

Para otros sistemas operativos:

DEBUG=app:* node scripts/mongo/seedApiKeys.js


Estos comandos insertarán los datos iniciales necesarios en la base de datos para la aplicación Disruptive.

¡Con esto, la API Disruptive está lista para su uso! Si tiene alguna pregunta o necesita ayuda adicional, consulte la documentación o comuníquese con el equipo de soporte técnico.