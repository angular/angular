@title
Multiple Components

@intro
We refactor the master/detail view into separate components.

@description
Our app is growing.
Use cases are flowing in for reusing components, passing data to components, and creating more reusable assets. Let's separate the heroes list from the hero details and make the details component reusable.

Run the <live-example></live-example> for this part.

## Where We Left Off
Before we continue with our Tour of Heroes, let’s verify we have the following structure. If not, we’ll need to go back and follow the previous chapters.

<aio-filetree>

  <aio-folder>
    angular-tour-of-heroes
    <aio-folder>
      src
      <aio-folder>
        app
        <aio-file>
          app.component.ts
        </aio-file>


        <aio-file>
          app.module.ts
        </aio-file>


      </aio-folder>


      <aio-file>
        main.ts
      </aio-file>


      <aio-file>
        index.html
      </aio-file>


      <aio-file>
        styles.css
      </aio-file>


      <aio-file>
        systemjs.config.js
      </aio-file>


      <aio-file>
        tsconfig.json
      </aio-file>


    </aio-folder>


    <aio-file>
      node_modules ...   
    </aio-file>


    <aio-file>
      package.json
    </aio-file>


  </aio-folder>


</aio-filetree>

### Keep the app transpiling and running
We want to start the TypeScript compiler, have it watch for changes, and start our server. We'll do this by typing

<code-example language="sh" class="code-shell">
  npm start  
    
</code-example>

This will keep the application running while we continue to build the Tour of Heroes.

## Making a Hero Detail Component
Our heroes list and our hero details are in the same component in the same file.
They're small now but each could grow. 
We are sure to receive new requirements for one and not the other.
Yet every change puts both components at risk and doubles the testing burden without benefit.
If we had to reuse the hero details elsewhere in our app,
the heroes list would tag along for the ride. 

Our current component violates the 
[Single Responsibility Principle](https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html).
It's only a tutorial but we can still do things right &mdash; 
especially if doing them right is easy and we learn how to build Angular apps in the process.

Let’s break the hero details out into its own component.

### Separating the Hero Detail Component
Add a new file named `hero-detail.component.ts` to the `app` folder and create `HeroDetailComponent` as follows.


{@example 'toh-3/ts/src/app/hero-detail.component.ts' region='v1'}


### Naming conventions
We like to identify at a glance which classes are components and which files contain components. 

Notice that  we have an `AppComponent` in a file named `app.component.ts` and our new
`HeroDetailComponent` is in a file named `hero-detail.component.ts`. 

All of our component names end in "Component".  All of our component file names end in ".component".

