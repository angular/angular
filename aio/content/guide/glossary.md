# Glosario

Angular tiene su propio vocabulario. La mayoría de los términos en Angular son palabras comunes en inglés o términos informáticos que tienen un significado específico dentro del sistema Angular.

Este glosario enumera los términos más destacados y algunos menos familiares con definiciones inusuales o inesperadas.

[A](#A) [B](#B) [C](#C) [D](#D) [E](#E) [F](#F) [G](#G) [H](#H) [I](#I)
[J](#J) [K](#K) [L](#L) [M](#M) [N](#N) [O](#O) [P](#P) [Q](#Q) [R](#R)
[S](#S) [T](#T) [U](#U) [V](#V) [W](#W) [X](#X) [Y](#Y) [Z](#Z)

{@a A}

{@a annotation}

## anotaciones

Una estructura que proporciona metadatos para una clase. Ver [decorador](#decorator).

{@a architect}

## architect

Es una herramienta que utiliza la CLI para realizar tareas complejas, como la compilación y la ejecución de pruebas, de acuerdo con una configuración proporcionada.

El architect es un shell que ejecuta un [constructor](#builder) (definido en un [paquete npm](#npm-package)) con una [configuración de destino](#target) dada.

En el [archivo de configuración del espacio de trabajo](guide/workspace-config#project-tool-configuration-options), una sección de "architect" proporciona opciones de configuración para los architects constructores.

Por ejemplo, un constructor incorporado para el linting se define en el paquete `@angular-devkit/build_angular: tslint`, que utiliza la herramienta [TSLint](https://palantir.github.io/tslint/) para realizar el linting, con una configuración especificada en un archivo `tslint.json`.

Utiliza el [comando CLI `ng run`](cli/run) para invocar a un constructor especificando una [configuración de destino](#target) asociada con ese constructor.
Los integradores pueden agregar constructores para permitir que las herramientas y los flujos de trabajo se ejecuten a través de la Angular CLI. Por ejemplo, un constructor personalizado puede reemplazar las herramientas de terceros utilizadas por las implementaciones integradas para los comandos de la CLI, como `ng build` o `ng test`.

## archivo de configuración de TypeScript

Un archivo especifica los archivos raíz y las opciones de compilación necesarias para compilar un proyecto TypeScript. Para obtener más información, consulta [Configuración de TypeScript](/guide/typescript-configuration).

{@a B}

{@a bootstrap}

## bootstrap

Una forma de inicializar e iniciar una aplicación o sistema.

En Angular, el NgModule raíz de una aplicación (`AppModule`) tiene una propiedad `bootstrap` que identifica los [componentes](#component) de nivel superior de la aplicación.
Durante el proceso de arranque, Angular crea e inserta estos componentes en la página web del host `index.html`.
Puedes arrancar varias aplicaciones en el mismo `index.html`. Cada aplicación contiene sus propios componentes.

Obtén más información en [Bootstrapping](guide/bootstrapping).

{@a C}

{@a lazy-load}
{@a lazy-loading}

## carga diferida

Un proceso que acelera el tiempo de carga de la aplicación al dividir la aplicación en múltiples paquetes y cargarlos bajo demanda.
Por ejemplo, las dependencias pueden cargarse de forma diferida según sea necesario en lugar de los módulos [eager-loaded](#eager-loading) que requiere el módulo raíz y, por lo tanto, se cargan en el inicio.

El [enrutador](#router) utiliza la carga diferida para cargar vistas secundarias solo cuando la vista principal está activada.
Del mismo modo, puede crear elementos personalizados que se pueden cargar en una aplicación Angular cuando sea necesario.

{@a differential-loading}

## carga diferencial

Una técnica de compilación que crea dos paquetes para una aplicación. Un paquete más pequeño es para navegadores modernos. Un segundo paquete más grande permite que la aplicación se ejecute correctamente en navegadores más antiguos (como IE11) que no son compatibles con todas las API de navegador modernas.

Obtén más información en la guía de [Implementación](guide/deployment#differential-loading).

{@a dynamic-components}

## carga dinámica de componentes

Una técnica para agregar un componente al DOM en tiempo de ejecución. Requiere que excluya el componente de la compilación y luego lo conecte al marco de detección de cambios y manejo de eventos de Angular cuando lo agrega al DOM.

Consulta también [elemento personalizado](#custom-element), que proporciona una ruta más fácil con el mismo resultado.

{@a eager-loading}

## carga eager

Los NgModules o componentes que se cargan en el lanzamiento se llaman eager-loaded, para distinguirlos de aquellos que se cargan en tiempo de ejecución (carga diferida).

Ver [carga diferida](#lazy-load).

{@a builder}

## constructor

Una función que utiliza la API de [Architect](#architect) para realizar un proceso complejo como "compilar" o "probar".
El código del constructor se define en un [paquete npm](#npm-package).

Por ejemplo, [BrowserBuilder](https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/build_angular/src/browser) ejecuta una compilación de [webpack](https://webpack.js.org/) para un destino de navegador y [KarmaBuilder](https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/build_angular/src/karma) inicia el servidor Karma y ejecuta una compilación de webpack para pruebas unitarias.

El [comando CLI `ng run`](cli/run) invoca un constructor con una [configuración de destino específica](#target). El [archivo de configuración del espacio de trabajo](guide/workspace-config), `angular.json`, contiene configuraciones predeterminadas para los constructores integrados.

{@a aot}

## compilación ahead-of-time (AOT)

La compilación ahead-of-time (AOT) de Angular convierte el código Angular HTML y TypeScript en código JavaScript durante la fase de compilación de una manera eficiente, antes de que el navegador descargue y ejecuta ese código.

Este es el mejor modo de compilación para entornos de producción, con un menor tiempo de carga y un mayor rendimiento en comparación con [compilación just-in-time (JIT)](#jit).

Al compilar tu aplicación utilizando la herramienta de línea de comandos `ngc`, puedes iniciar directamente a una module factory, por lo que no necesitas incluir el compilador Angular en tu paquete de JavaScript.

{@a jit}

## compilación just-in-time (JIT)

El compilador Angular just-in-time (JIT) convierte tu código Angular HTML y TypeScript en código JavaScript eficiente en tiempo de ejecución, como parte del arranque.

La compilación JIT es el valor predeterminado (a diferencia de la compilación AOT) cuando ejecutas los comandos CLI `ng build` y`ng serve` de Angular, y es una buena opción durante el desarrollo.
El modo JIT no se recomienda para el uso en producción porque da como resultado grandes cargas útiles de aplicaciones que dificultan el rendimiento de arranque.

Comparar con [compilación ahead-of-time (AOT)](#aot).

{@a router-component}

## componente de enrutamiento

Un [componente](#component) con una directiva `RouterOutlet` en su plantilla que muestra vistas basadas en la navegación del enrutador.

Obtén más información en [Enrutamiento y navegación](guide/router).

{@a collection}

## colección

En Angular, un conjunto de [esquemas](#schematic) relacionados recogidos en un [paquete npm](#npm-package).

{@a component}

## componente

Una clase con el `@Component()` [decorador](#decorator) que lo asocia con un compañero [plantilla](#template). Juntos, la clase de componente y la plantilla definen una [vista](#view).
Un componente es un tipo especial de [directiva](#directive).
El decorador `@Component()` extiende el decorador `@Directive()` con características orientadas a plantillas.

Una clase de componente Angular es responsable de exponer los datos y manejar la mayor parte de la visualización de la vista y la lógica de interacción del usuario a través de [enlace de datos](#data-binding).

Lee más sobre clases de componentes, plantillas y vistas en [Introducción a los conceptos de Angular](guide/architecture).

{@a configuration}

## configuración

Ver [configuración del espacio de trabajo](#cli-config)

{@a cli-config}

{@a config}

## configuración del espacio de trabajo

Un archivo llamado `angular.json` en el nivel raíz de un [espacio de trabajo](#workspace) Angular proporciona valores predeterminados de configuración de todo el espacio de trabajo y específicos del proyecto para las herramientas de compilación y desarrollo proporcionadas o integradas con la [Angular CLI](#cli).

Para obtener más información, consulta [Configuración del espacio de trabajo](guide/workspace-config).

Las herramientas utilizan archivos de configuración adicionales específicos del proyecto, como `package.json` para el [manejador de paquetes npm](#npm-package), `tsconfig.json` para [TypeScript transpilation](#transpile), y `tslint.json` para [TSLint](https://palantir.github.io/tslint/).

Para obtener más información, consulta [Espacio de trabajo y estructura de archivos de proyecto](guide/file-structure).

{@a form-control}

## control de formulario

Una instancia de `FormControl`, que es un elemento fundamental para los formularios Angular.
Junto con `FormGroup` y `FormArray`, rastrea el valor, la validación y el estado de un elemento de entrada de formulario.

Lee más sobre formularios en [Introducción a los formularios en Angular](guide/forms-overview).

{@a D}

{@a change-detection}

## detección de cambios

El mecanismo por el cual el framework de Angular sincroniza el estado de la interfaz de usuario de una aplicación con el estado de los datos.

El detector de cambios verifica el estado actual del modelo de datos cada vez que se ejecuta y lo mantiene como el estado anterior para compararlo en la siguiente iteración.

A medida que la lógica de la aplicación actualiza los datos de los componentes, los valores que están vinculados a las propiedades DOM en la vista pueden cambiar.
El detector de cambios es responsable de actualizar la vista para reflejar el modelo de datos actual.
Del mismo modo, el usuario puede interactuar con la interfaz de usuario, lo que provoca eventos que cambian el estado del modelo de datos.
Estos eventos pueden desencadenar la detección de cambios.

Usando la estrategia de detección de cambio predeterminada ("CheckAlways"), el detector de cambio pasa por la [jerarquía de vista](#view-tree) en cada turno de VM para verificar cada [propiedad vinculada a datos](#data-binding) en la plantilla. En la primera fase, compara el estado actual de los datos dependientes con el estado anterior y recopila los cambios.
En la segunda fase, actualiza la página DOM para reflejar los nuevos valores de datos.

Si configuras la estrategia de detección de cambios `OnPush` ("CheckOnce"), el detector de cambios se ejecuta solo cuando es [invocado explícitamente](api/core/ChangeDetectorRef), o cuando se activa mediante un cambio de referencia en mediante un `Input` o un controlador de eventos. Esto generalmente mejora el rendimiento. Para obtener más información, consulta [Optimizar la detección de cambios de Angular](https://web.dev/faster-angular-change-detection/).

{@a class-decorator}

## decorador de clase

Un [decorador](#decorator) que aparece inmediatamente antes de una definición de clase, que declara que la clase es del tipo dado y proporciona metadatos adecuados para el tipo.

Los siguientes decoradores pueden declarar tipos de clase Angular:

- `@Component()`
- `@Directive()`
- `@Pipe()`
- `@Injectable()`
- `@NgModule()`

{@a class-field-decorator}

## decorador de campo de clase

Un [decorador](#decorator) declarado inmediatamente antes de un campo en una definición de clase que declara el tipo de ese campo. Algunos ejemplos son `@Input` y `@Output`.

{@a attribute-directive}
{@a attribute-directives}

## directivas de atributos

Una categoría de [directiva](#directive) que puede escuchar y modificar el comportamiento de otros elementos HTML, atributos, propiedades y componentes. Generalmente están representados como atributos HTML, de ahí el nombre.

Obtén más información en [Directivas de atributos](guide/attribute-directives).

{@a structural-directive}
{@a structural-directives}

## directivas estructurales

Una categoría de [directiva](#directive) que es responsable de dar forma al diseño HTML modificando el DOM, es decir, agregando, eliminando o manipulando elementos y sus elementos secundarios.

Obtén más información en [Directivas estructurales](guide/structural-directives).

{@a declarable}

## declarable

Un tipo de clase que puede agregar a la lista de 'declaraciones' de un [NgModule](#ngmodule).
Puedes declarar [componentes](#component), [directivas](#directive), y [pipes](#pipe).

No declares lo siguiente:

- Una clase que ya está declarada en otro NgModule
- Un conjunto de directivas importadas de otro paquete. Por ejemplo, no declarar `FORMS_DIRECTIVES` de `@angular/forms`
- Clases de NgModule
- Clases de servicio
- Clases y objetos no de Angular, como cadenas de texto, números, funciones, modelos de entidad, configuraciones, lógica de negocios y clases auxiliares.

{@a decorator}
{@a decoration}

## decorador | decoración

Una función que modifica una definición de clase o propiedad. Los decoradores (también llamados _anotaciones_) son experimentales (etapa 2) [característica del lenguaje JavaScript](https://github.com/wycats/javascript-decorators).
TypeScript agrega soporte para decoradores.

Angular define decoradores que adjuntan metadatos a clases o propiedades para que sepas qué significan esas clases o propiedades y cómo deberían funcionar.

Consulta [decorador de clase](#class-decorator), [decorador de campo de clase](#class-field-decorator).

{@a directive}
{@a directives}

## directiva

Una clase que puede modificar la estructura del DOM o modificar atributos en el DOM y el modelo de datos de componentes. Una definición de clase directiva está precedida inmediatamente por un [decorador](#decorator) `@Directive()` que proporciona metadatos.

Una clase de directiva generalmente está asociada con un elemento o atributo HTML, y ese elemento o atributo a menudo se conoce como la directiva misma. Cuando Angular encuentra una directiva en una [plantilla](#template) HTML, crea la instancia de clase de directiva coincidente y le da a la instancia control sobre esa parte del DOM del navegador.

Hay tres categorías de directivas:

- [Componentes](#component) usa `@Component()` (una extensión de `@Directive()`) para asociar una plantilla con una clase.

- [Directivas de atributo](#attribute-directive) modifica el comportamiento y la apariencia de los elementos de la página.

- [Directivas estructurales](#structural-directive) modifican la estructura del DOM.

Angular proporciona una serie de directivas integradas que comienzan con el prefijo `ng`.
También puedes crear nuevas directivas para implementar tu propia funcionalidad.
Asocia un _selector_ (una etiqueta HTML como `<my-directive>`) con una directiva personalizada, extendiendo así la [sintaxis de plantilla](guide/template-syntax) que puede usar en tus aplicaciones.

{@a E}

{@a ecma}

## ECMAScript

La [especificación oficial del lenguaje JavaScript](https://es.wikipedia.org/wiki/ECMAScript).

No todos los navegadores son compatibles con el último estándar ECMAScript, pero puedes usar un [transpiler](#transpile) (como [TypeScript](#typescript)) para escribir código utilizando las últimas funciones, que luego se transpilarán al código que se ejecuta en las versiones que son compatibles con los navegadores.

Para obtener más información, consulta [Browser Support](guide/browser-support).

{@a binding}

## enlaces (binding)

En general, es la práctica de establecer una variable o propiedad en un valor de datos. Dentro de Angular, generalmente se refiere a [enlace de datos](#data-binding), que coordina las propiedades del objeto DOM con las propiedades del objeto de datos.

A veces se refiere a una [inyección de dependencia](#dependency-injection) de enlace
entre un [token](#token) y una dependencia de [proveedor](#provider).

{@a data-binding}

## enlace de datos

Un proceso que permite a las aplicaciones mostrar valores de datos a un usuario y responder al usuario acciones (como clics, toques y pulsaciones de teclas).

En el enlace de datos, declara la relación entre un widget HTML y una fuente de datos
y deja que el framework maneje los detalles.

El enlace de datos es una alternativa para insertar manualmente los valores de datos de la aplicación en HTML, adjuntando oyentes de eventos, extrayendo valores modificados de la pantalla y actualizar los valores de los datos de la aplicación.

Lee sobre las siguientes formas de enlace en la [Sintaxis de plantilla](guide/template-syntax) de Angular:

- [Interpolación](guide/interpolation)
- [Enlace de propiedad](guide/property-binding)
- [Enlace de evento](guide/event-binding)
- [Enlace de atributo](guide/attribute-binding)
- [Enlace de clase](guide/attribute-binding#class-binding)
- [Enlace de estilo](guide/attribute-binding#style-binding)
- [Enlace de datos bidireccional con ngModel](guide/built-in-directives#ngModel)

{@a input}

## entrada

Al definir una [directiva](#directive), el decorador `@Input()` en una propiedad directiva
hace que esa propiedad esté disponible como _objetivo_ de un [enlace de propiedad](guide/property-binding).
Los valores de datos fluyen a una propiedad de entrada desde la fuente de datos identificada en la [expresión de plantilla](#template-expression) a la derecha del signo igual.

Obtén más información en [propiedades de entrada y salida](guide/inputs-outputs).

{@a router}
{@a router-module}

## enrutador

Una herramienta que configura e implementa la navegación entre estados y [vistas](#view) dentro de una aplicación Angular.

El módulo `Router` es un [NgModule](#ngmodule) que proporciona los proveedores de servicios y las directivas necesarias para navegar por las vistas de la aplicación. Un [componente de enrutamiento](#router-outlet) es aquel que importa el módulo `Router` y cuya plantilla contiene un elemento `RouterOutlet` donde puede mostrar vistas producidas por el enrutador.

A diferencia de la navegación entre páginas, el enrutador define la navegación entre vistas en una sola página. Interpreta enlaces de tipo URL para determinar qué vistas crear o destruir, y qué componentes cargar o descargar. Te permite aprovechar la [carga diferida](#lazy-load) en las aplicaciones Angular.

Obtén más información en [Enrutamiento y navegación](guide/router).

{@a element}

## elemento

Angular define una clase `ElementRef` para envolver elementos de interfaz de usuario nativos específicos del render.
En la mayoría de los casos, esto le permite usar plantillas de Angular y enlace de datos para acceder a elementos DOM sin referencia al elemento nativo.

La documentación generalmente se refiere a _elementos_ (instancias `ElementRef`), a diferencia de _elementos DOM_ (que se puede acceder directamente si es necesario).

Comparar con [elemento personalizado](#custom-element).

{@a angular-element}

## elemento Angular

Un [componente](#component) Angular empaquetado como un [elemento personalizado](#custom-element).

Obtén más información en [Vista general de Elementos Angular](guide/elements).

{@a custom-element}

## elemento personalizado

Una función de plataforma web, actualmente compatible con la mayoría de los navegadores y disponible en otros navegadores a través de polyfills (consulta [Soporte del navegador](guide/browser-support)).

La característica de elemento personalizado extiende HTML al permitirle definir una etiqueta cuyo contenido es creado y controlado por código JavaScript. Un elemento personalizado (también llamado _componente web_) es reconocido por un navegador cuando se agrega a [CustomElementRegistry](https://developer.mozilla.org/es/docs/Web/API/CustomElementRegistry).

Puedes usar la API para transformar un componente Angular para que pueda registrarse con el navegador y usarse en cualquier HTML que agregue directamente al DOM dentro de una aplicación Angular. La etiqueta de elemento personalizado inserta la vista del componente, con la funcionalidad de detección de cambios y enlace de datos, en contenido que de otro modo se mostraría sin procesamiento Angular.

Ver [Elemento Angular](#angular-element).

Consulta también [carga de componentes dinámicos](#dynamic-components).

{@a schematic}

## esquema

Una librería de andamios que define cómo generar o transformar un proyecto de programación creando, modificando, refactorizando o moviendo archivos y códigos.
Un esquema define [reglas](#rule) que operan en un sistema de archivos virtual llamado [árbol](#file-tree).

La [Angular CLI](#cli) utiliza esquemas para generar y modificar [proyectos Angular](#project) y partes de proyectos.

- Angular proporciona un conjunto de esquemas para usar con la CLI. Consulta la [Referencia de comando de Angular CLI](cli). El comando [`ng add`](cli/add) ejecuta esquemas como parte de agregar una librería a su proyecto. El comando [`ng generate`](cli/generate) ejecuta esquemas para crear aplicaciones, librerías y construcciones de código Angular.

- Los desarrolladores de [Librerías](#library) pueden crear esquemas que permitan a la Angular CLI agregar y actualizar sus blibrerías publicadas y generar artefactos que la librería defina.
  Agregue estos esquemas al paquete npm que usa para publicar y compartir su librería.

Obtén más información en [Esquemas](guide/schematics) e [Integración de librerías con la CLI](guide/creating-libraries#integrating-with-the-cli).

{@a schematics-cli}

## esquema CLI

Los esquemas vienen con su propia herramienta de línea de comandos.
Usando Node 6.9 o superior, instala la CLI de esquemas globalmente:

<code-example language="bash">
npm install -g @angular-devkit/schematics-cli
</code-example>

Esto instala el ejecutable `schematics`, que puedes usar para crear un nuevo esquema [colección](#collection) con un esquema inicial llamado. La carpeta de colección es un espacio de trabajo para esquemas. También puedes usar el comando `schematics` para agregar un nuevo esquema a una colección existente, o extender un esquema existente.

{@a workspace}

## espacio de trabajo

Una colección de [proyectos](#project) Angular (es decir, aplicaciones y librerías) con tecnología de [Angular CLI](#cli) que generalmente se ubican en un único repositorio de control de fuente (como [git](https://git-scm.com/)).

El [comando CLI `ng new`](cli/new) crea un directorio del sistema de archivos (la "raíz del espacio de trabajo"). En la raíz del espacio de trabajo, también crea el espacio de trabajo [archivo de configuración](#configuration) (`angular.json`) y, por defecto, un proyecto de aplicación inicial con el mismo nombre.

Los comandos que crean u operan en aplicaciones y librerías (como `add` y `generate`) deben ejecutarse desde una carpeta de espacio de trabajo.

Para obtener más información, consulta [Configuración del espacio de trabajo](guide/workspace-config).

{@a template-expression}

## expresión de plantilla

Una sintaxis tipo TypeScript que Angular evalúa dentro de un [enlace de datos](#data-binding).

Lee acerca de cómo escribir expresiones de plantilla en la sección [expresiones de plantilla](guide/interpolation#template-expressions) de la guía [Interpolación](guide/interpolation).

{@a F}

{@a template-driven-forms}

## formularios basados en plantillas

Un formato para crear formularios Angular utilizando formularios HTML y elementos de entrada en la vista.
El formato alternativo utiliza el framework [formularios reactivos](#reactive-forms).

Al usar formularios basados en plantillas:

- La "fuente de la verdad" es la plantilla. La validación se define utilizando atributos en los elementos de entrada individuales.
- [Enlace bidireccional](#data-binding) con `ngModel` mantiene el modelo de componente sincronizado con la entrada del usuario en los elementos de entrada.
- Detrás de escena, Angular crea un nuevo control para cada elemento de entrada, siempre que haya configurado un atributo `name` y un enlace bidireccional para cada entrada.
- Las directivas Angular asociadas tienen el prefijo `ng` como `ngForm`, `ngModel` y `ngModelGroup`.

La alternativa es una forma reactiva. Para una introducción y comparación de ambos enfoques de formularios, consulta [Introducción a los formularios Angular](guide/forms-overview).

{@a reactive-forms}

## formularios reactivos

Un framework para construir forularios Angular a través del código en un componente.
La alternativa es un [formulario controlado por plantilla](#template-driven-forms).

Cuando se usan formularios reactivos:

- La "fuente de verdad", el modelo de formulario, se define en la clase de componente.
- La validación se configura mediante funciones de validación en lugar de directivas de validación.
- Cada control se crea explícitamente en la clase de componente creando una instancia de `FormControl` manualmente o con `FormBuilder`.
- Los elementos de entrada de la plantilla _no_ usan `ngModel`.
- Las directivas Angular asociadas tienen el prefijo `form`, como `formControl`, `formGroup` y `formControlName`.

La alternativa es un formulario basado en plantillas. Para una introducción y comparación de ambos enfoques de formularios, consulta [Introducción a los formularios Angular](guide/forms-overview).

{@a unidirectional-data-flow}

## flujo de datos unidireccional

Un modelo de flujo de datos donde el árbol de componentes siempre se verifica en busca de cambios en una dirección (principal a secundario), lo que evita los ciclos en el gráfico de detección de cambios.

En la práctica, esto significa que los datos en Angular fluyen hacia abajo durante la detección de cambios.
Un componente primario puede cambiar fácilmente los valores en sus componentes secundarios porque primero se verifica el primario.
Sin embargo, podría producirse un error si un componente secundario intenta cambiar un valor en su elemento primario durante la detección de cambio (invirtiendo el flujo de datos esperado), porque el componente principal ya se ha procesado.
En modo de desarrollo, Angular arroja el error `ExpressionChangedAfterItHasBeenCheckedError` si tu aplicación intenta hacer esto, en lugar de fallar silenciosamente en representar el nuevo valor.

Para evitar este error, un método [lifecycle hook](guide/lifecycle-hooks) que busca realizar dicho cambio debería desencadenar una nueva ejecución de detección de cambio. La nueva ejecución sigue la misma dirección que antes, pero logra recoger el nuevo valor.

{@a G}

{@a route-guard}

## guard de ruta

Un método que controla la navegación a una ruta solicitada en una aplicación de enrutamiento.
Los guards determinan si una ruta se puede activar o desactivar, y si se puede cargar un módulo con carga diferida.

Obtén más información en [Enrutamiento y navegación](guide/router#preventing-unauthorized-access "Ejemplos").

{@a H}

{@a I}

{@a di}

{@a dependency-injection}

## inyección de dependencia (DI)

Un patrón de diseño y un mecanismo para crear y entregar algunas partes de una aplicación (dependencias) a otras partes de una aplicación que las requieran.

En Angular, las dependencias suelen ser servicios, pero también pueden ser valores, como cadenas o funciones.

Un [inyector](#injector) para una aplicación (creado automáticamente durante el arranque) crea instancias de dependencias cuando sea necesario, utilizando un [proveedor](#provider) configurado del servicio o valor.

Obtén más información en [Inyección de dependencia en Angular](guide/dependency-injection).

{@a command-line-interface-cli}
{@a cli}

## interfaz de línea de comandos (CLI)

[Angular CLI](cli) es una herramienta de línea de comandos para administrar el ciclo de desarrollo Angular. Úsalo para crear la estructura inicial del sistema de archivos para un [espacio de trabajo](#workspace) o [proyecto](#project), y para ejecutar [esquemas](#schematic) que agreguen y modifiquen código para versiones genéricas iniciales de varios elementos. La CLI admite todas las etapas del ciclo de desarrollo, incluidas la construcción, las pruebas, la agrupación y la implementación.

- Para comenzar a usar la CLI para un nuevo proyecto, consulta [Configuración del entorno local](guide/setup-local "Configuración para el desarrollo local").
- Para obtener más información sobre las capacidades completas de la CLI, consulta la [Referencia del comando CLI](cli).

Ver también [Esquemas CLI](#schematics-cli).

{@a immutability}

## inmutabilidad

La capacidad de alterar el estado de un valor después de su creación. [Formularios reactivos](#reactive-forms) realizan cambios inmutables en ese cada cambio en el modelo de datos produce un nuevo modelo de datos en lugar de modificar el existente. [Formularios controlados por plantilla](#template-driven-forms) realizan cambios mutables con `NgModel` y [enlace de datos bidireccional](#data-binding) para modificar el modelo de datos existente en su lugar.

{@a injectable}

## inyectable

Una clase Angular u otra definición que proporciona una dependencia utilizando el mecanismo de [inyección de dependencia](#di). Una clase inyectable de [servicio](#service) debe estar marcada por el [decorador](#decorator) `@Injectable()`. Otros elementos, como valores constantes, también pueden ser inyectables.

{@a injector}

## inyector

Un objeto en el sistema Angular [inyección de dependencia](#dependency-injection) que puede encontrar una dependencia con nombre en su caché o crear una dependencia utilizando un [proveedor](#provider) configurado.
Los inyectores se crean para NgModules automáticamente como parte del proceso de arranque
y se heredan a través de la jerarquía de componentes.

- Un inyector proporciona una instancia singleton de una dependencia, y puede inyectar esta misma instancia en múltiples componentes.

- Una jerarquía de inyectores a nivel de NgModule y componente puede proporcionar diferentes instancias de dependencia a sus propios componentes y componentes secundarios.

- Puedes configurar inyectores con diferentes proveedores que pueden proporcionar diferentes implementaciones de la misma dependencia.

Obtén más información sobre la jerarquía de inyectores en [Inyectores de dependencia jerárquica](guide/hierarchical-dependency-injection).

{@a interpolation}

## interpolación

Una forma de propiedad [enlace de datos](#data-binding) en la que una [expresión de plantilla](#template-expression) entre llaves dobles se representa como texto.
Ese texto se puede concatenar con el texto vecino antes de asignarlo a una propiedad de elemento
o se muestra entre etiquetas de elementos, como en este ejemplo.

```html
<label>Mi héroe actual es {{hero.name}}</label>
```

Lee más en la guía [Interpolación](guide/interpolation).

{@a ivy}

## Ivy

Ivy es el nombre en clave del [canal de compilación y renderización de próxima generación](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7) de Angular.
Con la versión 9 de Angular, el nuevo compilador y las instrucciones de tiempo de ejecución se utilizan de forma predeterminada en lugar del compilador y el tiempo de ejecución más antiguos, conocidos como [View Engine](#ve).

Lee más en [Angular Ivy](guide/ivy).

{@a J}

{@a javascript}

## JavaScript

Ver [ECMAScript](#ecma), [TypeScript](#typescript).

{@a view-tree}

## jerarquía de vistas

Un árbol de vistas relacionadas en el que se puede actuar como una unidad. La vista raíz es la _vista de host_ de un componente. Una vista de host puede ser la raíz de un árbol de _vistas incrustadas_, recopiladas en un _contenedor de vista_ (`ViewContainerRef`) adjunto a un elemento de anclaje en el componente de alojamiento. La jerarquía de vistas es una parte clave de Angular [detección de cambios](#change-detection).

La jerarquía de vistas no implica una jerarquía de componentes. Las vistas que están integradas en el contexto de una jerarquía particular pueden ser vistas de host de otros componentes. Esos componentes pueden estar en el mismo NgModule que el componente de alojamiento o pertenecer a otros NgModules.

{@a K}

{@a L}

{@a dom}

## lenguaje específico de dominio (DSL)

Una librería o API de propósito especial; consulte [lenguaje específico del dominio](https://es.wikipedia.org/wiki/Lenguaje_espec%C3%ADfico_de_dominio).
Angular extiende TypeScript con lenguajes específicos de dominio para varios dominios relevantes para aplicaciones Angular, definidas en NgModules como [animaciones](guide/animations), [formularios](guide/forms), y [enrutamiento y navegación](guide/router).

{@a library}

## Librerías

En Angular, un [proyecto](#project) que proporciona funcionalidad que se puede incluir en otras aplicaciones de Angular.
Una librería no es una aplicación Angular completa y no puede ejecutarse de forma independiente.
Para agregar funcionalidades reutilizables de Angular a aplicaciones web no construidas con Angular, puedes usar Angular [elementos personalizados](#angular-element).)

- Los desarrolladores de librerías pueden usar la [Angular CLI](#cli) para `generar` andamios para una nueva librería en un [espacio de trabajo](#workspace) existente, y pueden publicar una librería como un paquete `npm`.

- Los desarrolladores de aplicaciones pueden usar la [Angular CLI](#cli) para `agregar` una librería publicada para usar con una aplicación en el mismo [espacio de trabajo](#workspace).

Ver también [esquema](#schematic).

{@a lifecycle-hook}

## lifecycle hook

Una interfaz que le permite aprovechar el ciclo de vida de [directivas](#directive) and [componentes](#component) a medida que se crean, actualizan y destruyen.

Cada interfaz tiene un método de enlace único cuyo nombre es el nombre de la interfaz con el prefijo `ng`.
Por ejemplo, la interfaz `OnInit` tiene un método de enlace llamado `ngOnInit`.

Angular llama a estos métodos de enlace en el siguiente orden:

- `ngOnChanges`: Cuando cambia un valor de enlace [entrada](#input)/[salida](#output).
- `ngOnInit`: Después de los primeros `ngOnChanges`.
- `ngDoCheck`: Detección de cambios personalizados del desarrollador.
- `ngAfterContentInit`: Después del contenido del componente inicializado.
- `ngAfterContentChecked`: Después de cada verificación del contenido del componente.
- `ngAfterViewInit`: Después de que se inicializan las vistas de un componente.
- `ngAfterViewChecked`: Después de cada comprobación de las vistas de un componente.
- `ngOnDestroy`: Justo antes de que se destruya la directiva.

Obtén más información en [Lifecycle Hooks](guide/lifecycle-hooks).

{@a M}

{@a form-model}

## modelo de formulario

La "fuente de verdad" para el valor y el estado de validación de un elemento de entrada de formulario en un momento dado. Cuando se usan [formularios reactivos](#reactive-forms), el modelo de formulario se crea explícitamente en la clase de componente. Al utilizar [formularios controlados por plantilla](#template-driven-forms), el modelo de formulario se crea implícitamente mediante directivas.

Obtén más información sobre los formularios reactivos y basados en plantillas en [Introducción a los formularios en Angular](guide/forms-overview).

{@a module}

## módulo

En general, un módulo recopila un bloque de código dedicado a un solo propósito. Angular utiliza módulos JavaScript estándar y también define un módulo Angular, `NgModule`.

En JavaScript (ECMAScript), cada archivo es un módulo y todos los objetos definidos en el archivo pertenecen a ese módulo. Los objetos se pueden exportar, haciéndolos públicos, y los objetos públicos se pueden importar para su uso por otros módulos.

Angular se envía como una colección de módulos JavaScript (también llamados librerías). Cada nombre de librería Angular comienza con el prefijo `@angular`. Instala librerías Angular con el [administrador de paquetes npm](https://docs.npmjs.com/getting-started/what-is-npm) e importa partes de ellas con las declaraciones de JavaScript `import`.

Comparar con [NgModule](#ngmodule).

{@a N}

{@a ngcc}

## ngcc

Compilador de compatibilidad Angular.
Si se crea la aplicación usando [Ivy](#ivy), pero depende de las librerías que no se han compilado con Ivy, la CLI usa `ngcc` para actualizar automáticamente las librerías dependientes para usar Ivy.

{@a ngmodule}

## NgModule

Una definición de clase precedida por el `@NgModule()` [decorador](#decorator), que declara y sirve como manifiesto para un bloque de código dedicado a un dominio de aplicación, un flujo de trabajo o un conjunto de capacidades estrechamente relacionadas.

Al igual que un [módulo JavaScript](#module), un NgModule puede exportar la funcionalidad para que otros NgModules la usen e importar la funcionalidad pública de otros NgModules.
Los metadatos para una clase NgModule recopilan componentes, directivas y canalizaciones que la aplicación usa junto con la lista de importaciones y exportaciones. Ver también [declarable](#declarable).

Los NgModules generalmente llevan el nombre del archivo en el que se define lo exportado. Por ejemplo, la clase [DatePipe](api/common/DatePipe) de Angular pertenece a un módulo de características llamado `date_pipe` en el archivo`date_pipe.ts`. Se importa desde un [paquete con scope](#scoped-package) como `@angular/core`.

Cada aplicación Angular tiene un módulo raíz. Por convención, la clase se llama `AppModule` y reside en un archivo llamado `app.module.ts`.

Para obtener más información, consulta [NgModules](guide/ngmodules).

{@a O}

{@a observable}

## observable

Un productor de múltiples valores, que empuja a [suscriptores](#subscriber). Se utiliza para el manejo de eventos asíncronos en todo Angular. Ejecutas un observable suscribiéndote con su método `subscribe()`, pasando devoluciones de llamada para notificaciones de nuevos valores, errores o finalización.

Los observables pueden entregar valores únicos o múltiples de cualquier tipo a los suscriptores, ya sea sincrónicamente (como una función entrega un valor a la persona que llama) o en un horario. Un suscriptor recibe una notificación de los nuevos valores a medida que se producen y una notificación de finalización normal o finalización de error.

Angular utiliza una librería de terceros llamada [Extensiones reactivas (RxJS)](http://reactivex.io/rxjs/).

Obtén más información en [Observables](guide/observables).

{@a observer}

## observador

Un objeto pasado al método `subscribe()` para un [observable](#observable). El objeto define las devoluciones de llamada para el [suscriptor](#subscriber).

{@a P}

{@a npm-package}

## paquete npm

El [administrador de paquetes npm](https://docs.npmjs.com/getting-started/what-is-npm) se usa para distribuir y cargar módulos y librerías Angular.

Obtén más información acerca de cómo Angular usa [Paquetes npm](guide/npm-packages).

{@a scoped-package}

## paquetes con scope

Una forma de agrupar [paquetes npm](guide/npm-packages) relacionados.
Los NgModules se entregan dentro de paquetes con ámbito cuyos nombres comienzan con Angular _nombre del scope_ `@angular`. Por ejemplo, `@angular/core`, `@angular/common`, `@angular/forms`, y `@angular/router`.

Importa un paquete con alcance de la misma manera que se importa un paquete normal.

<code-example path="architecture/src/app/app.component.ts" header="architecture/src/app/app.component.ts (import)" region="import">

</code-example>

{@a pipe}

## pipe

Una clase precedida por el decorador `@Pipe{}` y que define una función que transforma los valores de entrada en valores de salida para mostrar en una [vista](#view). Angular define varias pipes y puedes definir nuevas pipes.

Obtén más información en [Pipes](guide/pipes).

{@a platform}

## plataforma

En terminología Angular, una plataforma es el contexto en el que se ejecuta una aplicación Angular.
La plataforma más común para aplicaciones Angular es un navegador web, pero también puede ser un sistema operativo para un dispositivo móvil o un servidor web.

Los paquetes `@angular/platform-*` proporcionan soporte para las diversas plataformas de tiempo de ejecución Angular. Estos paquetes permiten que las aplicaciones que utilizan `@angular/core` y `@angular/common` se ejecuten en diferentes entornos al proporcionar la implementación para recopilar la entrada del usuario y representar las IU para la plataforma dada. El aislamiento de la funcionalidad específica de la plataforma permite al desarrollador hacer un uso independiente de la plataforma del resto del marco.

- Cuando se ejecuta en un navegador web, [`BrowserModule`](api/platform-browser/BrowserModule) se importa desde el paquete `platform-browser`, y admite servicios que simplifican la seguridad y el procesamiento de eventos, y permite que las aplicaciones accedan al navegador- características específicas, como interpretar la entrada del teclado y controlar el título del documento que se muestra. Todas las aplicaciones que se ejecutan en el navegador utilizan el mismo servicio de plataforma.

- Cuando se utiliza [renderizado del lado del servidor](#server-side-rendering) (SSR) el paquete [`platform-server`](api/platform-server) proporciona implementaciones de servidor web de`DOM`, `XMLHttpRequest`, y otras características de bajo nivel que no dependen de un navegador.

{@a template}

## plantilla

Código que define cómo representar la [vista](#view) de un componente.

Una plantilla combina HTML directo con sintaxis Angular [enlace de datos](#data-binding), [directivas](#directive),y [expresiones de plantilla](#template-expression) (construcciones lógicas).
Los elementos Angular insertan o calculan valores que modifican los elementos HTML antes de que se muestre la página. Obtén más información sobre el lenguaje de plantilla Angular en la guía [Sintaxis de plantilla](guide/template-syntax).

Una plantilla está asociada con una [clase de componente](#component) a través del [decorador](#decorator) `@Component()`. El código de la plantilla se puede proporcionar en línea, como el valor de la propiedad `template`, o en un archivo HTML separado vinculado a través de la propiedad`templateUrl`.

Las plantillas adicionales, representadas por objetos `TemplateRef`, pueden definir vistas alternativas o _incrustadas_, a las que se puede hacer referencia desde múltiples componentes.

{@a polyfill}

## polyfill

Un [paquete npm](guide/npm-packages) que cierra las brechas en la implementación de JavaScript de un navegador.
Consulta [Soporte del navegador](guide/browser-support) para ver polyfills que admiten funcionalidades particulares para plataformas particulares.

{@a project}

## proyecto

En la Angular CLI, una aplicación independiente o [librería](#library) que se puede crear o modificar mediante un comando de la CLI.

Un proyecto, generado por [`ng new`](cli/new), contiene el conjunto de archivos de origen, recursos y archivos de configuración que necesita para desarrollar y probar la aplicación utilizando la CLI. Los proyectos también se pueden crear con los comandos `ng generate application` y `ng generate library`.

Obtén más información en [Estructura del archivo del proyecto](guide/file-structure).

El archivo [`angular.json`](guide/workspace-config) configura todos los proyectos en un [espacio de trabajo](#workspace).

{@a content-projection}

## proyección de contenido

Una forma de insertar contenido DOM desde fuera de un componente en la vista del componente en un lugar designado.

Para obtener más información, consulta [Respuesta a cambios en el contenido](guide/lifecycle-hooks#content-projection).

{@a provider}

## proveedor

Un objeto que implementa una de las interfaces [`Provider`](api/core/Provider). Un objeto proveedor define cómo obtener una dependencia inyectable asociada con un [token DI](#token).
Un [inyector](#injector) usa el proveedor para crear una nueva instancia de una dependencia para una clase que lo requiera.

Angular registra sus propios proveedores con cada inyector, para los servicios que Angular define.
Puedes registrar sus propios proveedores para los servicios que su aplicación necesita.

Consulta también [servicio](#service), [inyección de dependencia](#di).

Obtén más información en [Inyección de dependencia](guide/dependency-injection).

{@a entry-point}

## punto de entrada

Un [módulo de JavaScript](#module) que está destinado a ser importado por un usuario de [un
paquete npm](guide/npm-packages). Un módulo de punto de entrada suele reexportarse símbolos de otros módulos internos. Un paquete puede contener múltiples puntos de entrada. Por ejemplo, el paquete `@angular/core` Un módulo de punto de entrada suele reexportarse
símbolos de otros módulos internos. Un paquete puede contener múltiples puntos de entrada. Por ejemplo, el paquete `@angular/core` y
`@angular/core/testing`.

{@a Q}

{@a R}

{@a rule}

## regla

En [esquemas](#schematic), una función que opera en un [árbol de archivos](#file-tree) para crear, eliminar o modificar archivos de una manera específica.

{@a server-side-rendering}

## renderizado del lado del servidor

Una técnica que genera páginas de aplicaciones estáticas en el servidor, y puede generar y servir esas páginas en respuesta a las solicitudes de los navegadores.
También puede pregenerar páginas como archivos HTML que servirá más adelante.

Esta técnica puede mejorar el rendimiento en dispositivos móviles y de baja potencia y mejorar la experiencia del usuario al mostrar una primera página estática rápidamente mientras se carga la aplicación del lado del cliente.
La versión estática también puede hacer que su aplicación sea más visible para los rastreadores web.

Puedes preparar fácilmente una aplicación para la representación del lado del servidor utilizando la [CLI](#cli) para ejecutar la herramienta [Angular Universal](#universal) utilizando el [esquema](#schematic) `@nguniversal/express-engine`.

{@a resolver}

## resolver

Una clase que implementa la interfaz [Resolve](api/router/Resolve "Referencia API") (o una función con la misma firma que el método [resolve()](api/router/Resolve#resolve "Referencia API")) que utiliza para producir o recuperar los datos necesarios antes de poder completar la navegación a una ruta solicitada.

Los resolvers se ejecutan después de que todos los [guards de ruta](#route-guard "Definición") para un árbol de ruta se hayan ejecutado y hayan tenido éxito.

Ver un ejemplo de uso de [resolve guard](guide/router-tutorial-toh#resolve-guard "Tutorial de técnicas de enrutamiento") para recuperar datos dinámicos.

{@a router-outlet}

## router outlet

Una [directiva](#directive) que actúa como marcador de posición en la plantilla de un componente de enrutamiento. Angular renderiza dinámicamente la plantilla en función del estado actual del enrutador.

{@a S}

{@a output}

## salida

Al definir una [directiva](#directive), el decorador `@Output{}` en una propiedad directiva
hace que esa propiedad esté disponible como _objetivo_ de [enlace de evento](guide/event-binding).
La secuencia de eventos _fuera_ de esta propiedad al receptor identificado
en la [expresión de plantilla](#template-expression) a la derecha del signo igual.

Obtén más información en [Propiedades de entrada y salida](guide/inputs-outputs).

{@a app-shell}

## shell de aplicación

El shell de aplicación es una forma de representar una parte de su aplicación a través de una ruta en el momento de la compilación.
Esto brinda a los usuarios una primera visualización significativa de su aplicación que aparece rápidamente porque el navegador puede renderizar HTML y CSS estáticos sin la necesidad de inicializar JavaScript.

Obtén más información en [Modelo Shell de Aplicación](https://developers.google.com/web/fundamentals/architecture/app-shell).

Puedes usar Angular CLI para [generar](cli/generate#appshell) un shell de aplicación.
Esto puede mejorar la experiencia del usuario al iniciar rápidamente una página estática renderizada (un esqueleto común a todas las páginas) mientras el navegador descarga la versión completa del cliente y cambia automáticamente después de que se carga el código.

Ver también [Service Worker y PWA](guide/service-worker-intro).

{@a service}

## Servicio

En Angular, una clase con el decorador [@Injectable()](#injectable) que encapsula la lógica y el código no UI que se pueden reutilizar en una aplicación.
Angular distingue los componentes de los servicios para aumentar la modularidad y la reutilización.

Los metadatos `@Injectable()` permiten que la clase de servicio se use con el mecanismo [inyección de dependencia](#di).
La clase inyectable es instanciada por un [proveedor](#provider).
Los [Inyectores](#injector) mantienen listas de proveedores y los utilizan para proporcionar instancias de servicio cuando son requeridos por componentes u otros servicios.

Obtén más información en [Introducción a los servicios y la inyección de dependencias](guide/architecture-services).

{@a subscriber}

## suscriptor

Una función que define cómo obtener o generar valores o mensajes para publicar. Esta función se ejecuta cuando un consumidor llama al método `subscribe()` de un [observable](#observable).

El acto de suscribirse a un observable desencadena su ejecución, asocia devoluciones de llamada con él y crea un objeto de `Subscription` que le permite darse de baja.

El método `subscribe ()` toma un objeto JavaScript (llamado [observador](#observer)) con hasta tres devoluciones de llamada, una para cada tipo de notificación que un observable puede entregar:

- La notificación `next` envía un valor como un número, una cadena o un objeto.
- La notificación `error` envía un error de JavaScript o una excepción.
- La notificación `complete` no envía un valor, pero se llama al controlador cuando finaliza la llamada. Los valores programados pueden continuar devolviéndose después de que se complete la llamada.

{@a T}

{@a target}

## target

Un subconjunto construible o ejecutable de un [proyecto](#project), configurado como un objeto en el [archivo de configuración del espacio de trabajo](guide/workspace-config#project-tool-configuration-options), y ejecutado por un [Architect](#architect) [constructor](#builder).

En el archivo `angular.json`, cada proyecto tiene una sección de "architect" que contiene targets que configuran los constructores. Algunos de estos targets corresponden a [comandos CLI](#cli), como `build`, `serve`, `test` y `lint`.

Por ejemplo, el constructor de Architect invocado por el comando `ng build` para compilar un proyecto usa una herramienta de construcción particular, y tiene una configuración predeterminada cuyos valores pueden ser anulados en la línea de comando. El objetivo `build` también define una configuración alternativa para una compilación "producción", que se puede invocar con el indicador `--prod` en el comando `build`.

Por ejemplo, el constructor de la herramienta Architect proporciona un conjunto de constructores. El comando [`ng new`](cli/new) proporciona un conjunto de targets para el proyecto de aplicación inicial. Los comandos [`ng generate application`](cli/generate#application) y [`ng generate library`](cli/generate#library) proporcionan un conjunto de targets para cada nuevo [proyecto](#project). Estos targets, sus opciones y configuraciones, se pueden personalizar para satisfacer las necesidades de su proyecto. Por ejemplo, es posible que desee agregar una configuración de "puesta en escena" o "prueba" al objetivo de "compilación" de un proyecto.

También puedes definir un generador personalizado y agregar un target a la configuración del proyecto que utiliza su generador personalizado. Luego puede ejecutar el target utilizando el comando [`ng run`](cli/run).

{@a case-conventions}
{@a case-types}
{@a dash-case}
{@a camelcase}
{@a kebab-case}

## tipos de casos

Angular usa convenciones de mayúsculas para distinguir los nombres de varios tipos, como se describe en la [sección de pautas de nomenclatura](guide/styleguide#02-01) de la Guía de estilo. Aquí hay un resumen de los tipos de casos:

- camelCase: símbolos, propiedades, métodos, nombres de pipelines, selectores de directivas sin componentes, constantes.
  El caso de camelcase estándar o inferior usa minúsculas en la primera letra del artículo. Por ejemplo, "selectedHero".

- UpperCamelCase (o PascalCase): nombres de clase, incluidas las clases que definen componentes, interfaces, NgModules, directivas y tuberías,
  La mayúscula del camelcase usa mayúscula en la primera letra del artículo. Por ejemplo, "HeroListComponent".

- dash-case (o "kebab-case"): Parte descriptiva de los nombres de archivos, selectores de componentes. Por ejemplo, "app-hero-list".

- underscore_case (o "snake_case"): No se usa típicamente en Angular. El caso de serpiente utiliza palabras relacionadas con guiones bajos.
  Por ejemplo, "convert_link_mode".

- UPPER_UNDERSCORE_CASE (o UPPER_SNAKE_CASE, o SCREAMING_SNAKE_CASE): Tradicional para constantes (aceptable, pero prefiere camelCase).
  Las mayúsculas y minúsculas usan palabras en mayúsculas conectadas con guiones bajos. Por ejemplo, "FIX_ME".

{@a di-token}

## token DI

Un token de búsqueda asociado con una dependencia [proveedor](#provider), para usar con el sistema [inyección de dependencia](#di).

{@a template-reference-variable}

## template reference variable

A variable defined in a template that references an instance associated with an element, such as a directive instance, component instance, template as in `TemplateRef`, or DOM element.
After declaring a template reference variable on an element in a template,
you can access values from that variable elsewhere within the same template.
The following example defines a template reference variable named `#phone`.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

For more information, see the [Template reference variable](guide/template-reference-variables) guide.

{@a token}

## token

Un identificador opaco utilizado para la búsqueda eficiente de tablas. En Angular, se utiliza un [token DI](#di-token) para encontrar [proveedores](#provider) de dependencias en el sistema [inyección de dependencia](#di).

{@a transpile}

## transpile

El proceso de traducción que transforma una versión de JavaScript en otra versión; por ejemplo, bajar el nivel de ES2015 a la versión anterior de ES5.

{@a file-tree}

## tree

En [esquemas](#schematic), un sistema de archivos virtual representado por la clase `Tree`.
Las [reglas](#rule) esquemáticas toman un objeto de árbol como entrada, operan en ellas y devuelven un nuevo objeto de árbol.

{@a typescript}

## TypeScript

Un lenguaje de programación basado en JavaScript que destaca por su sistema de escritura opcional.
TypeScript proporciona verificación de tipos en tiempo de compilación y un fuerte soporte de herramientas (como
terminación de código, refactorización, documentación en línea y búsqueda inteligente).
Muchos editores de código e IDE admiten TypeScript de forma nativa o con complementos.

TypeScript es el lenguaje preferido para el desarrollo Angular.
Lee más sobre TypeScript en [typescriptlang.org](http://www.typescriptlang.org/).

{@a U}

{@a universal}

## Universal

Una herramienta para implementar [renderizado del lado del servidor](#server-side-rendering) de una aplicación Angular.
Cuando se integra con una aplicación, Universal genera y sirve páginas estáticas en el servidor en respuesta a las solicitudes de los navegadores.
La página estática inicial sirve como marcador de posición de carga rápida mientras se prepara la aplicación completa para la ejecución normal en el navegador.

Para obtener más información, consulta [Angular Universal: representación del lado del servidor](guide/universal).

{@a V}

{@a form-validation}

## validación de formulario

Una comprobación que se ejecuta cuando cambian los valores del formulario e informa si los valores dados son correctos y completos, de acuerdo con las restricciones definidas. Se aplican formas reactivas [funciones de validación](guide/form-validation#adding-to-reactive-forms). Los formularios basados en plantillas usan [directivas de validación](guide/form-validation#adding-to-template-driven-forms).

Obtén más información en [Validación de formularios](guide/form-validation).

{@a view}

## vista

La agrupación más pequeña de elementos de visualización que se pueden crear y destruir juntos.
Angular representa una vista bajo el control de una o más [directivas](#directive).

Una clase [componente](#component) y su [plantilla](#template) asociada definen una vista.
Una vista está representada específicamente por una instancia `ViewRef` asociada con un componente.
Una vista que pertenece inmediatamente a un componente se llama _vista de host_.
Las vistas se suelen recopilar en [jerarquías de vista](#view-tree).

Las propiedades de los elementos en una vista pueden cambiar dinámicamente, en respuesta a las acciones del usuario; la estructura (número y orden) de elementos en una vista no puede.
Puedes cambiar la estructura de los elementos insertando, moviendo o eliminando vistas anidadas dentro de sus contenedores de vistas.

Las jerarquías de vista se pueden cargar y descargar dinámicamente a medida que el usuario navega por la aplicación, generalmente bajo el control de un [enrutador](#router).

{@a ve}

## View Engine

La canalización de compilación y representación utilizada por Angular antes de la versión 9. Comparar con [Ivy](#ivy).

{@a W}
{@a web-component}

## web component

Ver [elementos personalizados](#custom-element).

{@a X}

{@a Y}

{@a Z}
{@a zone}

## zona

Un contexto de ejecución para un conjunto de tareas asincrónicas. Útil para depurar, perfilar y probar aplicaciones que incluyen operaciones asincrónicas como el procesamiento de eventos, promesas y llamadas a servidores remotos.

Una aplicación Angular se ejecuta en una zona donde puede responder a eventos asincrónicos al verificar los cambios de datos y actualizar la información que muestra al resolver [enlaces de datos](#data-binding).

Un cliente de zona puede tomar medidas antes y después de que se complete una operación asincrónica.

Obtén más información sobre las zonas en este [Video de Brian Ford](https://www.youtube.com/watch?v=3IqtmUscE_U).
