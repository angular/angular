# Animation Basics

Animation provides the illusion of motion: elements change styling over time.

* Without animations, web page transitions can seem abrupt and jarring.

* Adding motion to your web application greatly enhances the user experience, giving users a chance to detect the application’s response to their own actions.

* Well-designed animations can make your application fun and easier to use. 

* Good user interfaces transition smoothly between states with engaging animations that intuitively call the user's attention to where it is needed.

Typically, animations involve multiple style _transformations_ over time – an HTML element can move, change color, grow or shrink, fade, or slide off the page. These changes can occur simultaneously or sequentially. You can control the timing of each of these transformations.

## Audience assumptions

Before starting with Angular animations, readers are advised to review the basic [Tutorial](tutorial) and [Architecture Overview](guide/architecture) sections.

## About Angular animations

Angular's animation system is built on CSS functionality, which means you can animate any property that the browser considers animatable. This includes positions, sizes, transforms, colors, borders, and more. The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) page.

The main Angular modules for animations are **@angular/animations** and **@angular/platform-browser**. 

If you want to create route-based animations that kick off when the user changes a URL, you’ll also need **@angular/router**. Advanced animation features, including `AnimationBuilder` and route-based animations, are addressed in separate guides.

Check out this full-fledged animation [demo](http://animationsftw.in/#/) with accompanying [presentation](https://www.youtube.com/watch?v=JhNo3Wvj6UQ&feature=youtu.be&t=2h47m53s), shown at the AngularConnect conference in November 2017.

## How this document is organized

This document begins with simple concepts, and then builds on those to create more complex applications. 

Each section follows a similar pattern:

* Describes key concepts and activities, using simple illustrated English-language examples.

* Explains how to implement the functionality in Angular.

* Includes code samples and links to complete demo projects on Stackblitz. 

* Details of implementation and expanded usage examples are on a separate "[Animation Basics Deep Dive](guide/animation-basics-deep-dive)" page following all the concept sections.





## Getting Started

To make the code samples work, you’ll need to import the animation-specific modules along with standard Angular functionality. 

### Step 1: Dependencies

Add **@angular/animations** and **@angular/platform-browser** to `package.json`. Specify "latest" for all modules, not just the animations.

<code-example hideCopy language="sh" class="code-shell">
// package.json  
{  
  "dependencies": {  
    "@angular/animations": "latest",  
    "@angular/platform-browser": "latest",  
    …  
  }  
}  
</code-example>

<div class="l-sub-section">
The code sample assumes that you are using the Angular CLI.
</div>

### Step 2: Import browser modules into root

Import `BrowserModule` and `BrowserAnimationsModule` into your Angular root application module.

<code-example hideCopy language="sh" class="code-shell">

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [ BrowserModule, BrowserAnimationsModule ],
  …

})

export class AppModule { }


</code-example>

<div class="l-sub-section">
The root application module is typically located in `src/app` and is named `app.module.ts`.
</div>

### Step 3: Import animation functions into component files 

Perform this step for every component file that uses animations.

<code-example hideCopy language="sh" class="code-shell">

import { Component } from '@angular/core'; 
import { 
  trigger, 
  state, 
  style, 
  animate, 
  transition 
  … 
} from '@angular/animations'; 

</code-example>	

<div class="l-sub-section">
Import the specific functions that you plan to use, from the items listed under the Animation DSL section of this document.
</div>

### Step 4: Add animations: property inside @Component decorator

In the component file, add a property called `animations:` to the `@Component` decorator.

<code-example hideCopy language="sh" class="code-shell">

@Component ( {
   …
   animations: [
      // animation function calls go here
   ]
} )

</code-example>

## Animation DSL

Angular provides a domain-specific language (DSL) for animations. See @angular/animations module in the [API reference](api) for a listing and syntax of core functions and related data structures. 

Advanced animation features, including reusable animations, `animateChild()`, and route-based animations will be covered in separate guide. Route-based animations require additional modules and imports.

