# Hoja de ruta Angular

Angular recibe una gran cantidad de solicitudes de fucionalidades, tanto desde dentro de Google como desde la comunidad de código abierto en general. Al mismo tiempo, nuestra lista de proyectos contiene muchas tareas de mantenimiento, refactorizaciones de código, posibles mejoras de rendimiento, etc. Reunimos a representantes de relaciones con desarrolladores, gestión de productos e ingeniería para priorizar esta lista. A medida que nuevos proyectos entran en la cola, los posicionamos regularmente en función de la prioridad relativa a otros proyectos. A medida que se realiza el trabajo, los proyectos avanzarán en la cola.

Los proyectos a continuación no están asociados con una versión de Angular en particular. Los publicaremos una vez finalizados, y serán parte de una versión específica basada en nuestro calendario de lanzamientos, siguiendo el control de versiones semántico. Por ejemplo, las funciones se publican en el siguiente menor después de que se completan, o el siguiente mayor si incluyen cambios importantes.

## En progreso

### Operación Bye Bye Backlog (también conocida como Operación Byelog)

Estamos invirtiendo activamente hasta el 50% de nuestra capacidad de ingeniería para clasificación de _issues_ y PRs hasta que tengamos una comprensión clara de las necesidades de la comunidad en general. Después de eso, comprometeremos hasta el 20% de nuestra capacidad de ingeniería para mantenernos al día con los nuevos envíos de _issues_ y PRs rápidamente.

### Soporte a TypeScript 4.0

Estamos trabajando para agregar soporte para TypeScript 4.0 antes de su versión estable. Siempre queremos que Angular se mantenga actualizado con la última versión de TypeScript para que los desarrolladores obtengan lo mejor que el lenguaje tiene para ofrecer.

### Actualizar nuestra estrategia de pruebas e2e

Para garantizar que proporcionamos una estrategia de prueba de e2e preparada para el futuro, queremos evaluar el estado de Protractor, las innovaciones de la comunidad, las mejores prácticas de e2e y explorar nuevas oportunidades.

### Las librerías de Angular usan Ivy

