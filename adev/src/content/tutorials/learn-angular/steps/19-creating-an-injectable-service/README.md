# Creating an injectable service

Dependency injection (DI) in Angular is one of the framework's most powerful features. Consider dependency injection to be the ability for Angular to _provide_ resources you need for your application at runtime. A dependency could be a service or some other resources.

NOTE: Learn more about [dependency injection in the essentials guide](/essentials/dependency-injection).

In this activity, you'll learn how to create an `injectable` service.

<hr>

One way to use a service is to act as a way to interact with data and APIs. To make a service reusable you should keep the logic in the service and share it throughout the application when it is needed.

To make a class eligible to be injected by the DI system, use the `@Service` decorator. For example:

```ts {highlight:[1]}
@Service()
class UserService {
  // methods to retrieve and return data
}
```

The `@Service` decorator marks the class as a service and notifies the DI system that `UserService` can be accessed anywhere in your application. By default, Angular provides the service across your entire application, so you don't need to write any extra configuration.

NOTE: By default, `@Service` provides the class at the root injector. If you want to provide it manually, for example, to scope it to a specific route or component, set `autoProvided: false`. Learn more in the [guide on creating and using services](guide/di/creating-and-using-services#using-the-service-decorator).

Alright, you try:

<docs-workflow>

<docs-step title="Add the `@Service` decorator">
Update the code in `car.service.ts` by adding the `@Service()` decorator to the `CarService` class.

TIP: Use the above example to find the correct syntax.

</docs-step>

</docs-workflow>

Well, done 👍 that service is now `injectable` and can participate in the fun. Now that the service is `injectable`, let's try injecting it into a component 👉
