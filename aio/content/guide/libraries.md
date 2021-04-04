# Vista general de librerías para Angular

Muchas aplicaciones necesitan resolver los mismos problemas en general, como presentar una interfaz de usuario unificada, mostrar datos, permitir entrada de datos etc.
Los desarrolladores puede crear soluciones generales para dominios particulares que pueden ser adoptados para re usarse en diferentes aplicaciones.
Tal solución se puede construir como *librerías* para Angular y estas librerías pueden ser publicadas y compartidas como *paquetes de npm*.

Una librería de Angular es como un [proyecto](guide/glossary#project) lo que la diferencia de una app es que no puede correr por si sola.
Una librería debe ser importada y usada en una app.

Las librerías extienden la funcionalidad base de Angular. Por ejemplo, para agregar [formularios reactivos](guide/reactive-forms) en una app, agregamos la librería usando `ng add @angular/forms`, entonces importamos el `ReactiveFormsModule` desde la librería `@angular/forms` el código de la aplicación.
De igual manera, agregar la librería [service worker](guide/service-worker-intro) dentro de una aplicación Angular es el primer paso para convertir una aplicación a una [Progressive Web App](https://developers.google.com/web/progressive-web-apps/) (PWA).
[Angular Material](https://material.angular.io/) es un ejemplo de una gran librería de propósito general que ofrece componentes de UI sofisticados, reutilizables y adaptables.

Cualquier desarrollador de apps puede usar estas y otras librerías que han sido publicadas como paquetes de npm por el equipo de Angular o por terceros. Mirá [Usando librerías publicadas](guide/using-libraries).

## Creando librerías

Si tu tienes funcionalidades desarrolladas que puede ser adecuadas para re usarse tu puedes crear tus propias librerías.
Estas librerías puede ser usadas localmente en tu espacio de trabajo, o puede ser publicadas como [paquetes de npm](guide/npm-packages) para compartir con otros proyectos o otros desarrolladores Angular.
Estos paquetes pueden ser publicados en el registro de npm, en un registro empresarial privado de npm, o en un sistema de gestión de paquetes privado que soporte paquetes de npm.
Mirá [Creando librerías](guide/creating-libraries).

Si tu decides empaquetar una funcionalidad como una librería es una decisión de arquitectura, similar a decidir entre si una pieza de funcionalidad es un componente o un servicio, o decidir el alcance de un componente.

Empaquetar funcionalidad como una librería fuerza a
que los artefactos en la librería puedan ser desacoplados de la lógica de negocio de la aplicación.
Esto puede ayudar a evitar varias malas practicas o errores de arquitectura que puede hacer difícil desacoplar y re usar código en el futuro.

Poniendo el código dentro de una librería separada es más complejo que simplemente poner todo en una sola aplicación.
Esto requiere una inversión mayor de tiempo y pensar para administrar, mantener y actualizar la librería.
Sin embargo esta complejidad puede valer la pena cuando la librería esta siendo usada en múltiples aplicaciones.

<div class="alert is-helpful">

Note que las librerías están destinadas para ser usadas por aplicaciones Angular.
Para agregar funcionalidad de Angular hacia una aplicación web que no es Angular, puedes usar [Angular custom elements](guide/elements).

</div>