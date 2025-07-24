# Inject-based dependency injection

Creating an injectable service is the first part of the dependency injection (DI) system in Angular. How do you inject a service into a component? Angular has a convenient function called `inject()` that can be used in the proper context.

NOTE: Injection contexts are beyond the scope of this tutorial, but you can learn more in the [dependency injection (DI) essentials guide](/essentials/dependency-injection) and [DI context guide](guide/di/dependency-injection-context).

In this activity, you'll learn how to inject a service and use it in a component.

<hr>

It is often helpful to initialize class properties with values provided by the DI system. Here's an example:

<docs-code language="ts" highlight="[3]">
@Component({...})
class PetCareDashboard {
  petRosterService = inject(PetRosterService);
}
</docs-code>

<docs-workflow>

<docs-step title="Inject the `CarService`">

In `app.ts`, using the `inject()` function inject the `CarService` and assign it to a property called `carService`

NOTE: Notice the difference between the property `carService` and the class `CarService`.

</docs-step>

<docs-step title="Use the `carService` instance">

Calling `inject(CarService)` gave you an instance of the `CarService` that you can use in your application, stored in the `carService` property.

Initialize the `display` property with the following implementation:

```ts
display = this.carService.getCars().join(' ⭐️ ');
```

</docs-step>

<docs-step title="Update the `App` template">

Update the component template in `app.ts` with the following code:

```ts
template: `<p>Car Listing: {{ display }}</p>`,
```

</docs-step>

</docs-workflow>

You've just injected your first service into a component - fantastic effort.
