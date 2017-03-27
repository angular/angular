@title
Displaying Data

@intro
Property binding helps show app data in the UI.

@description

You can display data by binding controls in an HTML template to properties of an Angular component.

In this page, you'll create a component with a list of heroes.
You'll display the list of hero names and
conditionally show a message below the list.

The final UI looks like this:

<figure class='image-display'>
  <img src="assets/images/devguide/displaying-data/final.png" alt="Final UI">  </img>
</figure>

# Contents

* [Showing component properties with interpolation](guide/displaying-data#interpolation).
* [Showing !{_an} !{_array} property with NgFor](guide/displaying-data#ngFor).
* [Conditional display with NgIf](guide/displaying-data#ngIf).


~~~ {.l-sub-section}

The <live-example></live-example> demonstrates all of the syntax and code
snippets described in this page.


~~~


## Showing component properties with interpolation
The easiest way to display a component property
is to bind the property name through interpolation.
With interpolation, you put the property name in the view template, enclosed in double curly braces: `{{myHero}}`.

Follow the [setup](guide/setup) instructions for creating a new project
named <ngio-ex path="displaying-data"></ngio-ex>.

Then modify the <ngio-ex path="app.component.ts"></ngio-ex> file by
changing the template and the body of the component.

When you're done, it should look like this:


<code-example path="displaying-data/src/app/app.component.1.ts">

</code-example>

You added two properties to the formerly empty component: `title` and `myHero`.

The revised template displays the two component properties using double curly brace
interpolation:


<code-example path="displaying-data/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>

Angular automatically pulls the value of the `title` and `myHero` properties from the component and
inserts those values into the browser. Angular updates the display
when these properties change.


~~~ {.l-sub-section}

More precisely, the redisplay occurs after some kind of asynchronous event related to
the view, such as a keystroke, a timer completion, or a response to an HTTP request.


~~~

Notice that you don't call **new** to create an instance of the `AppComponent` class.
Angular is creating an instance for you. How?

The CSS `selector` in the `@Component` !{_decorator} specifies an element named `<my-app>`.
That element is a placeholder in the body of your `index.html` file:


<code-example path="displaying-data/src/index.html" linenums="false" title="src/index.html (body)" region="body">

</code-example>

When you bootstrap with the `AppComponent` class (in <ngio-ex path="main.ts"></ngio-ex>), Angular looks for a `<my-app>`
in the `index.html`, finds it, instantiates an instance of `AppComponent`, and renders it
inside the `<my-app>` tag.

Now run the app. It should display the title and hero name:
<figure class='image-display'>
  <img src="assets/images/devguide/displaying-data/title-and-hero.png" alt="Title and Hero">  </img>
</figure>

## Template inline or template file?

You can store your component's template in one of two places.
You can define it *inline* using the `template` property, or you can define
the template in a separate HTML file and link to it in
the component metadata using the `@Component` !{_decorator}'s `templateUrl` property.

The choice between inline and separate HTML is a matter of taste,
circumstances, and organization policy.
Here the app uses inline HTML because the template is small and the demo
is simpler without the additional HTML file.

In either style, the template data bindings have the same access to the component's properties.

## Showing !{_an} !{_array} property with ***ngFor**

To display a list of heroes, begin by adding !{_an} !{_array} of hero names to the component and redefine `myHero` to be the first name in the !{_array}.


<code-example path="displaying-data/src/app/app.component.2.ts" linenums="false" title="src/app/app.component.ts (class)" region="class">

</code-example>

Now use the Angular `ngFor` directive in the template to display
each item in the `heroes` list.


<code-example path="displaying-data/src/app/app.component.2.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>

This UI uses the HTML unordered list with `<ul>` and `<li>` tags. The `*ngFor`
in the `<li>` element is the Angular "repeater" directive.
It marks that `<li>` element (and its children) as the "repeater template":


<code-example path="displaying-data/src/app/app.component.2.ts" linenums="false" title="src/app/app.component.ts (li)" region="li">

</code-example>



~~~ {.alert.is-important}

Don't forget the leading asterisk (\*) in `*ngFor`. It is an essential part of the syntax.
For more information, see the [Template Syntax](guide/template-syntax) page.


~~~

Notice the `hero` in the `ngFor` double-quoted instruction;
it is an example of a template input variable. Read
more about template input variables in the [microsyntax](guide/template-syntax) section of
the [Template Syntax](guide/template-syntax) page.

Angular duplicates the `<li>` for each item in the list, setting the `hero` variable
to the item (the hero) in the current iteration. Angular uses that variable as the
context for the interpolation in the double curly braces.


~~~ {.l-sub-section}

In this case, `ngFor` is displaying !{_an} !{_array}, but `ngFor` can
repeat items for any [iterable](guide/!{_iterableUrl}) object.

~~~

Now the heroes appear in an unordered list.

<figure class='image-display'>
  <img src="assets/images/devguide/displaying-data/hero-names-list.png" alt="After ngfor">  </img>
</figure>


## Creating a class for the data

The app's code defines the data directly inside the component, which isn't best practice.
In a simple demo, however, it's fine.

At the moment, the binding is to !{_an} !{_array} of strings.
In real applications, most bindings are to more specialized objects.

To convert this binding to use specialized objects, turn the !{_array}
of hero names into !{_an} !{_array} of `Hero` objects. For that you'll need a `Hero` class.

Create a new file in the `!{_appDir}` folder called  <ngio-ex path="hero.ts"></ngio-ex> with the following code:


<code-example path="displaying-data/src/app/hero.ts" linenums="false" title="src/app/hero.ts (excerpt)">

</code-example>


You've defined a class with a constructor and two properties: `id` and `name`.

It might not look like the class has properties, but it does.
The declaration of the constructor parameters takes advantage of a TypeScript shortcut.

Consider the first parameter:


<code-example path="displaying-data/src/app/hero.ts" linenums="false" title="src/app/hero.ts (id)" region="id">

</code-example>

That brief syntax does a lot:
* Declares a constructor parameter and its type.
* Declares a public property of the same name.
* Initializes that property with the corresponding argument when creating an instance of the class.

## Using the Hero class

After importing the `Hero` class, the `AppComponent.heroes` property can return a _typed_ !{_array}
of `Hero` objects:


<code-example path="displaying-data/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (heroes)" region="heroes">

</code-example>

Next, update the template.
At the moment it displays the hero's `id` and `name`.
Fix that to display only the hero's `name` property.


<code-example path="displaying-data/src/app/app.component.3.ts" linenums="false" title="src/app/app.component.ts (template)" region="template">

</code-example>

The display looks the same, but the code is clearer.

## Conditional display with NgIf

Sometimes an app needs to display a view or a portion of a view only under specific circumstances.

Let's change the example to display a message if there are more than three heroes.

The Angular `ngIf` directive inserts or removes an element based on a !{_boolean} condition.
To see it in action, add the following paragraph at the bottom of the template:


<code-example path="displaying-data/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (message)" region="message">

</code-example>



~~~ {.alert.is-important}

Don't forget the leading asterisk (\*) in `*ngIf`. It is an essential part of the syntax.
Read more about `ngIf` and `*` in the [ngIf section](guide/template-syntax) of the [Template Syntax](guide/template-syntax) page.


~~~

The template expression inside the double quotes,
`*ngIf="heros.length > 3"`, looks and behaves much like !{_Lang}.
When the component's list of heroes has more than three items, Angular adds the paragraph
to the DOM and the message appears. If there are three or fewer items, Angular omits the
paragraph, so no message appears. For more information,
see the [template expressions](guide/template-syntax) section of the
[Template Syntax](guide/template-syntax) page.


~~~ {.alert.is-helpful}

Angular isn't showing and hiding the message. It is adding and removing the paragraph element from the DOM. That improves performance, especially in larger projects when conditionally including or excluding
big chunks of HTML with many data bindings.


~~~

Try it out. Because the !{_array} has four items, the message should appear.
Go back into <ngio-ex path="app.component.ts"></ngio-ex> and delete or comment out one of the elements from the hero !{_array}.
The browser should refresh automatically and the message should disappear.

## Summary
Now you know how to use:
- **Interpolation** with double curly braces to display a component property.
- **ngFor** to display !{_an} !{_array} of items.
- A !{_Lang} class to shape the **model data** for your component and display properties of that model.
- **ngIf** to conditionally display a chunk of HTML based on a boolean expression.

Here's the final code:



<code-tabs>

  <code-pane title="src/app/app.component.ts" path="displaying-data/src/app/app.component.ts" region="final">

  </code-pane>


  <code-pane title="src/app/hero.ts" path="displaying-data/src/app/hero.ts">

  </code-pane>


  <code-pane title="src/app/app.module.ts" path="displaying-data/src/app/app.module.ts">

  </code-pane>


  <code-pane title="main.ts" path="displaying-data/src/main.ts">

  </code-pane>


</code-tabs>

