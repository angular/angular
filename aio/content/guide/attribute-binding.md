# Enlaces de atributos, clases y estilos

La sintaxis de la plantilla proporciona enlaces one-way especializados para escenarios menos adecuados para el enlace de propiedades.

<div class="alert is-helpful">

Consulta el <live-example></live-example> para ver un ejemplo práctico que contiene los fragmentos de código de esta guía.

</div>


## Enlace de atributo

Establece el valor de un atributo directamente con un **enlace de atributo**. Esta es la única excepción a la regla de que un enlace establece una propiedad de destino y el único enlace que crea y establece un atributo.

Por lo general, establecer una propiedad de elemento con un [enlace de propiedad](guide/property-binding) es preferible establecer el atributo con una string. Sin embargo, a veces
no hay ninguna propiedad de elemento para vincular, por lo que la vinculación de atributos es la solución.

Considera el [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) y
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG). Son puramente atributos, no corresponden a las propiedades del elemento y no establecen las propiedades del elemento. En estos casos, no hay objetivos de propiedad a los que vincularse.

La sintaxis de enlace de atributo se parece al enlace de propiedad, pero en lugar de una propiedad de elemento entre paréntesis, comienza con el prefijo `attr`, seguido de un punto (`.`) y el nombre del atributo.
Luego establece el valor del atributo, utilizando una expresión que se resuelve en una string, o elimina el atributo cuando la expresión se resuelva en `null`.

Uno de los casos de uso principales para el enlace de atributos es establecer atributos ARIA, como en este ejemplo:

<code-example path="attribute-binding/src/app/app.component.html" region="attrib-binding-aria" header="src/app/app.component.html"></code-example>

{@a colspan}

<div class="alert is-helpful">

#### `colspan` y `colSpan`

Observa la diferencia entre el atributo `colspan` y la propiedad `colSpan`.

Si escribes algo como esto:

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

Recibirías este error:

<code-example language="bash">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

Como dice el mensaje, el elemento `<td>` no tiene una propiedad `colspan`. Esto es verdad
porque `colspan` es un atributo&mdash;`colSpan`, con una `S` mayúscula, es la propiedad correspondiente. La interpolación y el enlace de propiedades solo pueden establecer *propiedades*, no atributos.

En su lugar, puedes usar el enlace de propiedad y lo escribirías así:

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

</div>

<hr/>

{@a class-binding}

## Enlace de clase

Aquí se explica cómo configurar el atributo `class` sin un enlace en HTML simple:

```html
<!-- standard class attribute setting -->
<div class="foo bar">Algún texto</div>
```

También puedes agregar y eliminar nombres de clase CSS del atributo `class` de un elemento con un **enlace de clase**.

