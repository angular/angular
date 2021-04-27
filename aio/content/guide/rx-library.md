# La Librería de RxJS

La programación Reactiva es un paradigma de programación asincrónico interesado en los flujos de datos y la propagación al cambio ([Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)). RxJS (Por sus siglas en Inglés, "Reactive Extensions for JavaScript") es una librería para programación reactiva usando obvservables que hacen más fácil la creación de código asincrono o basado en callbacks. Ver ([RxJS Docs](https://rxjs.dev/guide/overview)).

RxJS proporciona una implementación del tipo `Observable`, el cual es necesitado hasta que el tipo de dato sea parte del lenguaje y hasta que los navegadores ofrezcan un soporte. La librería también proporciona funciones de utilería para la creación y trabajo con observables. Dichas funciones de utilería pueden ser usadas para:

* Convertir código existente para operaciones asíncronas en observables.
* Iterar a través de valores en un flujo de datos.
* Mappear valores en tipos de datos diferentes.
* Filtrar flujos de datos.
* Composición de múltiplos flujos.

## Creación de funciones observables

RxJS ofrece un sin fin de funciones que pueden ser usadas para crear nuevos observables. Estas funciones pueden simplificar el proceso de creación de observables desde cosas como eventos, temporizadores, promesas, etc. Por ejemplo:

<code-example path="rx-library/src/simple-creation.ts" region="promise" header="Crear un observable desde una promesa"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="interval" header="Crear un observable desde un contador"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="event" header="Crear un observable desde un evento"></code-example>

<code-example path="rx-library/src/simple-creation.ts" region="ajax" header="Crear un observable que crea una petición AJAX"></code-example>

{@a operators}
## Operadores

Los operadores son funciones que construyen sobre la fundación de los observables para tener una manipulación más sofisticada de las colecciones. Por ejemplo, RxJS define operadores como `map()`, `filter()`, `concat()`, y `flatMap()`.

Los operadores toman las opciones de configuración y después regresan una función que toma la fuente observable. Cuando ejecutamos esta función regresada, el operador observa los valores fuente emitidos por el observable, los transforma y regresa un nuevo observable de esos valores transformados. Aquí un ejemplo sencillo:

<code-example path="rx-library/src/operators.ts" header="Operador Map"></code-example>

Puedes usar _pipes_ para enlazar más de un operador. Los Pipes te permiten combinar múltiples funciones en una sola. La función `pipe()` tiene como argumentos las funciones que quieres que combine y regresa una nueva función que, una vez ejecutada, corre las funciones en una sequencia.

Un conjunto de operadores aplicados a un observable no es más que una receta la cuál, es un conjunto de instrucciones para producir los valores que te interesan. Por sí misma, esta receta no hace nada. Necesitarás llamar a la función `subscribe()` para producir un resultado a través dicha receta.

A continuación un ejemplo:

<code-example path="rx-library/src/operators.1.ts" header="Función pipe autónoma"></code-example>

La función `pipe()` es también un `Observable` en RxJS, así que usas esta manera más sencilla para definir la misma operación:

<code-example path="rx-library/src/operators.2.ts" header="Función Observable.pipe"></code-example>

### Operadores Comunes

RxJS propociona muchos operadores pero solo algunos se usan con frecuencia. Para una lista de los operadores y su uso visita la [Documentación de RxJS](https://rxjs.dev/api).

<div class="alert is-helpful">
  Nota: Para aplicaciones creadas con Angular preferiremos combinar operadores con pipes, en lugar de hacer cadenas. El encadenamiento es usado en muchos ejemplos de RxJS.
</div>

| Area | Operador |
| :------------| :----------|
| Creación |  `from`,`fromEvent`, `of` |
| Combinación | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtrado| `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil` |
| Transformación | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap` |
| Utilería | `tap` |
| Multidifusión | `share` |

## Manejo de Errores

En adición con el manejador de `error()` que te ayuda con la subscripción, RxJS proporciona el operador `catchError` que te permite manejar los errores conocidos en un medio de observables.

Por ejemplo, supongamos que tienes un observable que hace una petición a una API y mapea la respuesta de un servidor. Si el servidor regresa un error o el valor no existe entonces se produciría un error. Si hacemos un catch de este error y le proporcionamos un valor por defecto entonces el flujo continuará, en lugar de simplemente mandarnos un error.


Aquí un ejemplo de como usar el operador `catchError` para hacer esto:

<code-example path="rx-library/src/error-handling.ts" header="Operador catchError"></code-example>

### Observable de reintentos fallidos

Donde el operador `catchError` ayuda a crear un camino simple para recuperarnos, el operador `retry` te permite reintentar una petición fallida.

Usa el operador `retry` antes del operador `catchError`. Dicho operador te re-subscribe a la fuente original del observable, la cual puede re-ejecutar una secuencia llena de acciones que resultaron en el error en primer lugar. Si esto incluye una petición HTTP, entonces el operador reintentará hacer la petición HTTP.

En el siguiente ejemplo usamos el ejemplo anterior pero ahora intentamos hacer la petición primero antes de obtener el error.

<code-example path="rx-library/src/retry-on-error.ts" header="Operador retry"></code-example>

<div class="alert is-helpful">

   No intentar hacer peticiones con una **autenticación** , ya que estas deben ser inicialiadas por una acción del usuario. No nos gustaría bloquear cuentas de usuario con solicitudes de inicio de sesión repetidas que el mismo usuario no ha iniciado.

</div>

## Nombrando convenciones para los observables

Debido a que en su mayoría las aplicaciones de Angular están escritas en TypeScript, típicamente sabrás cuando una variable es un observable. Aunque el framework de Angular no impone una convención de nombrado de observables, frecuentemente veras a los observables nombrados con el signo de “$” al final.

Esto puede llegar a ser muy útil cuando escaneamos rapidamente el código y miramos el valor de los observables. Además,  si quieres tener una propiedad para almacenara el valor más reciente de un observable entonce puede ser muy conveniente simplemente usar el nombre con o sin el “$”.

Por ejemplo:

<code-example path="rx-library/src/naming-convention.ts" header="Nombrando observables"></code-example>
