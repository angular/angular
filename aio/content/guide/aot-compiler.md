# Compilación anticipada (AOT)

Una aplicación Angular consta principalmente de componentes y sus plantillas HTML. Los componentes y plantillas proporcionados por Angular no pueden ser entendidos por el navegador directamente, las aplicaciones en Angular requieren un proceso de compilación antes de que puedan correr en un navegador.

La [compilación anticipada de Angular (AOT)](guide/glossary#aot) convierte plantillas y código de TypeScript en eficiente código JavaScript durante la fase de construcción _antes_ de que el navegador descargue y corra el código. Compilando tu aplicación durante el proceso de construcción se proporciona una renderización más rápida en el navegador.

Esta guía explica como especificar metadatos y aplicar las opciones del compilador disponibles para compilar aplicaciones eficientemente usando la compilación anticipada (AOT).

<div class="alert is-helpful">

  <a href="https://www.youtube.com/watch?v=anphffaCZrQ">Mira a Alex Rickabaugh explicando el compilador de Angular en AngularConnect 2019.

</div>

{@a why-aot}

Aquí algunas razones por las qué podrías querer usar AOT.

* *Renderizado más rápido*
   Con AOT, el navegador descarga una versión pre compilada de una aplicación.
   El navegador carga el código ejecutable para que pueda renderizar la aplicación inmediatamente, sin esperar a compilar la aplicación primero.

* *Menos solicitudes asincrónicas*
   El compilador _inserta_ plantillas HTML y hojas de estilo CSS externas dentro de la aplicación JavaScript, eliminando solicitudes ajax separadas para esos archivos fuente.

* *Angular pesa menos*
   No existe necesidad de incluir el compilador de Angular si la aplicación ya esta compilada.
   El compilador es aproximadamente la mitad de Angular en si mismo, así que omitíendolo se reduce drásticamente el peso de la aplicación.

* *Detecte errores en platillas antes*
   El compilador AOT detecta y reporta errores de enlace de datos en plantillas durante el paso de construcción antes que los usuarios puedan verlos.

* *Mejor seguridad*
   AOT compila las plantillas HTML y componentes en archivos JavaScript mucho antes de que se sirvan a el cliente.
   Sin plantillas para leer y sin evaluaciones de JavaScript o HTML del lado del cliente riesgosas, existen pocas oportunidades para ataques de inyección.

{@a overview}

## Eligiendo un compilador.

Angular ofrece dos formas para compilar tu aplicación:

* **_Just-in-Time_ (JIT)**, cuando compila tu aplicación en el navegador en tiempo de ejecución. Este fué el modo de compilación por defecto hasta Angular 8.
* **_Ahead-of-Time_ (AOT)**, cuando compila tu aplicación y librerías en el tiempo de construcción. Este es el modo de compilación por defecto desde Angular 9.

Cuando ejecutas los comandos del CLI [`ng build`](cli/build) (solo construcción) o [`ng serve`](cli/serve) (construye y sirve localmente), el tipo de compilación (JIT o AOT) depende del valor de la propiedad `aot` en tu configuración de construcción especificada en el archivo `angular.json`. Por defecto, `aot` esta establecido en `true` para nuevas aplicaciones.

Mira la [referencia de comandos del CLI](cli) y [Construyendo y sirviendo Angular apps](guide/build) para más información.

## Como funciona AOT

El compilador de Angular AOT extrae **metadatos** para interpretar las partes de la aplicación que se supone que Angular maneja.
Puedes especificar los metadatos explícitamente en **decoradores** como `@Component()` y `@Input()`, o implícitamente en las declaraciones del constructor de las clases decoradas.
Los metadatos le dicen a Angular como construir instancias de clases e interactuar con ellas en tiempo de ejecución.

En el siguiente ejemplo, los metadatos de `@Component()` y el constructor le dicen a Angular como crear y mostrar una instancia de `TypicalComponent`.

```typescript
@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data.name}}</div>'
)}
export class TypicalComponent {
  @Input() data: TypicalData;
  constructor(private someService: SomeService) { ... }
}
```

El compilador de Angular extrae los metadatos _una_ vez y genera una _fabrica_ para `TypicalComponent`.
Cuando este necesita crear una instancia de `TypicalComponent`, Angular llama a la fabrica, el cuál produce un nuevo elemento visual, vinculado a una nueva instancia la clase del componente con su dependencia inyectada.

### Fases de compilación

Existen tres fases de compilación en AOT.

* Fase 1: *análisis de código*
   En esta fase, el compilador de TypeScript y el *recolector AOT* crea una representación de la fuente. El recolector no intenta interpretar los metadatos recopilados. Estos representan los metadatos lo mejor que pueden y registra errores cuando este detecta un violación de sintaxis en los metadatos.

* Fase 2: *generación de código*
   En esta fase, el `StaticReflector` del compilador interpreta los metadatos recolectados en la fase 1, realiza validaciones adicionales de los metadatos y lanza un error si este detecta una violación de la restricción de metadatos.

* Fase 3: *verificación de tipos en plantillas*
   Esta fase es opcional, el *compilador de plantillas* de Angular usa el compilador de Typescript para validar las expresiones de enlaces de datos en las plantillas. Puedes habilitar esta fase explícitamente configurando la opción `fullTemplateTypeCheck`; revisa [Opciones del Compilador Angular](guide/angular-compiler-options).


### Restricciones de los metadatos

Escribe metadatos en un _subconjunto_ de TypeScript que debe cumplir las siguientes restricciones generales:

* Limita la [sintaxis de expresiones](#expression-syntax) al subconjunto soportado de JavaScript.
* Solo haz referencia a los símbolos exportados después del [plegado de código](#code-folding).
* Solo llame [funciones compátibles](#supported-functions) por el compilador.
* Miembros de clase decorados y con enlaces de datos deben ser públicos.

Para guías e instrucciones adicionales al preparar una aplicación para compilación anticipada (AOT), revise [Angular: Writing AOT-friendly applications](https://medium.com/sparkles-blog/angular-writing-aot-friendly-applications-7b64c8afbe3f).

<div class="alert is-helpful">

Los errores en compilación anticipada (AOT) comúnmente ocurren debido a que los metadatos no se ajustan a los requisitos del compilador (como se describen con más detalle a continuación).
Para ayudar a entender y resolver estos problemas, revisa [Errores de metadatos en AOT](guide/aot-metadata-errors).

</div>

### Configurando la compilación anticipada (AOT).

Puedes proporcionar opciones en el [archivo de configuración de TypeScript](guide/typescript-configuration) que controlan el proceso de compilación. Revisa [las opciones de compilación de Angular](guide/angular-compiler-options) para una lista completa de opciones disponibles.

## Fase 1: Análisis de código.

El compilador de TypeScript realiza parte del trabajo analítico en la primer fase. Este emite los _archivos de definición de tipos_ `.d.ts` con el tipo de información que el compilador AOT necesita para generar el código de la aplicación.
Al mismo tiempo, el **recolector** AOT analiza los metadatos registrados en los decoradores de Angular y genera información de metadatos en archivos **`.metadata.json`**, uno por archivo `.d.ts`.

Puedes pensar en `.metadata.json` como un diagrama de la estructura general de los metadatos de un decorador, representados como un [árbol de sintaxis abstracta (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

<div class="alert is-helpful">

El [schema.ts](https://github.com/angular/angular/blob/master/packages/compiler-cli/src/metadata/schema.ts) de Angular describe el formato JSON como una colección de interfaces de TypeScript.

</div>

{@a expression-syntax}
### Limitaciones del sintaxis de expresión.

El recolector de AOT solo entiende un subconjunto de JavaScript.
Defina objetos de metadatos con la siguiente sintaxis limitada:

<style>
  td, th {vertical-align: top}
</style>

<table>
  <tr>
    <th>Sintaxis</th>
    <th>Ejemplo</th>
  </tr>
  <tr>
    <td>Objeto literal </td>
    <td><code>{cherry: true, apple: true, mincemeat: false}</code></td>
  </tr>
  <tr>
    <td>Colección literal  </td>
    <td><code>['cherries', 'flour', 'sugar']</code></td>
  </tr>
  <tr>
    <td>Operador spread en colección literal</td>
    <td><code>['apples', 'flour', ...the_rest]</code></td>
  </tr>
   <tr>
    <td>Llamadas</td>
    <td><code>bake(ingredients)</code></td>
  </tr>
   <tr>
    <td>Nuevo</td>
    <td><code>new Oven()</code></td>
  </tr>
   <tr>
    <td>Acceso a propiedades</td>
    <td><code>pie.slice</code></td>
  </tr>
   <tr>
    <td>Indices de colección</td>
    <td><code>ingredients[0]</code></td>
  </tr>
   <tr>
    <td>Referencia de identidad</td>
    <td><code>Component</code></td>
  </tr>
   <tr>
    <td>Una plantilla de cadena</td>
    <td><code>`pie is ${multiplier} times better than cake`</code></td>
   <tr>
    <td>Cadena literal</td>
    <td><code>pi</code></td>
  </tr>
   <tr>
    <td>Numero literal</td>
    <td><code>3.14153265</code></td>
  </tr>
   <tr>
    <td>Booleano literal</td>
    <td><code>true</code></td>
  </tr>
   <tr>
    <td>Nulo literal</td>
    <td><code>null</code></td>
  </tr>
   <tr>
    <td>Soporte a operador prefijo</td>
    <td><code>!cake</code></td>
  </tr>
   <tr>
    <td>Soporte a operaciones binarias</td>
    <td><code>a+b</code></td>
  </tr>
   <tr>
    <td>Operador condicional</td>
    <td><code>a ? b : c</code></td>
  </tr>
   <tr>
    <td>Paréntesis</td>
    <td><code>(a+b)</code></td>
  </tr>
</table>

Si una expresión usa sintaxis no compatible, el recolector escribe un error de nodo en el archivo `.metadata.json`.
El compilador luego reporta el error si necesita esa pieza de metadatos para generar el código de la aplicación.

<div class="alert is-helpful">

 Si quieres que `ngc` reporte errores de sintaxis inmediatamente en lugar de producir un archivo `.metadata.json` con errores, configurá la opción `strictMetadataEmit` en el archivo de configuración de TypeScript.

```
  "angularCompilerOptions": {
   ...
   "strictMetadataEmit" : true
 }
 ```

Las librerías de Angular tienen esta opción para asegurar que todo los archivos `.metadata.json` están limpios y es una buena practica hacer lo mismo cuando construimos nuestras propias librerías.

</div>

{@a function-expression}
{@a arrow-functions}
### Sin funciones flecha

El compilador AOT no soporta [expresiones de función](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function) y [funciones  flecha](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function), tampoco las funciones llamadas _lambda_.

Considere el siguiente decorador del componente:

```typescript
@Component({
  ...
  providers: [{provide: server, useFactory: () => new Server()}]
})
```

El recolector de AOT no soporta la función tipo flecha, `() => new Server()`, en una expression de los metadatos.
Esto genera un error de nodo en lugar de la función.
Cuando el compilador posteriormente interpreta  este nodo, este reporta un error que invita a convertir la función flecha en una _función exportada_.

Puedes arreglar este error convirtiendo a esto:

```typescript
export function serverFactory() {
  return new Server();
}

@Component({
  ...
  providers: [{provide: server, useFactory: serverFactory}]
})
```

En la version 5 y posterior, el compilador realiza automáticamente esta re escritura mientras emite el archivo `.js`.

{@a exported-symbols}
{@a code-folding}
### Plegado de código (code folding)

El compilador puede solo resolver referencias a símbolos **_exportados_**.
El recolector sin embargo, puede evaluar una expresión durante la recolección y registrar el resultado en el `.metadata.json`, en vez de la expresión original.
Esto permite hacer un uso limitado de símbolos no exportados dentro de expresiones.

Por ejemplo, el recolector puede evaluar la expresión `1 + 2 + 3 + 4` y remplazarlo con el resultado, `10`.
El proceso es llamado _plegado_. Una expresión que puede se reducida de esta manera es _plegable_.

{@a var-declaration}
El recolector puede evaluar referencias hacia el modulo local, declaraciones `const` e inicializadas en `var` y `let` efectivamente son removidas del archivo `.metadata.json`.

Considere la siguiente definición del componente:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

El compilador no podría referirse hacia la constante `template` por que esta no ha sido exportada.
El recolector sim embargo, puede encontrar la constante `template` dentro de la definición de metadatos insertando su contenido.
El efecto es el mismo como si hubieras escrito:

```typescript
@Component({
  selector: 'app-hero',
  template: '<div>{{hero.name}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

No hay una referencia a `template` y por lo tanto nada que moleste al compilador cuando posteriormente interprete las salidas del recolector en el archivo `.metadata.json`.

Puedes tomar este ejemplo un paso más allá para incluir la constante `template` en otra expresión:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero.title}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

El recolector reduce esta expresión a su equivalente cadena _plegada_:

```
'<div>{{hero.name}}</div><div>{{hero.title}}</div>'
```

#### Sintaxis plegable

La siguiente tabla describe cuales expresiones el recolector puede y no puede encontrar:

<style>
  td, th {vertical-align: top}
</style>

<table>
  <tr>
    <th>Sintaxis</th>
    <th>Plegable</th>
  </tr>
  <tr>
    <td>Objeto literal </td>
    <td>si</td>
  </tr>
  <tr>
    <td>Colección literal </td>
    <td>si</td>
  </tr>
  <tr>
    <td>Operador spread en colección literal</td>
    <td>no</td>
  </tr>
   <tr>
    <td>Llamadas</td>
    <td>no</td>
  </tr>
   <tr>
    <td>Nuevo</td>
    <td>no</td>
  </tr>
   <tr>
    <td>Acceso a propiedades<</td>
    <td>si, si el objetivo es plegable</td>
  </tr>
   <tr>
    <td>Indices de colección</td>
    <td>si, si el objetivo y el indice es plegable</td>
  </tr>
   <tr>
    <td>Referencia de identidad</td>
    <td>si, si es una referencia a una local</td>
  </tr>
   <tr>
    <td>Una plantilla sin sustituciones</td>
    <td>si</td>
  </tr>
   <tr>
    <td>Una plantilla con sustituciones</td>
    <td>si, si las sustituciones son plegables</td>
  </tr>
   <tr>
    <td>Cadena literal</td>
    <td>si</td>
  </tr>
   <tr>
    <td>Numero literal</td>
    <td>si</td>
  </tr>
   <tr>
    <td>Booleano literal</td>
    <td>si</td>
  </tr>
   <tr>
    <td>Nulo literal</td>
    <td>si</td>
  </tr>
   <tr>
    <td>Soporte a operador prefijo </td>
    <td>si, si el operador es plegable</td>
  </tr>
   <tr>
    <td>Soporte a operador binario </td>
    <td>si, si ambos tanto el izquierda y derecha con plegables</td>
  </tr>
   <tr>
    <td>Operador condicional</td>
    <td>si, si la condición es plegable </td>
  </tr>
   <tr>
    <td>Paréntesis</td>
    <td>si, si la expresión es plegable</td>
  </tr>
</table>


Si es una expresión no plegable, el recolector lo escribe a `.metadata.json` como un [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) para que el compilador lo resuelva.


## Fase 2: generación de código

El recolector no hace ningún intento para entender los metadatos que se recolectarón y las envía a `.metadata.json`.
Esto representa los metadatos lo mejor que puede y registra errores cuando detecta una violación de sintaxis en los metadatos.
Es el trabajo del compilador interpretar el `.metadata.json` en la fase de generación de código.

El compilador entiende toda las formas de sintaxis que el recolector soporta pero puede rechazar metadatos _sintácticamente_ correctos si la _semántica_ viola reglas del compilador.

### Símbolos públicos

El compilador puede solo referirse a _símbolos exportados_.

* Los atributos de la clase que tienen un decorador deben ser públicos. No puedes hacer que una propiedad  `@Input()` sea privada o protegida.
* Las propiedades enlazadas a datos también deben ser publicas.

```typescript
// BAD CODE - title is private
@Component({
  selector: 'app-root',
  template: '<h1>{{title}}</h1>'
})
export class AppComponent {
  private title = 'My App'; // Bad
}
```

{@a supported-functions}

### Clases y funciones compatibles

El recolector puede representar una función o la creación de un objeto con `new` mientras la sintaxis sea valida.
El compilador, sin embargo, puede posteriormente rechazar a generar una llamada hacia una función _particular_ o la creación de un objeto _particular_.

El compilador puede solo crea instancias de ciertas clases, compatibles solo con decoradores centrales y solo compatibles con llamadas a macros (funciones o métodos estáticos) que retornan expresiones.

* Nuevas instancias
   El compilador solo permite metadatos que crean instancias de las clases `InjectionToken` de `@angular/core`.

* Decoradores soportados
   El compilador solo soporta metadatos del [Modulo de decoradores de Angular en `@angular/core`](api/core#decorators).

* Llamadas a funciones

   Las funciones de fabrica deben ser exportadas.
   El compilador AOT no soporta expresiones lambda ("funciones flecha") para las funciones de fabrica.

{@a function-calls}

### Llamadas a funciones y métodos estáticos.

El recolector acepta cualquier función o método estático que contenga una sola declaración de `return`.
El compilador sin embargo, solo soporta macros (funciones o métodos estáticos) en la forma de funciones y métodos estáticos que retornan una *expression*.

Por ejemplo, considere la siguiente función:

```typescript
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

Puedes llamar a `wrapInArray` en una definición de metadatos porque este retorna el valor de una expresiones qué se ajusta al subconjunto de Javascript restringido del compilador.

Puede usar `wrapInArray()` así:

```typescript
@NgModule({
  declarations: wrapInArray(TypicalComponent)
})
export class TypicalModule {}
```

El compilador trata este uso como si hubieras escrito:

```typescript
@NgModule({
  declarations: [TypicalComponent]
})
export class TypicalModule {}
```

El [`RouterModule`](api/router/RouterModule) de Angular exporta dos métodos estáticos, `forRoot` y `forChild` para ayudar a declarar rutas raíz e hijas.
Revisa el [código fuente](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code") para estos métodos para ver como los macros puede simplificar la configuración de complejos [NgModules](guide/ngmodules).

{@a metadata-rewriting}

### Re escribiendo metadatos

El compilador trata a los objetos literales que contengan los campos `useClass`, `useValue`, `useFactory` y `data` específicamente, convirtiendo la expresión inicializando uno de estos campos en una variable exportada que reemplaza la expresión

Este proceso de rescribir estas expresiones remueve todo las restricciones que pueden estar en el, porque el compilador no necesita conocer el valor de las expresiones solo necesita poder generar una referencia al valor.

Puedes escribir algo como:

```typescript
class TypicalServer {

}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}]
})
export class TypicalModule {}
```

Sin la reescritura, esto sería invalido por que las lambdas no son soportadas y `TypicalServer` no esta exportada.
Para permitirlo, el compilador automáticamente re escribe esto a algo como:

```typescript
class TypicalServer {

}

export const ɵ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: ɵ0}]
})
export class TypicalModule {}
```

Esto permite que el compilador genere una referencia hacia `ɵ0` en la fabrica sin tener que conocer cual es el valor de `ɵ0`.

El compilador hace la reescritura durante la emisión de el archivo `.js`.
Sin embargo, no reescribe el archivo `.d.ts`, entonces TypeScript no lo reconoce como una exportación y esto no interfiere con la API exportada de los módulos ES.


{@a binding-expression-validation}

## Fase 3: Verificación de tipos en las plantillas

Una de las características más útiles del compilador de Angular es la habilidad de comprobar el tipado de las expresiones dentro de las plantillas y capturar cualquier error antes de que ellos causen fallas en tiempo de ejecución.

En la fase de verificación de tipos en las plantillas, el compilador de plantillas de Angular usa a el compilador de TypeScript para validar las expresiones con enlazadas a datos en las plantillas.

Habilite esta fase explícitamente agregando la opción del compilador `"fullTemplateTypeCheck"` en las `"angularCompilerOptions"` del archivo de configuración del proyecto TypeScript (mira [Opciones del compilador de Angular](guide/angular-compiler-options)).

<div class="alert is-helpful">

En [Angular Ivy](guide/ivy), la verificación de tipos para las plantillas a sido completamente reescrita para ser más capaz así como más estricto, esto significa poder capturar una variedad de nuevos errores que antes el verificador de tipos no podia detectar.

Como resultado, las plantillas que previamente se compilarón bajo `View Engine` pueden fallar con el verificador de tipos bajo `Ivy`. Esto puede pasar por que el verificador de Ivy captura errores genuinos o porque el código de la aplicación no esta tipado correctamente o porque la aplicación usa librerías en las cuales el tipado es incorrecto o no es lo suficientemente especifico.

Este verificador de tipos estricto no esta habilitado por defecto el la version 9 pero puedes habilitarlo configurando la opción `strictTemplates`.
Nosotros esperamos hacer que el verificador de tipos estricto este habilitado por defecto en el futuro.

Para más información acerca de las opciones del verificador de tipos y más acerca de mejoras hacia la verificación de tipos en plantillas en la version 9 en adelante, mira [Verificando tipos en plantillas](guide/template-typecheck).

</div>

La validación de templates produce mensajes de error cuando un error de tipo es detectado en una plantilla con una expresión con enlace de datos, similar a como los errores de tipado son reportados por el compilador de TypeScript contra el código en un archivo `.ts`.

Por ejemplo, considere el siguiente componente:

```typescript
  @Component({
    selector: 'my-component',
    template: '{{person.addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
```

Esto produce el siguiente error:

```
  my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?
 ```

El archivo reporta el mensaje de error, `my.component.ts.MyComponent.html`, es un archivo sintético generado por el compilador de plantillas que espera que tenga contenido de la clase `MyComponent`.
El compilador nunca escribe un archivo en el disco.
Los números de línea y columna son relativos a la plantilla de cadena en el anotación `@Component` de la clase, `MyComponent` en este caso.
Si un componente usa `templateUrl` en vez de `template`, los errores son reportados en el archivo HTML referenciado por el `templateUrl` en vez de un archivo sintético.

La ubicación del error esta en el inicio del nodo de texto que contiene la expresión interpolada con el error.
Si el error esta en un atributo con enlace de datos como `[value]="person.address.street"`, la ubicación del error es la ubicación del atributo que contiene el error.

La validación usa el verificador de tipos de TypeScript y las opciones suministradas hacia el compilador de TypeScript para controlar qué tan detallada es la validación de tipos.
Por ejemplo, si el `strictTypeChecks` es especificado, el error ```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'``` es reportado así como el mensaje de error anterior.


### Type narrowing

La expresión usada en un directiva `ngIf` es usada para estrechar uniones de tipo en el compilador de plantillas de Angular, de la misma manera que la expresión `if` lo hace en TypeScript.
Por ejemplo, para evitar el error `Object is possibly 'undefined'` en la plantilla de arriba, modifícalo para que solo emita la interpolación si el valor de `person` esta inicializado como se muestra en seguida:


```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.addresss.street}} </span>'
  })
  class MyComponent {
    person?: Person;
  }
```

Usando `*ngIf` permite que el compilador de TypeScript infiera que el atributo `person` usado en la expresión enlanzada nunca séra `undefined`.

Para más información acerca del estrechamiento de tipos de entrada, mira [Coerción del establecedor de entrada](guide/template-typecheck#input-setter-coercion) y [Mejorando el verificar de tipos para directivas personalizadas](guide/structural-directives#directive-type-checks).

### Operador de aserción de tipo nulo

Use el [operador de aserción de tipo nulo](guide/template-expression-operators#non-null-assertion-operator) para reprimir el error `Object is possibly 'undefined'` cuando es inconveniente usar `*ngIf` o cuando alguna restricción en el componente asegura que la expresión siempre es no nula cuando la expresión con enlace de datos es interpolada.

En el siguiente ejemplo, las propiedades `person` y `address` son siempre configuradas juntas, implicando que `address` siempre es no nula si `person` es no nula.
No existe una forma conveniente de describir esta restricción a TypeScript y a el compilador de plantillas pero el error es suprimido en el ejemplo por usar `address!.street`.


```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>'
  })
  class MyComponent {
    person?: Person;
    address?: Address;

    setData(person: Person, address: Address) {
      this.person = person;
      this.address = address;
    }
  }
```

El operador de aserción de tipo nulo debería usarse con moderación ya que la refactorización del componente podría romper esta restricción.

En este ejemplo es recomendable incluir la verificación de `address` en el `*ngIf` como se muestra a continuación:

```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person && address"> {{person.name}} lives on {{address.street}} </span>'
  })
  class MyComponent {
    person?: Person;
    address?: Address;

    setData(person: Person, address: Address) {
      this.person = person;
      this.address = address;
    }
  }
```
