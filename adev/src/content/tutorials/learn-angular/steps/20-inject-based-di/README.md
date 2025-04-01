# Inject-based dependency injection

Creating an injectable service is the first part of the dependency injection (DI) system in Angular. How do you inject a service into a component? Angular has a convenient function called `inject()` that can be used in the proper context.

Note: Injection contexts are beyond the scope of this tutorial, but you can find more information in the [Angular Docs](guide/di/dependency-injection-context) if you would like to learn more.

In this activity, you'll learn how to inject a service and use it in a component.

<hr>

It is often helpful to initialize class properties with values provided by the DI system. Here's an example:

<docs-code language="ts" highlight="[3]">
@Component({...})
class PetCareDashboardComponent {
    petRosterService = inject(PetRosterService);
}
</docs-code>

<docs-workflow>

<docs-step title="Inject the `CarService`">

In `app.component.ts`, using the `inject()` function inject the `CarService` and assign it to a property called `carService`

Note: Notice the difference between the property `carService` and the class `CarService`.

</docs-step>

<docs-step title="Use the `carService` instance">

Calling `inject(CarService)` gave you an instance of the `CarService` that you can use in your application, stored in the `carService` property.

In the `constructor` function of the `AppComponent`, add the following implementation:

```ts
constructor() {
    this.display = this.carService.getCars().join(' ⭐️ ');
}
```

</docs-step>

<docs-step title="Update the `AppComponent` template">

Update the component template in `app.component.ts` with the following code:

```ts
template: `<p>Car Listing: {{ display }}</p>`,
```

</docs-step>

</docs-workflow>

You've just injected your first service into a component - fantastic effort. Before you finish this section on DI, you'll learn an alternative syntax to inject resources into your components.