<table>

 <tr>
   <th style="vertical-align: top">
     Function name
   </th>

   <th style="vertical-align: top">
     What it does
   </th>
 </tr>

 <tr>
   <td><code>trigger()</code></td>
   <td>Kicks off the animation and serves as a container for all other animation function calls. HTML template binds to <code>triggerName</code>. Use the first argument to declare a unique trigger name. Uses array syntax.</td>
 </tr>

 <tr>
   <td><code>style()</code></td>
   <td>Defines one or more CSS styles to use in animations. Controls visual appearance of HTML elements during animations. Uses object syntax.</td>
 </tr>

 <tr>
   <td><code>state()</code></td>
   <td>Creates a named set of CSS styles which should be applied on successful transition to a given state. The state can then be referenced by name within other animation functions.</td>
 </tr>

 <tr>
   <td><code>animate()</code></td>
   <td>Specifies timing information for a transition. Optional values for delay and easing. Can contain <code>style()</code> calls within.</td>
 </tr>

 <tr>
   <td><code>transition()</code></td>
   <td>Defines animation sequence between 2 named states. Uses array syntax.</td>
 </tr>

 <tr>
   <td><code>keyframes()</code></td>
   <td>Allows a sequential change between styles within a specified time interval. Use within <code>animate()</code>. Can include multiple <code>style()</code> calls within each <code>keyframe()</code>. Uses array syntax.</td>
 </tr>

 <tr>
   <td><code>group()</code></td>
   <td>Specifies a group of animation steps (<em>inner animations</em>) to be run in parallel. Animation continues only after all inner animation steps have completed. Used within <code>sequence()</code> or <code>transition()</code></td>
 </tr>

 <tr>
   <td><code>query()</code></td>
   <td>Use to find one or more inner HTML elements within the current element. </td>
 </tr>

 <tr>
   <td><code>sequence()</code></td>
   <td>Specifies a list of animation steps that are run sequentially, one by one.</td>
 </tr>

 <tr>
   <td><code>stagger()</code></td>
   <td>Staggers the starting time for animations for multiple elements.</td>
 </tr>

 <tr>
   <td><code>animation()</code></td>
   <td>Produces a re-usable animation that can be invoked from elsewhere. Used together with <code>useAnimation()</code>.</td>
 </tr>

 <tr>
   <td><code>useAnimation()</code></td>
   <td>Activates a reusable animation. Used together with <code>animation()</code>.</td>
 </tr>

 <tr>
   <td><code>animateChild()</code></td>
   <td>Allows animations on child components to be run within the same timeframe as the parent.</td>
 </tr>

</table>


## Simple transition

We’ll start with an animation example that is a single HTML element, changing from one state to another. For example, a button can show as either "Open" or "Closed", depending on the user's last action. When the button is in the "Open" state, it's visible and yellow. When it's "Closed" it's transparent and green. These attributes are set using ordinary CSS styles such as color and opacity. In Angular, they are set using the `style()` function.

Within Angular, these collections of _style_ attributes are called _states_, and each state can be associated with a name like `open` or `closed`.

<figure>
  <img src="generated/images/guide/animations/open-closed-500.png" alt="open and closed states">
</figure>

### States in Angular

Angular's `state()` function defines a set of styles to associate with a given state name. You can also define styles nested directly within the `transition()` function, with the following distinction between them:

* Use `state()` to define steady-state styles that are applied at the end of each transition. 

* Use `transition()` to define intermediate styles which create the illusion of motion during the animation.

* When animations are disabled, `transition()` styles can be skipped, but `state()` styles cannot. 

Here we describe how Angular's `state()` function works together with the `style⁣­(⁠)` function to set CSS style attributes.

In our example, when the button shows as "Open" it has several style attributes: a height of 200 pixels, an opacity of 1, and a color of yellow. The `style()` function describes what the style should be when the right conditions arise. In this case, some other code elsewhere causes the button to change to the `open` state.

<code-example hideCopy language="sh" class="code-shell">

