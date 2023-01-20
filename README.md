<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
  <h1 align="center">Sky Scrapper API NestJS</h1>
  <p align="center">Es el API Rest y Scrapper para la WebApp/PWA
   <a href="https://github.com/SkyZeroZx/Sky-Scrapper-App" target="blank"> Sky Scrapper APP </a> para comparar precios de las principales tiendas ventas de mangas en Perú integrado con Web Authentication para el inicio de sesion passworless
  </p>

<small>
  Nota : Este es un proyecto con fines educativos sin fines de lucro
</small>

## :ledger: Index

- [Pre-Requisitos](#pre-requisitos-)
- [Instalación](#instalación-)
- [Environment](#Environment)
- [Build](#build)
- [Despligue](#despliegue-)
- [Logger](#logger)
- [Construido](#Construido-con-%EF%B8%8F)

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

## Pre-Requisitos 📋

_Software requerido_

```
NodeJS >= 16.X
NPM >= 8.X
NestJS >= 9.X
MongoDB >= 6.0
```

_Software opcional_

```
Visual Studio Code ( O el editor de su preferencia)
```

## Instalación 🔧

_Para ejecutar un entorno de desarrollo_

_Previamente ejecutar el comando en la terminal para descargar "node_modules" para el funcionamiento del proyecto_

```
 npm install
```

_Previamente a ejecutar el servidor en desarrollo configurar el archivo .env con las credenciales del servidor correos y base de datos , ejecutar :_

```
 npm run start:dev
```

_Dirigirse a la ruta http://localhost:3000/ donde tendra el Webhook levantado_

### Environment

_Se tiene el archivo `env.template` , el cual posee un ejemplo de cada valor de las valores de entorno para poder desplegarlas en nuestro propio ambiente local o cloud_

![Env](/docs/env/env.png)

### Build

_Para generar el build de producción del proyecto ejecutar el siguiente comando:_

```
 npm run build
```

## Despliegue 👨🏻‍💻

_Para desplegar el proyecto mediante Docker tiene el archivo `docker-compose.prod.yaml` y la carpeta `docker`_

_Las cuales contienen los `Dockerfile` y dependencias necesarias para levantar el proyecto_

_Se dockerizo sobre un servidor de proxy inverso nginx el cual se expone en el puerto **80** por default_

_Para construir la imagen y ejecutarla tenemos el siguiente comando , el cual tambien tomara nuestras variable de entorno del archivo `env`_

_Ejecutar el siguiente comando en la raiz del proyecto_

```
 docker compose  -f docker-compose.prod.yaml --env-file .env up -d --build
```

![Docker 1](/docs/docker/docker-1.png)

![Docker 2](/docs/docker/docker-2.png)

_En caso de requerir volver a ejecutar el contenedor del proyecto previamente creado ejecutar el mismo comando_

## Analisis de Codigo 🔩

_**Pre requisitos**_

_En la raiz del proyecto se tiene el archivo *sonar-project.properties* el cual tiene las propiedades necesarias para ejecutarlo sobre un SonarQube_

_Configurar los apartados : *sonar.host.url* , *sonar.login* *sonar.password* con los datos de su instancia correspondiente o usar SonarCloud con su token correspondiente_

```
Sonaqube >= 9.X
```

![SonarQube Properties](/docs/sonar/sonar-properties.png)

_Las pruebas fueron realizas sobre *SonarQube 9.8* para ejecutar el analisis de codigo ejecutar el comando para la instancia local:_

```
npm run sonar
```

_Reporte de SonarQube_

![SonarQube 1](/docs/sonar/sonar-qube-1.jpg)

## Logger

_Se integro winston para reemplazar el logger de NestJS para realizar seguimiento y conservacion de los logs segun sea requerido_

_En el archivo `.env` se tienen los siguientes apartados configurados por default:_

```
APP_NAME=SKY_SCRAPPER
DATE_PATTERN=YYYY-MM-DD
MAX_SIZE=20m
MAX_DAYS=14d
```

_Por default la carpeta donde se guardan los logs es `LOG` , el formato configurado es JSON_

![LOGGER 1](/docs/logger/logger-1.png)

![LOGGER 2](/docs/logger/logger-2.png)

## Construido con 🛠️

_Las herramientas utilizadas son:_

- [NestJS](https://nestjs.com/) - El framework para construir aplicaciones del lado del servidor eficientes, confiables y escalables.
- [NPM](https://www.npmjs.com/) - Manejador de dependencias
- [Docker](https://www.docker.com/) - Para el despliegue de aplicaciones basado en contenedores
- [Puppeteer](https://pptr.dev/) - Biblioteca de Node.js que proporciona una API de alto nivel para controlar Chrome/Chromium sobre el protocolo DevTools.
- [MongoDb](https://www.mongodb.com/) - Motor de base de datos No SQL
- [SonarQube](https://www.sonarqube.org/) - Evaluacion de codigo on premise
- [Visual Studio Code](https://code.visualstudio.com/) - Editor de Codigo
- [Prettier](https://prettier.io/) - Formateador de Codigo
- [TabNine](https://www.tabnine.com/) - Autocompletador de Codigo
- [Winston](https://github.com/winstonjs/winston) - Logger para NodeJS
- [PageSpeed](https://pagespeed.web.dev/) - Plataforma para ayuda de WebSite Performance
## Versionado 📌

Usamos [GIT](https://git-scm.com/) para el versionado.

## Autor ✒️

- **Jaime Burgos Tejada** - _Developer_
- [SkyZeroZx](https://github.com/SkyZeroZx)
- email : jaimeburgostejada@gmail.com
