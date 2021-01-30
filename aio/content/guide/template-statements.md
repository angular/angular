# Declaraciones de plantilla

Una **declaración** de plantilla responde a un **evento** provocado por un enlace a un objetivo
como un elemento, componente o directiva.

<div class="alert is-helpful">

Mira la <live-example name="template-syntax">sintaxis de la plantilla</live-example> para
la sintaxis y los fragmentos de código de esta guía.

</div>

La siguiente declaración de plantilla aparece entre comillas a la derecha del símbolo `=`&nbsp;como en `(event)="statement"`.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

Una declaración de plantilla *tiene un efecto secundario*.
Ese es el objetivo de un evento.
Es la forma de actualizar el estado de la aplicación a partir de la acción del usuario.


<div class="alert is-helpful">

Responder a los eventos es un aspecto del [flujo de datos unidireccional](guide/glossary#unidirectional-data-flow) de Angular.

</div>
Eres libre de cambiar cualquier cosa, en cualquier lugar, durante este ciclo del evento.

Al igual que las expresiones de plantilla, las *declaraciones* de plantilla utilizan un lenguaje que se parece a JavaScript.
El analizador de declaraciones de plantilla difiere del analizador de expresiones de plantilla y
admite específicamente tanto la asignación básica (`=`) como el encadenamiento de expresiones con <code>;</code>.

Sin embargo, no se permiten determinadas sintaxis de expresión de plantilla y JavaScript:

* <code>new</code>
* Operadores de incremento y decremento, `++` y `--`
* operador de asignación , como `+=` y `-=`
* los operadores bit a bit, como `|` y `&`
* el [operador pipe](guide/template-expression-operators#pipe)

## Contexto de la declaración

Al igual que con las expresiones, las declaraciones solo pueden ver lo que está en el contexto de la declaración
como un método de manejo de eventos de la instancia del componente.

El *contexto de la declaración* es típicamente la instancia del componente.
El *deleteHero* en `(click)="deleteHero()"` es un método del componente enlazado a datos.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

El contexto de la declaración también puede ver las propiedades del propio contexto de la plantilla.
En los siguientes ejemplos, el objeto de plantilla `$event`,
una [variable de entrada de plantilla](guide/built-in-directives#template-input-variable) (`let hero`),
y una [variable de referencia de plantilla](guide/template-reference-variables) (`#heroForm`)
se pasan a un método de manejo de eventos del componente.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html"></code-example>

Los nombres de contexto de plantilla tienen prioridad sobre los nombres de contexto de componentes.
En `deleteHero(hero)` anterior, el `hero` es la variable de entrada de la plantilla
no la propiedad `hero` del componente.

## Pautas de la declaración

Las declaraciones de plantilla no pueden ver nada en el espacio de nombres global. No
pueden ver `window` o `document`.
No pueden llamar `console.log` o `Math.max`.

Al igual que con las expresiones, evita escribir declaraciones de plantilla complejas.
Una llamada a un método o una simple asignación de propiedad debería ser la norma.
