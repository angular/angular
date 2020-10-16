# Lanzando tu aplicación con un módulo raíz

#### Pre-requisitos

Una comprensión básica de lo siguiente:
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).

<hr />

Un NgModule describe cómo encajan las partes de la aplicación.
Cada aplicación tiene al menos un módulo Angular, el módulo _root_,
que debe estar presente para arrancar la aplicación en el lanzamiento inicial.
Por convención y por defecto, este NgModule se llama `AppModule`.

Cuando se usa el comando de [Angular CLI](cli) `ng new` para generar una aplicación, el `AppModule` predeterminado es el siguiente.

```typescript
/* JavaScript imports */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

/* the AppModule class with the @NgModule decorator */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

Después de las declaraciones de importación hay una clase con
[decorador](guide/glossary#decorator 'Explicando "Decorator"') **`@NgModule`**.

El decorador `@NgModule` identifica `AppModule` como una clase `NgModule`.
`@NgModule` toma un objeto de metadatos que le dice a Angular cómo compilar e iniciar la aplicación.

* **_declarations_**&mdash; el único componente de esta aplicación..
* **_imports_**&mdash; importar `BrowserModule` para tener servicios específicos del navegador como renderizado DOM, sanitization y ubicación.
* **_providers_**&mdash; los proveedores de servicios.
* **_bootstrap_**&mdash; el componente raíz que Angular crea e inserta
en la página web de host `index.html`.

La aplicación predeterminada creada por Angular CLI solo tiene un componente, `AppComponent`, por lo que
está en los arrays de `declarations` y `bootstrap`.

{@a the-declarations-array}
{@a declarations}

## El array `declarations`

El array de `declarations` le dice a Angular qué componentes pertenecen a ese módulo.
A medida que crees más componentes, agrégalos a las `declarations`.

Debe declarar cada componente en exactamente una clase `NgModule`.
Si se usa un componente sin declararlo, Angular devuelve un
mensaje de error.

El array `declarations` solo acepta declarables. Declarables pueden ser
componentes, [directivas](guide/attribute-directives) y [pipes](guide/pipes).
Todos los declarables de un módulo deben estar en el array de `declarations`.
Los declarables deben pertenecer exactamente a un módulo. El compilador emite
un error si se intenta declarar la misma clase en más de un módulo.

Estas clases declaradas son visibles dentro del módulo pero invisibles
a componentes en un módulo diferente, a menos que se exporten desde
éste módulo y el otro módulo importe éste mismo módulo.

A continuación, se muestra un ejemplo de un array `declarations`:

```typescript
  declarations: [
    YourComponent,
    YourPipe,
    YourDirective
  ],
```

Un declarable solo puede pertenecer a un módulo, por lo que solo debe ser declarado en
un `@NgModule`. Cuando se necesite en otro lugar,
importa el módulo que tiene el declarable que necesites.

**Solo las referencias de `@NgModule`** van en el array `imports`.


### Usando directivas con `@NgModule`

Usa el array `declarations` para las directivas.
Para usar una directiva, un componente o un pipe en un módulo, hay que hacer algunas cosas:

1. Exportarlo desde el archivo donde se escribió.
2. Importarlo al módulo apropiado.
3. Declararlo en el array `declarations` del `@NgModule`.


Esos tres pasos se parecen a los siguientes. En el archivo donde se crea la directiva, expórtalo.
El siguiente ejemplo, llamado `ItemDirective` es la estructura de directiva predeterminada que la CLI genera en su propio archivo, `item.directive.ts`:

<code-example path="bootstrapping/src/app/item.directive.ts" region="directive" header="src/app/item.directive.ts"></code-example>

El punto clave aquí es que se debe exportar para poder importarlo en otro lugar. A continuación, importar
en el `NgModule`, en este ejemplo, `app.module.ts` con una declaración de importación de JavaScript:

<code-example path="bootstrapping/src/app/app.module.ts" region="directive-import" header="src/app/app.module.ts"></code-example>

Y en el mismo archivo, agregarlo al array `declarations` del `@ NgModule`:

<code-example path="bootstrapping/src/app/app.module.ts" region="declarations" header="src/app/app.module.ts"></code-example>


Ahora puedes usar tu `ItemDirective` en un componente. Este ejemplo usa `AppModule`, pero se haría de la misma manera para un módulo de funciones. Para obtener más información sobre las directivas, consulta [Directivas de atributos](guide/attribute-directives) y [Directivas estructurales](guide/structural-directives). También se usaría la misma técnica para [pipes](guide/pipes) y componentes.

Recuerda, los componentes, directivas y pipes pertenecen a un solo módulo. Solo se necesita declararlos una vez en tu aplicación porque se comparten importando los módulos necesarios. Esto ahorra tiempo y ayuda a mantener la aplicación optimizada.


{@a imports}

## El array de `imports`

El array de `imports` del módulo aparece exclusivamente en el objeto de metadatos del `@NgModule`.
Le dice a Angular sobre otros NgModules que este módulo en particular necesita para funcionar correctamente.

Esta lista de módulos son los que exportan componentes, directivas o pipes
que las plantillas de componentes en este módulo hacen referencia. En este caso, el componente es
`AppComponent`, que hace referencia a componentes, directivas o pipes en `BrowserModule`,
`FormsModule`, o  `HttpClientModule`.
Una plantilla de componente puede hacer referencia a otro componente, directiva,
o pipe cuando la clase referenciada se declara en este módulo o
la clase se importó de otro módulo.

{@a bootstrap-array}

## El array `providers`

El array `providers` es donde se enumeran los servicios que necesita la aplicación. Cuando
enumera los servicios, están disponibles en toda la aplicación. Puedes reducir el scope
al usar módulos de funciones y carga diferida. Para más información, ver
[Proveedores](guide/providers).

## El array `bootstrap`

La aplicación se inicia haciendo bootstraping desde la raíz `AppModule`, que es
también conocido como `entryComponent`.
Entre otras cosas, el proceso de carga crea los componentes enumerados en el array de `bootstrap`
e inserta cada uno en el DOM del navegador.

Cada componente bootstrap es la base de su propio árbol de componentes.
La inserción de un componente bootstrapped generalmente desencadena una cascada de
creaciones de componentes que completan ese árbol.

Si bien puedes colocar más de un árbol de componentes en una página web de host,
la mayoría de las aplicaciones tienen solo un árbol de componentes y arrancan un solo componente raíz.

Este componente raíz se suele llamar `AppComponent` y se encuentra en el
array `bootstrap` del módulo raíz.


## Más sobre módulos Angular

Para obtener más información sobre NgModules que probablemente veas con frecuencia en las aplicaciones,
consulta [Módulos de uso frecuente](guide/frequent-ngmodules).
