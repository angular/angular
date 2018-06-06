<!--
# Observables compared to other techniques
-->
# 옵저버블과 다른 테크닉 비교

<!--
You can often use observables instead of promises to deliver values asynchronously. Similarly, observables can take the place of event handlers. Finally, because observables deliver multiple values, you can use them where you might otherwise build and operate on arrays.
-->
비동기 로직을 처리하려면 Promise대신 옵저버블을 사용할 수 있으며, 이벤트 핸들러도 옵저버블로 처리할 수 있습니다. 그리고 옵저버블은 객체 하나로 데이터를 여러번 보낼 수 있기 때문에, 데이터를 배열로 묶어서 한번에 보내는 방식보다 더 효율적입니다.

<!--
Observables behave somewhat differently from the alternative techniques in each of these situations, but offer some significant advantages. Here are detailed comparisons of the differences.
-->
옵저버블은 Promise나 이벤트 API, 배열을 사용하는 방식과 조금 다르게 동작하지만, 옵저버블의 독특한 장점이 있습니다. 이 문서에서는 이 차이점에 대해 알아봅니다.

<!--
## Observables compared to promises
-->
## 옵저버블 vs. Promise

<!--
Observables are often compared to promises. Here are some key differences:
-->
옵저버블은 Promise와 자주 비교됩니다. 간단하게 살펴보면 다음과 같은 점이 다릅니다:

<!--
* Observables are declarative; computation does not start until subscription. Promises execute immediately on creation. This makes observables useful for defining recipes that can be run whenever you need the result.
-->
* 옵저버블은 명시적으로 구독하기 전까지는 실행되지 않지만, Promise는 객체를 생성할 때 바로 실행됩니다. 데이터를 받는 쪽에서 원하는 시점을 결정하는 경우라면 옵저버블이 더 효율적입니다.

<!--
* Observables provide many values. Promises provide one. This makes observables useful for getting multiple values over time.
-->
* 옵저버블은 데이터를 여러개 보낼 수 있지만, Promise는 하나만 보낼 수 있습니다. 데이터를 여러번 나눠서 보내는 경우라면 옵저버블이 더 효율적입니다.

<!--
* Observables differentiate between chaining and subscription. Promises only have `.then()` clauses. This makes observables useful for creating complex transformation recipes to be used by other part of the system, without causing the work to be executed.
-->
* 옵저버블은 체이닝과 구독을 구별하지만, Promise는 `.then()` 하나로 사용합니다. 다른 곳에서 가져온 데이터를 복잡하게 가공해야 한다면 옵저버블이 더 효율적입니다.

<!--
* Observables `subscribe()` is responsible for handling errors. Promises push errors to the child promises. This makes observables useful for centralized and predictable error handling.
-->
* 옵저버블에서 제공하는 `subscribe()`는 에러도 함께 처리할 수 있습니다. Promise는 `.catch()`를 사용하는 위치에 따라 에러를 처리하는 로직이 달라져야 하지만, 옵저버블은 에러 처리 로직을 한 군데에 집중할 수 있습니다.

<!--
### Creation and subscription
-->
### 생성, 구독

<!--
* Observables are not executed until a consumer subcribes. The `subscribe()` executes the defined behavior once, and it can be called again. Each subscription has its own computation. Resubscription causes recomputation of values.
-->
* 옵저버블은 구독자가 구독하기 전까지 실행되지 않습니다. 그리고 `subscribe()`가 실행되면 스트림이 전달될 때마다 지정된 옵저버블 처리 로직을 실행합니다. 옵저버블은 구독될 때마다 새로운 실행 컨텍스트를 생성하며, 이 때마다 옵저버블이 처음부터 다시 실행됩니다.

<!--
<code-example hideCopy>
// declare a publishing operation
new Observable((observer) => { subscriber_fn });
// initiate execution
observable.subscribe(() => {
      // observer handles notifications
    });
</code-example>
-->
<code-example hideCopy>
// 옵저버블 발행 로직을 지정합니다.
new Observable((observer) => { subscriber_fn });
// 옵저버블을 시작합니다.
observable.subscribe(() => {
      // 옵저버가 알림을 처리합니다.
    });
</code-example>

<!--
* Promises execute immediately, and just once. The computation of the result is initiated when the promise is created. There is no way to restart work. All `then` clauses (subscriptions) share the same computation.
-->
* Promise는 생성되자마자 딱 한 번만 실행됩니다. Promise에 지정된 로직도 Promise가 생성될 때 한 번만 실행되며, 이 로직을 다시 실행하는 방법은 없습니다. Promise에서 체이닝하는 `then`은 모두 같은 객체를 공유합니다.

<!--
<code-example hideCopy>
// initiate execution
new Promise((resolve, reject) => { executer_fn });
// handle return value
promise.then((value) => {
      // handle result here
    });
