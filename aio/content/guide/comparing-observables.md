# Observables compared to other techniques

You can often use observables instead of promises to deliver values asynchronously. Similarly, observables can take the place of event handlers. Finally, because observables deliver multiple values, you can use them where you might otherwise build and operate on arrays.

Observables behave somewhat differently from the alternative techniques in each of these situations, but offer some significant advantages. Here are detailed comparisons of the differences.

## Observables compared to promises

Observables are often compared to promises. Here are some key differences:

* Observables are declarative; computation does not start until subscription. Promises execute immediately on creation. This makes observables useful for defining recipes that can be run whenever you need the result.

* Observables provide many values. Promises provide one. This makes observables useful for getting multiple values over time.

* Observables differentiate between chaining and subscription. Promises only have `.then()` clauses. This makes observables useful for creating complex transformation recipes to be used by other part of the system, without causing the work to be executed.

* Observables `subscribe()` is responsible for handling errors. Promises push errors to the child promises. This makes observables useful for centralized and predictable error handling.


### Creation and subscription

* Observables are not executed until a consumer subscribes. The `subscribe()` executes the defined behavior once, and it can be called again. Each subscription has its own computation. Resubscription causes recomputation of values.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (observable)"
    region="observable">
  </code-example>

* Promises execute immediately, and just once. The computation of the result is initiated when the promise is created. There is no way to restart work. All `then` clauses (subscriptions) share the same computation.

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (promise)"
    region="promise">
  </code-example>

### Chaining

* Observables differentiate between transformation function such as a map and subscription. Only subscription activates the subscriber function to start computing the values.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (chain)"
    region="chain">
  </code-example>

* Promises do not differentiate between the last `.then` clauses (equivalent to subscription) and intermediate `.then` clauses (equivalent to map).

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (chain)"
    region="chain">
  </code-example>

### Cancellation

* Observable subscriptions are cancellable. Unsubscribing removes the listener from receiving further values, and notifies the subscriber function to cancel work.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (unsubcribe)"
    region="unsubscribe">
  </code-example>

* Promises are not cancellable.

### Error handling

* Observable execution errors are delivered to the subscriber's error handler, and the subscriber automatically unsubscribes from the observable.

  <code-example
    path="comparing-observables/src/observables.ts"
    header="src/observables.ts (error)"
    region="error">
  </code-example>

* Promises push errors to the child promises.

  <code-example
    path="comparing-observables/src/promises.ts"
    header="src/promises.ts (error)"
    region="error">
  </code-example>

### Cheat sheet

The following code snippets illustrate how the same kind of operation is defined using observables and promises.

<table>
  <thead>
    <tr>
      <th>Operation</th>
      <th>Observable</th>
      <th>Promise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Creation</td>
      <td>
        <pre>
new Observable((observer) => {
  observer.next(123);
});</pre>
      </td>
      <td>
        <pre>
new Promise((resolve, reject) => {
  resolve(123);
});</pre>
      </td>
    </tr>
    <tr>
      <td>Transform</td>
      <td><pre>obs.pipe(map((value) => value * 2));</pre></td>
      <td><pre>promise.then((value) => value * 2);</pre></td>
    </tr>
    <tr>
      <td>Subscribe</td>
      <td>
        <pre>
sub = obs.subscribe((value) => {
  console.log(value)
});</pre>
      </td>
      <td>
        <pre>
promise.then((value) => {
  console.log(value);
});</pre>
      </td>
    </tr>
    <tr>
      <td>Unsubscribe</td>
      <td><pre>sub.unsubscribe();</pre></td>
      <td>Implied by promise resolution.</td>
    </tr>
  </tbody>
</table>

## Observables compared to events API

Observables are very similar to event handlers that use the events API. Both techniques define notification handlers, and use them to process multiple values delivered over time. Subscribing to an observable is equivalent to adding an event listener. One significant difference is that you can configure an observable to transform an event before passing the event to the handler.

Using observables to handle events and asynchronous operations can have the advantage of greater consistency in contexts such as HTTP requests.

Here are some code samples that illustrate how the same kind of operation is defined using observables and the events API.

<table>
  <tr>
    <th></th>
    <th>Observable</th>
    <th>Events API</th>
  </tr>
  <tr>
    <td>Creation & cancellation</td>
    <td>
