# Crear un componente de características

Por el momento, el `HeroesComponent` muestra tanto la lista de héroes como los detalles de los héroes seleccionados.

Mantener toda la funcionalidad en un componente se vuelve menos sostenible a medida que la aplicación crece.
Deberá dividir un componente grande en subcomponentes más pequeños que se centren en una tarea o flujo de trabajo en particular.

Esta página da el primer paso en ese camino moviendo los detalles del héroe a otro `HeroDetailComponent` reutilizable.

`HeroesComponent` solo muestra una lista de héroes.
`HeroDetailComponent` muestra los detalles del héroe seleccionado. 

<div class="alert is-helpful">
Para ver la aplicación de ejemplo que describe esta página, consulte el <live-example></live-example>.

</div>

## Crear `HeroDetailComponent`

Usa el  CLI de Angular para generar un nuevo componente llamado `hero-detail`.

<code-example language="sh" class="code-shell">
  ng generate component hero-detail
</code-example>

Este comando generará una plantilla para el archivo `HeroDetailComponent` y declarará este componente en el `AppModule`.
Este comando produce la siguiente plantilla:

* Crear el directorio `src/app/hero-detail`

Genera cuatro archivos en este directorio:

* Archivo CSS para estilo de componente
* Archivo HTML para la plantilla el componente 
* Archivo TypeScript de la clase de componente denominada `HeroDetailComponent`
* Archivo de prueba de la clase `HeroDetailComponent`

Este comando también agrega `HeroDetailComponent` como `declaraciones` en el decorador `@ NgModule` del archivo `src/app/app.module.ts`.

### Escribir plantilla

Corta el HTML de detalles del héroe desde la parte inferior de la plantilla `HeroesComponent` y pégalo en la plantilla generada en las plantilla `HeroDetailComponent`.

Las referencias HTML pegadas `selectedHero`.
El nuevo `HeroDetailComponent` puede mostrar _cualquier_héroe, no solo el héroe seleccionado.
Por lo tanto, reemplaza todos los "selectedHero" en la plantilla con "hero".

Cuando termines, las plantilla `HeroDetailComponent` deberían verse así:

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.html" header="src/app/hero-detail/hero-detail.component.html"></code-example>

### Añadir la propiedad `@Input()` al héroe 

Las plantillas `HeroDetailComponent` están vinculadas a la propiedad `hero` de un componente que es del tipo `Hero`.

Abre el archivo de clase `HeroDetailComponent` e importe el símbolo `Hero`.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" 
region="import-hero" header="src/app/hero-detail/hero-detail.component.ts (import Hero)">
</code-example>

La propiedad `hero` debe ser una [_propiedad de entrada_](guide/inputs-outputs "Input and Output properties") -->, anotada con el decorador `@Input()` porque el `HeroesComponent` _externo_ [se vinculará de esta manera.](#heroes-component-template)

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding">
</code-example>

Modifique la declaración de importación `@angular/core` para incluir el símbolo `Input`.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="import-input" header="src/app/hero-detail/hero-detail.component.ts (import Input)"></code-example>

Agrega la propiedad `hero` antepuesta por el decorador `@Input()`.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" header="src/app/hero-detail/hero-detail.component.ts" region="input-hero"></code-example>

Este es el único cambio que debe realizar en la clase `HeroDetailComponent`.
No se requieren más propiedades o lógica de visualización.
Este componente solo toma un objeto héroe a través de la propiedad `hero` y lo muestra.

## Mostrar `HeroDetailComponent`

El `HeroesComponent` todavía está en la vista maestra/detalle.

Hasta que eliminé los detalles del héroe de Plantillas, lo estaba mostrando en este componente. Ahora deleguemos a `HeroDetailComponent`.

Los dos componentes tienen una relación padre-hijo.
Para mostrar un nuevo héroe cada vez que el usuario selecciona un héroe de la lista,
El padre `HeroesComponent` controla al hijo `HeroDetailComponent` enviándolo.

No cambiarás la _clase_ de `HeroesComponent` pero cambiarás su _template_.

{@a heroes-component-template}

### Actualizar las plantillas `HeroesComponent`

El selector para `HeroDetailComponent` es `'app-hero-detail'`.

Agrega un elemento `<app-hero-detail>` a la parte inferior de las plantillas `HeroesComponent` donde la vista detallada de héroe existió una vez.

Vincula `HeroesComponent.selectedHero` a la propiedad `hero` de este elemento de la siguiente manera:

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding" header="heroes.component.html (HeroDetail binding)">

</code-example>

`[hero]="selectedHero"` es el [enlace de propiedad](guide/property-binding) de Angular.

Este es un enlace de datos unidireccional de la propiedad `selectedHero`  `HeroesComponent` a la propiedad `hero` del elemento objetivo.
Aquí se asigna la propiedad `hero` de `HeroDetailComponent`.

Cuando el usuario hace clic en un héroe en la lista, el `selectedHero` cambia.
Cuando `selectedHero` cambia,el _enlace de propiedad_ actualiza `hero` y
  `HeroDetailComponent` muestra el nuevo héroe.

La plantilla modificada de `HeroesComponent` se ve así:

<code-example path="toh-pt3/src/app/heroes/heroes.component.html"
  header="heroes.component.html"></code-example>

Una vez que se actualiza el navegador, la aplicación comenzará a funcionar nuevamente como antes.

## ¿Que ha cambiado?

[Como antes](tutorial/toh-pt2), cada vez que un usuario hace clic en el nombre de un héroe, el detalle del héroe aparece debajo de la lista de héroes. Ahora HeroDetailComponent presenta esos detalles en lugar de HeroesComponent.

Refactorizar el `HeroesComponent` original en dos componentes te beneficiará ahora y en el futuro.

1. Simplificado `HeroesComponent` al reducir su responsabilidad.

1. Puedes convertir un `HeroDetailComponent` en un editor enriquecido de héroes sin tocar el padre `HeroesComponent` principal.

1. Puedes evolucionar `HeroesComponent` sin tocar la vista de detalles del héroe.

1. Puedes reutilizar `HeroDetailComponent` en futuros componentes de Plantillas.

## Revisión final del código

Los archivos de código descritos en esta página son:

<code-tabs>

  <code-pane header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>

  <code-pane header="src/app/hero-detail/hero-detail.component.html" path="toh-pt3/src/app/hero-detail/hero-detail.component.html">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt3/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/app.module.ts" path="toh-pt3/src/app/app.module.ts">
  </code-pane>

</code-tabs>

## Resumen

* Creaste un `HeroDetailComponent` independiente y reutilizable.

* Usaste el [enlace de propiedad](guide/property-binding) para que el padre `HeroesComponent` pueda controlar al hijo `HeroDetailComponent`.

* Usaste el [`decorador @Input`](guide/inputs-outputs) para hacer que la propiedad del héroe esté disponible para ser vinculada por el componente `HeroesComponent` externamente.