</code-example>
-->
<code-example hideCopy>
// Promise를 실행합니다.
new Promise((resolve, reject) => { executer_fn });
// Promise 실행 결과를 then으로 받습니다.
promise.then((value) => {
      Promise가 전달하는 데이터를 처리합니다.
    });
</code-example>

<!--
### Chaining
-->
### 체이닝

<!--
* Observables differentiate between transformation function such as a map and subscription. Only subscription activates the subscriber function to start computing the values.
-->
* 옵저버블은 데이터를 조작하는 것과 구독하는 것을 구별합니다. 옵저버블은 구독자가 있을 때만 옵저버블 로직을 실행합니다.

<code-example hideCopy>observable.map((v) => 2*v);</code-example>


<!--
* Promises do not differentiate between the last `.then` clauses (equivalent to subscription) and intermediate `.then` clauses (equivalent to map).
-->
* Promise는 구독을 의미하는 마지막 `.then`과 데이터 조작을 의미하는 중간 `.then`을 구분하지 않습니다.

<code-example hideCopy>promise.then((v) => 2*v);</code-example>


<!--
### Cancellation
-->
### 취소

<!--
* Observable subscriptions are cancellable. Unsubscribing removes the listener from receiving further values, and notifies the subscriber function to cancel work.
-->
* 옵저버블 구독은 취소할 수 있습니다. 옵저버블 구독을 해지하면 옵저버블에서 전달하는 값이나 알림을 더이상 받지 않습니다.

<code-example hideCopy>
const sub = obs.subscribe(...);
sub.unsubscribe();
</code-example>

<!--
* Promises are not cancellable.
-->
* Promise는 실행되는 도중에 취소할 수 없습니다.

<!--
### Error handling
-->
### 에러 처리

<!--
* Observable execution errors are delivered to the subscriber's error handler, and the subscriber automatically unsubscribes from the observable.
-->
* 옵저버블은 구독자의 에러 핸들러 함수에서 에러를 처리하며, 에러가 발생하면 구독자가 자동으로 구독을 해지합니다.

<code-example hideCopy>
obs.subscribe(() => {
  throw Error('my error');
});
</code-example>

<!--
* Promises push errors to the child promises.
-->
* Promise는 자식 Promise를 생성하고 이 객체에 에러를 보냅니다.

<code-example hideCopy>
promise.then(() => {
      throw Error('my error');
});
</code-example>

<!--
### Cheat sheet
-->
### 치트 시트

<!--
The following code snippets illustrate how the same kind of operation is defined using observables and promises.
-->
각 상황에서 옵저버블과 Promise가 어떻게 다른지 확인해 봅시다.

<table>
  <tr>
    <!--
    <th>Operation</th>
    -->
    <th>동작</th>
    <th>Observable</th>
    <th>Promise</th>
  </tr>
  <tr>
    <!--
    <td>Creation</td>
    -->
    <td>생성</td>
    <td>
      <pre>new Observable((observer) => {
  observer.next(123);
});</pre>
    </td>
    <td>
      <pre>new Promise((resolve, reject) => {
  resolve(123);
});</pre>
    </td>
  </tr>
  <tr>
    <!--
    <td>Transform</td>
    -->
    <td>변환</td>
    <td><pre>obs.map((value) => value * 2 );</pre></td>
    <td><pre>promise.then((value) => value * 2);</pre></td>
  </tr>
  <tr>
    <!--
    <td>Subscribe</td>
    -->
    <td>구독</td>
    <td>
      <pre>sub = obs.subscribe((value) => {
  console.log(value)
});</pre>
    </td>
    <td>
      <pre>promise.then((value) => {
  console.log(value);
});</pre>
    </td>
  </tr>
  <tr>
    <!--
    <td>Unsubscribe</td>
    -->
    <td>구독 해지</td>
    <td><pre>sub.unsubscribe();</pre></td>
    <!--
    <td>Implied by promise resolution.</td>
    -->
    <td>Promise가 모두 실행되면 해지된 것으로 봅니다.</td>
  </tr>
</table>

<!--
## Observables compared to events API
-->
## 옵저버블 vs. 이벤트 API

<!--
Observables are very similar to event handlers that use the events API. Both techniques define notification handlers, and use them to process multiple values delivered over time. Subscribing to an observable is equivalent to adding an event listener. One significant difference is that you can configure an observable to transform an event before passing the event to the handler.
-->
옵저버블은 이벤트 API를 활용하는 이벤트 핸들러와 아주 비슷합니다. 두 방식은 모두 핸들러를 지정해서 이벤트를 처리하며, 데이터가 여러번 계속 전달된다는 점도 같습니다. 사실 옵저버블을 구독하는 것은 엘리먼트에 이벤트 리스너를 연결하는 것과 비슷합니다. 다른 점을 꼽아보자면, 옵저버블은 이벤트 핸들러가 이벤트를 받기 전에 옵저버블 연산자를 사용해서 다른 형태로 변환할 수 있습니다.

