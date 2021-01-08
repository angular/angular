# Introducción al Service Worker de Angular

Los service Workers amplían el modelo de implementación web tradicional y permiten que las aplicaciones brinden una experiencia de usuario con la confiabilidad y el rendimiento a la par del código instalado de forma nativa. Agregar un service worker a una aplicación Angular es uno de los pasos para convertir una aplicación en una [Aplicación web progresiva] (https://developers.google.com/web/progressive-web-apps/) (también conocida como PWA ).

En su forma más simple, un service worker es un script que se ejecuta en el navegador web y administra el almacenamiento en caché de una aplicación.

Los service workers funcionan como un proxy de red. Interceptan todas las solicitudes HTTP salientes realizadas por la aplicación y pueden elegir cómo responderlas. Por ejemplo, pueden consultar un caché local y entregar una respuesta en caché si hay una disponible. El proxy no se limita a las solicitudes realizadas a través de código para consumir API, como "fetch"; también incluye recursos referenciados en HTML e incluso la solicitud inicial a `index.html`. El almacenamiento en caché basado en service workers es, por lo tanto, completamente programable y no depende de los encabezados de almacenamiento en caché especificados por el servidor.

A diferencia de los otros scripts que componen una aplicación, como el paquete de la aplicación Angular, el service worker se conserva después de que el usuario cierre la pestaña. La próxima vez que el navegador cargue la aplicación, el service worker cargará primero y podrá interceptar cada solicitud de recursos para cargar la aplicación. Si el service worker está diseñado para hacerlo, puede *satisfacer completamente la carga de la aplicación, sin necesidad de la red*.

Incluso en una red rápida y fiable, los retrasos de ida y vuelta pueden introducir una latencia significativa al cargar la aplicación. El uso de un service worker para reducir la dependencia de la red puede mejorar significativamente la experiencia del usuario.


## Service workers en Angular

Las aplicaciones de Angular, como aplicaciones de una sola página, están en una posición privilegiada para beneficiarse de las ventajas de los service workers. A partir de la versión 5.0.0, Angular se envía con una implementación del service worker. Los desarrolladores de Angular pueden aprovechar este service worker y beneficiarse de la mayor fiabilidad y rendimiento que proporciona, sin necesidad de codificar con APIs de bajo nivel.

El service worker de Angular está diseñado para optimizar la experiencia del usuario final al usar una aplicación en una conexión de red lenta o poco fiable, al mismo tiempo que minimiza los riesgos de ofrecer contenido desactualizado.

El comportamiento del service worker de Angular sigue ese objetivo de diseño:

* El almacenamiento en caché de una aplicación es como instalar una aplicación nativa. La aplicación se almacena en caché como una unidad y todos los archivos se actualizan juntos.
* Una aplicación en ejecución continúa ejecutándose con la misma versión de todos los archivos. No comienza a recibir repentinamente archivos en caché de una versión más reciente, que probablemente sean incompatibles.
* Cuando los usuarios actualizan la aplicación, ven la última versión completamente almacenada en caché. Las pestañas nuevas cargan el último código almacenado en caché.
* Las actualizaciones ocurren en segundo plano, relativamente rápido después de que se publican los cambios. La versión anterior de la aplicación se sirve hasta que se instala y está lista una actualización.
* El service worker conserva el ancho de banda cuando es posible. Los recursos solo se descargan si han cambiado.

Para admitir estos comportamientos, el service worker de Angular carga un archivo * manifiesto * desde el servidor. El manifiesto describe los recursos para almacenar en caché e incluye hashes del contenido de cada archivo. Cuando se implementa una actualización de la aplicación, el contenido del manifiesto cambia e informa al service worker que se debe descargar y almacenar en caché una nueva versión de la aplicación. Este manifiesto se genera a partir de un archivo de configuración generado por CLI llamado `ngsw-config.json`.

Instalar el service worker de Angular es tan simple como incluir un `NgModule`. Además de registrar el service worker de Angular en el navegador, esto también hace que algunos servicios estén disponibles para inyección que interactúan con el service worker y se pueden usar para controlarlo. Por ejemplo, una aplicación puede solicitar que se le notifique cuando esté disponible una nueva actualización, o una aplicación puede pedirle al service worker que busque actualizaciones disponibles en el servidor.

## Requisitos previos

Para hacer uso de todas las características del Angular service worker, use las últimas versiones de Angular y Angular CLI.

Para que los service workers se registren, se debe acceder a la aplicación a través de HTTPS, no de HTTP.
Los navegadores ignoran a los service workers en las páginas que se sirven a través de una conexión insegura.
La razón es que los service workers son bastante poderosos, por lo que se debe tener especial cuidado para garantizar que el script del service worker no se haya alterado.

Hay una excepción a esta regla: para facilitar el desarrollo local, los navegadores _no_ requieren una conexión segura al acceder a una aplicación en `localhost`.

### Soporte de navegador

Para beneficiarse del service worker de Angular, su aplicación debe ejecutarse en un navegador web que admita service workers en general.
Actualmente, los service workers son compatibles con las últimas versiones de Chrome, Firefox, Edge, Safari, Opera, UC Browser (versión de Android) y Samsung Internet.
Los navegadores como IE y Opera Mini no son compatibles con los service workers.

Si el usuario accede a su aplicación a través de un navegador que no es compatible con los service workers, el service worker no es registrado y el comportamiento relacionado como la administración de caché sin conexión y las notificaciones automáticas, no ocurre.
Más específicamente:

* El navegador no descarga la secuencia de comandos del service worker y el archivo de manifiesto `ngsw.json`.
* Intentos activos de interactuar con el service worker, como llamar a `SwUpdate.checkForUpdate ()`, devuelve promesas rechazadas.
* Los eventos observables de servicios relacionados, como "SwUpdate.available", no se activan.

Se recomienda encarecidamente que se asegure de que su aplicación funcione incluso sin la asistencia del trabajador de servicio en el navegador.
Aunque un navegador no compatible ignora el almacenamiento en caché del service worker, seguirá informando errores si la aplicación intenta interactuar con el service worker.
Por ejemplo, llamar a `SwUpdate.checkForUpdate ()` devolverá las promesas rechazadas.
Para evitar tal error, puede verificar si el service worker de Angular está habilitado usando `SwUpdate.isEnabled ()`.

Para obtener más información sobre otros navegadores que soportan service workers, consulta [Can I Use](https://caniuse.com/#feat=serviceworkers) y [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).


## Recursos Relacionados

El resto de los artículos de esta sección abordan específicamente la implementación de los service workers en Angular.

* [App Shell](guide/app-shell)
* [Comunicación del Service Worker](guide/service-worker-communications)
* [Service Worker en producción](guide/service-worker-devops)
* [Service Worker Configuración](guide/service-worker-config)

Para obtener más información sobre los service workers en general, consulta [Service Workers: una Introducción](https://developers.google.com/web/fundamentals/primers/service-workers/).

Para obtener más información sobre la compatibilidad con el navegador, consulta la [soporte del navegador](https://developers.google.com/web/fundamentals/primers/service-workers/#browser_support) sección de [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/),  [Is Serviceworker ready?](https://jakearchibald.github.io/isserviceworkerready/) Jake Archibald, y
[Can I Use](http://caniuse.com/#feat=serviceworkers).

Para obtener recomendaciones y ejemplos adicionales, consulta:

* [Precaching con Angular Service Worker](https://web.dev/precaching-with-the-angular-service-worker/)
* [Creando una PWA con Angular CLI](https://web.dev/creating-pwa-with-angular-cli/)

## Siguientes pasos con el Angular CLI

Comienza a usar los service workers en Angular, consulta [Introducción a los trabajadores del servicio](guide/service-worker-getting-started).