We spell our file names in lower **[dash case](../guide/glossary.html#dash-case)** 
(AKA **[kebab-case](../guide/glossary.html#kebab-case)**) so we don't worry about
case sensitivity on the server or in source control.

<!-- TODO
.l-sub-section
  :marked
    Learn more about naming conventions in the chapter [Naming Conventions]
:marked
-->We begin by importing the `Component` and `Input` decorators from Angular because we're going to need them soon.
  
We create metadata with the `@Component` decorator where we 
specify the selector name that identifies this component's element.
Then we export the class to make it available to other components.

When we finish here, we'll import it into `AppComponent` and create a corresponding `<my-hero-detail>`  element.#### Hero Detail Template
At the moment, the *Heroes* and *Hero Detail* views are combined in one template in `AppComponent`.
Let’s **cut** the *Hero Detail* content from `AppComponent` and **paste** it into the new template property of  `HeroDetailComponent`.

We previously bound to the `selectedHero.name` property of the `AppComponent`.
Our `HeroDetailComponent` will have a `hero` property, not a `selectedHero` property.
So we replace `selectedHero` with `hero` everywhere in our new template. That's our only change.
The result looks like this:


{@example 'toh-3/ts/src/app/hero-detail.component.ts' region='template'}

Now our hero detail layout exists only in the `HeroDetailComponent`.

#### Add the *hero* property
Let’s add that `hero` property we were talking about to the component class.

{@example 'toh-3/ts/src/app/hero-detail.component.ts' region='hero'}

Uh oh. We declared the `hero` property as type `Hero` but our `Hero` class is over in the `app.component.ts` file. 
We have two components, each in their own file, that need to reference the `Hero` class. 

We solve the problem by relocating the `Hero` class from `app.component.ts` to its own `hero.ts` file.


{@example 'toh-3/ts/src/app/hero.ts'}

We export the `Hero` class from `hero.ts` because we'll need to reference it in both component files. 
Add the following import statement near the top of **both `app.component.ts` and `hero-detail.component.ts`**.


{@example 'toh-3/ts/src/app/hero-detail.component.ts' region='hero-import'}

#### The *hero* property is an ***input***

The `HeroDetailComponent` must be told what hero to display. Who will tell it? The parent `AppComponent`! 

The `AppComponent` knows which hero to show: the hero that the user selected from the list. 
The user's selection is in its `selectedHero` property.

We will soon update the `AppComponent` template so that it binds its `selectedHero` property
to the `hero` property of our `HeroDetailComponent`. The binding *might* look like this:
<code-example language="html">
  &lt;my-hero-detail [hero]="selectedHero">&lt;/my-hero-detail>
</code-example>

Notice that the `hero` property is the ***target*** of a property binding &mdash; it's in square brackets to the left of the (=).

Angular insists that we declare a ***target*** property to be an ***input*** property.
If we don't, Angular rejects the binding and throws an error.
We explain input properties in more detail [here](../guide/attribute-directives.html#why-input) 
where we also explain why *target* properties require this special treatment and 
*source* properties do not.There are a couple of ways we can declare that `hero` is an *input*. 
We'll do it the way we *prefer*, by annotating the `hero` property with the `@Input` decorator that we imported earlier.

{@example 'toh-3/ts/src/app/hero-detail.component.ts' region='hero-input'}


Learn more about the `@Input()` decorator in the 
[Attribute Directives](../guide/attribute-directives.html#input) chapter.

## Refresh the AppModule
We return to the `AppModule`, the application's root module, and teach it to use the `HeroDetailComponent`.

We begin by importing the `HeroDetailComponent` so we can refer to it.


{@example 'toh-3/ts/src/app/app.module.ts' region='hero-detail-import'}

Then we add `HeroDetailComponent` to the `NgModule` decorator's `declarations` array.
This array contains the list of all components, pipes, and directives that we created
and that belong in our application's module.


{@example 'toh-3/ts/src/app/app.module.ts' region='declarations'}


## Refresh the AppComponentNow that the application knows about our `HeroDetailComponent`, 
find the location in the `AppComponent` template where we removed the *Hero Detail* content
and add an element tag that represents the `HeroDetailComponent`.
<code-example language="html">
  &lt;my-hero-detail>&lt;/my-hero-detail>
</code-example>


*my-hero-detail* is the name we set as the  `selector` in the `HeroDetailComponent` metadata.The two components won't coordinate until we bind the `selectedHero` property of the `AppComponent` 
to the `HeroDetailComponent` element's `hero` property  like this:
<code-example language="html">
  &lt;my-hero-detail [hero]="selectedHero">&lt;/my-hero-detail>
</code-example>

The `AppComponent`’s template should now look like this


{@example 'toh-3/ts/src/app/app.component.ts' region='hero-detail-template'}

Thanks to the binding, the `HeroDetailComponent` should receive the hero from the `AppComponent` and display that hero's detail beneath the list.
The detail should update every time the user picks a new hero.
### It works!
When we view our app in the browser we see the list of heroes. 
When we select a hero we can see the selected hero’s details. 

What's fundamentally new is that we can use this `HeroDetailComponent`
to show hero details anywhere in the app.

We’ve created our first reusable component!

### Reviewing the App Structure
Let’s verify that we have the following structure after all of our good refactoring in this chapter:

<aio-filetree>

  <aio-folder>
    angular-tour-of-heroes
    <aio-folder>
      src
      <aio-folder>
        app
        <aio-file>
          app.component.ts
        </aio-file>


        <aio-file>
          app.module.ts
        </aio-file>


        <aio-file>
          hero.ts
        </aio-file>


        <aio-file>
          hero-detail.component.ts
        </aio-file>


      </aio-folder>


      <aio-file>
        main.ts
      </aio-file>


      <aio-file>
        index.html
      </aio-file>


      <aio-file>
        styles.css
      </aio-file>


      <aio-file>
        systemjs.config.js
      </aio-file>


      <aio-file>
        tsconfig.json
      </aio-file>


    </aio-folder>


    <aio-file>
      node_modules ...
    </aio-file>


    <aio-file>
      package.json
    </aio-file>


  </aio-folder>


</aio-filetree>

Here are the code files we discussed in this chapter.

<md-tab-group>

  <md-tab label="src/app/hero-detail.component.ts">
    {@example 'toh-3/ts/src/app/hero-detail.component.ts'}
  </md-tab>


  <md-tab label="src/app/app.component.ts">
    {@example 'toh-3/ts/src/app/app.component.ts'}
  </md-tab>


  <md-tab label="src/app/hero.ts">
    {@example 'toh-3/ts/src/app/hero.ts'}
  </md-tab>


  <md-tab label="src/app/app.module.ts">
    {@example 'toh-3/ts/src/app/app.module.ts'}
  </md-tab>


</md-tab-group>


## The Road We’ve Travelled
Let’s take stock of what we’ve built.

* We created a reusable component
* We learned how to make a component accept input
* We learned to declare the application directives we need in an Angular module. We
list the directives in the `NgModule` decorator's `declarations` array.
* We learned to bind a parent component to a child component.

Run the <live-example></live-example> for this part.

## The Road Ahead
Our Tour of Heroes has become more reusable with shared components. 

We're still getting our (mock) data within the `AppComponent`.
That's not sustainable. 
We should refactor data access to a separate service
and share it among the components that need data. 

We’ll learn to create services in the [next tutorial](toh-pt4.html) chapter.