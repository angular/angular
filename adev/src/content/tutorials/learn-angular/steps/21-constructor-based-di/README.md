# Constructor-based dependency injection

In previous activities you used the `inject()` function to make resources available, "providing" them to your components. The `inject()` function is one pattern and it is useful to know that there is another pattern for injecting resources called constructor-based dependency injection.

You specify the resources as parameters to the `constructor` function of a component. Angular will make those resources available to your component.

Note: Learn more about [injecting services in the in-depth guide](/guide/di/creating-injectable-service#injecting-services).

In this activity, you will learn how to use constructor-based dependency injection.

<hr>

To inject a service or some other injectable resource into your component use the following syntax:

<docs-code language="ts" highlight="[3]">
@Component({...})
class PetCarDashboard {
    constructor(private petCareService: PetCareService) {
        ...
    }
}
</docs-code>

There are a few things to notice here:

- Use the `private` keyword
- The `petCareService` becomes a property you can use in your class
- The `PetCareService` class is the injected class

Alright, now you give this a try:

<docs-workflow>

<docs-step title="Update the code to use constructor-based DI">

In `app.ts`, update the constructor code to match the code below:

TIP: Remember, if you get stuck refer to the example on this activity page.

```ts
constructor(private carService: CarService) {
    this.display = this.carService.getCars().join(' ⭐️ ');
}
```

</docs-step>

</docs-workflow>

Congratulations on completing this activity. The example code works the same as with using the `inject` function. While these two approaches are largely the same, there are some small differences that are beyond the scope of this tutorial.

<br>

You can find out more information about dependency injection in the [Angular Documentation](guide/di).
