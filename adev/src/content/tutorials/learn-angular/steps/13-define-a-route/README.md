# Define a Route

Now that you've set up the app to use Angular Router, you need to define the routes.

Note: Learn more about [defining a basic route in the in-depth guide](/guide/routing/common-router-tasks#defining-a-basic-route).

In this activity, you'll learn how to add and configure routes with your app.

<hr>

<docs-workflow>

<docs-step title="Define a route in `app.routes.ts`">

In your app, there are two pages to display: (1) Home Page and (2) User Page.

To define a route, add a route object to the `routes` array in `app.routes.ts` that contains:

- The `path` of the route (which automatically starts at the root path (i.e., `/`))
- The `component` that you want the route to display

```ts
import {Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];
```

The code above is an example of how `HomeComponent` can be added as a route. Now go ahead and implement this along with the `UserComponent` in the playground.

Use `'user'` for the path of `UserComponent`.

</docs-step>

<docs-step title="Add title to route definition">

In addition to defining the routes correctly, Angular Router also enables you to set the page title whenever users are navigating by adding the `title` property to each route.

In `app.routes.ts`, add the `title` property to the default route (`path: ''`) and the `user` route. Here's an example:

<docs-code language="ts" highlight="[8]">
import {Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    title: 'App Home Page',
    component: HomeComponent,
  },
];
</docs-code>

</docs-step>

</docs-workflow>

In the activity, you've learned how to define and configure routes in your Angular app. Nice work. 🙌

The journey to fully enabling routing in your app is almost complete, keep going.
