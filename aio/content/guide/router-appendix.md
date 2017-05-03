# Router Appendix

This appendix elaborates on some points mentioned earlier in the router guide.

## Link parameters array

A link parameters array holds the following ingredients for router navigation:

* The *path* of the route to the destination component.
* Required and optional route parameters that go into the route URL.

You can bind the `RouterLink` directive to such an array like this:


<code-example path="router/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (h-anchor)" region="h-anchor">

</code-example>



You've written a two element array when specifying a route parameter like this:


<code-example path="router/src/app/heroes/hero-list.component.1.ts" linenums="false" title="src/app/heroes/hero-list.component.ts (nav-to-detail)" region="nav-to-detail">

</code-example>



You can provide optional route parameters in an object like this:


<code-example path="router/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (cc-query-params)" region="cc-query-params">

</code-example>



These three examples cover the need for an app with one level routing.
The moment you add a child router, such as the crisis center, you create new link array possibilities.

Recall that you specified a default child route for the crisis center so this simple `RouterLink` is fine.


<code-example path="router/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (cc-anchor-w-default)" region="cc-anchor-w-default">

</code-example>



Parse it out.

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route so you're done with it.
* There is no default for the child route so you need to pick one.
* You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash.
* Voilà! `['/crisis-center']`.

Take it a step further. Consider the following router link that
navigates from the root of the application down to the *Dragon Crisis*:


<code-example path="router/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (Dragon-anchor)" region="Dragon-anchor">

</code-example>



* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route so you're done with it.
* The second item identifies the child route details about a particular crisis (`/:id`).
* The details child route requires an `id` route parameter.
* You added the `id` of the *Dragon Crisis* as the second item in the array (`1`).
* The resulting path is `/crisis-center/1`.


If you wanted to, you could redefine the `AppComponent` template with *Crisis Center* routes exclusively:


<code-example path="router/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>



In sum, you can write applications with one, two or more levels of routing.
The link parameters array affords the flexibility to represent any routing depth and
any legal sequence of route paths, (required) router parameters, and (optional) route parameter objects.


{@a browser-url-styles}

{@a location-strategy}

## *LocationStrategy* and browser URL styles

When the router navigates to a new component view, it updates the browser's location and history
with a URL for that view.
This is a strictly local URL. The browser shouldn't send this URL to the server
and should not reload the page.

Modern HTML5 browsers support
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>,
a technique that changes a browser's location and history without triggering a server page request.
The router can compose a "natural" URL that is indistinguishable from
one that would otherwise require a page load.

Here's the *Crisis Center* URL in this "HTML5 pushState" style:


<code-example format="nocode">
  localhost:3002/crisis-center/

</code-example>



Older browsers send page requests to the server when the location URL changes
_unless_ the change occurs after a "#" (called the "hash").
Routers can take advantage of this exception by composing in-application route
URLs with hashes.  Here's a "hash URL" that routes to the *Crisis Center*.


<code-example format="nocode">
  localhost:3002/src/#/crisis-center/

</code-example>



The router supports both styles with two `LocationStrategy` providers:

1. `PathLocationStrategy`&mdash;the default "HTML5 pushState" style.
1. `HashLocationStrategy`&mdash;the "hash URL" style.

The `RouterModule.forRoot` function sets the `LocationStrategy` to the `PathLocationStrategy`,
making it the default strategy.
You can switch to the `HashLocationStrategy` with an override during the bootstrapping process if you prefer it.


<div class="l-sub-section">



Learn about providers and the bootstrap process in the
[Dependency Injection guide](guide/dependency-injection#bootstrap).


</div>



### Which strategy is best?

You must choose a strategy and you need to make the right call early in the project.
It won't be easy to change later once the application is in production
and there are lots of application URL references in the wild.

Almost all Angular projects should use the default HTML5 style.
It produces URLs that are easier for users to understand.
And it preserves the option to do _server-side rendering_ later.

Rendering critical pages on the server is a technique that can greatly improve
perceived responsiveness when the app first loads.
An app that would otherwise take ten or more seconds to start
could be rendered on the server and delivered to the user's device
in less than a second.

This option is only available if application URLs look like normal web URLs
without hashes (#) in the middle.

Stick with the default unless you have a compelling reason to
resort to hash routes.

### HTML5 URLs and the  *&lt;base href>*

While the router uses the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="Browser history push-state">HTML5 pushState</a>
style by default, you *must* configure that strategy with a **base href**.

The preferred way to configure the strategy is to add a
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a>
tag in the `<head>` of the `index.html`.


<code-example path="router/src/index.html" linenums="false" title="src/index.html (base-href)" region="base-href">

</code-example>



Without that tag, the browser may not be able to load resources
(images, CSS, scripts) when "deep linking" into the app.
Bad things could happen when someone pastes an application link into the
browser's address bar or clicks such a link in an email.

Some developers may not be able to add the `<base>` element, perhaps because they don't have
access to `<head>` or the `index.html`.

Those developers may still use HTML5 URLs by taking two remedial steps:

1. Provide the router with an appropriate [APP_BASE_HREF][] value.
1. Use _root URLs_ for all web resources: CSS, images, scripts, and template HTML files.

[APP_BASE_HREF]: ../api/common/index/APP_BASE_HREF-let.html


### *HashLocationStrategy*

You can go old-school with the `HashLocationStrategy` by
providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot`
in the `AppModule`.


<code-example path="router/src/app/app.module.6.ts" linenums="false" title="src/app/app.module.ts (hash URL strategy)">

</code-example>

