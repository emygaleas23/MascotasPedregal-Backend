# Backend - Sistema Web para la Gestión y Oferta de Servicios para Mascotas en el conjunto habitacional “El Pedregal”

Este repositorio contiene el componente backend desarrollado para el sistema web de gestión y oferta de servicios para mascotas en el conjunto habitacional “El Pedregal”. El backend permite administrar usuarios, mascotas, compromisos sanitarios, anuncios, postulaciones, servicios y reseñas, considerando los roles definidos dentro del sistema.

## Descripción del proyecto

El sistema fue desarrollado como parte del Trabajo de Integración Curricular, con el objetivo de brindar una solución backend que permita centralizar y organizar la información relacionada con las mascotas del conjunto habitacional, así como facilitar la oferta y solicitud de servicios de cuidado de mascotas entre residentes.

El backend expone una API REST que permite la comunicación con el frontend del sistema, gestionando la autenticación de usuarios, control de acceso por roles, operaciones CRUD, envío de correos electrónicos y validaciones de negocio.

## Tecnologías utilizadas

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JSON Web Token
* Bcrypt.js
* Nodemailer
* Cloudinary
* Express FileUpload
* Node-cron
* CORS
* Dotenv
* Postman
* JMeter
* Vercel

## Instalación del proyecto

Para ejecutar el proyecto de manera local, se deben seguir los siguientes pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/emygaleas23/MascotasPedregal-Backend.git
```

### 2. Ingresar al directorio del proyecto

```bash
cd MascotasPedregal-Backend
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto y configurar las variables necesarias para la conexión a la base de datos, autenticación, envío de correos electrónicos, almacenamiento de imágenes y servicios externos.

El archivo `.env` debe tener la siguiente estructura:

```env
# Base de datos
MONGODB_URI_ATLAS=URL_DE_CONEXION_MONGODB_ATLAS

# Autenticación
JWT_SECRET=CLAVE_SECRETA_JWT

# URL del frontend
URL_FRONTEND=URL_DEL_FRONTEND_DESPLEGADO

# Configuración de correo electrónico
HOST_MAILTRAP=smtp.gmail.com
PORT_MAILTRAP=465
USER_MAILTRAP=CORREO_EMISOR
PASS_MAILTRAP=CONTRASEÑA_O_CLAVE_DE_APLICACION

# Cloudinary
CLOUDINARY_CLOUD_NAME=NOMBRE_DEL_CLOUD
CLOUDINARY_API_KEY=API_KEY_CLOUDINARY
CLOUDINARY_API_SECRET=API_SECRET_CLOUDINARY

# Datos iniciales para seeds
ADMIN_EMAIL=CORREO_ADMINISTRADOR
ADMIN_PASSWORD=CONTRASEÑA_ADMINISTRADOR
ADMIN_NOMBRE=NOMBRE_ADMINISTRADOR
ADMIN_APELLIDO=APELLIDO_ADMINISTRADOR
ADMIN_TELEFONO=TELEFONO_ADMINISTRADOR

DUENO_EMAIL=CORREO_DUENO
DUENO_PASSWORD=CONTRASEÑA_DUENO
DUENO_NOMBRE=NOMBRE_DUENO
DUENO_APELLIDO=APELLIDO_DUENO
DUENO_TELEFONO=TELEFONO_DUENO

CUIDADOR_EMAIL=CORREO_CUIDADOR
CUIDADOR_PASSWORD=CONTRASEÑA_CUIDADOR
CUIDADOR_NOMBRE=NOMBRE_CUIDADOR
CUIDADOR_APELLIDO=APELLIDO_CUIDADOR
CUIDADOR_TELEFONO=TELEFONO_CUIDADOR
```

### 5. Ejecutar el servidor en modo desarrollo

```bash
npm run dev
```

## Autenticación y seguridad

El backend utiliza JSON Web Token para proteger las rutas privadas del sistema. Cada usuario autenticado recibe un token que debe enviarse en las peticiones protegidas mediante el encabezado de autorización.

```http
Authorization: Bearer token
```

Además, el sistema valida los permisos de acceso según el rol del usuario autenticado, evitando que usuarios sin autorización accedan a funcionalidades que no les corresponden.

Las contraseñas son cifradas mediante Bcrypt.js antes de almacenarse en la base de datos.

## Despliegue

El backend fue desplegado en Vercel, permitiendo que la API REST se encuentre disponible en línea para su consumo desde el frontend del sistema.

URL del backend:

```text
https://mascotas-pedregal-backend.vercel.app
```

## Documentación y manuales

La documentación de los endpoints fue realizada en Postman, donde se detalla el funcionamiento de las rutas del backend, incluyendo método HTTP, URL, autenticación requerida, parámetros, cuerpo de la petición y ejemplos de respuesta.

Además, se elaboró un video correspondiente al manual de usuario del backend, en el cual se explica la organización de la colección de Postman y el uso general de los endpoints según los roles del sistema.

* **Documentación de Postman:** https://documenter.getpostman.com/view/49837926/2sBXqJK1Hw#intro
* **Manual de usuario:** https://www.youtube.com/watch?v=xp-tUAbcu-g

## Autora

- **Nombre:** Emily Alejandra Galeas Tingo
- **Carrera:** Tecnología Superior en Desarrollo de Software
- **Institución:** Escuela Politécnica Nacional
