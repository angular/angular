# Route transition animations

#### Prerequisites

A basic understanding of the following concepts:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Reusable animations](guide/reusable-animations)

<hr>

Routing enables users to navigate between different routes in an application. When a user navigates from one route to another, the Angular router maps the URL path to a relevant component and displays its view. Animating this route transition can greatly enhance the user experience.

The Angular router comes with high-level animation functions that let you animate the transitions between views when a route changes. To produce an animation sequence when switching between routes, you need to define nested animation sequences. Start with the top-level component that hosts the view, and nest additional animations in the components that host the embedded views.

To enable routing transition animation, do the following:

1. Import the routing module into the application and create a routing configuration that defines the possible routes.
2. Add a router outlet to tell the Angular router where to place the activated components in the DOM.
3. Define the animation.


Let's illustrate a router transition animation by navigating between two routes, *Home* and *About* associated with the `HomeComponent` and `AboutComponent` views respectively. Both of these component views are children of the top-most view, hosted by `AppComponent`. We'll implement a router transition animation that slides in the new view to the right and slides out the old view when the user navigates between the two routes.

</br>

<div class="lightbox">
  <img src="generated/images/guide/animations/route-animation.gif" alt="Animations in action" width="440">
</div>

## Route configuration

To begin, configure a set of routes using methods available in the `RouterModule` class. This route configuration tells the router how to navigate.

Use the `RouterModule.forRoot` method to define a set of routes. Also, import this `RouterModule` to the `imports` array of the main module, `AppModule`.

<div class="alert is-helpful">

**Note:** Use the `RouterModule.forRoot` method in the root module, `AppModule`, to register top-level application routes and providers. For feature modules, call the `RouterModule.forChild` method to register additional routes.

</div>

The following configuration defines the possible routes for the application.

<code-example path="animations/src/app/app.module.ts" header="src/app/app.module.ts" region="route-animation-data" language="typescript"></code-example>

The `home` and `about` paths are associated with the `HomeComponent` and `AboutComponent` views. The route configuration tells the Angular router to instantiate the `HomeComponent` and `AboutComponent` views when the navigation matches the corresponding path.

In addition to `path` and `component`, the `data` property of each route defines the key animation-specific configuration associated with a route. The `data` property value is passed into `AppComponent` when the route changes. You can also pass additional data in route config that is consumed within the animation. The data property value has to match the transitions defined in the `routeAnimation` trigger, which we'll define later.

<div class="alert is-helpful">

**Note:** The `data` property names that you use can be arbitrary. For example, the name *animation* used in the example above is an arbitrary choice.

</div>

## Router outlet

After configuring the routes, tell the Angular router where to render the views when matched with a route. You can set a router outlet by inserting a `<router-outlet>` container inside the root `AppComponent` template.

The `<router-outlet>` container has an attribute directive that contains data about active routes and their states, based on the `data` property that we set in the route configuration.

<code-example path="animations/src/app/app.component.html" header="src/app/app.component.html" region="route-animations-outlet"></code-example>

`AppComponent` defines a method that can detect when a view changes. The method assigns an animation state value to the animation trigger (`@routeAnimation`) based on the route configuration `data` property value. Here's an example of an `AppComponent` method that detects when a route change happens.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="prepare-router-outlet" language="typescript"></code-example>

Here, the `prepareRoute()` method takes the value of the outlet directive (established through `#outlet="outlet"`) and returns a string value representing the state of the animation based on the custom data of the current active route. You can use this data to control which transition to execute for each route.

## Animation definition

Animations can be defined directly inside your components. For this example we are defining the animations in a separate file, which allows us to re-use the animations.

The following code snippet defines a reusable animation named `slideInAnimation`.


<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="route-animations" language="typescript"></code-example>

The animation definition does several things:

* Defines two transitions. A single trigger can define multiple states and transitions.
* Adjusts the styles of the host and child views to control their relative positions during the transition.
* Uses `query()` to determine which child view is entering and which is leaving the host view.

A route change activates the animation trigger, and a transition matching the state change is applied.

<div class="alert is-helpful">

**Note:** The transition states must match the `data` property value defined in the route configuration.
</div>

Make the animation definition available in your application by adding the reusable animation (`slideInAnimation`) to the `animations` metadata of the `AppComponent`.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="define" language="typescript"></code-example>

### Styling the host and child components

During a transition, a new view is inserted directly after the old one and both elements appear on screen at the same time. To prevent this, apply additional styling to the host view, and to the removed and inserted child views. The host view must use relative positioning, and the child views must use absolute positioning. Adding styling to the views animates the containers in place, without the DOM moving things around.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="style-view" language="typescript"></code-example>

### Querying the view containers

Use the `query()` method to find and animate elements within the current host component. The `query(":enter")` statement returns the view that is being inserted, and `query(":leave")` returns the view that is being removed.

Let's assume that we are routing from the *Home => About*.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts (Continuation from above)" region="query" language="typescript"></code-example>

The animation code does the following after styling the views:

* `query(':enter', style({ left: '-100%' }))` matches the view that is added and hides the newly added view by positioning it to the far left.
* Calls `animateChild()` on the view that is leaving, to run its child animations.
* Uses `group()` function to make the inner animations run in parallel.
* Within the `group()` function:
    * Queries the view that is removed and animates it to slide far to the right.
    * Slides in the new view by animating the view with an easing function and duration. </br>
    This animation results in the `about` view sliding from the left to right.
* Calls the `animateChild()` method on the new view to run its child animations after the main animation completes.

You now have a basic routable animation that animates routing from one view to another.

## More on Angular animations

You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Complex animation sequences](guide/complex-animation-sequences)
* [Reusable animations](guide/reusable-animations)
