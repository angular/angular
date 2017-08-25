# Displaying Data (CLI version)

## Prerequisites

Bootstrapping
NgModules

<hr />


## Set up an example app

First, create an app with the CLI called `displaying-data` by entering the following commands at the 
command prompt of the terminal window:

```sh
ng new displaying-data
```

Then, `cd` into the directory:

```sh
cd displaying-data
```

To see it in a browser, first serve it with the following command:

```sh
ng serve
```

Then go to http://localhost:4200/ to see the basic CLI generated 
app running. If it's working, the browser should display "app works!".


## Interpolation

The browser displays the component property, "app works!", 
using double curly brace interpolation, which you can see in 
`app.component.html`:

```html
<h1>
  {{title}}
</h1>

```

Angular dertermines the value of `title` but looking at 
the `AppComponent` class in `app.component.ts`.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
}
```


Angular automatically pulls the value of the `title` property from the component and inserts that value into the browser. One reason to use interpolation is so that Angular can update the display when properties such as this change.

<!--Note on how Angular changes the display:
More precisely, the redisplay occurs after some kind of asynchronous event related to the view, such as a keystroke, a timer completion, or a response to an HTTP request.-->


Notice that you don't have to call `new` to create an instance of the `AppComponent` class because Angular is creating an instance for you.

The CSS selector in the `@Component` decorator specifies an element named `<app-root>`.
That element is a placeholder in the body of your `index.html` file:

```html
<body>
  <app-root>Loading...</app-root>
</body>
```

When you bootstrap with the `AppComponent` in `main.ts`, Angular looks for an <app-root> in the `index.html`, finds it, instantiates an instance of `AppComponent`, and renders it inside the <app-root> tag.

## Showing an array property with `*ngFor`

To display a list of customers, begin by removing `title = 'app works!';` 
and replacing it with an array of customer names to the 
`AppComponent`:

```js
customers = ['Lei', 'Alex', 'Sam', 'Jose'];
currentCustomer = this.customers[0];
```
The first line sets up an array of customers and the second line 
defines `currentCustomer` to be the first name in the array.

Now use the Angular `ngFor` directive in the template to display 
each item in the customer list by adding the following to `app.component.html`. 
In the template, replace `<h1>{{title}}</h1>` with this snippet:

```html
<h1>Current customer: {{ currentCustomer }}</h1>
<p>Customers:</p>
<ul>
  <li *ngFor="let customer of customers">
    {{ customer }}
  </li>
</ul>
```

The leading asterisk (\*) in `*ngFor` is an essential part of the syntax.
For more information, see the 
[Template Syntax](guide/template-syntax#ngFor) page.

This UI uses the HTML unordered list with `<ul>` and `<li>` tags. The `*ngFor` 
in the `<li>` element is the Angular "repeater" directive. It marks that 
`<li>` element and its children as the "repeater template".

Notice the `customer` in the `ngFor` double-quoted instruction; it is an example 
of a template input variable. For more about template input variables, 
see the [microsyntax](guide/template-syntax#microsyntax) section of
the [Template Syntax](guide/template-syntax) page.

Angular duplicates the `<li>` for each item in the list, setting the 
`customer` variable to the item (the customer) in the current iteration. 
Angular uses that variable as the context for the interpolation in 
the double curly braces.

In this case, `ngFor` is displaying an array, but `ngFor` can
repeat items for any [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) object.


<figure>
  <img src="generated/images/guide/displaying-data-cli/customer-names-list.gif" alt="After ngfor">
</figure>


## Create a class for the data


At the moment, the binding is to an array of strings.
In real applications, most bindings are to more specialized objects.

To convert this binding to use specialized objects, turn the array
of customer names into an array of `Customer` objects. For that you'll need a `Customer` class.

Create a new file in the `app` folder called `customers.ts` with the following code:

```typescript
export class Customers {
  constructor(
    public id: number,
    public name: string) { }
}
```
This `Customers` class has a constructor with two properties: `id` and `name`. 
The `id` isn't strictly necessary in this example, but it does demonstrate 
how to use more than one property.

The declaration of the `constructor()` parameters takes advantage 
of a TypeScript shortcut.

Consider the first parameter:

```typescript
public id: number,
```

That brief syntax does a lot:

* Declares a constructor parameter and its type.
* Declares a public property of the same name.
* Initializes that property with the corresponding argument when creating an instance of the class.


## Using the `Customer` class

To use the new `Customer` class, import it into `AppComponent`:

```js
import { Customer } from './customer';
```

Next, delete the current contents of the `AppComponent` class:

```js
customers = ['Lei', 'Alex', 'Sam', 'Jose'];
currentCustomer = this.customers[0];
```
And replace it with the following:

```js
customers = [
  new Customer(1, 'Lei'),
  new Customer(13, 'Alex'),
  new Customer(15, 'Sam'),
  new Customer(20, 'Jose')
];
currentCustomer = this.customers[0];

```
Now the `AppComponent.customers` property can return a _typed_ array
of `Customers` objects.

Next, update the template.

```html
<h1>Current customer: {{ currentCustomer.name }}</h1>
<p>Customers:</p>
<ul>
  <li *ngFor="let customer of customers">
    {{ customer.id }} {{ customer.name }}
  </li>
</ul>

```
The template now grabs the `currentCustomer` by `name` and displays it 
in the `h1`. The `ngFor` works the same as it did in the simpler example 
and displays the `id` along with the `name`.

Now the code is clearer and you have a `Customer` class you can use over 
and over.


## Conditional display with `NgIf`

Sometimes an app needs to display a view or a portion of a view only under specific circumstances.

The Angular `ngIf` directive inserts or removes an element based on a _truthy/falsy_ condition.
To see it in action, add the following paragraph at the bottom of the template:

```html
<p *ngIf="customers.length > 3">There are many customers!</p>

```

The leading asterisk (\*) in `*ngIf` is an essential part of the syntax.
For more about `ngIf` and `*`, see the [ngIf section](guide/template-syntax#ngIf) of the [Template Syntax](guide/template-syntax) page.

The template expression inside the double quotes,
`*ngIf="heroes.length > 3"`, looks and behaves much like TypeScript.
When the component's list of heroes has more than three items, Angular adds the paragraph
to the DOM and the message appears. If there are three or fewer items, Angular omits the
paragraph, so no message appears. For more information,
see the [template expressions](guide/template-syntax#template-expressions) section of the
[Template Syntax](guide/template-syntax) page.

Rather than showing and hiding the message, Angular is adding and 
removing the paragraph element from the DOM, which improves performance. 
This is especially important in large projects when conditionally including or excluding
big chunks of HTML with many data bindings.


Try it out. Because the array has four items, the message should appear.
Go back into `app.component.ts` and delete or comment out one of the 
elements from the hero array.
The browser should refresh automatically and the message should disappear.



## Summary
This page covered:

* **Interpolation** with double curly braces to display a component property.
* **ngFor** to display an array of items.
* A TypeScript class to shape the **model data** for your component and display properties of that model.
* **ngIf** to conditionally display a chunk of HTML based on a boolean expression.



