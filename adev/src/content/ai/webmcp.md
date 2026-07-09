# WebMCP

Web Model Context Protocol (WebMCP) is an [emerging web standard](https://github.com/webmachinelearning/webmcp/) that allows web applications to expose structured tools directly to AI agents running natively in the browser. Tools defined by an application allow AI assistants to interact with it directly, providing additional capabilities to the agent and reducing the need for DOM interactions.

For example, an application to register a new user might provide a WebMCP tool for a browser's AI agent to create the user directly rather than requiring the agent to go through a complex wizard UI via DOM interactions.

Angular provides experimental support for WebMCP, allowing you to easily register tools tied to your application's dependency injection lifecycle and automatically turn your Signal Forms into AI-ready tools.

IMPORTANT: The WebMCP spec is very early in its lifecycle and is undergoing frequent changes. As such, WebMCP support in Angular is currently [**experimental**](reference/releases#experimental). APIs are subject to change even outside of major versions.

## Provide tools for the application

Use [`provideExperimentalWebMcpTools`](api/core/provideExperimentalWebMcpTools) in your application config to register tools for the entire lifecycle of the application. Tools provided this way are automatically registered when the application initializes and unregistered when the application is destroyed.

The `execute` callback is invoked in the injection context of the associated `Injector`, meaning you can [`inject`](api/core/inject) services directly.

```ts {header:"main.ts"}
import {Service, inject, provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

@Service()
class Greeter {
  sayHello(): string {
    return 'Hello agent!';
  }
}

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'greet',
        description: 'Greets the agent.',
        inputSchema: {type: 'object', properties: {}},
        execute: () => {
          const greeter = inject(Greeter);

          return {content: [{type: 'text', text: greeter.sayHello()}]};
        },
      },
    ]),
  ],
});
```

### Define tool parameters

When a tool requires input from the AI assistant, define the expected arguments inside `inputSchema` using [JSON Schema](https://json-schema.org/) syntax. Angular automatically infers the parameter types passed into your `execute` callback based on the schema definition.

```ts {header:"main.ts"}
import {provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'searchCatalog',
        description: 'Searches the store catalog for products matching a query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search keywords.',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return.',
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
        execute: ({query, maxResults}) => {
          // Type of `query` is inferred as `string`.
          // Type of `maxResults` is inferred as `number | undefined`.

          // Consider validating this at runtime, since inputs may not be validated to match the schema.
          if (typeof query !== 'string') throw new Error(`Bad query: ${query}`);
          if (typeof maxResults !== 'number' && maxResults !== undefined)
            throw new Error(`Bad maxResults: ${maxResults}`);

          const limit = maxResults ?? 5;
          return {
            content: [{type: 'text', text: `Returning up to ${limit} results for "${query}".`}],
          };
        },
      },
    ]),
  ],
});
```

TIP: Use `required: ['param1', 'param2', ...]` to remove `undefined` from the types of those parameters and use `additionalProperties: false` to restrict the argument object's type to only these parameters.

## Provide tools for a route

When building complex applications, you may only want certain tools available when the user is viewing specific routes. You can achieve this by providing tools directly in route definitions.

```ts {header:"routes.ts"}
import {provideExperimentalWebMcpTools} from '@angular/core';
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then((m) => m.Dashboard),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'exportDashboardReports',
          description: 'Exports the current dashboard analytics.',
          inputSchema: {type: 'object', properties: {}},
          execute: () => ({
            content: [{type: 'text', text: 'Dashboard export successfully triggered.'}],
          }),
        },
      ]),
    ],
  },
];
```

NOTE: When registering tools to a particular route, consider configuring the router to use [`withExperimentalAutoCleanupInjectors`](api/router/withExperimentalAutoCleanupInjectors) to ensure tools are automatically _unregistered_ when the user navigates away from the route. Without this option, WebMCP tools declared on routes will remain accessible to AI agents even after the user has navigated to a different route.

```ts {header:"app.config.ts"}
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';
import {routes} from './routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withExperimentalAutoCleanupInjectors())],
};
```

## Provide tools within services

For dynamic use cases, the [`declareExperimentalWebMcpTool`](api/core/declareExperimentalWebMcpTool) function registers a tool directly within an injection context and automatically unregisters it when that context is destroyed.

```ts {header:"counter.ts"}
import {Service, declareExperimentalWebMcpTool, signal, inject} from '@angular/core';

@Service()
export class Counter {
  readonly count = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the global counter.',
      inputSchema: {type: 'object', properties: {}},
      execute: () => ({
        content: [{type: 'text', text: `The count is: ${this.count()}.`}],
      }),
    });
  }
}
```

While `declareExperimentalWebMcpTool` works in any injection context, watch out for [name collisions](#name-collisions) and prefer using it in root services.

## Implicit tools in Signal Forms

You can create a WebMCP tool implicitly from an existing Angular [Signal Form](essentials/signal-forms) with minimal configuration. Angular converts your form models into rich WebMCP tools, effectively supporting highly dynamic forms without requiring you to manually write JSON schemas or event handlers.

### Enable the WebMCP forms feature

First, add [`provideExperimentalWebMcpForms`](api/forms/signals/provideExperimentalWebMcpForms) to your root application providers:

```ts {header:"main.ts"}
import {bootstrapApplication} from '@angular/platform-browser';
import {provideExperimentalWebMcpForms} from '@angular/forms/signals';
import {AppRoot} from './app-root';

bootstrapApplication(AppRoot, {
  providers: [provideExperimentalWebMcpForms()],
});
```

### Opt in a Signal Form

Second, when defining a Signal Form using [`form`](api/forms/signals/form), pass the `experimentalWebMcpTool` configuration option to opt-in to an implicit WebMCP tool. Angular will inspect your form's data model and automatically generate a JSON schema for connected AI agents.

```ts {header:"user-registration.ts"}
import {Component, signal} from '@angular/core';
import {form, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
})
export class UserRegistration {
  private readonly model = signal({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly userForm = form(
    this.model,
    (f) => {
      required(f.firstName, {message: 'First name is mandatory.'});
      required(f.lastName, {message: 'Last name is mandatory.'});
    },
    {
      // Implicitly registers a WebMCP tool named `registerUser` with parameters derived from `model`.
      experimentalWebMcpTool: {
        name: 'registerUser',
        description: 'Registers a new user.',
      },
      submission: {
        action: async (formValue) => {
          console.log('Submitting user:', formValue);
          // ...
        },
      },
    },
  );
}
```

In this example, Angular generates a WebMCP tool with a JSON schema which:

1. includes `firstName`, `lastName`, `age`, and `hobbies` as parameters inferred from the initial value of the `model` signal.
2. defines `firstName` and `lastName` as _required_ fields as inferred from the [`required`](api/forms/signals/required) validator.
3. defines `hobbies` as an array of strings, allowing the agent to provide an arbitrary amount of hobbies.

Beyond inferring the input schema, Angular also connects the WebMCP tool to the form's validation logic and submission handler. This means the agent will observe any validation errors triggered by its inputs or any failures which happen during submission, allowing it to self-correct and potentially retry.

NOTE: Async validators are _not_ triggered and should be handled by the submission action.

#### Constraints

Angular infers the WebMCP schema from the initial value of your form model. This requires:

- Concrete initial values (`''`, `0`, `false`): Angular cannot infer data types from `null` or `undefined`.
- Non-empty arrays (`['Hello!']`): Angular cannot infer data types from an empty array and requires at least one initial value.

## Best practices

Keep the following best practices in mind:

### Name collisions

WebMCP requires each tool to have a unique name and will throw an error if the same tool name is registered multiple times. This means calling `declareExperimentalWebMcpTool` or `provideExperimentalWebMcpTools` in a context where they might be registered multiple times (such as a component constructor) may lead to errors at runtime.

Prefer placing tools on application providers, route providers, or root services where possible. When putting tools on a component, including [implicit tools in Signal Forms](#implicit-tools-in-signal-forms), ensure that component is only ever rendered on the page at most _once_ at any given time.

### Validate tool inputs

Angular does not provide any implicit validation that the inputs provided by an agent actually match the defined JSON schema. Consider explicitly validating arguments to the `execute` function before using them to ensure reliability.

### Testing

Consider using a mock WebMCP implementation like [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill) to effectively unit test your tools.
