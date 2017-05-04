@title
Services

@intro
Create a reusable service to manage the hero data calls.

@description


As the Tour of Heroes app evolves, you'll add more components that need access to hero data.

Instead of copying and pasting the same code over and over,
you'll create a single reusable data service and
inject it into the components that need it.
Using a separate service keeps components lean and focused on supporting the view,
and makes it easy to unit-test components with a mock service.

Because data services are invariably asynchronous,
you'll finish the page with a *Promise*-based version of the data service.

When you're done with this page, the app should look like this <live-example></live-example>.



## Where you left off
Before continuing with the Tour of Heroes, verify that you have the following structure.
If not, go back to the previous pages.


<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          hero.ts
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        systemjs.config.js
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>



## Keep the app transpiling and running
Enter the following command in the terminal window:


<code-example language="sh" class="code-shell">
  npm start

</code-example>



This command runs the TypeScript compiler in "watch mode", recompiling automatically when the code changes.
The command simultaneously launches the app in a browser and refreshes the browser when the code changes.

You can keep building the Tour of Heroes without pausing to recompile or refresh the browser.

## Creating a hero service
The stakeholders want to show the heroes in various ways on different pages.
Users can already select a hero from a list.
Soon you'll add a dashboard with the top performing heroes and create a separate view for editing hero details.
All three views need hero data.

At the moment, the `AppComponent` defines mock heroes for display.
However, defining heroes is not the component's job,
and you can't easily share the list of heroes with other components and views.
In this page, you'll move the hero data acquisition business to a single service that provides the data and
share that service with all components that need the data.

### Create the HeroService
Create a file in the `app` folder called `hero.service.ts`.

<div class="l-sub-section">



The naming convention for service files is the service name in lowercase followed by `.service`.
For a multi-word service name, use lower [dash-case](guide/glossary).
For example, the filename for `SpecialSuperHeroService` is `special-super-hero.service.ts`.

</div>



Name the class `HeroService` and export it for others to import.


<code-example path="toh-pt4/src/app/hero.service.1.ts" region="empty-class" title="src/app/hero.service.ts (starting point)" linenums="false">

</code-example>



### Injectable services
Notice that you imported the Angular `Injectable` function and applied that function as an `@Injectable()` decorator.

<div class="callout is-helpful">



Don't forget the parentheses. Omitting them leads to an error that's difficult to diagnose.

</div>



The `@Injectable()` decorator tells TypeScript to emit metadata about the service.
The metadata specifies that Angular may need to inject other dependencies into this service.

Although the `HeroService` doesn't have any dependencies at the moment,
applying the `@Injectable()` decorator ​from the start ensures
consistency and future-proofing.


### Getting hero data
Add a `getHeroes()` method stub.


<code-example path="toh-pt4/src/app/hero.service.1.ts" region="getHeroes-stub" title="src/app/hero.service.ts (getHeroes stub)" linenums="false">

</code-example>



The `HeroService` could get `Hero` data from anywhere&mdash;a
web service, local storage, or a mock data source.
Removing data access from the component means
you can change your mind about the implementation anytime,
without touching the components that need hero data.

### Move the mock hero data
Cut the `HEROES` array from `app.component.ts` and paste it to a new file in the `app` folder named `mock-heroes.ts`.
Additionally, copy the `import {Hero} ...` statement because the heroes array uses the `Hero` class.


<code-example path="toh-pt4/src/app/mock-heroes.ts" title="src/app/mock-heroes.ts">

</code-example>



The `HEROES` constant is exported so it can be imported elsewhere, such as the `HeroService`.

In `app.component.ts`, where you cut the `HEROES` array,
add an uninitialized `heroes` property:

<code-example path="toh-pt4/src/app/app.component.1.ts" region="heroes-prop" title="src/app/app.component.ts (heroes property)" linenums="false">

</code-example>



### Return mocked hero data
Back in the `HeroService`, import the mock `HEROES` and return it from the `getHeroes()` method.
The `HeroService` looks like this:

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="full" title="src/app/hero.service.ts" linenums="false">

</code-example>



### Import the hero service
You're ready to use the `HeroService` in other components, starting with `AppComponent`.

Import the `HeroService` so that you can reference it in the code.

<code-example path="toh-pt4/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (hero-service-import)" region="hero-service-import">

</code-example>



