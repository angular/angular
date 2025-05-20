# Creating an injectable service

Dependency injection (DI) in Angular is one of the framework's most powerful features. Consider dependency injection to be the ability for Angular to _provide_ resources you need for your application at runtime. A dependency could be a service or some other resources.

Note: Learn more about [dependency injection in the essentials guide](/essentials/dependency-injection).

In this activity, you'll learn how to create an `injectable` service.

<hr>

One way to use a service is to act as a way to interact with data and APIs. To make a service reusable you should keep the logic in the service and share it throughout the application when it is needed.

To make a service eligible to be injected by the DI system use the `@Injectable` decorator. For example:

<docs-code language="ts" highlight="[1, 2, 3]">
@Injectable({
    providedIn: 'root'
})
class UserService {
    // methods to retrieve and return data
}
</docs-code>

The `@Injectable` decorator notifies the DI system that the `UserService` is available to be requested in a class. `providedIn` sets the scope in which this resource is available. For now, it is good enough to understand that `providedIn: 'root'` means that the `UserService` is available to the entire application.

Alright, you try:

<docs-workflow>

<docs-step title="Add the `@Injectable` decorator">
Update the code in `car.service.ts` by adding the `@Injectable` decorator.
</docs-step>

<docs-step title="Configure the decorator">
The values in the object passed to the decorator are considered to be the configuration for the decorator.
<br>
Update the `@Injectable` decorator in `car.service.ts` to include the configuration for `providedIn: 'root'`.

TIP: Use the above example to find the correct syntax.

</docs-step>

</docs-workflow>

Well, done 👍 that service is now `injectable` and can participate in the fun. Now that the service is `injectable`, let's try injecting it into a component 👉