Para crear un enlace de clase único, comienza con el prefijo `class` seguido de un punto (`.`) y el nombre de la clase CSS (por ejemplo, `[class.foo]="hasFoo"`).
Angular agrega la clase cuando la expresión enlazada es verdadera y elimina la clase cuando la expresión es falsa (con la excepción de `undefined`, vea [delegación de estilo](#styling-delegation)).

Para crear un enlace a varias clases, usa un enlace genérico `[class]` sin el punto (por ejemplo, `[class]="classExpr"`).
La expresión puede ser una string de nombres de clase delimitada por espacios, o puede formatearla como un objeto con nombres de clase como claves y expresiones de verdad / falsedad como valores.
Con el formato de objeto, Angular agregará una clase solo si su valor asociado es verdadero.

Es importante tener en cuenta que con cualquier expresión similar a un objeto (`object`,`Array`, `Map`, `Set`, etc.), la identidad del objeto debe cambiar para que se actualice la lista de clases.
Actualizar la propiedad sin cambiar la identidad del objeto no tendrá ningún efecto.

Si hay varios enlaces al mismo nombre de clase, los conflictos se resuelven usando [precedencia de estilo](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Tipo de enlace
    </th>
    <th>
      Sintaxis
    </th>
    <th>
      Tipo de entrada
    </th>
    <th>
      Ejemplo de valores de entrada
    </th>
  </tr>
  <tr>
    <td>Enlace de clase única</td>
    <td><code>[class.foo]="hasFoo"</code></td>
    <td><code>boolean | undefined | null</code></td>
    <td><code>true</code>, <code>false</code></td>
  </tr>
  <tr>
    <td rowspan=3>Enlace de clases múltiples</td>
    <td rowspan=3><code>[class]="classExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"my-class-1 my-class-2 my-class-3"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: boolean | undefined | null}</code></td>
    <td><code>{foo: true, bar: false}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['foo', 'bar']</code></td>
  </tr>
</table>


La directiva [NgClass](guide/built-in-directives/#ngclass) se puede utilizar como alternativa a los enlaces directos `[class]`.
Sin embargo, se prefiere usar la sintaxis de enlace de clase anterior sin `NgClass` porque debido a las mejoras en el enlace de clase en Angular, `NgClass` ya no proporciona un valor significativo y podría eliminarse en el futuro.


<hr/>

{@a style-binding}

## Enlace de estilo

Aquí se explica cómo configurar el atributo `style` sin un enlace en HTML simple:

```html
<!-- standard style attribute setting -->
<div style="color: blue">Algún texto</div>
```

También se puede establecer estilos dinámicamente con un **enlace de estilo**.

Para crear un enlace de estilo único, comienza con el prefijo `style` seguido de un punto (`.`) y el nombre de la propiedad de estilo CSS (por ejemplo, `[style.width]="width"`).
La propiedad se establecerá en el valor de la expresión enlazada, que normalmente es una string.
Opcionalmente, se puede agregar una extensión de unidad como `em` o `%`, que requiere un tipo de número.

<div class="alert is-helpful">

Ten en cuenta que se puede escribir una _propiedad de estilo_ en [dash-case](guide/glossary#dash-case), como se muestra arriba, o [camelCase](guide/glossary#camelcase), como `fontSize`.

</div>

Si deseas alternar múltiples estilos, puedes vincular la propiedad `[style]` directamente sin el punto (por ejemplo,  `[style]="styleExpr"`).
La expresión asociada al enlace `[style]` suele ser una lista de string de estilos como `"width: 100px; height: 100px;"`.

También se puede formatear la expresión como un objeto con nombres de estilo como claves y valores de estilo como los valores, como `{width: '100px', height: '100px'}`.
Es importante tener en cuenta que con cualquier expresión similar a un objeto (`object`, `Array`, `Map`, `Set`, etc), la identidad del objeto debe cambiar para que se actualice la lista de clases.
Actualizar la propiedad sin cambiar la identidad del objeto no tendrá ningún efecto.

Si hay varios enlaces a la misma propiedad de estilo, los conflictos se resuelven usando [reglas de precedencia de estilo](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Tipo de enlace
    </th>
    <th>
      Sintaxis
    </th>
    <th>
      Tipo de entrada
    </th>
    <th>
      Ejemplo de valores de entrada
    </th>
  </tr>
  <tr>
    <td>Enlace de estilo único</td>
    <td><code>[style.width]="width"</code></td>
    <td><code>string | undefined | null</code></td>
    <td><code>"100px"</code></td>
  </tr>
  <tr>
  <tr>
    <td>Enlace de estilo único con unidades</td>
    <td><code>[style.width.px]="width"</code></td>
    <td><code>number | undefined | null</code></td>
    <td><code>100</code></td>
  </tr>
    <tr>
    <td rowspan=3>Enlace de múltiples estilos</td>
    <td rowspan=3><code>[style]="styleExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"width: 100px; height: 100px"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: string | undefined | null}</code></td>
    <td><code>{width: '100px', height: '100px'}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['width', '100px']</code></td>
  </tr>
</table>

La directiva [NgStyle](guide/built-in-directives/#ngstyle) se puede utilizar como alternativa a los enlaces directos `[style]`.
Sin embargo, se prefiere usar la sintaxis de enlace de estilos anterior sin `NgStyle` porque debido a las mejoras en el enlace de estilos en Angular, `NgStyle` ya no proporciona un valor significativo y podría eliminarse en el futuro.


<hr/>

{@a styling-precedence}

## Precedencia de estilo

Un único elemento HTML puede tener su lista de clases CSS y valores de estilo vinculados a múltiples fuentes (por ejemplo, enlaces de host de múltiples directivas).

Cuando hay varios enlaces al mismo nombre de clase o propiedad de estilo, Angular usa un conjunto de reglas de precedencia para resolver conflictos y determinar qué clases o estilos se aplican finalmente al elemento.

<div class="alert is-helpful">
<h4>Precedencia de estilo (de mayor a menor)</h4>

1. Enlaces de plantillas
    1. Enlace de propiedad (por ejemplo, `<div [class.foo]="hasFoo">` o `<div [style.color]="color">`)
    1. Enlace de mapa (por ejemplo, `<div [class]="classExpr">` o `<div [style]="styleExpr">`)
    1. Valor estático (por ejemplo, `<div class="foo">` o `<div style="color: blue">`)
1. Enlaces de directivas hosts
    1. Enlace de propiedad (por ejemplo, `host: {'[class.foo]': 'hasFoo'}` o `host: {'[style.color]': 'color'}`)
    1. Enlace de mapa (por ejemplo, `host: {'[class]': 'classExpr'}` o `host: {'[style]': 'styleExpr'}`)
    1. Valor estático (por ejemplo, `host: {'class': 'foo'}` o `host: {'style': 'color: blue'}`)
1. Enlaces de componentes hosts
    1. Enlace de propiedad (por ejemplo, `host: {'[class.foo]': 'hasFoo'}` o `host: {'[style.color]': 'color'}`)
    1. Enlace de mapa (por ejemplo, `host: {'[class]': 'classExpr'}` o `host: {'[style]': 'styleExpr'}`)
    1. Valor estático (por ejemplo, `host: {'class': 'foo'}` o `host: {'style': 'color: blue'}`)

</div>

Cuanto más específico sea un enlace de clase o estilo, mayor será su precedencia.

Un enlace a una clase específica (por ejemplo, `[class.foo]`) tendrá prioridad sobre un enlace genérico `[class]`, y un enlace a un estilo específico (por ejemplo, `[style.bar]`)  tendrá prioridad sobre un enlace genérico `[style]`.

<code-example path="attribute-binding/src/app/app.component.html" region="basic-specificity" header="src/app/app.component.html"></code-example>

Las reglas de especificidad también se aplican cuando se trata de enlaces que se originan de diferentes fuentes.
Es posible que un elemento tenga enlaces en la plantilla donde se declara, desde enlaces de host en directivas coincidentes y desde enlaces de host en componentes coincidentes.

Los enlaces de plantilla son los más específicos porque se aplican al elemento directa y exclusivamente, por lo que tienen la mayor prioridad.

Los enlaces de host de directiva se consideran menos específicos porque las directivas se pueden usar en varias ubicaciones, por lo que tienen una precedencia menor que los enlaces de plantilla.

Las directivas a menudo aumentan el comportamiento de los componentes, por lo que los enlaces de host de los componentes tienen la prioridad más baja.

<code-example path="attribute-binding/src/app/app.component.html" region="source-specificity" header="src/app/app.component.html"></code-example>

Además, los enlaces tienen prioridad sobre los atributos estáticos.

En el siguiente caso, `class` y `[class]` tienen una especificidad similar, pero el enlace `[class]` tendrá prioridad porque es dinámico.

<code-example path="attribute-binding/src/app/app.component.html" region="dynamic-priority" header="src/app/app.component.html"></code-example>

{@a styling-delegation}
### Delegar a estilos con menor prioridad

Es posible que los estilos de precedencia más alta "deleguen" a los estilos de precedencia más bajos utilizando valores `undefined`.
Mientras que establecer una propiedad de estilo en `null` asegura que el estilo se elimine, establecerlo en `undefined` hará que Angular vuelva al siguiente enlace de precedencia más alto para ese estilo.

Por ejemplo, considera la siguiente plantilla:

<code-example path="attribute-binding/src/app/app.component.html" region="style-delegation" header="src/app/app.component.html"></code-example>

Imagina que la directiva `dirWithHostBinding`  y el componente `comp-with-host-binding`  tienen un enlace de host `[style.width]`.
En ese caso, si `dirWithHostBinding` establece su enlace en `undefined`, la propiedad `width` volverá al valor del enlace de host del componente `comp-with-host-binding`.
Sin embargo, si `dirWithHostBinding` establece su enlace en `null`, la propiedad `width` se eliminará por completo.