### Don't use *new* with the *HeroService*
How should the `AppComponent` acquire a runtime concrete `HeroService` instance?

You could create a new instance of the `HeroService` with `new` like this:

<code-example path="toh-pt4/src/app/app.component.1.ts" region="new-service" title="src/app/app.component.ts" linenums="false">

</code-example>



However, this option isn't ideal for the following reasons:

* The component has to know how to create a `HeroService`.
If you change the `HeroService` constructor,
you must find and update every place you created the service.
Patching code in multiple places is error prone and adds to the test burden.
* You create a service each time you use `new`.
What if the service caches heroes and shares that cache with others?
You couldn't do that.
* With the `AppComponent` locked into a specific implementation of the `HeroService`,
switching implementations for different scenarios, such as operating offline or using
different mocked versions for testing, would be difficult.


### Inject the *HeroService*

Instead of using the *new* line, you'll add two lines.

 * Add a constructor that also defines a private property.
 * Add to the component's `providers` metadata.

Add the constructor:

<code-example path="toh-pt4/src/app/app.component.1.ts" region="ctor" title="src/app/app.component.ts (constructor)">

</code-example>



The constructor itself does nothing. The parameter simultaneously
defines a private `heroService` property and identifies it as a `HeroService` injection site.

Now Angular knows to supply an instance of the `HeroService` when it creates an `AppComponent`.


<div class="l-sub-section">



Read more about dependency injection in the [Dependency Injection](guide/dependency-injection) page.

</div>



The *injector* doesn't know yet how to create a `HeroService`.
If you ran the code now, Angular would fail with this error:

<code-example format="nocode">
  EXCEPTION: No provider for HeroService! (AppComponent -> HeroService)
</code-example>



To teach the injector how to make a `HeroService`,
add the following `providers` array property to the bottom of the component metadata
in the `@Component` call.



<code-example path="toh-pt4/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (providers)" region="providers">

</code-example>



The `providers` array  tells Angular to create a fresh instance of the `HeroService` when it creates an `AppComponent`.
The `AppComponent`, as well as its child components, can use that service to get hero data.

{@a child-component}


### *getHeroes()* in the *AppComponent*
The service is in a `heroService` private variable.

You could call the service and get the data in one line.

<code-example path="toh-pt4/src/app/app.component.1.ts" region="get-heroes" title="src/app/app.component.ts" linenums="false">

</code-example>



You don't really need a dedicated method to wrap one line.  Write it anyway:


<code-example path="toh-pt4/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (getHeroes)" region="getHeroes">

</code-example>

{@a oninit}

### The *ngOnInit* lifecycle hook
`AppComponent` should fetch and display hero data with no issues.

 You might be tempted to call the `getHeroes()` method in a constructor, but
a constructor should not contain complex logic,
especially a constructor that calls a server, such as a data access method.
The constructor is for simple initializations, like wiring constructor parameters to properties.

To have Angular call `getHeroes()`, you can implement the Angular *ngOnInit lifecycle hook*.
Angular offers interfaces for tapping into critical moments in the component lifecycle:
at creation, after each change, and at its eventual destruction.

Each interface has a single method. When the component implements that method, Angular calls it at the appropriate time.

<div class="l-sub-section">



Read more about lifecycle hooks in the [Lifecycle Hooks](guide/lifecycle-hooks) page.

</div>



Here's the essential outline for the `OnInit` interface (don't copy this into your code):

<code-example path="toh-pt4/src/app/app.component.1.ts" region="on-init" title="src/app/app.component.ts" linenums="false">

</code-example>



Add the implementation for the `OnInit` interface to your export statement:

<code-example format="nocode">
  export class AppComponent implements OnInit {}
</code-example>



Write an `ngOnInit` method with the initialization logic inside. Angular will call it
at the right time. In this case, initialize by calling `getHeroes()`.

<code-example path="toh-pt4/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (ng-on-init)" region="ng-on-init">

</code-example>



The app should run as expected, showing a list of heroes and a hero detail view
when you click on a hero name.
{@a async}

## Async services and Promises
The `HeroService` returns a list of mock heroes immediately;
its `getHeroes()` signature is synchronous.

<code-example path="toh-pt4/src/app/app.component.1.ts" region="get-heroes" title="src/app/app.component.ts" linenums="false">

</code-example>



