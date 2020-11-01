# El editor de Héroe

Se ha agregado un título básico a la aplicación.
Luego crea un nuevo componente para mostrar la información del héroe,
Coloca el componente en el (app shell) de la aplicación.

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, consulta el <live-example></live-example>.

</div>

## Crear un componente de héroes

Usa la CLI angular para generar un nuevo componente llamado `heroes`.

<code-example language="sh" class="code-shell">
  ng generate component heroes
</code-example>

CLI crea una nueva carpeta llamada `src/app/heroes/`, y
genera tres archivos sobre `HeroesComponent` junto un archivo de prueba.

El archivo de la clase `HeroesComponent` es el siguiente.

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" region="v1" header="app/heroes/heroes.component.ts (initial version)"></code-example>

Siempre Importa el símbolo `Component` de la biblioteca pricipal de Angular, y realiza la anotación a la clase del component con `@Component`.

`@Component` es una decoradoro que especifica metadatos Angular para un
componente.

La CLI generó 3 propiedades de metadatos:

1. `selector`&mdash; El selector de elementos CSS para el componente
1. `templateUrl`&mdash; La ubicación del archivo plantilla para el componente
1. `styleUrls`&mdash; La ubicación de los estilos CSS privados del componente.

{@a selector}

El [Selector de elementos CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors)
`'app-heroes'`, coincide con el nombre del elemento HTML que identifica este componente en el componente padre Plantillas.