state ('open', 
   style ({
     height: 200px, 
     opacity: 1, 
     background-color: 'yellow'})

</code-example>

In the `closed` state, the button has a height of 100 pixels, an opacity of 0.5, and a background color of green. This example shows how states can allow multiple style attributes to be set all at the same time. 

<code-example hideCopy language="sh" class="code-shell">

state ('closed', 
   style ({
     height: 100px, 
     opacity: 0.5, 
     background-color: 'green'})

</code-example>

### Transitions and timing

In Angular, you can set multiple styles without any animation. However, without further refinement, the button will instantly transform with no fade, no shrinkage, or other visible indicator that a change is occurring. 

To make the change less abrupt, we need an animation _transition_ to describe the changes that occur between one state and another over a defined period of time. The user perceives the animation as a sense of movement or change. 

The `transition()` function evaluates an expression, such as a state-to-state transition. Note the arrow syntax used in the code snippet below. Within the transition, `animate()` specifies how long the transition will take. In this case, the state change from open to closed takes one second, expressed here as '1s'. 

<code-example hideCopy language="sh" class="code-shell">

transition ('open => closed', [
   animate ('1s') 
] )

</code-example>

The `animate()` function defines the duration of the animation: how long it should take, and optionally, whether there is a delay before that portion of the animation begins. A third option uses a standard CSS feature called _easing_, which allows for the change to vary in speed during the animation. For now, we will only specify a duration: 1 second to go from `open` to `closed`, and half a second to go from `closed` to `open`.

<code-example hideCopy language="sh" class="code-shell">

transition ('closed => open', [
   animate ('0.5s') 
] )

</code-example>

### Triggering the animation

We still need something to kick off the animation, so that it knows when to start. This is done through an animation trigger. The `trigger()` function collects the states and transitions, and gives the animation a name, so that you can attach it to the  triggering element in the HTML template. 

The `trigger()` function describes the property name that should be watched for changes. When that change occurs, the trigger specifies the actions to apply. These actions can be transitions, or, as we will see later on, other animation functions as well.

For our example, we'll name the trigger `openClose`, and attach it to the `button` element. The trigger describes the open and closed states, and the timings for the two transitions.  

<figure>
  <img src="generated/images/guide/animations/triggering-the-animation-500.png" alt="triggering the animation">
</figure>

Here's the trigger function that describes and names the new trigger: 

<code-example hideCopy language="sh" class="code-shell">

trigger ('openClose', [
   state ('open', style ({
      height: 200px,
      opacity: 1,
      background-color: 'yellow'}) ),
   state ('closed', style ({
      Height: 100px,
      Opacity: 0.5,
      background-color: 'green'}) ),
   transition ('open => closed', [
      animate ('1s')] ),
   transition ('closed => open', [
      animate ('500ms')] ),

</code-example>


### Defining and linking the animation

Animations are  defined in the metadata of the component that controls the HTML element to be animated. Put the code that defines your animations under the `animations:` property within the `@Component` decorator:

<code-example hideCopy language="sh" class="code-shell">

@Component ( {
     selector:  ' selectorName '
     templateUrl:  ' componentHtmlFile '
     animations:  [
        //animation description here
     ] 
) }

</code-example>

When you have defined an animation trigger for a component, you can bind it to an element in that component's template using standard Angular property binding syntax. On the triggering element in the HTML template, add the trigger property using this format:

<code-example hideCopy language="sh" class="code-shell">

 [ @triggerName ] = "expression"

</code-example>

where `triggerName` is the name of the trigger, and  `expression` evaluates to a defined animation state.  The full HTML syntax looks like this:

>**<myElement [@myTriggerName]="expression">...</myElement>**

The animation is executed or triggered when the expression value changes to a new state. 

### Linking to the HTML template

The trigger is bound to the component in the component metadata, under the `@Component `decorator using the `animations:` property. In the HTML template, that same trigger appears under the HTML element to be animated. 

#### Component decorator

<code-example hideCopy language="sh" class="code-shell">

@Component ( {
   …
   animations: [
      trigger ('openClose', [ … ] )
      …
   ]
} )

</code-example>	

In the HTML template for that component, we bind the `openClose` trigger to the HTML element to be animated, along with a trigger expression.  

#### HTML template file

>**<button [ @openClose ] = 'expression' … />**

For elements entering or leaving a page (inserted or removed  from the DOM), you can make the animation conditional – for example, use `*ngIf` with the animation trigger in the HTML template. In the above code snippet, `'expression'` is an expression that evaluates to a defined state, in this case `open` or `closed`.

### Code sample, simple transition

### Summary

The simplest possible animation transition is between two states, using `style()`, `state()`,  with `animate()` for the timing. The animation kicks off using the `trigger()` function, which is also how the animation is tied to the HTML template. 

On the [Animation Basics Deep Dive](guide/animation-basics-deep-dive) page, we go into greater depth on callbacks, animation timing, some special states such as `wildcard *` and `void`, and show how these special states are used for elements entering and leaving a view.

## Keyframes

In the previous section we saw a simple two-state transition. Now we’ll create an animation with multiple steps run in sequence using keyframes. 

Angular’s `keyframe()` function is similar to keyframes in CSS. Keyframes allow several style changes within a single timing segment. For example, our button, instead of fading, could change color several times over a single 2-second timespan.

<figure>
  <img src="generated/images/guide/animations/keyframes-500.png" alt="keyframes">
</figure>

The code for the above might look like this:

<code-example hideCopy language="sh" class="code-shell">

animate ("2s", 
         keyframes([
            style ({ background-color: "blue"})
            style ({ background-color: "red"})
            style ({ background-color: "orange"})
         ])

</code-example>

### Offset

Keyframes include an _offset_ that defines at which point in the animation each style change occurs. Offsets are relative measures from zero to one, marking the beginning and end of the animation respectively. 

Defining offsets for keyframes is optional. If you omit them, evenly spaced offsets are automatically assigned. For example, three keyframes without predefined offsets receive offsets 0, 0.5, and 1. Specifying an offset of 0.8 for the middle transition in the above example might look like this:

<figure>
  <img src="generated/images/guide/animations/keyframes-offset-500.png" alt="keyframes with offset">
</figure>

The code with offsets specified would be as follows:

<code-example hideCopy language="sh" class="code-shell">

animate ("2s", 
         keyframes([
            style ({ background-color: "blue", offset: 0})
            style ({ background-color: "red", offset: 0.8})
            style ({ background-color: "orange", offset: 1.0})
         ])

</code-example>

You can combine keyframes together with duration, delay, and easing within a single animation.

### Keyframes with a pulsation

Here’s an example showing:

* The original open and closed states, with the original changes in height, color, and opacity, occurring over a timeframe of 1 second.

* A keyframes sequence inserted in the middle that causes the button to appear to pulsate irregularly over the course of that same 1-second timeframe.

<figure>
  <img src="generated/images/guide/animations/keyframes-pulsation-500.png" alt="keyframes with irregular pulsation">
</figure>

The code snippet for this animation might look like this:

<code-example hideCopy language="sh" class="code-shell">

@Component ({
        selector:  ' selectorName '
        templateUrl:  ' componentHtmlFile '
   animations: [
      trigger ( 'openClose',  [
      transition ('* => closed', [
         animate ('1s', keyframes ( [
            style ({ opacity: 0.1, offset: 0.1 })
            style ({ opacity: 0.6, offset: 0.2 })
            style ({ opacity: 1,   offset: 0.5 })
            style ({ opacity: 0.2, offset: 0.7 })
         ] ) 
      ] 
})

</code-example>	


<div class="l-sub-section">
The use of the wildcard state `*` under `transition()` in the above code snippet is described on the [Animation Basics Deep Dive](guide/animation-basics-deep-dive).
</div>

### Code sample, keyframes

### Summary

The `keyframes()` function in Angular allows you to specify multiple interim styles within a single transition, with an optional offset to define at which point during the animation each style change occurs.

## Complex animation sequences

So far, we have been reviewing simple animations of single HTML elements. Angular also lets you animate coordinated sequences, such as an entire grid or list of elements as they enter and leave a page. You can choose to run multiple animations in parallel, or run discrete animations in sequential fashion, one following another.

Functions that control complex animation sequences are as follows:

* `query()` finds one or more inner HTML elements
* `stagger()` applies a cascading delay to animations for multiple elements
* `group()` runs multiple animation steps in parallel
* `sequence()` runs animation  steps one after another

### Grouping and staggering animations

First, we describe the grouping and choreographing of multiple animated HTML elements. The functions that allow this to happen are `query()` and `stagger()`. 

<div class="l-sub-section">
The function known as `group()` is used to group animation steps, rather than animated elements.
</div>

The `query()` function targets specific HTML elements within a parent component and applies animations specifically to each element individually. Angular intelligently handles setup, tear-down, and cleanup as it coordinates the elements across the page. 

### Multiple elements with query()

This [demo](http://animationsftw.in/#/) shows an example of a choreographed animation involving multiple elements in a grid. The Advanced tab contains three image galleries, each consisting of a grid with tiled photo images. 

The page opens with an introductory sequence. To see the portion that is relevant to this `query()` description, click **Advanced**. The entire grid for Gallery One cascades in, with a slight delay from row to row from the bottom up. Within each row, the elements slide down and fade into place starting from right to left.

### Page entry query stagger example

The page entry animation code is as follows:

<code-example hideCopy language="sh" class="code-shell">

trigger ('pageAnimations', [
  transition (':enter', [
    query ('.photo-record, .menu li, form', [
      style ({
        opacity: 0,
        transform: 'translateY (-100px)' }),
      stagger (-30, [
        animate ('500ms cubic-bezier(0.35, 0, 0.25, 1)',
          style ({ opacity: 1, transform: 'none' })
        )
      ])
    ])
  ])
])

</code-example>

This animation does the following:

* Use `query()` to look for any element entering or leaving the page. The query specifies elements meeting certain CSS class criteria.

* For each of these elements, use `style()` to set the same initial style for the element – make it invisible and using transform to move it out of position so that it can slide down into place.

* Use `stagger()` to delay each animation by 30 milliseconds, starting at the bottom of the page. 

* Animate each element in over 0.5 second using a custom-defined easing curve, simultaneously fading it in and un-transforming it at the same time.

In addition to the page animation that runs when you click **Advanced** from any other tab, there are additional animations when transitioning between Gallery Two, Gallery Three, and back to Gallery One again. You can review the code snippets embedded in the demo to see small differences in the `transition()` statements and animation parameters.

### Filter animation example

Let’s take a look at another animation on this same demo page. In the upper left-hand corner of the **Advanced** page, enter some text into the “FILTER RESULTS” text box, such as “COOL” or “STYLE”.

The filter works real-time as you type. Elements (images) leave the page as the filter gets progressively stricter, when you type each new letter. The images successively re-enter the page, as you delete each letter in the filter box.

The HTML template contains a trigger called filterAnimation:

>**<div [@filterAnimation]="totalItems">**

The component file contains 3 transitions:

<code-example hideCopy language="sh" class="code-shell">

trigger ( 'filterAnimation', [
  transition ( ':enter, [  ] ),
  transition ( ':increment', [
    query ( ':enter', [
      style ( { opacity: 0, width: '0px' } ),
      stagger( 50, [
        animate  ('300ms ease-out', style ( { 
          opacity: 1, width: '*' } ) ),
      ] ),
    ] )
  ] ),
  transition ( ':decrement', [
    query ( ':leave', [
      stagger ( 50, [
        animate ( '300ms ease-out', style ( { 
           opacity: 0, width: '0px' } ) ),
      ] ),
    ] )
  ] ),
] )

</code-example>	

<div class="l-sub-section">
NOTE: The use of the special aliases `:enter`, `:leave`, `:increment`, and `:decrement` are described on the [Animation Basics Deep Dive](guide/animation-basics-deep-dive).
</div>

The animation does the following:

* Ignore any animations that are performed when the user first opens or navigates to this page. Since the filter narrows what is already there, it assumes that any HTML elements to be animated already exist in the DOM.

* Perform a filter match for matches. 

For each match:

* First, hide the element by making it completely transparent and infinitely narrow, by setting its opacity and width to 0.

* Animate in the element over 300 milliseconds. During the animation, the element assumes its default width and opacity.

* If there are multiple matching elements, stagger each element in starting at the top of the page, with a 50-millisecond delay between each element.

### Sequential vs. parallel animations

Complex animations can have many things happening at once. But what if you want to create an animation involving not just one, but several choreographies happening one after the other? Earlier we used `group()` to run multiple animations all at the same time, in parallel. 

A second function called `sequence()` lets you run those same animations one after the other. Within `sequence()`, the animation steps consist of either `style()` or `animate()` function calls. 

* Use `style()` to apply the provided styling data immediately.

* Use `animate()` to apply styling data over a given time interval.

### Summary

Angular functions for choreographing multiple elements start with `query()` to find inner elements, for example gathering all images within a <div>. The remaining functions, `stagger()`, `group()`, and `sequence()`, apply cascades or allow you to control how multiple animation steps are applied.



