@title
The Hero Editor

@intro
We build a simple hero editor.

@description
## Setup to develop locally
Real application development takes place in a local development environment like your machine.

Follow the [setup](../guide/setup.html) instructions for creating a new project
named <ngio-ex path="angular-tour-of-heroes"></ngio-ex>
after which the file structure should look like this:

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

When we're done with this first episode, the app runs like this <live-example></live-example>.

## Keep the app transpiling and running
We want to start the TypeScript compiler, have it watch for changes, and start our server. 
Do this by entering the following command in the terminal window.


<code-example language="sh" class="code-shell">
  npm start  
    
</code-example>

This command runs the compiler in watch mode, starts the server, launches the app in a browser,
and keeps the app running while we continue to build the Tour of Heroes.

## Show our Hero
We want to display Hero data in our app

Update the `AppComponent` so it has two properties: &nbsp; a `title` property for the application name and a `hero` property
for a hero named "Windstorm".


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='app-component-1'}

Now update the template in the `@Component` decoration with data bindings to these new properties.


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='show-hero'}

The browser should refresh and display our title and hero.

The double curly braces tell our app to read the `title` and `hero` properties from the component and render them.
This is the "interpolation" form of one-way data binding.
Learn more about interpolation in the [Displaying Data chapter](../guide/displaying-data.html).### Hero object

At the moment, our hero is just a name.  Our hero needs more properties.
Let's convert the `hero` from a literal string to a class.

Create a `Hero` class with `id` and `name` properties.
For now put this near the top of the `app.component.ts` file, just below the import statement.


{@example 'toh-1/ts/src/app/app.component.ts' region='hero-class-1'}

Now that we have a `Hero` class, let’s refactor our component’s `hero` property to be of type `Hero`.
Then initialize it with an id of `1` and the name, "Windstorm".


{@example 'toh-1/ts/src/app/app.component.ts' region='hero-property-1'}

Because we changed the hero from a string to an object,
we update the binding in the template to refer to the hero’s `name` property.


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='show-hero-2'}

The browser refreshes and continues to display our hero’s name.

### Adding more HTML
Displaying a name is good, but we want to see all of our hero’s properties.
We’ll add a `<div>` for our hero’s `id` property and another `<div>` for our hero’s `name`.


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='show-hero-properties'}

Uh oh, our template string is getting long. We better take care of that to avoid the risk of making a typo in the template.

### Multi-line template strings

We could make a more readable template with string concatenation
but that gets ugly fast, it is harder to read, and
it is easy to make a spelling error. Instead,
let’s take advantage of the template strings feature
in ES2015 and TypeScript to maintain our sanity.

Change the quotes around the template to back-ticks and
put the `<h1>`, `<h2>` and `<div>` elements on their own lines.


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='multi-line-strings'}


## Editing Our Hero

We want to be able to edit the hero name in a textbox.

Refactor the hero name `<label>` with `<label>` and `<input>` elements as shown below:


{@example 'toh-1/ts-snippets/app.component.snippets.pt1.ts' region='editing-Hero'}

We see in the browser that the hero’s name does appear in the `<input>` textbox.
But something doesn’t feel right.
When we change the name, we notice that our change
is not reflected in the `<h2>`. We won't get the desired behavior
with a one-way binding to `<input>`.

### Two-Way Binding

We intend to display the name of the hero in the `<input>`, change it,
and see those changes wherever we bind to the hero’s name.
In short, we want two-way data binding.

Before we can use two-way data binding for **form inputs**, we need to import the `FormsModule`
package in our Angular module. We add it to the `NgModule` decorator's `imports` array. This array contains the list
of external modules used by our application.
Now we have included the forms package which includes `ngModel`.


{@example 'toh-1/ts/src/app/app.module.ts'}


Learn more about the `FormsModule` and `ngModel` in the
[Forms](../guide/forms.html#ngModel) and
[Template Syntax](../guide/template-syntax.html#ngModel) chapters.
Let’s update the template to use the  **`ngModel`** built-in directive for two-way binding.

Replace the `<input>` with the following HTML

<code-example language="html">
  &lt;input [(ngModel)]="hero.name" placeholder="name">  
    
</code-example>

The browser refreshes. We see our hero again. We can edit the hero’s name and
see the changes reflected immediately in the `<h2>`.

## The Road We’ve Travelled
Let’s take stock of what we’ve built.

* Our Tour of Heroes uses the double curly braces of interpolation (a kind of one-way data binding)
to display the application title and properties of a `Hero` object.
* We wrote a multi-line template using ES2015’s template strings to make our template readable.
* We can both display and change the hero’s name after adding a two-way data binding to the `<input>` element
using the built-in `ngModel` directive.
* The `ngModel` directive also propagates changes to every other binding of the `hero.name`.

Run the <live-example></live-example> for this part.

Here's the complete `app.component.ts` as it stands now:


{@example 'toh-1/ts/src/app/app.component.ts' region='pt1'}


## The Road Ahead
Our Tour of Heroes only displays one hero and we really want to display a list of heroes.
We also want to allow the user to select a hero and display their details.
We’ll learn more about how to retrieve lists, bind them to the
template, and allow a user to select a hero in the
[next tutorial chapter](./toh-pt2.html).