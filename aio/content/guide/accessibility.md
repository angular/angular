# Accesibilidad en Angular

Hay una amplia variedad de personas que utilizan la web, algunas de ellas con discapacidad visual o motora.
Existen diferentes tecnologías de apoyo que hacen que sea mucho más fácil para estos grupos
interactuar con aplicaciones de software basadas en la web.
Además, diseñar una aplicación para que sea más accesible, normalmente mejora la experiencia de usuario en general.

Para una introducción en profundidad a los problemas y técnicas sobre el diseño de aplicaciones accesibles, puede consultar la sección de [Accesibilidad](https://developers.google.com/web/fundamentals/accessibility/#what_is_accessibility) de Google [Fundamentos Web](https://developers.google.com/web/fundamentals/).

Esta página habla de las mejores prácticas para diseñar aplicaciones en Angular que funcionan
bien para todos los usuarios, incluyendo aquéllos que necesitan tecnologías de apoyo.

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, ir a <live-example></live-example>.

</div>

## Atributos de accesibilidad

Crear una web accesible a menudo implica establecer los [atributos ARIA](https://developers.google.com/web/fundamentals/accessibility/semantics-aria)
para proporcionar la semántica que, de otro modo, podría no estar presente.
Usa la plantilla de sintaxis del [enlace de atributos](attribute binding) (guide/attribute-binding) para controlar los valores de los atributos relacionados con la accesibilidad.

Para enlazar los atributos ARIA en Angular, debes usar el prefijo `attr.`, ya que la especificación ARIA
depende de los atributos HTML y no de las propiedades de los elementos del DOM.

```html
<!-- Use attr. when binding to an ARIA attribute -->
<button [attr.aria-label]="myActionLabel">...</button>
```

Observa que esta sintaxis solo es necesaria para los _enlaces_ de atributos.
Los atributos ARIA estáticos no requieren de ninguna sintaxis adicional.

```html
<!-- Static ARIA attributes require no extra syntax -->
<button aria-label="Save document">...</button>
```

NOTA:

<div class="alert is-helpful">

   Por convenio, los atributos HTML se escriben en minúscula (`tabindex`), mientras que para las propiedades se usa *camelCase*  (`tabIndex`).

   Consulta la guía [Sintaxis del enlace](guide/binding-syntax#html-attribute-vs-dom-property) para saber más sobre las diferencias entre atributos y propiedades.

</div>


## Componentes del interfaz de usuario de Angular

La librería [Angular Material](https://material.angular.io/), que es mantenida por el equipo Angular, es un conjunto de componentes reutilizables para la interfaz de usuario que pretende ser totalmente accesible.
El [Kit de Desarrollo de Componentes (CDK)](https://material.angular.io/cdk/categories) (Component Development Kit) incluye el paquete  `a11y` que proporciona herramientas para dar soporte a distintos aspectos de la accesibilidad.
Por ejemplo:

* `LiveAnnouncer` se utiliza para comunicar mensajes a los usuarios de lectores de pantalla que usan la region `aria-live`. Se puede consultar la documentación de la W3C para obtener más información sobre [regiones aria-live](https://www.w3.org/WAI/PF/aria-1.1/states_and_properties#aria-live).

* La directiva `cdkTrapFocus` limita el foco de la tecla de tabulación para que se quede dentro de un elemento. Úsala para crear una experiencia accesible en componentes como las ventanas modales, donde el foco debe estar limitado.

Para obtener más detalles sobre esta y otras herramientas, consulta el [resumen de accesibilidad del Angular CDK](https://material.angular.io/cdk/a11y/overview).


### Aumento de elementos nativos

Los elementos HTML nativos capturan una serie de patrones de interacción estándar que son importantes para la accesibilidad.
Al crear componentes de Angular, deberías reutilizar estos elementos nativos directamente cuando sea posible, en lugar de volver a implementar comportamientos bien soportados.

Por ejemplo, en lugar de crear un elemento personalizado para un nuevo tipo de botón, puedes crear un componente que use un selector de atributos con un elemento nativo `<button>`.
Esto se aplica sobre todo a `<button>` y `<a>`, pero se puede usar con muchos otros tipos de elementos.

You can see examples of this pattern in Angular Material: [`MatButton`](https://github.com/angular/components/blob/master/src/material/button/button.ts#L66-L68), [`MatTabNav`](https://github.com/angular/components/blob/master/src/material/tabs/tab-nav-bar/tab-nav-bar.ts#L67), [`MatTable`](https://github.com/angular/components/blob/master/src/material/table/table.ts#L17).

### Uso de contenedores para elementos nativos

A veces, para usar el elemento nativo apropiado hace falta un contenedor.
Por ejemplo, el elemento nativo `<input>` no puede tener hijos, por lo que cualquier componente de entrada de texto personalizado necesita envolver un `<input>` con elementos adicionales.

Si bien puedes incluir el `<input>` en la plantilla de tu componente personalizado,
esto hace que sea imposible para los usuarios de dicho componente establecer propiedades y atributos arbitrarios para el elemento de entrada.
En su lugar, puedes crear un componente contenedor que utilice la proyección de contenido para incluir el control nativo en el
API del componente.

Puedes consultar [`MatFormField`](https://material.angular.io/components/form-field/overview) para ver un ejemplo de este patrón.

## Caso práctico: creación de una barra de progreso personalizada

El siguiente ejemplo muestra cómo hacer que una barra de progreso simple sea accesible utilizando el *host binding* para controlar los atributos relacionados con la accesibilidad.

* El componente define un elemento habilitado para accesibilidad con el atributo HTML estándar `role` y los atributos ARIA. El atributo ARIA `aria-valuenow` está vinculado a la entrada del usuario.

   <code-example path="accessibility/src/app/progress-bar.component.ts" header="src/app/progress-bar.component.ts" region="progressbar-component"></code-example>


* En la plantilla, el atributo `aria-label` asegura que el control sea accesible para los lectores de pantalla.

   <code-example path="accessibility/src/app/app.component.html" header="src/app/app.component.html" region="template"></code-example>


## Enrutamiento y gestión del foco

El seguimiento y el control del [foco](https://developers.google.com/web/fundamentals/accessibility/focus/) en una interfaz de usuario son aspectos muy importantes en el diseño si queremos tener en cuenta la accesibilidad.
Al usar el enrutamiento de Angular, debes decidir dónde va el foco de la página al navegar.

Para evitar depender únicamente de señales visuales, te debes asegurar de que el código de enrutamiento actualiza el foco después de la navegación de la página.
Usa el evento `NavigationEnd` del servicio` Router` para saber cuándo actualizar el foco.

El siguiente ejemplo muestra cómo encontrar y poner el foco en el contenido principal de la cabecera (el elemento `#main-content-header`) dentro del DOM después de la navegación.

The following example shows how to find and focus the main content header in the DOM after navigation.

```ts

router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
  const mainHeader = document.querySelector('#main-content-header')
  if (mainHeader) {
    mainHeader.focus();
  }
});

```
En una aplicación real, el elemento que recibe el foco dependerá de la estructura específica y del diseño que tenga tu aplicación.
El elemento enfocado debe colocar a los usuarios en una posición en la que pasen inmediatamente al contenido principal que acaba de ser visualizado.
Debe evitar situaciones en las que el foco vuelva al elemento `body` después de un cambio de ruta.


## Recursos adicionales

* [Accessibility - Google Web Fundamentals](https://developers.google.com/web/fundamentals/accessibility)

* [ARIA specification and authoring practices](https://www.w3.org/TR/wai-aria/)

* [Material Design - Accessibility](https://material.io/design/usability/accessibility.html)

* [Smashing Magazine](https://www.smashingmagazine.com/search/?q=accessibility)

* [Inclusive Components](https://inclusive-components.design/)

* [Accessibility Resources and Code Examples](https://dequeuniversity.com/resources/)

* [W3C - Web Accessibility Initiative](https://www.w3.org/WAI/people-use-web/)

* [Rob Dodson A11ycasts](https://www.youtube.com/watch?v=HtTyRajRuyY)

* [Codelyzer](http://codelyzer.com/rules/) provides linting rules that can help you make sure your code meets accessibility standards.

Libros

* "A Web for Everyone: Designing Accessible User Experiences", Sarah Horton and Whitney Quesenbery

* "Inclusive Design Patterns", Heydon Pickering

## Más sobre accesibilidad

Podrías estar interesado en lo siguiente:
* [Audit your Angular app's accessibility with codelyzer](https://web.dev/accessible-angular-with-codelyzer/).