Estamos invirtiendo en el diseño y desarrollo del plan de distribución de la librería Ivy, que incluirá una actualización del formato del paquete de la librería para usar la compilación de Ivy, desbloquear la obsolescencia del formato de la librería View Engine y [ngcc](guide/glossary#ngcc).

### Evaluar los cambios futuros de RxJS (v7 y posteriores)

Queremos asegurarnos de que los desarrolladores Angular aprovechen las últimas capacidades de RxJS y tengan una transición sin problemas a las próximas versiones principales del framework. Para este propósito, exploraremos y documentaremos el alcance de los cambios en la versión 7 y posteriores de RxJS y planificaremos una estrategia de actualización.

### El servicio de lenguaje Angular usa Ivy

Hoy en día, el servicio de lenguaje todavía utiliza el compilador de View Engine y la verificación de tipos, incluso para aplicaciones Ivy. Queremos utilizar el analizador de plantillas Ivy y la verificación de tipos mejorada para que el servicio Angular Language coincida con el comportamiento de la aplicación. Esta migración también será un paso hacia el desbloqueo de la eliminación de View Engine, que simplificará Angular, reducirá el tamaño del paquete npm y mejorará la capacidad de mantenimiento del marco.

### Ampliar las buenas prácticas en componentes harnesses

Angular CDK introdujo el concepto de [component test harnesses](https://material.angular.io/cdk/test-harnesses) en Angular en la versión 9. Los harnesses de prueba permiten a los autores de componentes crear API compatibles para probar interacciones de componentes. Continuamos mejorando esta infraestructura de harness  y aclarando las mejores prácticas en torno al uso de harnesses. También estamos trabajando para impulsar una mayor adopción de harness dentro de Google.

### Soporte nativo de [Trusted Types](https://web.dev/trusted-types/) en Angular

En colaboración con el equipo de seguridad de Google, estamos agregando soporte para la nueva API Trusted Types. Esta API de plataforma web ayudará a los desarrolladores a crear aplicaciones web más seguras.

### Integrar [MDC Web](https://material.io/develop/web/) en Angular Material

MDC Web es una librería creada por el equipo de Material Design de Google que proporciona primitivas reutilizables para construir componentes de Material Design. El equipo de Angular está incorporando estas primitivas en Angular Material. El uso de MDC Web alineará Angular Material más estrechamente con la especificación de Material Design, expandirá la accesibilidad, mejorará en general la calidad de los componentes y mejorará la velocidad de nuestro equipo.

### Ofrecer a los ingenieros de Google una mejor integración con Angular y la pila de servidores internos de Google

Este es un proyecto interno para agregar soporte para interfaces Angular a la pila de servidores integrados internos de Google.

### Control de versiones y ramificación Angular

Queremos consolidar las herramientas de administración de versiones entre los múltiples repositorios de GitHub de Angular ([angular/angular](https://github.com/angular/angular), [angular/angular-cli](https://github.com/angular/angular-cli), y [angular/components](https://github.com/angular/components)). Este esfuerzo nos permitirá reutilizar la infraestructura, unificar y simplificar procesos y mejorar la confiabilidad de nuestro proceso de lanzamiento.

## Futuro

### Actualizar la documentación introductoria

Redefiniremos las rutas de aprendizaje del usuario y actualizaremos la documentación introductoria. Expresaremos claramente los beneficios de Angular, cómo explorar sus capacidades y brindaremos orientación para que los desarrolladores puedan dominar el framework en el menor tiempo posible.

### Tipos de datos estrictos para `@angular/forms`

Trabajaremos en la implementación de una verificación de tipo más estricta para los formularios reactivos. De esta manera, permitiremos a los desarrolladores detectar más problemas durante el tiempo de desarrollo, habilitar un mejor editor de texto y soporte IDE, y mejorar la verificación de tipos para formularios reactivos.

### webpack 5 en Angular CLI

Webpack 5 trae muchas mejoras en la velocidad de compilación y el tamaño del paquete. Para que estén disponibles para los desarrolladores de Angular, invertiremos en migrar la CLI de Angular del uso de API de paquetes web obsoletos y eliminados.

### Estandarización del mensaje del commit

Queremos unificar los requisitos y la conformidad de los commit messages en los repositorios Angular ([angular/angular](https://github.com/angular/angular), [angular/components](https://github.com/angular/components), [angular/angular-cli](https://github.com/angular/angular-cli)) ara brindar coherencia a nuestro proceso de desarrollo y reutilizar las herramientas de infraestructura.

### Zone.js opcional

Vamos a diseñar e implementar un plan para que Zone.js sea opcional desde las aplicaciones Angular. De esta forma, simplificaremos el framework, mejoraremos la depuración y reduciremos el tamaño del paquete de aplicaciones. Además, esto nos permitirá aprovechar la sintaxis nativa async/await, que actualmente Zone.js no admite.

### Eliminar legacy [View Engine](guide/ivy)

Una vez que se haya completado la transición de todas nuestras herramientas internas a Ivy, queremos eliminar el  legacy View Engine para una sobrecarga conceptual Angular más pequeña, un tamaño de paquete más pequeño, un costo de mantenimiento más bajo y una menor complejidad del código base.

### Herramientas de desarrollo Angular

Trabajaremos en herramientas de desarrollo para Angular que proporcionarán utilidades para depuración y generación de perfiles de rendimiento. Este proyecto tiene como objetivo ayudar a los desarrolladores a comprender la estructura del componente y la detección de cambios en una aplicación Angular.

### NgModules opcionales

Para simplificar el modelo mental Angular y la ruta de aprendizaje, trabajaremos para hacer que NgModules sea opcional. Este trabajo permitirá a los desarrolladores desarrollar componentes independientes e implementar una API alternativa para declarar el alcance de compilación del componente.

### API de división de código a nivel de componente ergonómico

Un problema común de las aplicaciones web es su lento tiempo de carga inicial. Una forma de mejorarlo es aplicar una división de código más granular a nivel de componente. Para fomentar esta práctica, trabajaremos en API de división de código más ergonómicas.

### Migración a ESLint

Con la deprecación de TSLint, nos trasladaremos a ESLint. Como parte del proceso, trabajaremos para garantizar la compatibilidad con versiones anteriores de nuestra configuración TSLint recomendada actual, implementaremos una estrategia de migración para las aplicaciones Angular existentes e introduciremos nuevas herramientas en la cadena de herramientas Angular CLI.
