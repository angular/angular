
# Sintaxis de Enlace: una visión general

El enlace de datos es un mecanismo utilizado para coordinar los valores de los datos que los usuarios visualizan en la aplicación.
Aunque puedas insertar y actualizar valores en el HTML, la aplicación es más fácil de escribir, leer y mantener si tu le dejas esas tareas al framework de enlace.
Por lo que simplemente debes declarar enlaces entre los datos del modelo y los elementos HTML y dejar al framework que haga el resto del trabajo.

<div class="alert is-helpful">

Consulta la <live-example>aplicación de muestra</live-example> que es un ejemplo funcional que contiene los fragmentos de código utilizados en esta guía.

</div>

Angular proporciona muchas formas para manejar el enlace de datos. Los tipos de enlace se pueden agrupar en tres categorías que se distinguen de acuerdo a la dirección del flujo de datos:

* Desde el _modelo-hacia-vista_
* Desde la _vista-hacia-modelo_
* Secuencia Bidireccional: _vista-hacia-modelo-hacia-vista_

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="30%">
  </col>
  <col width="50%">
  </col>
  <col width="20%">
  </col>
  <tr>
    <th>
      Tipo
    </th>
    <th>
      Sintaxis
    </th>
    <th>
      Categoría
    </th>

  </tr>
  <tr>
     <td>
      Interpolación<br>
      Propiedad<br>
      Atributo<br>
      Clase<br>
      Estilos
    </td>
    <td>

      <code-example>
        {{expression}}
        [target]="expression"
        bind-target="expression"
      </code-example>

    </td>

    <td>
      Una sola dirección<br>desde el modelo de datos<br>hacia la vista
    </td>
    <tr>
      <td>
        Evento
      </td>
      <td>
        <code-example>
          (target)="statement"
          on-target="statement"
        </code-example>
      </td>

      <td>
        Una sola dirección<br>desde la vista<br>hacia el modelo de datos
      </td>
    </tr>
    <tr>
      <td>
        Bidireccional
      </td>
      <td>
        <code-example>
          [(target)]="expression"
          bindon-target="expression"
        </code-example>
      </td>
      <td>
        Bidireccional
      </td>
    </tr>
  </tr>
</table>

Los tipos de enlace distintos a la interporlación tienen un **nombre de destino** hacia la izquierda del signo igual, están rodeados por los signos de puntación `[]` o `()`, o bien están precedidos por el prefijo: `bind-`, `on-`, `bindon-`.

El *destino* de un enlace es la propiedad o evento situado dentro de los signos de puntuación: `[]`, `()` or `[()]`.

Cada miembro <span class="x x-first x-last">público</span> de una directiva **fuente** <span class="x x-first x-last">está</span> disponible automaticamente para ser utilizada con los enlaces.
No es necesario hacer nada especial para poder acceder al miembro de una directiva en una expresión o declaración de plantilla.

### Enlace de Datos y el HTML

En condiciones normales para un desarrollo HTML, primero se crea la estructura visual con los elementos HTML y luego se modifican dichos elementos estableciendo los atributos de dichos elementos utilizando una cadena de caracteres.

```html
<div class="special">HTML Simple</div>
<img src="images/item.png">
<button disabled>Guardar</button>
```

Usando el enlace de datos, puedes controlar cosas como el estado de un botón:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Puedes notar que el enlace se realiza a la propiedad `disabled` del elemento botón del DOM,
**no** al atributo. Esto aplica al enlace de datos en general. El enlace de datos funciona con las *propiedades* de los elementos, componentes y directivas del DOM, no con los *atributos* HTML

{@a html-attribute-vs-dom-property}

### Atributos HTML vs. Propiedades del DOM

Distinguir la diferencia entre un atributo HTML y una propiedad del DOM es clave para comprender como funciona el enlace en Angular. **Los attributos son definidos por el HTML. Las propiedades se acceden desde los nodos del DOM (Document Object Model).**

* Muy pocos atributos HTML tienen una relación 1:1 con las propiedades; por ejemplo el, `id`.

* Algunos atributos HTML no tienen su correspondencia en propiedades; como por ejemplo, `aria-*`.

* Algunas propiedades del DOM no tienen su correspondencia hacia atributos; como por ejemplo, `textContent`.

Es importante recordar que los *atributos HTML* y las *propiedades del DOM* son cosas muy diferentes, incluso cuando tienen el mismo nombre.
En Angular, el único rol de los atributos HTML es el de inicializar el estado de los elementos y las directivas.

**El enlace de plantilla funciona con *propiedades* y *eventos*, no con *atributos*.**

Cuando escribes un enlace de datos, se trata exclusivamente sobre las *propiedades del DOM* and *eventos* del objeto de destino.

<div class="alert is-helpful">

Esta regla general puede ayudarnos a crear un modelo mental de los atributos y las propiedades del DOM:
**Los atributos inicializan las propiedades del DOM y cuando eso ya esta hecho, los valores de las propiedades pueden cambiar, mientras que los atributos no lo pueden hacer.**

