# APIs de Utilidades de Testing

Esta página describe las funciones de testing más útiles de Angular

Las funciones de testing de Angular incluyen la `TestBed` , el `ComponentFixture` y varias funciones que controlan el medio de pruebas

Las clases  [_TestBed_](#testbed-api-summary) y [_ComponentFixture_](#component-fixture-api-summary) se tratan aparte.

Este es un resumen de todas las funciones autocontenidas, en orden de posible utilidad:

<table>
  <tr>
    <th>
      Función
    </th>
    <th>
      Descripción
    </th>
  </tr>


  <tr>
    <td style="vertical-align: top">
      <code>async</code>
    </td>

    <td>
    
      Ejecuta el conjunto de una función test (`it`) o setup (`beforeEach`) desde una _zona de pruebas asíncrona_
      Consulta [esta discusión](guide/testing-components-scenarios#waitForAsync).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>fakeAsync</code>
    </td>

    <td>
    
      Ejecuta el conjunto de un test (`it`) desde una _zona falsa de pruebas asíncrona_ especial, permitiendo un estilo de código de flujo de control lineal. 
      Consulta [esta discusión](guide/testing-components-scenarios#fake-async).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>tick</code>
    </td>

    <td>
    
      Simula el paso del tiempo y completar actividades asíncronas pendientes haciendo flush tanto en el _cronómetro_ como en la _cola de micro-tareas_ desde la _zona falsa de pruebas asíncronas_
    
      <div class="alert is-helpful">
      Algún lector curioso y dedicado quizá disfrute de la lectura de esta extensa publicación en un blog:
      ["_Tasks, microtasks, queues and schedules_"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/).
    
      </div>
    
      Acepta un argumento adicionar que adelanta el reloj virtual según el número especificado de milisegundos, despejando las actividades asíncronas planeadas para ese bloque de tiempo
      
      Consulta [esta discusión](guide/testing-components-scenarios#tick).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
       <code>inject</code>
    </td>

    <td>
    
      Inyecta uno o más servicios desde la `TestBed` inyectora actual hacia una función de test.
      No puede inyectar un servicio proveído por el componente en sí.
      Consulta [debugElement.injector](guide/testing-components-scenarios#get-injected-services).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>discardPeriodicTasks</code>
    </td>

    <td>
    
      Cuando un `fakeAsync()` test finaliza con tareas cronometradas pendientes (llamadas a `setTimeOut` y `setInterval` en cola), el test finaliza con un mensaje de error vacío.
    
      En general, un test debería finalizar sin tareas en cola. Cuando esperamos tareas cronometradas pendientes, llamamos a `discardPeriodicTasks` para hacer flush a la cola de tareas y evitar el error.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>flushMicrotasks</code>
    </td>

    <td>
      Cuando un test `fakeAsync()` finaliza con micro-tareas pendientes como promesas sin resolver, el test finaliza con un mensaje de error vacío
    
      En general, un test debería esperar a que acaben las micro-tareas. Cuando quedan micro-tareas pendientes en cola, llamamos a `flushMicrotasks` para hacer flush a la cola de micro-tareas y evitar el error.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>ComponentFixtureAutoDetect</code>
    </td>

    <td>
      Un token del proveedor que inicia la [detección automática de cambios](guide/testing-components-scenarios#automatic-change-detection).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>getTestBed</code>
    </td>

    <td>
    
      Toma la instancia actual de la `TestBed`.
      Normalmente es innecesaria porque los métodos de clase estáticos de `TestBed` suelen ser suficientes.
      La instancia de `TestBed` muestra algunos miembros menos comunes que no están disponibles como métodos estáticos
      
    </td>
  </tr>
</table>

<hr>

{@a resumen-clase-testbed}

## Resumen de la clase _TestBed_ 

La clase `TestBed`  es una de las utilidades de testing principales de Angular. Su API es bastante grande y puede ser sobrecogedora hasta que la has explorado, ve poco a poco. Puedes leer la parte inicial de esta guía primero para familiarizarte con lo básico antes de intentar aprender toda la API.

La definición del módulo que pasamos a `configureTestingModule` es un subconjunto de las propiedades metadata de `@NgModule`.

<code-example language="javascript">
  type TestModuleMetadata = {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array&lt;SchemaMetadata | any[]&gt;;
  };
</code-example>

{@a metadata-override-object}

Cada método de sobreescribir toma un `MetadataOverride<T>` donde  `T` es el tipo de metadato apropiado para el método, es decir, el parámetro de un `@NgModule`,
`@Component`, `@Directive`, o `@Pipe`.

<code-example language="javascript">
  type MetadataOverride&lt;T&gt; = {
    add?: Partial&lt;T&gt;;
    remove?: Partial&lt;T&gt;;
    set?: Partial&lt;T&gt;;
  };
</code-example>

{@a testbed-métodos}
{@a testbed-api-summary}

La API `TestBed` consiste de métodos de clase estáticos que o actualizan o referencian una instancia global de `TestBed`.

Internamente, todos los métodos estáticos cubren los métodos de la instancia `TestBed` actual, lo cual también es devuelto por la función `getTestBed()`.

Llama a los métodos `TestBed` *desde* un `beforeEach()` para asegurarte de tener un inicio en blanco antes de cada test individual.

Aquí están los métodos estáticos más importantes, en orden de posible utilidad.

<table>
  <tr>
    <th>
      Métodos
    </th>
    <th>
      Descripción
    </th>
  </tr>


  <tr>
    <td style="vertical-align: top">
      <code>configureTestingModule</code>
    </td>

    <td>
    
      Los shims de prueba (`karma-test-shim, `browser-test-shim`) establecen el [medio de pruebas inicial](guide/testing)y un módulo de pruebas por defecto.
      El módulo de pruebas por defecto es configurado con declarativas básicas y algunos servicios sustitutos de Angular que cualquier tester necesitaría.
      
      Llama a `configureTestingModule` para refinar la configuración del módulo de pruebas para un conjunto particular de tests, añadiendo o quitando importes, declaraciones (de componentes, directivas, pipes...) y proveedores.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>compileComponents</code>
    </td>

    <td>
    
      Compila el módulo de testing de forma asíncrona después de que hayas finalizado configurándolo.
      Debes llamar este método si cualquiera de los componentes de módulo de testing tiene una `templateUrl` o `styleUrls`, porque traer templates de componentes y archivos de estilo es obligatoriamente asíncrono.
     
      Consulta [aquí](guide/testing-components-scenarios#compile-components).
      
      Después de llamar a `compileComponents`, la configuración de `TestBed` se congela durante la especificación actual.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>createComponent<T></code>
    </td>

    <td>
    
      Crea una instancia de un componente de tipo `T` basado en la configuración de la `TestBed` actual.
      Despuest de llamar a `compileComponent`, la configuración de `TestBed` se congela durante la especificación actual.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideModule</code>
    </td>
    <td>

      Reemplaza metadatos del `NgModule` proporcionado. Recuerde que los módulos pueden importar otros módulos.
      El método `overrideModule` puede ir hasta el fondo del módulo testing actual para modificar alguno de estos módulos internos
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideComponent</code>
    </td>

    <td>
    
      Reemplaza metadatos para la clase componente dada, la cual puede estar anidada dentro de un módulo interno.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideDirective</code>
    </td>

    <td>
      
      Reemplaza metadatos para la clase directiva dada, la cual puede estar anidada dentro de un módulo interno.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overridePipe</code>
    </td>
    <td>

      Reemplaza metadatos para la clase pipe dada, la cual puede estar anidada dentro de un módulo interno.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      {@a testbed-inject}
      <code>inject</code>
    </td>

    <td>
    
      Trae un servicio del inyector `TestBed` actual.
    
      La función `inject` normalmente es adecuada para esto, pero lanza un error si no puede proveer el servicio
    
      ¿Qué pasa si el servicio es opcional?
     
      El método `TestBed.inject()` toma un segundo parámetro opcional, el objeto para devolver si Angular no encuentra el proveedor (nulo, en este ejemplo):
    
      <code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="testbed-get-w-null" header="app/demo/demo.testbed.spec.ts"></code-example>
    
      Después de llamar a `TestBed.inject`, la configuración de `TestBed` se congela durante la especificación actual.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      {@a testbed-initTestEnvironment}
      <code>initTestEnvironment</code>
    </td>
    <td>

      Inicializa el medio de testing para todo el test run.
    
      Los shims de pruebas (`karma-test-shim`, `browser-test-shim`) lo llaman por ti, así que no suele haber un motivo para usarlo.
      
      Puedes llamar este método _exactamente una vez_. Si debes cambiar este valor por defecto en mitad de un test run, utiliza `resetTestEnvironment` primero.
     
      Especifica el compilador de fábrica Angular, un `PlatformRef` y un módulo por defecto de pruebas de Angular.
      Existen alternativas para plataformas no basadas en navegador en el formulario general siguiente:
      `@angular/platform-<platform_name>/testing/<platform_name>`.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>resetTestEnvironment</code>
    </td>
    <td>

      Resetea el medio de pruebas inicial, incluyendo el módulo de pruebas por defecto.
    
    </td>
  </tr>
</table>

Algunos de los métodos de instancia de `TestBed` no son cubiertos por los métodos estáticos de clase de  `TestBed`. Estos no suelen utilizarse.

{@a component-fixture-api-summary}

## El _ComponentFixture_

 `TestBed.createComponent<T>` crea una instancia de un componente `T` y devuelve un `ComponentFixture` fuertemente tipificado para ese componente

Las propiedades y métodos de `ComponentFixture` permiten acceso al componente, su representación DOM y algunos aspectos del medio Angular.

{@a componentes-fixture-propiedades}

### Propiedades de _ComponentFixture_

Aquí están las propiedades más importantes para testers, en orden de posible utilidad.

<table>
  <tr>
    <th>
      Propiedades
    </th>
    <th>
      Descripción
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>
    
      La instancia de la clase componente creada por `TestBed.createComponent`.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>debugElement</code>
    </td>

    <td>
    
      El `DebugElement` asociado con el elemento raíz del componente.
    
      El `DebugElement` da información sobre el componente y su elemento DOM durante el test y debug.
      
      Es una propiedad crítica para los testers. Los miembros más interesantes están cubiertos [aquí](#debug-element-details).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>
    
      El elemento DOM nativo en la raíz del componente.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>changeDetectorRef</code>
    </td>

    <td>
    
      El `ChangeDetectorRef` para el componente.
     
      El `ChangeDetectorRef` es más valioso cuando testeamos un componente que tiene el  método`ChangeDetectionStrategy.OnPush` o cuando la detección de cambios del componente está bajo tu control programático.
    
    </td>
  </tr>
</table>

{@a componente-fixture-métodos}

### Métodos de _ComponentFixture_

Los métodos fixture hacen que Angular ejecute mejor ciertas tareas  en el árbol de componentes. Llama a estos métodos para iniciar el comportamiento de Angular en respuesta a una acción de usuario simulada.

Aquí están los métodos más útiles para los testers.

<table>
  <tr>
    <th>
      Métodos
    </th>
    <th>
      Descripción
    </th>
  </tr>


  <tr>
    <td style="vertical-align: top">
      <code>detectChanges</code>
    </td>

    <td>
    
      Inicia un ciclo de detección de cambios para el componente.
    
      Llámalo para inicializar el componente (que llama a `ngOnInit`) y después de tu código de pruebas, cambia los valores de propiedad asociados a los datos de los componentes. 
      Angular no puede ver que has cambiado `personComponent.name` y no actualizará el `name` hasta que llames a `detectChanges`.
    
      Ejecuta `checkNoChanges` después para confirmar que no hay actualizaciones circulares, a no se que se llame así: `detectChanges(false)`
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>autoDetectChanges</code>
    </td>

    <td>
    
      Poner esto a `true` cuando quieras que el fixture detecte los cambios automáticamente.
      Set this to `true` when you want the fixture to detect changes automatically.
    
      Cuando autodetect es `true`, el fixture de pruebas llama a `detectChanges` inmediatamente después de crear el componente. Después comprueba los eventos de zona pertinentes y llama a `detectChanges` de forma acorde.
      Cuando tu código de pruebas modifique los valores de propiedad de un componente de forma directa, probablemente tengas que llamar a `fixture.detectChanges` para iniciar las actualizaciones de unificación de datos.
      
      El valor por defecto es `false`. Los testers que prefieren tener un control mayor sobre el comportamiento de pruebas suelen dejarlo en `false`.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>checkNoChanges</code>
    </td>

    <td>
    
      Corre el programa para detectar cambios y asegurarse de que no hay cambios pendientes.
      Lanza una excepción si los hay.
      
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>isStable</code>
    </td>

    <td>
    
      Si el fixture es actualmente estable, devuelve `true`.
      Si hay tareas asíncronas no completadas, devuelve `false`.
      
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>whenStable</code>
    </td>

    <td>
    
      Devuelve una promesa que resuelve cuando el fixture es estable.
      
      Para volver al testing después de completar actividad asíncrona o detección de cambios asíncronos, añade esta promesa.
      
      Consulta [aquí](guide/testing-components-scenarios#when-stable).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>destroy</code>
    </td>

    <td>
    
      Inicia la destrucción del componente
    
    </td>
  </tr>
</table>

{@a debug-elementos-detalles}

#### _DebugElement_

El `DebugElement` proporciona información crucial para la representación DOM de los componentes.

Desde el `DebugElement` del componente test raíz, devuelto por `fixture.debugElement`, puedes llegar a todo elemento y subárbol de componentes del fixture

Aquí están los miembros  `DebugElement`  más útiles para los testers, en orden de posible utilidad:

<table>
  <tr>
    <th>
      Miembro
    </th>
    <th>
      Descripción
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>
      El elemento DOM correspondiente en el navegador (nulo para WebWorkers).
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>query</code>
    </td>

    <td>
      Llamar a `query(predicate: Predicate<DebugElement>)` devuelbe el primer `DebugElement` que coincida con el [predicado](#query-predicate) a cualquier profundidad en el subárbol
     
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>queryAll</code>
    </td>

    <td>
      Llamar a `queryAll(predicate: Predicate<DebugElement>)` devuelve todos los `DebugElements` que coincidan con el [predicado](#query-predicate) a cualquier profundidad en el subárbol
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>injector</code>
    </td>

    <td>
      El inyector de dependecia del host. Por ejemplo, el inyector de la instancia del componente del elemento
      
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>
      La instancia del componente del propio elemento, si tiene.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>context</code>
    </td>

    <td>
    
      Un objeto que provee contexto del padre para este elemento.
      En muchas ocasiones una instancia del componente ancestro gobierna este elemento.
      
      Cuando un elemento se repite en `*ngFor`, el contexto es un `NgForRow` cuya propiedad `$implicit` es el valor de la instancia de la fila. Por ejemplo, el `hero` en *ngFor="let hero of heroes"`.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>children</code>
    </td>

    <td>
    
      Los hijos `DebugElement` inmediatos. Recorre el árbol descendiendo a través de los hijos.
    
      <div class="alert is-helpful">
    
      `DebugElement` también tiene `childNodes`, una lista de objetos `DebugNode`.
      `DebugElement` deriva de los objetos `DebugNode` y suele haber más nodos que elementos. Los tester normalmente ignoran los nodos planos.
    
      </div>
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>parent</code>
    </td>
    <td>

      El `DebugElement` padre. Es nulo si este es el elemento raíz.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>name</code>
    </td>

    <td>
      El tag name del elemento, si es que es un elemento.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>triggerEventHandler</code>
    </td>
    <td>

      Inicia el evento por su nombre si hay un receptor correspondiente en la colección `listeners` del elemento.
      El segundo parámetro es el _objeto evento_ esperado por el handler.
      
      Consulta [aquí](guide/testing-components-scenarios#trigger-event-handler).
    
      Si el evento no tiene un receptor o hay algún problema, considera llamar a `nativeElement.dispatchEvent(eventObject)`.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>listeners</code>
    </td>

    <td>
    
      Los callbacks insertados al `@Output` del componente, sus propiedades y/o las propiedades de evento del elemento.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>providerTokens</code>
    </td>

    <td>
      Los token de búsqueda del inyector de este componente.
      Include el componente en sí mismo además de los tokens que el componente lista en la parte "proveedores" de sus metadatos.
    
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>source</code>
    </td>

    <td>
      Dónde encontrar este elemento en el componente template fuente.
     
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>references</code>
    </td>

    <td>
      Diccionario de objetos asociados a variables locales template (e.g. `#foo`), acuñado por el nombre de la variable local
    
    </td>
  </tr>
</table>

{@a query-predicate}

Los métodos `DebugElement.query(predicate)` y`DebugElement.queryAll(predicate)` toman un predicado que filtra el subárbol del elemento fuente para igualar a `DebugElement`.

El predicado es cualquier método que tome el `DebugElement` y devuelva un valor verdadero.

El siguiente ejemplo encuentra todos los `DebugElement` con una referencia a una variable local template llamada "content":

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="custom-predicate" header="app/demo/demo.testbed.spec.ts"></code-example>

La clase Angular `By` tiene tres métodos estáticos para predicados comunes:

- `By.all` - devuelve todos los elementos
- `By.css(selector)` - devuelve los elementos con selectores CSS coincidentes
- `By.directive(directive)` - devuelve elementos que Angular ha unido a una instancia de la clase directiva.

<code-example path="testing/src/app/hero/hero-list.component.spec.ts" region="by" header="app/hero/hero-list.component.spec.ts"></code-example>

<hr>
