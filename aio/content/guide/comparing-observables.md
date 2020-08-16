# Observables en comparación con otras técnicas

A menudo puedes usar observables en lugar de promesas para entregar valores de forma asíncrona. Del mismo modo, los observables pueden reemplazar a los controladores de eventos. Finalmente, porque los observables entregan múltiples valores, puedes usarlos donde de otro modo podrías construir y operar con arrays.

Los observables se comportan de manera algo diferente a las técnicas alternativas en cada una de estas situaciones, pero ofrecen algunas ventajas significativas. Aquí hay comparaciones detalladas de las diferencias.

## Observables en comparación con promesas

Los observables a menudo se comparan con las promesas. Aquí hay algunas diferencias clave:

* Los observables son declarativos; La ejecución no comienza hasta la suscripción. Las promesas se ejecutan inmediatamente después de la creación. Esto hace que los observables sean útiles para definir recetas que se pueden ejecutar cuando necesites el resultado.

* Los observables proporcionan muchos valores. Las promesas proporcionan un valor. Esto hace que los observables sean útiles para obtener múltiples valores a lo largo del tiempo.

* Los observables diferencian entre encadenamiento y suscripción. Las promesas solo tienen cláusulas `.then ()`. Esto hace que los observables sean útiles para crear recetas de transformación complejas para ser utilizadas por otra parte del sistema, sin que el trabajo se ejecute.

* Observables `subscribe()` es responsable de manejar los errores. Las promesas empujan los errores a promesas hijas. Esto hace que los observables sean útiles para el manejo centralizado y predecible de errores.

### Creación y suscripción

* Los observables no se ejecutan hasta que un consumidor se suscribe. El `subscribe()` ejecuta el comportamiento definido una vez, y se puede volver a llamar. Cada suscripción tiene su propia computación. La resuscripción provoca la recomputación de los valores.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (observable)"
    region="observable">
  </code-example>

* Las promesas se ejecutan de inmediato, y solo una vez. La computación del resultado se inicia cuando se crea la promesa. No hay forma de reiniciar el trabajo. Todas las cláusulas `then` (suscripciones) comparten la misma computación.

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (promise)"
    region="promise">
  </code-example>

### Encadenamiento

* Los observables diferencian entre la función de transformación, como `map` y `subscription`. Solo la suscripción activa la función de suscriptor para comenzar a calcular los valores.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (chain)"
    region="chain">
  </code-example>

* Las promesas no diferencian entre las últimas cláusulas `.then` (equivalentes al subscription) y las cláusulas intermedias `.then` (equivalentes al map).

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (chain)"
    region="chain">
  </code-example>

### Cancelación

* Las suscripciones de los observables son cancelables. La cancelación de la suscripción evita que el oyente reciba más valores y notifica a la función del suscriptor que cancele el trabajo.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (unsubcribe)"
    region="unsubscribe">
  </code-example>

* Las promesas no son cancelables.

### Manejo de errores

* Los errores de ejecución en observables se entregan al controlador de errores del suscriptor, y el suscriptor cancela automáticamente la suscripción del observable.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (error)"
    region="error">
  </code-example>

* Las promesas empujan los errores a las promesas hijas.

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (error)"
    region="error">
  </code-example>

### Hoja de trucos

Los siguientes fragmentos de código ilustran cómo se define el mismo tipo de operación utilizando observables y promesas.

<table>
  <thead>
    <tr>
      <th>Operation</th>
      <th>Observable</th>
      <th>Promise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Creation</td>
      <td>
        <pre>
new Observable((observer) => {
  observer.next(123);
});</pre>
      </td>
      <td>
        <pre>
new Promise((resolve, reject) => {
  resolve(123);
});</pre>
      </td>
    </tr>
    <tr>
      <td>Transform</td>
      <td><pre>obs.pipe(map((value) => value * 2));</pre></td>
      <td><pre>promise.then((value) => value * 2);</pre></td>
    </tr>
    <tr>
      <td>Subscribe</td>
      <td>
        <pre>
sub = obs.subscribe((value) => {
  console.log(value)
});</pre>
      </td>
      <td>
        <pre>
promise.then((value) => {
  console.log(value);
});</pre>
      </td>
    </tr>
    <tr>
      <td>Unsubscribe</td>
      <td><pre>sub.unsubscribe();</pre></td>
      <td>Implied by promise resolution.</td>
    </tr>
  </tbody>
</table>

## Observables en comparación con eventos API

Los observables son muy similares a los controladores de eventos que usan la API de eventos. Ambas técnicas definen manejadores de notificaciones y las utilizan para procesar múltiples valores entregados a lo largo del tiempo. Suscribirse a un observable es equivalente a agregar un detector de eventos. Una diferencia significativa es que puedes configurar un observable para transformar un evento antes de pasar el evento al controlador.

