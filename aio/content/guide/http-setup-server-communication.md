# HTTP: Setup for server communication

Before you can use `HttpClient`, you must add it to the application's [root dependency injector](guide/dependency-injection). 

Most apps do so in the `providers` array of `ApplicationConfig` in `app.config.ts`.

<code-example header="app.config.ts (excerpt)" path="http/src/app/app.config.ts" region="sketch"></code-example>

You can then inject the `HttpClient` service as a dependency of an application class, as shown in the following `ConfigService` example.

<code-example header="app/config/config.service.ts (excerpt)" path="http/src/app/config/config.service.ts" region="proto"></code-example>

<div class="alert is-helpful">

You can run the <live-example name="http"></live-example> that accompanies this guide.

The sample app does not require a data server.
It relies on the [Angular *in-memory-web-api*](https://github.com/angular/angular/tree/main/packages/misc/angular-in-memory-web-api), which replaces the *HttpClient* module's `HttpBackend`.
The replacement service simulates the behavior of a REST-like backend.

Look at the `bootstrapApplication()` method in `main.ts` to see how it is configured.

</div>

@reviewed 2023-08-16
