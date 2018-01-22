# Animation Basics Deep Dive

This page contains supplemental details on Angular animations basic functionality.

## Basic code structure

The following code sample shows the basic structure of a TypeScript file for a simple Angular component, including:

* Module imports

* Function imports

* Embedded HTML template code block

* Embedded CSS styles

* `@Component` decorator with an animation

* Exported class for the component

* `@NgModule` imports

<code-example hideCopy language="sh" class="code-shell">

import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
 
@Component({
 selector: 'example-app',
 styles: [`
   .toggle-container {
     background-color:white;
     border:10px solid black;
     width:200px;
     text-align:center;
     line-height:100px;
     font-size:50px;
     box-sizing:border-box;
     overflow:hidden;
   }
 `],
 animations: [trigger(
     'openClose',
     [
       state('collapsed, void', style({height: '0px', color: 'maroon', borderColor: 'maroon'})),
       state('expanded', style({height: '*', borderColor: 'green', color: 'green'})),
       transition(
           'collapsed <=> expanded', [animate(500, style({height: '250px'})), animate(500)])
     ])],
 template: `
   <button (click)="expand()">Open</button>
   <button (click)="collapse()">Closed</button>
   <hr />
   <div class="toggle-container" [@openClose]="stateExpression">
     Look at this box
   </div>
 `
})
export class MyExpandoCmp {
 stateExpression: string;
 constructor() { this.collapse(); }
 expand() { this.stateExpression = 'expanded'; }
 collapse() { this.stateExpression = 'collapsed'; }
}
 
@NgModule(
   {imports: [BrowserAnimationsModule], declarations: [MyExpandoCmp], bootstrap: [MyExpandoCmp]})
export class AppModule {
}

</code-example>

## Details from simple transition