Solamente hay una excepción a la regla.
Los atributos pueden cambiarse usando el método `setAttribute()`, el cual re-inicializa las propiedades del DOM correspondientes.

</div>

Para más información, consulta la [Documentación de Interfaces MDN](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces) que contiene los documentos de la API para todos los elementos estándar del DOM y sus propiedades.
Comparar los atributos [`<td>` atributos](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td) con las propiedades [`<td>` propiedades](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) nos proporciona un ejemplo útil para poder diferenciar estos dos términos de una mejor manera.
En particular, se puede navegar de la página de atributos a la página de propiedades por medio del enlace "Interfaz del DOM", y navegar la jerarquía de la herencia hasta `HTMLTableCellElement`.


#### Ejemplo 1: un `<input>`

Cuando el navegador renderiza `<input type="text" value="Sarah">`, este crea un nodo correspondiente en el DOM con la propiedad `value` inicializada con el valor de "Sarah".

```html
<input type="text" value="Sarah">
```

Cuando el usuario ingresa "Sally" dentro del `<input>`, la **propiedad** `value` del elemento del DOM se convierte en "Sally".
Sin embargo, si tu revisas el atributo HTML `value` usando el método `input.getAttribute('value')`, puedes notar que el *atributo* no ha cambiado&mdash;por lo que returna el valor de "Sarah".

El atributo HTML `value` especifica el valor *inicial*; la propiedad del DOM `value` es el valor *actual*.

Para consultar los atributos vs las propiedades del DOM en una aplicación funcional, consulta la <live-example name="binding-syntax">aplicación</live-example> en especial para repasar la sintaxis de enlace.

#### Ejemplo 2: un botón desactivado

El atributo `disabled` es otro ejemplo. La *propiedad* del botón `disabled`
*property* es `false` por defecto así que el botón esta activo.

Cuando añades el *atributo* `disabled`, su sola presencia inicializa la *propiedad* del botón `disabled` con el valor de `true` por lo que el botón esta desactivado.

```html
<button disabled>Botón de Ejemplo</button>
```

Añadir y eliminar el *atributo* `disabled` desactiva y activa el botón.
Sin embargo, el valor del *atributo* es irrelevante,
lo cual es la razón del por qué no puedes activar un botón escribiendo `<button disabled="false">Todavía Desactivado</button>`.

Para controlar el estado de un botón, establece la *propiedad* `disabled`.

<div class="alert is-helpful">

Aunque técnicamente podrías establecer el enlace de atributo `[attr.disabled]`, los valores son diferentes ya que el enlace de propiedad necesita un valor booleano, mientras que el enlace de atributo correspondiente depende de que su valor sea `null` o no. Por lo que considera lo siguiente:

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

Por lo general usa enlace de propiedades sobre enlace de atributos ya que es más intuitivo (siendo un valor booleano), tienen una sintaxis corta y es más eficaz.

</div>

Para ver el ejemplo del botón `disabled`, consulta la <live-example name="binding-syntax">aplicación</live-example> en especial para revisar la sintaxis de enlace. Este ejemplo muestra como alternar la propiedad disabled desde el componente.

## Tipos de enlace y objetivos

El **objetivo de un enlace de datos** se relaciona con algo del DOM.
Dependiendo del tipo de enlace, el objetivo puede ser una propiedad (elemento, componente, o directiva),
un evento (elemento, componente o directiva), o incluso algunas veces el nombre de un atributo.
La siguiente tabla recoge los objetivos para los diferentes tipos de enlace.

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="10%">
  </col>
  <col width="15%">
  </col>
  <col width="75%">
  </col>
  <tr>
    <th>
      Tipo
    </th>
    <th>
      Objetivo
    </th>
    <th>
      Ejemplos
    </th>
  </tr>
  <tr>
    <td>
      Propiedad
    </td>
    <td>
      Propiedad del&nbsp;elemento<br>
      Propiedad del&nbsp;componente<br>
      Propiedad de la&nbsp;directiva
    </td>
    <td>
      <code>src</code>, <code>hero</code>, and <code>ngClass</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1"></code-example>
      <!-- For more information, see [Property Binding](guide/property-binding). -->
    </td>
  </tr>
  <tr>
    <td>
      Evento
    </td>
    <td>
      Evento del &nbsp;elemento<br>
      Evento del&nbsp;componente<br>
      Evento de la &nbsp;directiva
    </td>
    <td>
      <code>click</code>, <code>deleteRequest</code>, and <code>myClick</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1"></code-example>
      <!-- KW--Why don't these links work in the table? -->
      <!-- <div>For more information, see [Event Binding](guide/event-binding).</div> -->
    </td>
  </tr>
  <tr>
    <td>
      Bidireccional
    </td>
    <td>
      Eventos y propiedades
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      Atributo
    </td>
    <td>
      Atributo
      (la&nbsp;excepción)
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      Clase
    </td>
    <td>
    Propiedad de una <code>clase</code>
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      Estilos
    </td>
    <td>
     Propiedad de un <code>estilo</code>
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1"></code-example>
    </td>
  </tr>
</table>