<pre>// Setup
const clicks$ = fromEvent(buttonEl, ‘click’);
// Begin listening
const subscription = clicks$
  .subscribe(e => console.log(‘Clicked’, e))
// Stop listening
subscription.unsubscribe();</pre>
   </td>
   <td>
<pre>function handler(e) {
  console.log(‘Clicked’, e);
}
// Setup & begin listening
button.addEventListener(‘click’, handler);
// Stop listening
button.removeEventListener(‘click’, handler);
</pre>
    </td>
  </tr>
  <tr>
    <td>Subscription</td>
    <td>
<pre>observable.subscribe(() => {
  // notification handlers here
});</pre>
    </td>
    <td>
<pre>element.addEventListener(eventName, (event) => {
  // notification handler here
});</pre>
    </td>
  </tr>
  <tr>
    <td>Configuration</td>
    <td>Listen for keystrokes, but provide a stream representing the value in the input.
<pre>fromEvent(inputEl, 'keydown').pipe(
  map(e => e.target.value)
);</pre>
    </td>
    <td>Does not support configuration.
<pre>element.addEventListener(eventName, (event) => {
  // Cannot change the passed Event into another
  // value before it gets to the handler
});</pre>
    </td>
  </tr>
</table>


## Observables compared to arrays

An observable produces values over time. An array is created as a static set of values. In a sense, observables are asynchronous where arrays are synchronous. In the following examples, ➞ implies asynchronous value delivery.

<table>
  <tr>
    <th></th>
    <th>Observable</th>
    <th>Array</th>
  </tr>
  <tr>
    <td>Given</td>
    <td>
      <pre>obs: ➞1➞2➞3➞5➞7</pre>
      <pre>obsB: ➞'a'➞'b'➞'c'</pre>
    </td>
    <td>
      <pre>arr: [1, 2, 3, 5, 7]</pre>
      <pre>arrB: ['a', 'b', 'c']</pre>
    </td>
  </tr>
  <tr>
    <td><pre>concat()</pre></td>
    <td>
      <pre>concat(obs, obsB)</pre>
      <pre>➞1➞2➞3➞5➞7➞'a'➞'b'➞'c'</pre>
    </td>
    <td>
      <pre>arr.concat(arrB)</pre>
      <pre>[1,2,3,5,7,'a','b','c']</pre>
    </td>
  </tr>
  <tr>
    <td><pre>filter()</pre></td>
    <td>
      <pre>obs.pipe(filter((v) => v>3))</pre>
      <pre>➞5➞7</pre>
    </td>
    <td>
      <pre>arr.filter((v) => v>3)</pre>
      <pre>[5, 7]</pre>
    </td>
  </tr>
  <tr>
    <td><pre>find()</pre></td>
    <td>
      <pre>obs.pipe(find((v) => v>3))</pre>
      <pre>➞5</pre>
    </td>
    <td>
      <pre>arr.find((v) => v>3)</pre>
      <pre>5</pre>
    </td>
  </tr>
  <tr>
    <td><pre>findIndex()</pre></td>
    <td>
      <pre>obs.pipe(findIndex((v) => v>3))</pre>
      <pre>➞3</pre>
    </td>
    <td>
      <pre>arr.findIndex((v) => v>3)</pre>
      <pre>3</pre>
    </td>
  </tr>
  <tr>
    <td><pre>forEach()</pre></td>
    <td>
      <pre>obs.pipe(tap((v) => {
  console.log(v);
}))
1
2
3
5
7</pre>
    </td>
    <td>
      <pre>arr.forEach((v) => {
  console.log(v);
})
1
2
3
5
7</pre>
    </td>
  </tr>
  <tr>
    <td><pre>map()</pre></td>
    <td>
      <pre>obs.pipe(map((v) => -v))</pre>
      <pre>➞-1➞-2➞-3➞-5➞-7</pre>
    </td>
    <td>
      <pre>arr.map((v) => -v)</pre>
      <pre>[-1, -2, -3, -5, -7]</pre>
    </td>
  </tr>
  <tr>
    <td><pre>reduce()</pre></td>
    <td>
      <pre>obs.pipe(reduce((s,v)=> s+v, 0))</pre>
      <pre>➞18</pre>
    </td>
    <td>
      <pre>arr.reduce((s,v) => s+v, 0)</pre>
      <pre>18</pre>
    </td>
  </tr>
</table>