This section contains details from the topics discussed in the [Simple Transition](guide/animations#simple-transition) section of the Animation Basics page.

### animation() details

The `animation()` function controls the timing of a single animation.

#### Duration, delay, and easing

The `animate()` function takes one argument as a single string. This string may contain the following information:

>`animate ('duration delay easing')`

The first part, `duration`, is required. Duration can be expressed in milliseconds as a simple number without quotes, or in seconds with quotes and a time specifier. For example, a duration of a tenth of a second can be expressed as follows:

* As a plain number, in milliseconds: `100`

* In a string, as milliseconds: `'100ms'`

* In a string, as seconds: `'0.1s'`

The second argument, `delay`, has the same syntax as duration. For example:


* Wait for 100ms and then run for 200ms: `'0.2s 100ms'`


The third argument, `easing`, controls how the animation [accelerates and decelerates](http://easings.net/) during its runtime. For example, 'ease-in' causes the animation to begin slowly, and to pick up speed as it progresses.


* Wait for 100ms, run for 200ms. Use a deceleration curve to start out fast and slowly decelerate to a resting point:  
`'0.2s 100ms ease-out'`

* Run for 200ms, with no delay. Use a standard curve to start slow, accelerate in the middle, and then decelerate slowly at the end:  
`'0.2s ease-in-out'` 
* Start immediately, run for 200ms. Use a acceleration curve to start slow and end at full velocity:  
`'0.2s ease-in'`

<div class="l-sub-section">
NOTE: See the Angular Material Design web site’s topic on [Natural easing curves](https://material.io/guidelines/motion/duration-easing.html#duration-easing-natural-easing-curves) for general information on easing curves.
</div>

#### Valid values for easing

The `animate()` function takes the following valid values for easing:

* `ease-in`

* `ease-out`

* `ease-in-out`

* `linear`

* `cubic-bezier ( a , b , c , d )` where `a b c d` represent the four defined points needed for a Bezier curve as applied specifically to define web animation timings.

### trigger() details

#### Disabling an animation on an HTML element

A special animation control binding called `@.disabled` can be placed on an HTML element to disable animations on that element, as well as any inner animations for elements nested within the disabled element. When true, the `@.disabled` binding prevents all animations from rendering. 

The code sample below shows how to use this feature. Note that the HTML template code is embedded inside the component code in this example:

>@Component ({
>  selector: 'my-component',
>  // HTML template code
>  template: `
>    <div [ @.disabled ]= "isDisabled" >
>      <div [ @childAnimation ]= "exp" ></div>
>    </div>
>  `,
>  animations: [
>    trigger ( "childAnimation", [
>      // ...
>    ])
>  ]
>})
>class MyComponent {
>  isDisabled = true;
>  exp = '...';
>}

The `@childAnimation` trigger will not animate because the `@.disabled` binding (when true) prevents it from happening.

Note that `@.disabled` disables all animations running on the same element. You can't selectively disable multiple animations on a single element.

#### Disabling animations application-wide

To disable all animations for an entire Angular app, place the @.disabled host binding on the topmost Angular component.

<code-example hideCopy language="sh" class="code-shell">
import { Component, HostBinding } from '@angular/core';
@Component ({
  selector: 'app-component',
  templateUrl: 'app.component.html',
})
class AppComponent {
  @HostBinding ( '@.disabled' )
  public animationsDisabled = true;
}
</code-example>	

#### Multiple triggers and states active simultaneously

Within each trigger() function call, an element can only be in one state at any given time. However, it is possible for multiple triggers to be active at once.

<div class="l-sub-section">
Even if inner animations are disabled, a parent animation can still use query() for inner elements located in disabled areas of the HTML template and animate them. This is also the case for when a sub-animation is queried by a parent, and then later animated using animateChild().
</div>

#### Notes on state-to-state transitions

* Styles defined using `state()` will persist after the animation has completed.

* A double arrow syntax specifies state-to-state transitions that go in either direction, for example:  
transition `( 'on <=> off', … `

* You can include multiple state pairs within the same `transition()` argument:  
`transition( 'on => off, off => void', … `

### transition() details

#### Functions in transitions

The `transition()` function also takes additional functions as well as named states:

<code-example hideCopy language="sh" class="code-shell">
trigger ( 'myAnimationTrigger', [
   transition (( fromState, toState) => {
       return fromState == "off" && toState == "on";
     }, animate("1s 0s"))
   // assume that an animation is defined below
</code-example>

The above code snippet shows an example using a trigger called `myAnimationTrigger`. When the expression evaluates to 'true' (in this case, when `fromState` is 'off' and `toState` is 'on'), this condition allows the animation that follows to be invoked. 

The following HTML template example binds to to a `<div>` element using the same trigger name, `myAnimationTrigger`.

>**<div [ @myAnimationTrigger ]="myStatusExp">...</div>**

#### Boolean values in transitions

If a trigger contains a Boolean value as a binding value, then this value can be matched using a `transition()` expression that compares `true` and `false`, or `1` and `0`.

In this example, the HTML template binds a `<div>` element to a trigger named `openClose`, with a status expression of `open`, with possible values of `true` and `false`. This is an alternative to the practice of simply creating two named states of open and close.

>**<div [ @openClose ]= 'open ? true : false' > … </div>**

In the component code, under the `@Component` metadata under the `animations:` property, when the state evaluates to `true`, meaning "open" in this case, the associated HTML element's height is a wildcard style or default, basically saying to use whatever height the element already had before the animation started. When the element is "closed", the element animates to a height of 0, which basically makes it invisible.

<code-example hideCopy language="sh" class="code-shell">
@Component ({
   … 
   animations: [
      trigger ( 'openClose', [
        state ( 'true', style ({ height: '*' })),
        state ( 'false', style ({ height: '0px' })),
        transition  ('false <=> true', animate ( 500 ))
   ])
</code-example>	

#### Wildcard state *

An asterisk `*` or _wildcard_ matches any animation state. This is useful for defining transitions that apply regardless of the HTML element’s start or end state.

For example, a transition of  `open  => *` would apply when the element’s state changes from open to anything else. 

<figure>
  <img src="generated/images/guide/animations/wildcard-state-500.png" alt="wildcard state expressions">
</figure>

Here’s another code sample using the wildcard state together with our previous example using `open` and `closed` states. Instead of defining each state-to-state transition pair, we are now saying that any transition to `closed` takes 1 second, and any transition to `open` takes 0.5 seconds.

This allows us to add new states without having to add separate transitions for each one.

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
   transition ('* => closed', [
      animate ('1s')] ),
   transition ('* => open', [
      animate ('500ms')] ),
 </code-example>

Use a double arrow syntax to specify state-to-state transitions in both directions:

<code-example hideCopy language="sh" class="code-shell">
transition ('closed <=> open', [
      animate ('500ms')] ),
</code-example>

#### Wildcard state with 3 states

In our two-state button example, the wildcard isn’t that useful because there are only 2 possible states, `open` and `closed`. Wildcard states are better when an element in one particular state has multiple potential states that it could change to. If our button could change from `open` to either `closed` or something like `inProgress`, using a wildcard state could potentially reduce the amount of coding you’d have to write.

<figure>
  <img src="generated/images/guide/animations/wildcard-3-states-500.png" alt="wildcard state with 3 states">
</figure>

In this example, we assume that all the transitions have a duration of 1 second.

<code-example hideCopy language="sh" class="code-shell">
   state ('open', style ({
      height: 200px,
      opacity: 1,
      background-color:'yellow'}) ),
   state ('closed', style ({
      height: 100px,
      opacity: 0.5,
      background-color: 'green'}) ),
   state ('inProgress', style ({
      height: 100px,
      opacity: 1,
      background-color: 'orange'}) ),
   transition ('* => *', [
      animate ('1s')] ),
</code-example>	

The `* => *` transition applies when any change between two states takes place. 

Transitions are matched in the order in which they are defined. Thus, you can apply other transitions on top of the  `* => *`  ("any-to-any") transition. For example, you can define style changes or animations that would apply just to `open  => closed`, or just  to `closed => open`, and then use `* => *` as a fallback for state pairings that aren't otherwise called out. 

To do this, list the more specific transitions _before_ the `* => *`. 

#### Wildcard styles *

Use the wildcard `*` with a style setting to tell the animation to use whatever the current style value is, and animate with that. It's a fallback value that is used if the state that is being animated is not declared within the trigger.

<code-example hideCopy language="sh" class="code-shell">
transition ('* => open', [
   animate ('1s', 
      style ({ opacity: '*'}),
   ),
]),
</code-example>	

#### Void state

A special state called `void` can apply when the HTML element is not attached to a view. For example, suppose we have a page where elements appear to fly in and out. You can use the void state in a transition to configure different transitions for entering and leaving based on each state.

<div class="l-sub-section">

For our purposes here, saying that an element is entering or leaving a view is equivalent to saying “inserted or removed from the DOM.” 

</div>

Up until this point, we haven’t had our single button enter or leave the page. We’ve assumed that the button starts out already on the page, and has three possible styles: open, closed, and inProgress.

Now we will add a new behavior: on initial page load, the button appears to fly onto the page from the left, entering in the `open` state. 

<code-example hideCopy language="sh" class="code-shell">
@Component ({
   animations: [
      trigger ( 'openClose',  [
              state ('open', style ({
            height: 200px,
            opacity: 1,
            background-color:'yellow'}) ),
         state ('closed', style ({
            height: 100px,
            opacity: 0.5,
            background-color: 'green'}) ),
         state ('inProgress', style ({
            height: 100px,
            opacity: 1,
            background-color: 'orange'}) ),
         transition ('open => *', [
            animate ('1s')] ),
//next bit was taken from existing doc
//hero-list-enter-leave-component.ts (excerpt)
           trigger('flyInOut', [  
         state('in',
           style({transform: 'translateX(0)'})),
//the void to wildcard is explained in next section
          transition('void => *', [
            style({transform: 'translateX(-100%)'}),
            animate(100)
          ]),
          transition('* => void', [
            animate(100,
              style({transform: 'translateX(100%)'}))
          ])
      ])
</code-example>	

### Special values for transition() and query()

#### Combining wildcard and void states

You can combine wildcard and void states in a transition to define animations that enter and leave the page.

* A transition of `* =>` void applies when the element leaves a view, regardless of what state it was in before it left.

* A transition of `void => *` applies when the element enters a view, regardless of what state it  assumes when entering.

* The wildcard state `*` matches to _any_ state, including `void`.

#### :enter and :leave

The transitions for `void => *` and `* => void` have their own aliases, called `:enter` and `:leave`. These aliases are used by several animation functions. 

<code-example hideCopy language="sh" class="code-shell">
transition ( ':enter', [ ... ] );  // alias for void => *
transition ( ':leave', [ ... ] );  // alias for * => void
</code-example>	

HTML elements that are inserted or removed from a view use special enter and leave animations. It is harder to target an element that is entering, because it is not yet in the DOM. So, `:enter` is another point to lock onto an element and apply some style over time.

#### Use of *ngIf and *ngFor with :enter and :leave

The `:enter` transition runs when any `*ngIf` or `*ngFor` views are placed on the page, and `:leave` runs when those views are removed from the page. Let’s say that we have a special trigger for the enter and leave animation called `myInsertRemoveTrigger`.

The HTML template contains:

>**<div @myInsertRemoveTrigger *ngIf = 'expression'>**

In the component file, the enter transition first sets an initial opacity of 0, and then animates it to change that opacity to 1 as the element is inserted into the view:

<code-example hideCopy language="sh" class="code-shell">
trigger ('myInsertRemoveTrigger', [
   transition (':enter', [
       style ( { opacity: 0 } ), 
       animate ('1s', style ( { opacity: 1 } ),
       ] ),
   transition (':leave', [
      animate ('1s', style ( { opacity: 0 } )
   ] )
] )
</code-example>	

Note that this example does not need to use `state()`. 

#### :increment and :decrement in transitions

The `transition()` function takes additional selector values, `:increment` and `:decrement`. Use these to kick off a transition when a numeric value has increased or decreased in value.

### Animation callbacks

The animation `trigger()` function emits _callbacks_ when it starts and when it finishes. 

<code-example hideCopy language="sh" class="code-shell">
import {AnimationEvent} from '@angular/animations';
@Component ({
   animations: [
      trigger ( 'openClose',  […]
class openCloseComponent {
   onAnimationEvent ( event: AnimationEvent ) {…}
</code-example>	

In the HTML template, the animation event is passed back via `$event`, as `@trigger.start` and `@trigger.done`, where `trigger` is the name of the trigger being used. In our example, the trigger `openClose` appears as follows:

><div *ngIf = "expression"
>   @openClose {
>      (@openClose.start) = "onAnimationEvent ( $event )"
>      (@openClose.done) = "onAnimationEvent ( $event )"
>…</div>

A potential use for animation callbacks could be to cover for a slow API call, such as a database lookup. For example, the "InProgress" button could actually have its own looping animation where it pulsates or does some other visual motion while the back-end system operation finishes.

Then, another animation can be called when the current animation finishes. For example, the button goes from `inProgress` to the `closed` state when the API call is completed.

An animation can influence an end user to _perceive_ the operation as faster, even when it isn’t. Thus, a simple animation can be a cost-effective way to keep users happy, rather than seeking to improve the speed of a server call and having compensate for circumstances beyond your control, such as an unreliable network connection.

Callbacks can also serve as a debugging tool, for example in conjunction with `console.log()` to view the application’s progress in a browser’s Developer JavaScript Console. The following code snippet creates console log output for our original example, button that has 2 states of `open` and `closed`.

<code-example hideCopy language="sh" class="code-shell">
@Component ( {
   animations: [
      trigger ( 'openClose', [ … ] )
   ],
} )
class MyOpenCloseComponent {
   onAnimationEvent ( event: AnimationEvent ) {
  // syntax is event.triggerName
  // openClose is trigger name in this example 
      console.log ( event.openClose );
 // phaseName is start or done
      console.log ( event.phaseName  ); 
 // in our example, totalTime is 1000 or 1 second
      console.log ( event.totalTime  ); 
 // in our example, fromState is either open or closed
      console.log ( event.fromState  );  
 // in our example, toState either open or closed
      console.log ( event.toState  );
 // the HTML element itself, the button in this case
      console.log ( event.element  ); 
</code-example>

## Details from Keyframes

### Animatable properties and units

Angular's animation support builds on top of animations. Thus, you can animate any property that the browser considers animatable. This includes positions, sizes, transforms, colors, borders, and more. The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) page.

For positional properties with a numeric value, define a unit by providing the value as a string, in quotes, with the appropriate suffix:

* 50 pixels: `'50px'`

* Relative font size: `'3em'`

* Percentage: `'100%'`

If you don't provide a unit when specifying dimension, Angular assumes a default unit of pixels, or px:

* Expressing 50 pixels as `50` is the same as saying `'50px'`

### Automatic property calculation with *

Sometimes you don't know the value of a dimensional style property until runtime. For example, elements often have widths and heights that depend on their content and the screen size. These properties are often challenging to animate using CSS.

In these cases, you can use a special wildcard `*` property value under `style()`, so that the value of that particular style property is computed at runtime and then plugged into the animation.

In this example, we have a trigger called `shrinkOut`, used when an HTML element leaves the page. The animation takes whatever height the element has before it leaves, and animates from that height to zero:

<code-example hideCopy language="sh" class="code-shell">
animations: [
  trigger('shrinkOut', [
    state('in', style({height: '*'})),
    transition('* => void', [
      style({height: '*'}),
      animate(250, style({height: 0}))
    ])
  ])
]
</code-example>	

## Details from Grouping and Sequencing

### Additional query() options

Options for `query()` allow you to:

* Limit the total number of items collected with `query()` using the `limit` option.

* Ignore errors when `query()` returns zero items using the `optional` flag.

Refer to the [API reference](api) for more information.

### Special selector values for query()

In addition to the aliases `:enter` and `:leave` for HTML elements inserted or removed from a page, `query()` uses these additional special values:

* `:animating` - all elements that are currently animating

* `@triggerName` - all elements with a specific named animation trigger

* `@*` - all elements containing any animation trigger

* `:self` - use to include the current element in the animation

These selectors can be merged together into a combined query selector string.

<code-example hideCopy language="sh" class="code-shell">
query (':self, .record:enter, .record:leave, @trigger', [ 
   ...
])
</code-example>	

Refer to the [API reference](api) for more information.

### Use of :increment and :decrement with transition ( ), query ( ), :enter and :leave

Here's an example using several special selector values, including In the animation demo. Click Advanced and then go to Filter Animation to see the code. The functionality is what occurs when you type filter criteria into the Filter box in the upper left.

// <div [ @filterAnimation ]="totalItems">
trigger ( 'filterAnimation', [
  // this will ignore animations on enter 
  // and when there are none to display
  transition ( ':enter, * => 0, * => -1', [] ),
  transition ( ':increment', [
    query ( ':enter', [
      style ({ opacity: 0, width: '0px' }),
      stagger (50, [
        animate ( '300ms ease-out', 
          style ({ 
            opacity: 1, 
            width: '*' })
        ),
      ]),
    ])
  ]),
  transition ( ':decrement', [
    query ( ':leave', [
      stagger (50, [
        animate ('300ms ease-out', 
          style ({ 
            opacity: 0, 
            width: '0px' })
        ),
      ]),
    ])
  ]),
])

### Use of :increment and :decrement with transition(), query(), and group()

Here's another code sample using `:increment` and `:decrement`, with `group()`:

### Usage example for stagger()

In the example below, the HTML code has a `<div>` element containing list of items generated by an *ngFor. directive. Within the `<div>` container is a trigger called `listAnimation`.

The HTML code is as follows:

In the component file, the `listAnimation` trigger performs a query for each of the inner HTML elements, for anything entering or leaving the page. Items entering are faded in, while items leaving are faded out. If multiple items are entering or leaving, they are staggered as they fade in or out.

The component file is as follows:

<code-example hideCopy language="sh" class="code-shell">
import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
@Component ({
   templateUrl: 'list.component.html',
   animations: [
      trigger ( 'listAnimation', [
        // transition any time the binding value changes
         transition ( '* => *', [ 
        
            query ( ':leave', [
               stagger ( 100, [
                  animate ('0.5s', 
                     style ({ opacity: 0 }))
               ])
            ]),
            query ( ':enter', [
               style ({ opacity: 0 }),
               stagger (100, [
                  animate ('0.5s', 
                     style ({ opacity: 1 }))
               ])
            ])
         ])
      ])
   ]
})
class ListComponent {
 items = [];
 
 showItems() {
   this.items = [0,1,2,3,4];
 }
 
 hideItems() {
   this.items = [];
 }
 
 toggle() {
   this.items.length ? this.hideItems() : this.showItems();
 }
}
</code-example>	

## Details from Parent-Child Animations

Normally, when an element within an HTML template has animations disabled using @.disabled host binding, animations are disabled on all inner elements as well. 

However, selective child animations can still be run on a disabled parent in one of the following ways:

* A parent animation can use `query()` to collect inner elements located in disabled areas of the HTML template. Those elements can still animate. 

* A sub-animation can be queried by a parent and then later animated with `animateChild()`.