El `ngOnInit()` es un [gancho de ciclo de vida](guide/lifecycle-hooks#oninit) ("lifecycle hook") . Angular llama a `ngOnInit()` inmediatamente después de crear el componente.
Adecuado para poner la lógica de inicialización.

Siempre `exporta` la clase de componente, por lo que siempre puede `importarla` en otro lugar, como un `AppModule`.

### Agrega la propiedad `hero`

Agrega una propiedad `hero` al `HeroesComponent` para un héroe llamado "Windstorm".

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" region="add-hero" header="heroes.component.ts (hero property)"></code-example>

### Mostrar el héroe

Abre el archivo de plantilla `heroes.component.html`.
Elimina el texto predeterminado generado por CLI angular,
Reemplaza con un enlace de datos a la nueva propiedad `hero`.

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" header="heroes.component.html" region="show-hero-1"></code-example>

## Mostrar la vista `HeroesComponent`

Para ver el `HeroesComponent`, debe agregarlo a las Plantillas en el `AppComponent` del shell de tu aplicación.

Recuerda que `app-heroes` es el [selector de elemento](#selector) del `HeroesComponent`.
Entonces, en el archivo Plantillas de `AppComponent`, agrega el elemento `<app-heroes>` directamente debajo del título.

<code-example path="toh-pt1/src/app/app.component.html" header="src/app/app.component.html"></code-example>

Si el comando CLI `ng serve` todavía se está ejecutando,
El navegador se actualiza para mostrar el título de la aplicación y el nombre del héroe.

## Crear interfaz de héroe

Un héroe es más que un nombre.

Crea una interfaz `Hero` en su propio archivo en la carpeta `src/app`.
Dale una propiedad `id` y una propiedad `name`.

<code-example path="toh-pt1/src/app/hero.ts"  header="src/app/hero.ts"></code-example>


Regresa a la clase `HeroesComponent` e importe la interfaz `Hero`.

Refactoriza la propiedad de héroe del componente para que sea del tipo 'Héroe'.
Inicialízalo con un `id` de `1` y un nombre de `Windstorm`.

El archivo de clase revisado `HeroesComponent` se ve así:

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts"></code-example>

Cambió el héroe de texto a un objeto, lo que provocó que la página se mostrara incorrectamente.

## Mostrar objeto de héroe

Actualiza los enlaces de Plantillas para anunciar el nombre del héroe,
Muestra tanto el `id` como el `name` con un diseño detallado como este:

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" region="show-hero-2" header="heroes.component.html (HeroesComponent's template)"></code-example>

El navegador se actualiza para mostrar la información del héroe.

## Formatea con _UppercasePipe_

Modifica el enlace para `hero.name` de esta manera:
<code-example path="toh-pt1/src/app/heroes/heroes.component.html" header="src/app/heroes/heroes.component.html" region="pipe">
</code-example>

El navegador se actualizará para mostrar el nombre del héroe en mayúsculas.

En el enlace de interpolación, la palabra `mayúscula` inmediatamente después del operador pipe (|) es
Inicie el 'UppercasePipe' incorporado.

[pipe](guide/pipes) ("pipe") Es adecuado para formatear cadenas, importes monetarios, fechas y otros datos de visualización.
Angular viene con múltiples pipes incorporadas, y puede crear las suyas propias.

## Editar el héroe

El usuario debe poder editar el nombre del héroe en el cuadro de texto `<input>`.

En el cuadro de texto, la propiedad `name` del héroe se muestra _,
La propiedad se actualiza según los tipos de usuario.
Esto es de la clase de componente a _screen_,
Y significa el flujo de datos desde la pantalla a la clase de componente.

Para automatizar ese flujo de datos, configure un enlace de datos bidireccional entre el elemento de formulario `<input>` y la propiedad `hero.name`.

### Enlace de datos bidireccional

Refactorizando el área de detalle de las Plantas `HeroesComponent` se ve así:

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" region="name-input" header="src/app/heroes/heroes.component.html (HeroesComponent's template)"></code-example>

**[(ngModel)]** Es la sintaxis de enlace de datos bidireccional de Angular.

Esto vinculará la propiedad `hero.name` al cuadro de texto HTML, por lo que
Puede pasar datos _en ambas direcciones_ desde la propiedad `hero.name` al cuadro de texto y desde el cuadro de texto a la propiedad `hero.name`.

### _FormsModule_ No encontrado 

Observa que la aplicación dejó de funcionar cuando agregué el `[(ngModel)]`.

Para ver el error, abre las herramientas de desarrollo de su navegador,
Busca mensajes como el siguiente en la consola,

<code-example language="sh" class="code-shell">
Errores de análisis de plantilla:
No se puede vincular a 'nGModelo' ya que no es una propiedad conocida de 'entrada'.
</code-example>

`ngModel` Es una directiva angular válida pero no está disponible por defecto.

Pertenece al `FormsModule` opcional y debe optar por ese módulo para usarlo.

## _AppModule_

En Angular, cómo encajan las partes de la aplicación,
Necesita saber qué otros archivos y bibliotecas necesita su aplicación.
Esta información se llama _metadata_.

Algunos de los metadatos se encuentran en el decorador `@Component` que agregó a su clase de componentes.
Otros metadatos importantes son[`@NgModule`](guide/ngmodules)Está en el decorador.

El decorador más importante `@NgModule` anota la clase **AppModule** de nivel superior.

Angular CLI creó la clase `AppModule` en `src/app/app.module.ts` al crear el proyecto.
Ahora opta por el `FormsModule`.

### Importar _FormsModule_

Abre `AppModule` (`app.module.ts`) e importe el símbolo `FormsModule` desde la biblioteca `@angular/forms`.

<code-example path="toh-pt1/src/app/app.module.ts" header="app.module.ts (@NgModule imports)"
 region="formsmodule-js-import">
</code-example>

A continuación, agregue el `FormsModule` a el arreglo `imports` de los metadatos `@ NgModule`.
Esta matriz contiene una lista de módulos externos que requiere su aplicación.

<code-example path="toh-pt1/src/app/app.module.ts" header="app.module.ts ( @NgModule imports)"
region="ng-imports">
</code-example>

La aplicación debería funcionar nuevamente cuando se actualice el navegador. Puedes editar el nombre del héroe y ver los cambios reflejados inmediatamente en el `<h2>` arriba del cuadro de texto.

### Declarar `HeroesComponent`

Todos los componentes deben declararse con _exactamente uno_ [NgModule](guide/ngmodules).

_No has declarado_ HeroesComponent`.
Entonces, ¿por qué funcionó la aplicación?

La aplicación funcionó porque Angular CLI declaró el componente en el `AppModule` cuando generó el `HeroesComponent`.

Abra `src/app/app.module.ts` y encuentre el `HeroesComponent` importado cerca de la parte superior.

<code-example path="toh-pt1/src/app/app.module.ts" header="src/app/app.module.ts" region="heroes-import" >
</code-example>

`HeroesComponent` se declara en la matriz`@NgModule.declarations`.
<code-example path="toh-pt1/src/app/app.module.ts" header="src/app/app.module.ts" region="declarations">
</code-example>

`AppModule` declara los componentes de aplicación `AppComponent` y `HeroesComponent`.

## Revisión del código final

Los archivos de código descritos en esta página son:

<code-tabs>

  <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt1/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/app.module.ts" 
  path="toh-pt1/src/app/app.module.ts">
  </code-pane>

  <code-pane header="src/app/app.component.ts" path="toh-pt1/src/app/app.component.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="toh-pt1/src/app/app.component.html">
  </code-pane>

  <code-pane header="src/app/hero.ts"
  path="toh-pt1/src/app/hero.ts">
  </code-pane>

</code-tabs>
## Resumen

* Creo un segundo `HeroesComponent` usando el CLI.
* Agregó `HeroesComponent` al shell de `AppComponent` y lo mostró.
* Aplico 'UppercasePipe' para formatear el nombre.
* Utilizo el enlace de datos bidireccional en la directiva `ngModel`.
* Aprendío sobre `AppModule`.
* Importó `FormsModule` en `AppModule` para reconocer y aplicar la directiva Angular `ngModel`.
* Aprendío la importancia de declarar un componente en un `AppModule` y me di cuenta de que la CLI está haciendo esa declaración por usted.
