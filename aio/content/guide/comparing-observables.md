# Observables compared to other techniques

You can often use observables instead of promises to deliver values asynchronously.
Similarly, observables can take the place of event handlers.
Finally, because observables deliver multiple values, you can use them where you might otherwise build and operate on arrays.

Observables behave somewhat differently from the alternative techniques in each of these situations, but offer some significant advantages.
Here are detailed comparisons of the differences.

## Observables compared to promises

Observables are often compared to promises.
Here are some key differences:

*   Observable execution is deferred; computation does not start until subscription.
    Promises execute immediately on creation.
    This makes observables useful for defining recipes that can be run whenever you need the result.

*   Observables provide many values.
    Promises provide one.
    This makes observables useful for getting multiple values over time.

*   Observable values can be transformed with operators as well as in the subscription.  The rich variety of RxJS operators observables enables complex transformations that can be passed around to other parts of the system, without causing the work to be executed prematurely.
    
    Promises have `.then()` clauses which can transform values but only after the work is done.

*   Observables and Promises handle errors differently with roughly comparable efficacy.

The following sections explore these points in greater detail.
### Creation and subscription

*   Observables are not executed until a consumer subscribes.
    
    The `subscribe()` initiates the observable's behavior which may execute synchronously or asynchronously and could produce one, many or no values over time.

    For "unicast" observables, if you call `subscribe` again, you get a new observable execution with its own production of values.
    Calling `subscribe` on a "multicast" observable (e.g., `Subject` or an observable with the `shareReplay` operator) simply adds another *subscriber* to the already running observable.

    The `subscribe` call is the end-of-the-line. You cannot continue to manipulate values after `subscribe(...)`.

    <code-example header="src/observables.ts (observable)" path="comparing-observables/src/observables.ts" region="observable"></code-example>

*   Promises execute immediately when they are created. There is no deferred execution and, therefore, no equivalent to `subscribe()`.

    A promise is always asynchronous and can produce at most one value.
    
    There is no way to restart a promise and it retains its result value for the life of the promise.

    You can chain additional `then` clauses to a promise.

    <code-example header="src/promises.ts (promise)" path="comparing-observables/src/promises.ts" region="promise"></code-example>

<a id="chaining"></a>
### Transformations

*   Developers can transform values both in the *subscription* and in piped *operators*. There are large number of RxJS operators to suit many complex scenarios, including numerous ways to combine and split observables.

    <code-example header="src/observables.ts (operators and multiple values)" path="comparing-observables/src/observables.ts" region="operators"></code-example>

*   Promises do not have an equivalent to `subscribe()`. You can transform the emitted value of a promise through one or more `.then` clauses. Promises have a small set of combiners (e.g., `all`, `any`, `race`).

    <code-example header="src/promises.ts (chained .then)" path="comparing-observables/src/promises.ts" region="chain"></code-example>

### Cancellation

*   Observable subscriptions are cancellable.
    Unsubscribing removes the listener from receiving further values, and notifies the subscriber function to cancel work.

    <code-example header="src/observables.ts (unsubscribe)" path="comparing-observables/src/observables.ts" region="unsubscribe"></code-example>

*   Promises are not cancellable.

### Error handling

*   Observable execution errors can be handled with the `catchError()` operator or in the `subscribe`.

    `catchError` can put the observable back on the normal path where it continues to produce values or it can rethrow the error. An uncaught error unsubscribes all subscribers.

    <code-example header="src/observables.ts (error)" path="comparing-observables/src/observables.ts" region="error"></code-example>

*   Promise errors can be handled with a `.catch()` or in the second argument of a `.then()`.

    <code-example header="src/promises.ts (error)" path="comparing-observables/src/promises.ts" region="error"></code-example>

### Cheat sheet

The following code snippets illustrate how the same kind of operation is defined using observables and promises.

| Operation   | Observable                                                                                                                                                           | Promise |
|:---         |:---                                                                                                                                                                  |:---     |
| Creation    | <code-example format="typescript" hideCopy language="typescript"> new Observable((observer) =&gt; { &NewLine;&nbsp; observer.next(123); &NewLine;}); </code-example> | <code-example format="typescript" hideCopy language="typescript"> new Promise((resolve, reject) =&gt; { &NewLine;&nbsp; resolve(123); &NewLine;}); </code-example> |
| Transform   | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(map((value) =&gt; value &ast; 2));</pre>                                                  | <code-example format="typescript" hideCopy language="typescript"> promise.then((value) =&gt; value &ast; 2);</code-example>                                        |
| Subscribe   | <code-example format="typescript" hideCopy language="typescript"> sub = obs.subscribe((value) =&gt; { &NewLine;&nbsp; console.log(value) &NewLine;});</code-example> | <code-example format="typescript" hideCopy language="typescript"> promise.then((value) =&gt; { &NewLine;&nbsp; console.log(value); &NewLine;}); </code-example>    |
| Unsubscribe | <code-example format="typescript" hideCopy language="typescript"> sub.unsubscribe();</code-example>                                                                  | Implied by promise resolution.                                                                                                                                     |

## Observables compared to events API

Observables are very similar to event handlers that use the events API.
Both techniques define notification handlers, and use them to process multiple values delivered over time.
Subscribing to an observable is equivalent to adding an event listener.
One significant difference is that you can configure an observable to transform an event before passing the event to the handler.

Using observables to handle events and asynchronous operations can have the advantage of greater consistency in contexts such as HTTP requests.

Here are some code samples that illustrate how the same kind of operation is defined using observables and the events API.

