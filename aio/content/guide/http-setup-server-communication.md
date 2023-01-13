# HTTP: Setup for server communication

Before you can use `HttpClient`, you need to import the Angular `HttpClientModule`.
Most apps do so in the root `AppModule`.

<code-example header="app/app.module.ts (excerpt)" path="http/src/app/app.module.ts" region="sketch"></code-example>

You can then inject the `HttpClient` service as a dependency of an application class, as shown in the following `ConfigService` example.

<code-example header="app/config/config.service.ts (excerpt)" path="http/src/app/config/config.service.ts" region="proto"></code-example>

The `HttpClient` service makes use of [observables](guide/glossary#observable "Observable definition") for all transactions.
You must import the RxJS observable and operator symbols that appear in the example snippets.
These `ConfigService` imports are typical.

<code-example header="app/config/config.service.ts (RxJS imports)" path="http/src/app/config/config.service.ts" region="rxjs-imports"></code-example>

<div class="alert is-helpful">

You can run the <live-example></live-example> that accompanies this guide.

The sample app does not require a data server.
It relies on the [Angular *in-memory-web-api*](https://github.com/angular/angular/tree/main/packages/misc/angular-in-memory-web-api), which replaces the *HttpClient* module's `HttpBackend`.
The replacement service simulates the behavior of a REST-like backend.

Look at the `AppModule` *imports* to see how it is configured.

</div>

@reviewed 2022-11-03
