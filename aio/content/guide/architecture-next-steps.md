# Próximos Pasos: Herramientas y Técnicas

Una vez que comprendas los conceptos básicos de Angular, puedes aprender más sobre las funcionalidades y herramientas que pueden ayudarte a desarrollar y entregar aplicaciones Angular.

* Realiza el tutorial [Tour de Héroes](tutorial) para familiarizarte con los conceptos básicos necesarios para crear una aplicación bien diseñada.

* Consulta el [Glosario](guide/glossary) para comprender los términos específicos de Angular y su correspondiente utilización.

* Utiliza la documentación te permite conocer en detalle las funcionalidades claves, según tu etapa de desarrollo y tus áreas de interés.

## Arquitectura de la aplicación

* La guía de [Componentes y Plantillas](guide/displaying-data) explica como conectar los datos de la aplicación de sus [componentes](guide/glossary#componente) con las [plantillas](guide/glossary#plantilla) de las pantallas, para crear una aplicación completamente interactiva.

* La guía de [NgModules](guide/ngmodules) proporciona información detallada sobre la estructura de módulos utilizada en una aplicación Angular.

* La guía de [Enrutamiento y navigación](guide/router) describe como crear aplicaciones que permitan al usuario navegar entre las diferentes [vistas](guide/glossary#vista) dentro de su aplicación de una sola página (SPA).

* La guía de [Injección de dependencias](guide/dependency-injection) brinda información detallada sobre cómo construir una aplicación de modo que cada clase de componente pueda adquirir los servicios y objetos que necesita para realizar su función.

## Programación responsive

La guía de **Componentes y Plantillas** brinda orientación y detalles de la [sintaxis de plantilla](guide/template-syntax) que se utilizan para mostrar la información de sus componentes, cuando y donde lo desees dentro de una vista y para obtener entradas (inputs) de los usuarios a las que puedas responder.   

Las páginas y secciones adicionales describen algunas técnicas básicas de programación para aplicaciones Angular.

* [Lifecycle Hooks](guide/lifecycle-hooks): Aprovecha los momentos claves de la vida de un componente, desde su creación hasta su destrucción, implementando las interfaces de los `lifecycle hooks`.

* [Observables y procesamiento de eventos](guide/observables): Cómo utilizar observables con componentes y servicios para publicar y suscribirse a mensajes de cualquier tipo, tales como los eventos de interacción del usuario y los resultados de operaciones asincrónicas.

* [Elementos Angular](guide/elements): Cómo empaquetar componentes como *elementos personalizados* utilizando Web Components, un estándar web para definir nuevos elementos HTML de una manera agnóstica a cualquier framework.

* [Formularios](guide/forms-overview): Soporta escenarios complejos de entrada de datos con validación de entradas (inputs) basadas en HTML.

* [Animaciones](guide/animations): Utiliza la librería de animación de Angular para animar el comportamiento de los componentes sin necesidad de conocer en profundidad las técnicas de animación o CSS.

## Interacción Cliente-Servidor

Angular ofrece un framework para aplicaciones de una sola página (SPA), donde la mayoría de la lógica y los datos se encuentran en el cliente.
La mayoría de las aplicaciones todavía necesitan acceder a un servidor usando el `HttpClient` para acceder y guardar datos.
Para algunas plataformas y aplicaciones, se puede también querer utilizar el modelo PWA (Aplicaciones Web Progresivas) para mejorar la experiencia de usuario. 

* [HTTP](guide/http): Comunícate con un servidor para obtener datos, guardarlos e invocar acciones del lado del servidor con un cliente HTTP.

* [Renderizado del lado del servidor](guide/universal): Angular Universal genera páginas de aplicación estáticas en el servidor a través de la renderización del lado del servidor (SSR). Esto te permite ejecutar tu aplicación Angular en el servidor para mejorar el rendimiento y mostrar la primera página rápidamente en dispositivos móviles y de baja potencia, y también facilitar los rastreadores web.

* [Service workers y PWA](guide/service-worker-intro): Utiliza un service worker para reducir la dependencia de la red y mejorar significativamente la experiencia del usuario.

* [Web workers](guide/web-worker): Aprende a ejecutar cálculos con uso intensivo de la CPU en un hilo en segundo plano.

## Soporte del Ciclo de Desarrollo

La sección **Workflow de Desarrollo** detalla las herramientas y los procesos utilizados para compilar, probar y desplegar aplicaciones Angular.

* [CLI Referencia de Comando](cli): La CLI de Angular es una interfaz de línea de comandos utilizada para crear proyectos, generar código de aplicaciones y librerías y realizar un conjunto de tareas de desarrollo tales como pruebas, empaquetamiento y despliegue de aplicaciones.

* [Compilación](guide/aot-compiler): Angular proporciona compilación `just-in-time` (JIT) para el entorno de desarrollo y compilación `ahead-of-time` (AOT) para el entorno de producción.

* [Plataforma de pruebas](guide/testing): Ejecuta pruebas unitarias sobre las distintas partes de tu aplicación a medida que interactúan con el framework de Angular.

* [Despliegue](guide/deployment): Aprende técnicas para desplegar tu aplicación Angular en un servidor remoto.

* [Lineamientos de Seguridad](guide/security): Aprende sobre las protecciones integradas por Angular contra las vulnerabilidades y los ataques comunes a las aplicaciones web, como por ejemplo, ataques de cross-site scripting.

* [Internacionalización](guide/i18n): Haz que tu aplicación soporte múltiples lenguajes con las herramientas de internacionalización de Angular (i18n).

* [Accesibilidad](guide/accessibility): Haz que tu aplicación sea accesible a todos los usuarios.


## Estructura de Archivos, Configuración y Dependencias

* [Espacio de trabajo y estructura de archivos](guide/file-structure): Comprende la estructura del espacio de trabajo y las carpetas de proyectos en Angular.

* [Construcción y servicio](guide/build): Aprende a definir diferentes configuraciones de servidores proxy y construcción para tu proyecto, como por ejemplo desarrollo, staging y producción.

* [Paquetes npm](guide/npm-packages): El Framework de Angular, la CLI de Angular y los componentes usados por las aplicaciones Angular se empaquetan como paquetes [npm](https://docs.npmjs.com/) y se distribuyen a través del registro de `npm`. La CLI de Angular crea por defecto un archivo `package.json`, que especifica un conjunto inicial de paquetes que funcionan bien en conjunto y dan soporte a muchos escenarios de aplicaciones comunes.

* [Configuración de Typescript](guide/typescript-configuration): TypeScript es el lenguaje principal utilizado para el desarrollo de aplicaciones Angular.

* [Soporte de Navegadores](guide/browser-support): Haz que tus aplicaciones sean compatibles en una amplia gama de navegadores.

## Extendiendo Angular

* [Librerías Angular](guide/libraries): Aprende a usar y crear librerías reutilizables.

* [Esquemas](guide/schematics): Aprende como personalizar y extender las capacidades de generación de la CLI.

* [Constructores de la CLI](guide/cli-builder): Aprende a personalizar y extender la capacidad de la CLI de aplicar herramientas para realizar tareas complejas, como la construcción y pruebas de aplicaciones.