El uso de observables para manejar eventos y operaciones asíncronas puede tener la ventaja de una mayor coherencia en contextos como las solicitudes HTTP.

Aquí hay algunos ejemplos de código que ilustran cómo se define el mismo tipo de operación usando observables y la API de eventos.

<table>
  <tr>
    <th></th>
    <th>Observable</th>
    <th>Events API</th>
  </tr>
  <tr>
    <td>Creation & cancellation</td>
    <td>
<pre>// Setup
const clicks$ = fromEvent(buttonEl, ‘click’);
// Begin listening
const subscription = clicks$
  .subscribe(e => console.log(‘Clicked’, e))
// Stop listening
subscription.unsubscribe();</pre>
   </td>
   <td>
<pre>function handler(e) {
  console.log(‘Clicked’, e);
}
// Setup & begin listening
button.addEventListener(‘click’, handler);
// Stop listening
button.removeEventListener(‘click’, handler);
</pre>
    </td>
  </tr>
  <tr>
    <td>Subscription</td>
    <td>
<pre>observable.subscribe(() => {
  // notification handlers here
});</pre>
    </td>
    <td>
<pre>element.addEventListener(eventName, (event) => {
  // notification handler here
});</pre>
    </td>
  </tr>
  <tr>
    <td>Configuration</td>
    <td>Listen for keystrokes, but provide a stream representing the value in the input.
<pre>fromEvent(inputEl, 'keydown').pipe(
  map(e => e.target.value)
);</pre>
    </td>
    <td>Does not support configuration.
<pre>element.addEventListener(eventName, (event) => {
  // Cannot change the passed Event into another
  // value before it gets to the handler
});</pre>
    </td>
  </tr>
</table>


## Observables en comparación con arrays

Un observable produce valores a lo largo del tiempo. Se crea un array como un conjunto estático de valores. En cierto sentido, los observables son asíncronos mientras que los arrays son síncronos. En los siguientes ejemplos, ➞ implica entrega de valor asíncrono.

<table>
  <tr>
    <th></th>
    <th>Observable</th>
    <th>Array</th>
  </tr>
  <tr>
    <td>Given</td>
    <td>
      <pre>obs: ➞1➞2➞3➞5➞7</pre>
      <pre>obsB: ➞'a'➞'b'➞'c'</pre>
    </td>
    <td>
      <pre>arr: [1, 2, 3, 5, 7]</pre>
      <pre>arrB: ['a', 'b', 'c']</pre>
    </td>
  </tr>
  <tr>
    <td><pre>concat()</pre></td>
    <td>
      <pre>concat(obs, obsB)</pre>
      <pre>➞1➞2➞3➞5➞7➞'a'➞'b'➞'c'</pre>
    </td>
    <td>
      <pre>arr.concat(arrB)</pre>
      <pre>[1,2,3,5,7,'a','b','c']</pre>
    </td>
  </tr>
  <tr>
    <td><pre>filter()</pre></td>
    <td>
      <pre>obs.pipe(filter((v) => v>3))</pre>
      <pre>➞5➞7</pre>
    </td>
    <td>
      <pre>arr.filter((v) => v>3)</pre>
      <pre>[5, 7]</pre>
    </td>
  </tr>
  <tr>
    <td><pre>find()</pre></td>
    <td>
      <pre>obs.pipe(find((v) => v>3))</pre>
      <pre>➞5</pre>
    </td>
    <td>
      <pre>arr.find((v) => v>3)</pre>
      <pre>5</pre>
    </td>
  </tr>
  <tr>
    <td><pre>findIndex()</pre></td>
    <td>
      <pre>obs.pipe(findIndex((v) => v>3))</pre>
      <pre>➞3</pre>
    </td>
    <td>
      <pre>arr.findIndex((v) => v>3)</pre>
      <pre>3</pre>
    </td>
  </tr>
  <tr>
    <td><pre>forEach()</pre></td>
    <td>
      <pre>obs.pipe(tap((v) => {
  console.log(v);
}))
1
2
3
5
7</pre>
    </td>
    <td>
      <pre>arr.forEach((v) => {
  console.log(v);
})
1
2
3
5
7</pre>
    </td>
  </tr>
  <tr>
    <td><pre>map()</pre></td>
    <td>
      <pre>obs.pipe(map((v) => -v))</pre>
      <pre>➞-1➞-2➞-3➞-5➞-7</pre>
    </td>
    <td>
      <pre>arr.map((v) => -v)</pre>
      <pre>[-1, -2, -3, -5, -7]</pre>
    </td>
  </tr>
  <tr>
    <td><pre>reduce()</pre></td>
    <td>
      <pre>obs.pipe(reduce((s,v)=> s+v, 0))</pre>
      <pre>➞18</pre>
    </td>
    <td>
      <pre>arr.reduce((s,v) => s+v, 0)</pre>
      <pre>18</pre>
    </td>
  </tr>
</table>
