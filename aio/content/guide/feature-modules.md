# Módulos de funcionalidades

Los módulos de funcionalidades son NgModules con el propósito de organizar el código.

Para la aplicación de muestra final con un módulo de funcionalidades que se describe en esta página,
ver el <live-example> </live-example>.

<hr>

A medida que tu aplicación crece, puedes organizar el código relevante para una funcionalidad específica. Esto ayuda a aplicar límites claros para las funcionalidades. Con módulos de funcionalidades,
puedes mantener el código relacionado con una funcionalidad o característica específica
separado de otro código. Delinear áreas de suaplicación ayuda con la colaboración entre desarrolladores y equipos, separando directivas y gestionar el tamaño del módulo raíz.

## Módulos de funcionalidades frente a módulos raíz

Un módulo de funcionalidades es una mejor práctica organizativa, a diferencia de un concepto de la API angular principal. Un módulo de funcionalidades ofrece un conjunto coherente de funcionalidades centradas en una necesidad de aplicación específica, como un flujo de trabajo, enrutamiento o formularios de usuario. Si bien puede hacer todo dentro del módulo raíz, los módulos de funcionalidades lo ayudan a dividir la aplicación en áreas específicas. Un módulo de funcionalidades colabora con el módulo raíz y con otros módulos a través de los servicios que proporciona y los componentes, directivas y canalizaciones que comparte.

## Cómo hacer un módulo de funcionalidades

Suponiendo que ya tienes una aplicación que creó con la [CLI Angular](cli), crea un módulo de funcionalidades usando la CLI ingresando el siguiente comando en el directorio raíz del proyecto. Reemplaza `CustomerDashboard` con el nombre de tu módulo. Puedes omitir el sufijo "Módulo" / "Module" del nombre porque la CLI lo agrega:

```sh
ng generate module CustomerDashboard

```

Esto hace que la CLI cree una carpeta llamada `customer-dashboard` con un archivo dentro llamado` customer-dashboard.module.ts` con el siguiente contenido:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [],
})
export class CustomerDashboardModule {}
```

La estructura de un NgModule es la misma si es un módulo raíz o un módulo de funcionalidades. En el módulo de funcionalidades generado por CLI, hay dos declaraciones de importación de JavaScript en la parte superior del archivo: la primera importa `NgModule`, que, como el módulo raíz, le permite usar el decorador `@NgModule`; el segundo importa `CommonModule`, que aporta muchas directivas comunes como `ngIf` y `ngFor`. Los módulos de funcionalidades importan `CommonModule` en lugar de `BrowserModule`, que solo se importa una vez en el módulo raíz. `CommonModule` solo contiene información para directivas comunes como `ngIf` y `ngFor` que se necesitan en la mayoría de las plantillas, mientras que `BrowserModule` configura la aplicación Angular para el navegador, lo cual debe hacerse solo una vez.

La matriz `declaraciones` está disponible para que agregue declarables, que son componentes, directivas y canalizaciones que pertenecen exclusivamente a este módulo en particular. Para agregar un componente, ingresa el siguiente comando en la línea de comando donde `customer-dashboard` es el directorio donde la CLI generó el módulo de funciones y CustomerDashboard` es el nombre del componente:

```sh
ng generate component customer-dashboard/CustomerDashboard
```

Esto genera una carpeta para el nuevo componente dentro de la carpeta del panel del cliente y actualiza el módulo de funcionalidades con la información de `CustomerDashboardComponent`:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard.module.ts" region="customer-dashboard-component" header="src/app/customer-dashboard/customer-dashboard.module.ts"></code-example>

El `CustomerDashboardComponent` ahora se encuentra en la lista de importación de JavaScript en la parte superior y se agregó a la matriz de `declaraciones`, lo que le permite a Angular asociar este nuevo componente con este módulo de funciones.

## Importación de un módulo de funcionalidades

Para incorporar el módulo de funcionalidades en tu aplicación, debes informar al módulo raíz, `app.module.ts`. Observa la exportación de "CustomerDashboardModule" en la parte inferior de `customer-dashboard.module.ts`. Esto lo expone para que otros módulos puedan acceder a él. Para importarlo en el `AppModule`, agrégalo a las importaciones en` app.module.ts` y al arreglo de `import`:

<code-example path="feature-modules/src/app/app.module.ts" region="app-module" header="src/app/app.module.ts"></code-example>

Ahora el `AppModule` conoce el módulo de funcionalidades. Si tuviera que agregar cualquier proveedor de servicios al módulo de funcionalidades, `AppModule` también lo conocería, al igual que cualquier otro módulo de funcionalidades. Sin embargo, los NgModules no exponen sus componentes.

## Representación de la plantilla de componente de un módulo de funcionalidades

Cuando la CLI generó el `CustomerDashboardComponent` para el módulo de funcionalidades, incluyó una plantilla, `customer-dashboard.component.html`, con el siguiente marcado:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard/customer-dashboard.component.html" region="feature-template" header="src/app/customer-dashboard/customer-dashboard/customer-dashboard.component.html"></code-example>

Para ver este HTML en el `AppComponent`, primero tienes que exportar el `CustomerDashboardComponent` en el `CustomerDashboardModule`. En `customer-dashboard.module.ts`, justo debajo de la matriz de `declaraciones`, agrega una matriz de `exportaciones` que contenga `CustomerDashboardComponent`:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard.module.ts" region="component-exports" header="src/app/customer-dashboard/customer-dashboard.module.ts"></code-example>

Luego, en el `AppComponent`, `app.component.html`, agrega la etiqueta `<app-customer-dashboard>`:

<code-example path="feature-modules/src/app/app.component.html" region="app-component-template" header="src/app/app.component.html"></code-example>

Ahora, además del título que se representa de forma predeterminada, la plantilla `CustomerDashboardComponent` también se representa:

<div class="lightbox">
  <img src="generated/images/guide/feature-modules/feature-module.png" alt="feature module component">
</div>

<hr />

## Más sobre NgModules

También te puede interesar lo siguiente:

- [Módulos de carga diferida con el enrutador angular](guide/lazy-loading-ngmodules).
- [Proveedores](guide/providers).
- [Tipos de módulos de funciones](guide/module-types).
