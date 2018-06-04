

# Types of Feature Modules

#### Prerequisites

A basic understanding of the following concepts:
* [Feature Modules](guide/feature-modules).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
* [Frequently Used Modules](guide/frequent-ngmodules).

<hr>

There are five general categories of feature modules which
tend to fall into the following groups:

* Domain feature modules.
* Routed feature modules.
* Routing modules.
* Service feature modules.
* Widget feature modules.

While the following guidelines describe the use of each type and their
typical characteristics, in real world apps, you may see hybrids.

<table>

 <tr>
   <th style="vertical-align: top">
     Feature Module
   </th>

   <th style="vertical-align: top">
     Guidelines
   </th>
 </tr>

 <tr>
   <td>Domain</td>
   <td>
     Domain feature modules deliver a user experience dedicated to a particular application domain like editing a customer or placing an order.

     They typically have a top component that acts as the feature root and private, supporting sub-components descend from it.

     Domain feature modules consist mostly of declarations. Only the top component is exported.

     Domain feature modules rarely have providers. When they do, the lifetime of the provided services should be the same as the lifetime of the module.

     Domain feature modules are typically imported exactly once by a larger feature module.

     They might be imported by the root `AppModule` of a small application that lacks routing.
   </td>
 </tr>
 <tr>
   <td>Routed</td>
   <td>
     Routed feature modules are domain feature modules whose top components are the targets of router navigation routes.

     All lazy-loaded modules are routed feature modules by definition.

     Routed feature modules don’t export anything because their components never appear in the template of an external component.

     A lazy-loaded routed feature module should not be imported by any module. Doing so would trigger an eager load, defeating the purpose of lazy loading.That means you won’t see them mentioned among the `AppModule` imports. An eager loaded routed feature module must be imported by another module so that the compiler learns about its components.

     Routed feature modules rarely have providers for reasons explained in [Lazy Loading Feature Modules](/guide/lazy-loading-ngmodules). When they do, the lifetime of the provided services should be the same as the lifetime of the module. Don't provide application-wide singleton services in a routed feature module or in a module that the routed module imports.
   </td>
 </tr>

 <tr>
   <td>Routing</td>
   <td>

     A routing module provides routing configuration for another module and separates routing concerns from its companion module.

     A routing module typically does the following:

     <ul>
     <li>Defines routes.</li>
     <li>Adds router configuration to the module's imports.</li>
     <li>Adds guard and resolver service providers to the module's providers.</li>
     <li>The name of the routing module should parallel the name of its companion module, using the suffix "Routing". For example, <code>FooModule</code> in <code>foo.module.ts</code> has a routing module named <code>FooRoutingModule</code> in <code>foo-routing.module.ts</code>. If the companion module is the root <code>AppModule</code>, the <code>AppRoutingModule</code> adds router configuration to its imports with <code>RouterModule.forRoot(routes)</code>. All other routing modules are children that import <code>RouterModule.forChild(routes)</code>.</li>
     <li>A routing module re-exports the <code>RouterModule</code> as a convenience so that components of the companion module have access to router directives such as <code>RouterLink</code> and <code>RouterOutlet</code>.</li>
     <li>A routing module does not have its own declarations. Components, directives, and pipes are the responsibility of the feature module, not the routing module.</li>
     </ul>

     A routing module should only be imported by its companion module.

   </td>
 </tr>

 <tr>
   <td>Service</td>
   <td>

     Service modules provide utility services such as data access and messaging. Ideally, they consist entirely of providers and have no declarations. Angular's `HttpClientModule` is a good example of a service module.

     The root `AppModule` is the only module that should import service modules.

   </td>
 </tr>

 <tr>
   <td>Widget</td>
   <td>

     A widget module makes components, directives, and pipes available to external modules. Many third-party UI component libraries are widget modules.

     A widget module should consist entirely of declarations, most of them exported.

     A widget module should rarely have providers.

     Import widget modules in any module whose component templates need the widgets.

   </td>
 </tr>

</table>

The following table summarizes the key characteristics of each feature module group.

<table>
 <tr>
   <th style="vertical-align: top">
     Feature Module
   </th>

   <th style="vertical-align: top">
     Declarations
   </th>

   <th style="vertical-align: top">
     Providers
   </th>

   <th style="vertical-align: top">
     Exports
   </th>

   <th style="vertical-align: top">
     Imported by
   </th>
 </tr>

 <tr>
   <td>Domain</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Top component</td>
   <td>Feature, AppModule</td>
 </tr>

 <tr>
   <td>Routed</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>No</td>
   <td>None</td>
 </tr>

 <tr>
   <td>Routing</td>
   <td>No</td>
   <td>Yes (Guards)</td>
   <td>RouterModule</td>
   <td>Feature (for routing)</td>
 </tr>

 <tr>
   <td>Service</td>
   <td>No</td>
   <td>Yes</td>
   <td>No</td>
   <td>AppModule</td>
 </tr>

 <tr>
   <td>Widget</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Yes</td>
   <td>Feature</td>
 </tr>
</table>

<hr />

## More on NgModules

You may also be interested in the following:
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