|                             | Observable                                                                                                                                                                                                                                                                                                                                                      | Events API |
|:---                         |:---                                                                                                                                                                                                                                                                                                                                                             |:---        |
| Creation &amp; cancellation | <code-example format="typescript" hideCopy language="typescript"> // Setup &NewLine;const clicks&dollar; = fromEvent(buttonEl, 'click'); &NewLine;// Begin listening &NewLine;const subscription = clicks&dollar; &NewLine;&nbsp; .subscribe(e =&gt; console.log('Clicked', e)) &NewLine;// Stop listening &NewLine;subscription.unsubscribe(); </code-example> | <code-example format="typescript" hideCopy language="typescript">function handler(e) { &NewLine;&nbsp; console.log('Clicked', e); &NewLine;} &NewLine;// Setup &amp; begin listening &NewLine;button.addEventListener('click', handler); &NewLine;// Stop listening &NewLine;button.removeEventListener('click', handler); </code-example> |
| Subscription                | <code-example format="typescript" hideCopy language="typescript">observable.subscribe(() =&gt; { &NewLine;&nbsp; // notification handlers here &NewLine;});</code-example>                                                                                                                                                                                      | <code-example format="typescript" hideCopy language="typescript">element.addEventListener(eventName, (event) =&gt; { &NewLine;&nbsp; // notification handler here &NewLine;}); </code-example>                                                                                                                                             |
| Configuration               | Listen for keystrokes, but provide a stream representing the value in the input. <code-example format="typescript" hideCopy language="typescript"> fromEvent(inputEl, 'keydown').pipe( &NewLine;&nbsp; map(e =&gt; e.target.value) &NewLine;); </code-example>                                                                                                  | Does not support configuration. <code-example format="typescript" hideCopy language="typescript"> element.addEventListener(eventName, (event) =&gt; { &NewLine;&nbsp; // Cannot change the passed Event into another &NewLine;&nbsp; // value before it gets to the handler &NewLine;}); </code-example>                                   |

## Observables compared to arrays

An observable produces values over time.
An array is created as a static set of values.
In a sense, observables are asynchronous where arrays are synchronous.
In the following examples, <code>&rarr;</code> implies asynchronous value delivery.

| Values        | Observable                                                                                                                                                                                                                                           | Array                                                                                                                                                                                                                |
|:---           |:---                                                                                                                                                                                                                                                  |:---                                                                                                                                                                                                                 |
| Given         | <code-example format="typescript" hideCopy language="typescript"> obs: &rarr;1&rarr;2&rarr;3&rarr;5&rarr;7 </code-example> <code-example format="typescript" hideCopy language="typescript"> obsB: &rarr;'a'&rarr;'b'&rarr;'c' </code-example>       | <code-example format="typescript" hideCopy language="typescript"> arr: [1, 2, 3, 5, 7] </code-example> <code-example format="typescript" hideCopy language="typescript"> arrB: ['a', 'b', 'c'] </code-example>      |
| `concat()`    | <code-example format="typescript" hideCopy language="typescript"> concat(obs, obsB) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;1&rarr;2&rarr;3&rarr;5&rarr;7&rarr;'a'&rarr;'b'&rarr;'c' </code-example> | <code-example format="typescript" hideCopy language="typescript"> arr.concat(arrB) </code-example> <code-example format="typescript" hideCopy language="typescript"> [1,2,3,5,7,'a','b','c'] </code-example>        |
| `filter()`    | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(filter((v) =&gt; v&gt;3)) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;5&rarr;7 </code-example>                                | <code-example format="typescript" hideCopy language="typescript"> arr.filter((v) =&gt; v&gt;3) </code-example> <code-example format="typescript" hideCopy language="typescript"> [5, 7] </code-example>             |
| `find()`      | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(find((v) =&gt; v&gt;3)) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;5 </code-example>                                         | <code-example format="typescript" hideCopy language="typescript"> arr.find((v) =&gt; v&gt;3) </code-example> <code-example format="typescript" hideCopy language="typescript"> 5 </code-example>                    |
| `findIndex()` | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(findIndex((v) =&gt; v&gt;3)) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;3 </code-example>                                    | <code-example format="typescript" hideCopy language="typescript"> arr.findIndex((v) =&gt; v&gt;3) </code-example> <code-example format="typescript" hideCopy language="typescript"> 3 </code-example>               |
| `forEach()`   | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(tap((v) =&gt; { &NewLine; &nbsp; console.log(v); &NewLine; })) &NewLine; 1 &NewLine; 2 &NewLine; 3 &NewLine; 5 &NewLine; 7 </code-example>                                | <code-example format="typescript" hideCopy language="typescript"> arr.forEach((v) =&gt; { &NewLine; &nbsp; console.log(v); &NewLine; }) &NewLine; 1 &NewLine; 2 &NewLine; 3 &NewLine; 5 &NewLine; 7 </code-example> |
| `map()`       | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(map((v) =&gt; -v)) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;-1&rarr;-2&rarr;-3&rarr;-5&rarr;-7 </code-example>             | <code-example format="typescript" hideCopy language="typescript"> arr.map((v) =&gt; -v) </code-example> <code-example format="typescript" hideCopy language="typescript"> [-1, -2, -3, -5, -7] </code-example>      |
| `reduce()`    | <code-example format="typescript" hideCopy language="typescript"> obs.pipe(reduce((s,v)=&gt; s+v, 0)) </code-example> <code-example format="typescript" hideCopy language="typescript"> &rarr;18 </code-example>                                     | <code-example format="typescript" hideCopy language="typescript"> arr.reduce((s,v) =&gt; s+v, 0) </code-example> <code-example format="typescript" hideCopy language="typescript"> 18 </code-example>               |

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-08-25
