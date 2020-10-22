# Probando servicios


Para comprobar que tus servicios funcionan como deseas, puedes escribir pruebas específicamente para ellos.

<div class="alert is-helpful">

  Para la aplicación de muestra que describe las guías de prueba, consulta la <live-example name="testing" embedded-style noDownload>aplicación de muestra</live-example>.

  Para las funcionalidades de las pruebas en las guías de prueba, consulta las <live-example name="testing" stackblitz="specs" noDownload>pruebas</live-example>.

</div>


Los servicios suelen ser los archivos en los que es mas fácil realizar pruebas unitarias.
 Estas son algunas pruebas unitarias sincrónicas y asincrónicas del `ValueService`
escritas sin ayuda de las utilidades de prueba Angular.

<code-example path="testing/src/app/demo/demo.spec.ts" region="ValueService" header="app/demo/demo.spec.ts"></code-example>

{@a services-with-dependencies}

## Servicios con dependencias

Los servicios a menudo dependen de otros servicios que Angular inyecta en el constructor.
En muchos casos, es fácil crear e _inyectar_ estas dependencias a mano mientras
se llama al constructor del servicio.

El `MasterService` es un ejemplo simple:

<code-example path="testing/src/app/demo/demo.ts" region="MasterService" header="app/demo/demo.ts"></code-example>

`MasterService` delega su único método, `getValue`, al `ValueService` inyectado.

Aquí hay varias formas de probarlo.

<code-example path="testing/src/app/demo/demo.spec.ts" region="MasterService" header="app/demo/demo.spec.ts"></code-example>

La primera prueba crea un `ValueService` con `new` y lo pasa al constructor de `MasterService`.

Sin embargo, inyectar el servicio real rara vez funciona bien, ya que la mayoría de los servicios dependientes son difíciles de crear y controlar.