<!--
Using observables to handle events and asynchronous operations can have the advantage of greater consistency in contexts such as HTTP requests.
-->
그리고 옵저버블로 이벤트를 처리하거나 비동기 로직을 처리하는 방식은 컨텍스트를 계속 유지해야 하는 경우에 좀 더 유리합니다. HTTP 요청이 이런 경우에 해당됩니다.

<!--
Here are some code samples that illustrate how the same kind of operation is defined using observables and the events API.
-->
각 상황에서 옵저버블과 이벤트 API가 어떻게 다른지 확인해 봅시다.

<table>
  <tr>
    <th></th>
    <th>Observable</th>
    <th>Events API</th>
  </tr>
  <tr>
    <!--
    <td>Creation & cancellation</td>
    -->
    <td>생성 & 취소</td>
    <td>
<!--
<pre>// Setup
let clicks$ = fromEvent(buttonEl, ‘click’);
// Begin listening
let subscription = clicks$
  .subscribe(e => console.log(‘Clicked’, e))
// Stop listening
subscription.unsubscribe();</pre>
-->
<pre>// 옵저버블을 정의합니다.
let clicks$ = fromEvent(buttonEl, ‘click’);
// 구독을 시작합니다.
let subscription = clicks$
  .subscribe(e => console.log(‘Clicked’, e))
// 구독을 중단합니다.
subscription.unsubscribe();</pre>
   </td>
   <td>
<!--
<pre>function handler(e) {
  console.log(‘Clicked’, e);
}

// Setup & begin listening
button.addEventListener(‘click’, handler);
// Stop listening
button.removeEventListener(‘click’, handler);
</pre>
-->
<pre>function handler(e) {
  console.log(‘Clicked’, e);
}

// 이벤트 리스너를 설정하고 감지하기 시작합니다.
button.addEventListener(‘click’, handler);
// 이벤트 추적을 중단합니다.
button.removeEventListener(‘click’, handler);
</pre>
    </td>
  </tr>
  <tr>
    <!--
    <td>Subscription</td>
    -->
    <td>구독</td>
    <td>
<!--
<pre>observable.subscribe(() => {
  // notification handlers here
});</pre>
-->
<pre>observable.subscribe(() => {
  // 옵저버블 핸들러는 여기에 정의합니다.
});</pre>
    </td>
    <td>
<!--
<pre>element.addEventListener(eventName, (event) => {
  // notification handler here
});</pre>
-->
<pre>element.addEventListener(eventName, (event) => {
  // 핸들러는 여기 정의합니다.
});</pre>
    </td>
  </tr>
  <tr>
    <!--
    <td>Configuration</td>
    -->
    <td>데이터 변환</td>
    <!--
    <td>Listen for keystrokes, but provide a stream representing the value in the input.
    -->
    <td>키입력에 반응하지만 입력 필드의 데이터를 반환합니다.
<pre>fromEvent(inputEl, 'keydown').pipe(
  map(e => e.target.value)
);</pre>
    </td>
    <!--
    <td>Does not support configuration.
<pre>element.addEventListener(eventName, (event) => {
  // Cannot change the passed Event into another
  // value before it gets to the handler
});</pre>
    </td>
    -->
    <td>데이터 변환을 지원하지 않습니다.
<pre>element.addEventListener(eventName, (event) => {
  // 이벤트 핸들러가 이벤트 객체를 받기 전에
  // 다른 형태로 변환할 수 없습니다.
});</pre>
    </td>
  </tr>
</table>


<!--
## Observables compared to arrays
-->
## 옵저버블 vs. 배열

<!--
An observable produces values over time. An array is created as a static set of values. In a sense, observables are asynchronous where arrays are synchronous. In the following examples, ➞ implies asynchronous value delivery.
-->
옵저버블은 데이터를 여러번 전달하지만, 배열은 데이터를 한 번에 묶어서 전달합니다. 

<table>
  <tr>
    <th></th>
    <!--
    <th>Observable</th>
    <th>Array</th>
    -->
    <th>옵저버블</th>
    <th>배열</th>
  </tr>
  <tr>
    <!--
    <td>Given</td>
    -->
    <td>데이터</td>
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
      <pre>obs.concat(obsB)</pre>
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
      <pre>obs.filter((v) => v>3)</pre>
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
      <pre>obs.find((v) => v>3)</pre>
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
      <pre>obs.findIndex((v) => v>3)</pre>
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
      <pre>obs.forEach((v) => {
  console.log(v);
})
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
      <pre>obs.map((v) => -v)</pre>
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
      <pre>obs.scan((s,v)=> s+v, 0)</pre>
      <pre>➞1➞3➞6➞11➞18</pre>
    </td>
    <td>
      <pre>arr.reduce((s,v) => s+v, 0)</pre>
      <pre>18</pre>
    </td>
  </tr>
</table>