Eventually, the hero data will come from a remote server.
When using a remote server, users don't have to wait for the server to respond;
additionally, you aren't able to block the UI during the wait.


To coordinate the view with the response, 
you can use *Promises*, which is an asynchronous 
technique that changes the signature of the `getHeroes()` method.

### The hero service makes a Promise

A *Promise* essentially promises to call back when the results are ready.
You ask an asynchronous service to do some work and give it a callback function.
The service does that work and eventually calls the function with the results or an error.

<div class="l-sub-section">



This is a simplified explanation. Read more about ES2015 Promises in the
[Promises for asynchronous programming](http://exploringjs.com/es6/ch_promises.html) page of
[Exploring ES6](http://http://exploringjs.com/es6.html).


</div>



Update the `HeroService` with this Promise-returning `getHeroes()` method:

<code-example path="toh-pt4/src/app/hero.service.ts" region="get-heroes" title="src/app/hero.service.ts (excerpt)" linenums="false">

</code-example>



You're still mocking the data. You're simulating the behavior of an ultra-fast, zero-latency server,
by returning an *immediately resolved Promise* with the mock heroes as the result.

### Act on the Promise

As a result of the change to `HeroService`, `this.heroes` is now set to a `Promise` rather than an array of heroes.

<code-example path="toh-pt4/src/app/app.component.1.ts" region="getHeroes" title="src/app/app.component.ts (getHeroes - old)" linenums="false">

</code-example>



You have to change the implementation to *act on the `Promise` when it resolves*.
When the `Promise` resolves successfully, you'll have heroes to display.

Pass the callback function as an argument to the Promise's `then()` method:

<code-example path="toh-pt4/src/app/app.component.ts" region="get-heroes" title="src/app/app.component.ts (getHeroes - revised)" linenums="false">

</code-example>



<div class="l-sub-section">



As described in [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions),
the ES2015 arrow function
in the callback is more succinct than the equivalent function expression and gracefully handles `this`.

</div>



The callback sets the component's `heroes` property to the array of heroes returned by the service.

The app is still running, showing a list of heroes, and
responding to a name selection with a detail view.

<div class="l-sub-section">



At the end of this page, [Appendix: take it slow](tutorial/toh-pt4#slow) describes what the app might be like with a poor connection.

</div>



## Review the app structure
Verify that you have the following structure after all of your refactoring:


<div class='filetree'>

  <div class='file'>
    angular-tour-of-heroes
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          hero.ts
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

        <div class='file'>
          hero.service.ts
        </div>

        <div class='file'>
          mock-heroes.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        systemjs.config.js
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>



Here are the code files discussed in this page.


<code-tabs>

  <code-pane title="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts">

  </code-pane>

  <code-pane title="src/app/app.component.ts" path="toh-pt4/src/app/app.component.ts">

  </code-pane>

  <code-pane title="src/app/mock-heroes.ts" path="toh-pt4/src/app/mock-heroes.ts">

  </code-pane>

</code-tabs>



## The road you've travelled
Here's what you achieved in this page:

* You created a service class that can be shared by many components.
* You used the `ngOnInit` lifecycle hook to get the hero data when the `AppComponent` activates.
* You defined the `HeroService` as a provider for the `AppComponent`.
* You created mock hero data and imported them into the service.
* You designed the service to return a Promise and the component to get the data from the Promise.

Your app should look like this <live-example></live-example>.

## The road ahead
The Tour of Heroes has become more reusable using shared components and services.
The next goal is to create a dashboard, add menu links that route between the views, and format data in a template.
As the app evolves, you'll discover how to design it to make it easier to grow and maintain.

Read about the Angular component router and navigation among the views in the [next tutorial](tutorial/toh-pt5 "Routing and Navigation") page.

{@a slow}

## Appendix: Take it slow
To simulate a slow connection,
import the `Hero` symbol and add the following `getHeroesSlowly()` method to the `HeroService`.

<code-example path="toh-pt4/src/app/hero.service.ts" region="get-heroes-slowly" title="app/hero.service.ts (getHeroesSlowly)" linenums="false">

</code-example>



Like `getHeroes()`, it also returns a `Promise`.
But this Promise waits two seconds before resolving the Promise with mock heroes.

Back in the `AppComponent`, replace `getHeroes()` with `getHeroesSlowly()`
and see how the app behaves.