En su lugar, puedes hacer un mock de la dependencia, usar un valor ficticio o crear un
[espía](https://jasmine.github.io/2.0/introduction.html#section-Spies)
sobre el método del servicio pertinente.

<div class="alert is-helpful">

Utiliza espías, ya que suelen ser la forma más fácil de hacer mocks a los servicios.

</div>

Estas técnicas de prueba estándar son excelentes para hacer pruebas unitarias de servicios de forma aislada.

Sin embargo, casi siempre inyecta servicios en clases de aplicación usando
la inyección de dependencias de Angular y debe tener pruebas que reflejen ese patrón de uso.
Las utilidades de pruebas de Angular facilitan la investigación de cómo se comportan los servicios inyectados.

## Probando los servicios con _TestBed_

Tu aplicación se basa en la [inyección de dependencias (ID)](guide/dependency-injection) de Angular
para crear servicios.
Cuando un servicio tiene un servicio dependiente, la inyección de dependencia busca o crea ese servicio dependiente.
Y si ese servicio dependiente tiene sus propias dependencias, la inyección de dependencia también las encuentra o crea.

Como _consumidor_ de servicios, no te preocupas por nada de esto.
No te preocupes por el orden de los argumentos del constructor o cómo se crean.

Como _probador_ de servicios, debes pensar al menos en el primer nivel de dependencias del servicio
pero _puedes_ dejar que la inyección de dependencia de Angular haga la creación del servicio y se ocupe del orden de los argumentos del constructor
cuando uses la utilidad de prueba `TestBed` para proporcionar y crear servicios.

{@a testbed}

## Angular _TestBed_

El `TestBed` es la más importante de las utilidades de prueba de Angular.
El `TestBed` crea un modulo Angular _test_ construido dinámicamente que emula
un [@NgModule](guide/ngmodules) de Angular.

El método `TestBed.configureTestingModule()` toma un objeto de metadatos que puede tener la mayoría de las propiedades de un [@NgModule](guide/ngmodules).

Para probar un servicio, estableces la propiedad de metadatos de `providers` con un
array de los servicios que probarás o simularás.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-before-each" header="app/demo/demo.testbed.spec.ts (provide ValueService in beforeEach)"></code-example>

Luego inyéctalo dentro de una prueba llamando `TestBed.inject()` con la clase del servicio como argumento.

<div class="alert is-helpful">

**Nota:** `TestBed.get()` quedó obsoleto a partir de la versión 9 de Angular.
Para ayudar a minimizar los cambios importantes, Angular presenta una nueva función llamada `TestBed.inject()`, que deberas usar en su lugar.
Para obtener información sobre la eliminación de `TestBed.get()`,
consulta su entrada en el [Índice de bajas](guide/deprecations#index).

</div>

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-it"></code-example>

O dentro del `beforeEach()` si prefieres inyectar el servicio como parte de tu configuración.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-before-each"> </code-example>

Al probar un servicio con una dependencia, proporcione un mock en el array de `providers`.

En el siguiente ejemplo, el mock es un objeto espía.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="master-service-before-each"></code-example>

La prueba consume ese espía de la misma manera que lo hizo antes.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="master-service-it">
</code-example>

{@a no-before-each}

## Pruebas sin _beforeEach()_

La mayoría de los conjuntos de pruebas en esta guía llaman a `beforeEach()` para establecer las condiciones previas para cada prueba `it()`
y confían en `TestBed` para crear clases e inyectar servicios.

Hay otra escuela de pruebas que nunca llama a `beforeEach()` y prefiere crear clases explícitamente en lugar de usar el `TestBed`.

Así es como podrías reescribir una de las pruebas del `MasterService` en ese estilo.

Empieza poniendo código preparatorio reutilizable en una función _setup_ en lugar de `beforeEach()`.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup"
  header="app/demo/demo.spec.ts (setup)"></code-example>

La función `setup()` devuelve un objeto literal
con las variables, como `masterService`, a las que una prueba podría hacer referencia.
No defines variables _semi-globales_ (por ejemplo, `let masterService: MasterService`)
en el cuerpo de `describe()`.

Luego, cada prueba invoca `setup()` en su primera línea, antes de continuar
con pasos que manipulan al sujeto de prueba y afirman expectativas.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-test"></code-example>

Observe cómo la prueba usa
[_desestructuración de asignación_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
para extraer las variables de configuración que necesita.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup-call">
</code-example>

Muchos desarrolladores sienten que este enfoque es más limpio y explícito que el
que el estilo tradicional `beforeEach()`.

Aunque esta guía de prueba sigue el estilo tradicional y
los [esquemas CLI](https://github.com/angular/angular-cli) predeterminados
generan archivos de prueba con `beforeEach()` y `TestBed`,
no dudes en adoptar _este enfoque alternativo_ en tus propios proyectos.

## Pruebas de servicios HTTP

Los servicios de datos que realizan llamadas HTTP a servidores remotos normalmente inyectan y delegan
al servicio Angular [`HttpClient`](guide/http) para llamadas XHR.

Puedes probar un servicio de datos con un espía `HttpClient` inyectado como lo harías
con cualquier servicio con una dependencia.
<code-example
  path="testing/src/app/model/hero.service.spec.ts"
  region="test-with-spies"
  header="app/model/hero.service.spec.ts (tests with spies)">
</code-example>

<div class="alert is-important">

Los métodos del `HeroService` devuelven `Observables`. Debes
_subscribirte_ a un observable para (a) hacer que se ejecute y (b)
afirmar que el método funciona o no.

El método `subscribe()` toma una callback de éxito (`next`) y una de falla (`error`).
Asegurate de proporcionar _ambas_ callback para capturar errores.
Si no lo haces, se produce un error observable asincrónico no detectado que el
test runner probablemente atribuirá a una prueba completamente diferente.

</div>

## _HttpClientTestingModule_

Las interacciones extendidas entre un servicio de datos y el `HttpClient` pueden ser complejas
y difícil de crear un mock con los espías.

El `HttpClientTestingModule` puede hacer que estos escenarios de prueba sean más manejables.

Si bien el _ejemplo de código_ que acompaña a esta guía muestra `HttpClientTestingModule`,
esta página se remite a la [guía Http](guide/http#testing-http-requests),
que cubre las pruebas con el `HttpClientTestingModule` en detalle.
