{@a top}

# Establecer el título del documento

Tu aplicación debería poder hacer que el título de la barra del navegador diga lo que quieras que diga.
Esta guía explica cómo hacerlo.

Ve el <live-example name="set-document-title"></live-example>.

## El problema con el *&lt;título&gt;*

La manera mas obvia es enlazar una propiedad del componente al HTML `<title>` como este:

<code-example format=''>
  &lt;title&gt;{{Esto_No_Funciona}}&lt;/title&gt;
</code-example>

Lamentablemente eso no funcionará. El componente raíz de la aplicación es un elemento contenido en la etiqueta `<body>`. El `<title>` HTML está en el `<head>` del documento, fuera del `<body>`, lo que lo hace inaccesible para el enlace de datos de Angular.

Tu podrías tomar el objeto `document` del navegador y establecer el título manualmente.
Eso no es ideal y socava tus posibilidades de ejecutar la aplicación fuera de un navegador algún día.

<div class="alert is-helpful">

  Ejecutar tu aplicación fuera de un navegador significa que puedes aprovechar las ventajas del renderizado del lado del servidor
  para tiempos del primer renderizado de la primera aplicación casi instantáneos y para SEO. Significa que puedes correr la aplicación
  dentro de un Web Worker para mejorar la capacidad de respuesta de tu aplicación mediante el uso de varios subprocesos. Y también
  significa que puedes ejecutar tu aplicación dentro de Electron.js o Windows Universal para enviarla al escritorio.

</div>

## Utiliza el servicio `Title`

Afortunadamente, Angular reduce las diferencias al proporcionar un servicio `Title` como parte de la *plataforma del navegador*.
El servicio [Title](api/platform-browser/Title) es una clase simple que proporciona un API
para obtener y configurar el título del documento HTML actual:

* `getTitle() : string`&mdash;Obtiene el título del documento HTML actual.
* `setTitle( newTitle : string )`&mdash;Establece el título del documento HTML actual.

Puedes inyectar el servicio `Title` en la raíz de `AppComponent` y exponer un método `setTitle` enlazable que lo llame:

<code-example path="set-document-title/src/app/app.component.ts" region="class" header="src/app/app.component.ts (class)"></code-example>

¡Enlaza ese método a tres etiquetas de anclaje y listo!

<div class="lightbox">
  <img src="generated/images/guide/set-document-title/set-title-anim.gif" alt="Set title">
</div>

Aquí está la solución completa:

<code-tabs>
  <code-pane header="src/main.ts" path="set-document-title/src/main.ts"></code-pane>
  <code-pane header="src/app/app.module.ts" path="set-document-title/src/app/app.module.ts"></code-pane>
  <code-pane header="src/app/app.component.ts" path="set-document-title/src/app/app.component.ts"></code-pane>
</code-tabs>

## ¿Por qué proporcionar el servicio `Title` en el `arranque`?

Por lo general, deseas proporcionar servicios para toda la aplicación en el componente de la aplicación raíz, `AppComponent`.

Esta guía recomienda registrar el servicio de títulos durante el arranque (boostrapping),
una ubicación que se reserva para configurar el ambiente de ejecución de Angular.

Eso es exactamente lo que está haciendo.
El servicio `Title` es parte de la *plataforma del navegador* de Angular.
Si inicias tu aplicación en una plataforma diferente,
tendrás que proporcionar un servicio de `Title` diferente que comprenda
el concepto de un "título de documento" para esa plataforma específica.
Idealmente, la aplicación en sí no conoce ni se preocupa por el ambiente de ejecución.
