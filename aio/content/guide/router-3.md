# Milestone 3: Add a *Routing module*

In the initial route configuration, you provided a simple setup with two routes used
to configure the application for routing. This is perfectly fine for simple routing.
As the application grows and you make use of more `Router` features, such as guards,
resolvers, and child routing, you'll naturally want to refactor the routing configuration into its own file.
We recommend moving the routing information into a special-purpose module called a *Routing Module*.

The **Routing Module** has several characteristics:

* Separates routing concerns from other application concerns.
* Provides a module to replace or remove when testing the application.
* Provides a well-known location for routing service providers including guards and resolvers.
* Does **not** [declare components](cookbook/ngmodule-faq#routing-module).


{@a routing-refactor}


## Refactor the routing configuration into a _routing module_

Create a file named `app-routing.module.ts` in the `/app` folder to contain the routing module.

Import the `CrisisListComponent` and the `HeroListComponent` components
just like you did in the `app.module.ts`. Then move the `Router` imports
and routing configuration, including `RouterModule.forRoot`, into this routing module.

Following convention, add a class name `AppRoutingModule` and export it
so you can import it later in `AppModule`.

Finally, re-export the Angular `RouterModule` by adding it to the module `exports` array.
By re-exporting the `RouterModule` here and importing `AppRoutingModule` in `AppModule`,
the components declared in `AppModule` will have access to router directives such as `RouterLink` and `RouterOutlet`.

After these steps, the file should look like this.

<code-example path="router/src/app/app-routing.module.1.ts" title="src/app/app-routing.module.ts">

</code-example>



Next, update the `app.module.ts` file,
first importing the newly created `AppRoutingModule`from `app-routing.module.ts`,
then replacing `RouterModule.forRoot` in the `imports` array with the `AppRoutingModule`.

<code-example path="router/src/app/app.module.2.ts" title="src/app/app.module.ts">

</code-example>



<div class="l-sub-section">



Later in this guide you will create [multiple routing modules](guide/router-4#hero-routing-module) and discover that
you must import those routing modules [in the correct order](guide/router-4#routing-module-order).


</div>



The application continues to work just the same, and you can use `AppRoutingModule` as
the central place to maintain future routing configuration.


{@a why-routing-module}


## Do you need a _Routing Module_?

The _Routing Module_ *replaces* the routing configuration in the root or feature module.
_Either_ configure routes in the Routing Module _or_ within the module itself but not in both.

The Routing Module is a design choice whose value is most obvious when the configuration is complex
and includes specialized guard and resolver services.
It can seem like overkill when the actual configuration is dead simple.

Some developers skip the Routing Module (for example, `AppRoutingModule`) when the configuration is simple and
merge the routing configuration directly into the companion module (for example, `AppModule`).

Choose one pattern or the other and follow that pattern consistently.

Most developers should always implement a Routing Module for the sake of consistency.
It keeps the code clean when configuration becomes complex.
It makes testing the feature module easier.
Its existence calls attention to the fact that a module is routed.
It is where developers expect to find and expand routing configuration.

## Next step 

Organize a workflow or "feature" in its own [routed _Feature Module_](guide/router-4).
