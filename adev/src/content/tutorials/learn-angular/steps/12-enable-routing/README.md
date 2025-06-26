# Routing Overview

For most apps, there comes a point where the app requires more than a single page. When that time inevitably comes, routing becomes a big part of the performance story for users.

Note: Learn more about [routing in the in-depth guide](/guide/routing).

In this activity, you'll learn how to set up and configure your app to use Angular Router.

<hr>

<docs-workflow>

<docs-step title="Create an app.routes.ts file">

Inside `app.routes.ts`, make the following changes:

1. Import `Routes` from the `@angular/router` package.
2. Export a constant called `routes` of type `Routes`, assign it `[]` as the value.

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [];
```

</docs-step>

<docs-step title="Add routing to provider">

In `app.config.ts`, configure the app to Angular Router with the following steps:

1. Import the `provideRouter` function from `@angular/router`.
1. Import `routes` from the `./app.routes.ts`.
1. Call the `provideRouter` function with `routes` passed in as an argument in the `providers` array.

<docs-code language="ts" highlight="[2,3,6]">
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
providers: [provideRouter(routes)],
};
</docs-code>

</docs-step>

<docs-step title="Import `RouterOutlet` in the component">

Finally, to make sure your app is ready to use the Angular Router, you need to tell the app where you expect the router to display the desired content. Accomplish that by using the `RouterOutlet` directive from `@angular/router`.

Update the template for `App` by adding `<router-outlet />`

<docs-code language="angular-ts" highlight="[11]">
import { RouterOutlet } from '@angular/router';

@Component({
...
template: `     <nav>
      <a href="/">Home</a>
      |
      <a href="/user">User</a>
    </nav>
    <router-outlet />
  `,
imports: [RouterOutlet],
})
export class App {}
</docs-code>

</docs-step>

</docs-workflow>

Your app is now set up to use Angular Router. Nice work! 🙌

Keep the momentum going to learn the next step of defining the routes for our app.
