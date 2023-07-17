<!-- vale Angular.Google_Headings = NO -->

# NgZone

<!-- vale Angular.Google_Headings = YES -->

A zone is an execution context that persists across async tasks.
You can think of it as [thread-local storage](https://en.wikipedia.org/wiki/Thread-local_storage) for the JavaScript VM.
This guide describes how to use Angular's NgZone to automatically detect changes in the component to update HTML.

## Fundamentals of change detection

To understand the benefits of `NgZone`, it is important to have a clear grasp of what change detection is and how it works.

### Displaying and updating data in Angular

In Angular, you can display data by binding controls in an HTML template to the properties of an Angular component.

<code-example header="src/app/app.component.ts" path="displaying-data/src/app/app.component.1.ts"></code-example>

You can also bind DOM events to a method of an Angular component.
In such methods, you can also update a property of the Angular component, which updates the corresponding data displayed in the template.

<code-example header="src/app/click-me.component.ts" path="user-input/src/app/click-me.component.ts" region="click-me-component"></code-example>

In both of the preceding examples, the component's code updates only the property of the component.
The HTML is also updated automatically.
This guide describes how and when Angular renders the HTML based on the data from the Angular component.

### Detecting changes with plain JavaScript

To clarify how changes are detected and values updated, consider the following code written in plain JavaScript.

<code-example format="javascript" language="javascript">

&lt;html&gt;
  &lt;div id="dataDiv"&gt;&lt;/div&gt;
  &lt;button id="btn"&gt;updateData&lt;/button&gt;
  &lt;canvas id="canvas"&gt;&lt;/canvas&gt;
  &lt;script&gt;
    let value = 'initialValue';
    // initial rendering
    detectChange();

    function renderHTML() {
      document.getElementById('dataDiv').innerText = value;
    }

    function detectChange() {
      const currentValue = document.getElementById('dataDiv').innerText;
      if (currentValue !== value) {
        renderHTML();
      }
    }

    // Example 1: update data inside button click event handler
    document.getElementById('btn').addEventListener('click', () =&gt; {
      // update value
      value = 'button update value';
      // call detectChange manually
      detectChange();
    });

    // Example 2: HTTP Request
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
      // get response from server
      value = this.responseText;
      // call detectChange manually
      detectChange();
    });
    xhr.open('GET', serverUrl);
    xhr.send();

    // Example 3: setTimeout
    setTimeout(() =&gt; {
      // update value inside setTimeout callback
      value = 'timeout update value';
      // call detectChange manually
      detectChange();
    }, 100);

    // Example 4: Promise.then
    Promise.resolve('promise resolved a value').then(v =&gt; {
      // update value inside Promise thenCallback
      value = v;
      // call detectChange manually
      detectChange();
    }, 100);

    // Example 5: some other asynchronous APIs
    document.getElementById('canvas').toBlob(blob =&gt; {
      // update value when blob data is created from the canvas
      value = `value updated by canvas, size is &dollar;{blob.size}`;
      // call detectChange manually
      detectChange();
    });
  &lt;/script&gt;
&lt;/html&gt;

</code-example>

After you update the data, you need to call `detectChange()` manually to see whether the data changed.
If the data changed, you render the HTML to reflect the updated data.

In Angular, this step is unnecessary.
Whenever you update the data, your HTML is updated automatically.

### When apps update HTML

To understand how change detection works, first consider when the application needs to update the HTML.
Typically, updates occur for one of the following reasons:

1.  Component initialization.
    For example, when bootstrapping an Angular application, Angular loads the bootstrap component and triggers the [ApplicationRef.tick()](api/core/ApplicationRef#tick) to call change detection and View Rendering.

1.  Event listener.
    The DOM event listener can update the data in an Angular component and also trigger change detection, as in the following example.

    <code-example header="src/app/click-me.component.ts" path="user-input/src/app/click-me.component.ts" region="click-me-component"></code-example>

1.  HTTP Data Request.
    You can also get data from a server through an HTTP request.
    For example:

    <code-example format="typescript" language="typescript">

    &commat;Component({
      selector: 'app-root',
      template: '&lt;div&gt;{{data}}&lt;/div&gt;';
    })
    export class AppComponent implements OnInit {
      data = 'initial value';
      serverUrl = 'SERVER_URL';
      constructor(private httpClient: HttpClient) {}

      ngOnInit() {
        this.httpClient.get(this.serverUrl).subscribe(response =&gt; {
          // user does not need to trigger change detection manually
          this.data = response.data;
        });
      }
    }

    </code-example>

1.  MacroTasks, such as `setTimeout()` or `setInterval()`.
    You can also update the data in the callback function of a `macroTask` such as `setTimeout()`.
    For example:

    <code-example format="typescript" language="typescript">

    &commat;Component({
      selector: 'app-root',
      template: '&lt;div&gt;{{data}}&lt;/div&gt;';
    })
    export class AppComponent implements OnInit {
      data = 'initial value';

      ngOnInit() {
        setTimeout(() =&gt; {
          // user does not need to trigger change detection manually
          this.data = 'value updated';
        });
      }
    }

    </code-example>

1.  MicroTasks, such as `Promise.then()`.
    Other asynchronous APIs return a Promise object \(such as `fetch`\), so the `then()` callback function can also update the data.
    For example:

    <code-example format="typescript" language="typescript">

    &commat;Component({
      selector: 'app-root',
      template: '&lt;div&gt;{{data}}&lt;/div&gt;';
    })
    export class AppComponent implements OnInit {
      data = 'initial value';

      ngOnInit() {
        Promise.resolve(1).then(v =&gt; {
          // user does not need to trigger change detection manually
          this.data = v;
        });
      }
    }

    </code-example>

1.  Other async operations.
    Besides `addEventListener()`, `setTimeout()` and `Promise.then()`, there are other operations that can update the data asynchronously.
    Some examples include `WebSocket.onmessage()` and `Canvas.toBlob()`.

    The preceding list contains most common scenarios in which the application might change the data.
    Angular runs change detection whenever it detects that data could have changed.
    The result of change detection is that the DOM is updated with new data.
    Angular detects the changes in different ways.
    For component initialization, Angular calls change detection explicitly.
    For [asynchronous operations](https://developer.mozilla.org/docs/Learn/JavaScript/Asynchronous), Angular uses a zone to detect changes in places where the data could have possibly mutated and it runs change detection automatically.

## Zones and execution contexts

A zone provides an execution context that persists across async tasks.
[Execution Context](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this) is an abstract concept that holds information about the environment within the current code being executed.
Consider the following example:

<code-example format="javascript" language="javascript">

const callback = function() {
  console.log('setTimeout callback context is', this);
}

const ctx1 = { name: 'ctx1' };
const ctx2 = { name: 'ctx2' };

const func = function() {
  console.log('caller context is', this);
  setTimeout(callback);
}

func.apply(ctx1);
func.apply(ctx2);

</code-example>

The value of `this` in the callback of `setTimeout()` might differ depending on when `setTimeout()` is called.
Thus, you can lose the context in asynchronous operations.

A zone provides a new zone context other than `this`, the zone context that persists across asynchronous operations.
In the following example, the new zone context is called `zoneThis`.

<code-example format="javascript" language="javascript">

zone.run(() =&gt; {
  // now you are in a zone
  expect(zoneThis).toBe(zone);
  setTimeout(function() {
    // the zoneThis context will be the same zone
    // when the setTimeout is scheduled
    expect(zoneThis).toBe(zone);
  });
});

</code-example>

This new context, `zoneThis`, can be retrieved from the `setTimeout()` callback function, and this context is the same when the `setTimeout()` is scheduled.
To get the context, you can call [`Zone.current`](https://github.com/angular/angular/blob/main/packages/zone.js/lib/zone.ts).

## Zones and async lifecycle hooks

Zone.js can create contexts that persist across asynchronous operations as well as provide lifecycle hooks for asynchronous operations.

<code-example format="javascript" language="javascript">

const zone = Zone.current.fork({
  name: 'zone',
  onScheduleTask: function(delegate, curr, target, task) {
    console.log('new task is scheduled:', task.type, task.source);
    return delegate.scheduleTask(target, task);
  },
  onInvokeTask: function(delegate, curr, target, task, applyThis, applyArgs) {
    console.log('task will be invoked:', task.type, task.source);
    return delegate.invokeTask(target, task, applyThis, applyArgs);
  },
  onHasTask: function(delegate, curr, target, hasTaskState) {
    console.log('task state changed in the zone:', hasTaskState);
    return delegate.hasTask(target, hasTaskState);
  },
  onInvoke: function(delegate, curr, target, callback, applyThis, applyArgs) {
    console.log('the callback will be invoked:', callback);
    return delegate.invoke(target, callback, applyThis, applyArgs);
  }
});
zone.run(() =&gt; {
  setTimeout(() =&gt; {
    console.log('timeout callback is invoked.');
  });
});

</code-example>

The preceding example creates a zone with several hooks.

The `onXXXTask` hooks trigger when the status of the task changes.
The concept of a *Zone Task* is comparable to the JavaScript VM Task concept:

*   `macroTask`: such as `setTimeout()`
*   `microTask`: such as `Promise.then()`
*   `eventTask`: such as `element.addEventListener()`

These hooks trigger under the following circumstances:

| Hooks            | Details |
|:---              |:---     |
| `onScheduleTask` | Triggers when a new asynchronous task is scheduled, such as when you call `setTimeout()`.                                                                                                                                                         |
| `onInvokeTask`   | Triggers when an asynchronous task is about to run, such as when the callback of `setTimeout()` is about to run.                                                                                                                          |
| `onHasTask`      | Triggers when the status of one kind of task inside a zone changes from stable to unstable or from unstable to stable. A status of "stable" means there are no tasks inside the zone, while "unstable" means a new task is scheduled in the zone. |
| `onInvoke`       | Triggers when a synchronous function is going to run in the zone.                                                                                                                                                                             |

With these hooks, `Zone` can observe the status of all synchronous and asynchronous operations inside a zone.

The preceding example returns the following output:

<code-example format="output" hideCopy language="shell">

the callback will be invoked: () =&gt; {
  setTimeout(() =&gt; {
    console.log('timeout callback is invoked.');
  });
}
new task is scheduled: macroTask setTimeout
task state changed in the zone: { microTask: false,
  macroTask: true,
  eventTask: false,
  change: 'macroTask' }
task will be invoked macroTask: setTimeout
timeout callback is invoked.
task state changed in the zone: { microTask: false,
  macroTask: false,
  eventTask: false,
  change: 'macroTask' }

</code-example>

All of the functions of `Zone` are provided by a library called [Zone.js](https://github.com/angular/angular/tree/main/packages/zone.js/README.md).
This library implements those features by intercepting asynchronous APIs through monkey patching.
Monkey patching is a technique to add or alter the default behavior of a function at runtime without changing the source code.

<!-- vale Angular.Google_Headings = NO -->

## NgZone

<!-- vale Angular.Google_Headings = YES -->

While Zone.js can observe all the states of synchronous and asynchronous operations, Angular additionally provides a service called NgZone.
This service creates a zone named `angular` to automatically trigger change detection when the following conditions are satisfied:

1.  When a sync or async function is executed
1.  When there is no `microTask` scheduled

<!-- vale Angular.Google_Headings = NO -->

### NgZone `run()` and `runOutsideOfAngular()`

<!-- vale Angular.Google_Headings = YES -->

`Zone` handles most asynchronous APIs such as `setTimeout()`, `Promise.then()`, and `addEventListener()`.
For the full list, see the [Zone Module document](https://github.com/angular/angular/blob/main/packages/zone.js/MODULE.md).
In those asynchronous APIs, you don't need to trigger change detection manually.

Some third party APIs are not handled by Zone.
In those cases, the `NgZone` service provides a [`run()`](api/core/NgZone#run) method that allows you to run a function inside the Angular zone.
This function, and all asynchronous operations in that function, triggers change detection automatically at the correct time.

<code-example format="typescript" language="typescript">

export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone) {}
  ngOnInit() {
    // New async API is not handled by Zone, so you need to use ngZone.run()
    // to make the asynchronous operation callback in the Angular zone and
    // trigger change detection automatically.
    someNewAsyncAPI(() =&gt; {
      this.ngZone.run(() =&gt; {
        // update the data of the component
      });
    });
  }
}

</code-example>

By default, all asynchronous operations are inside the Angular zone, which triggers change detection automatically.
Another common case is when you don't want to trigger change detection.
In that situation, you can use another `NgZone` method: [`runOutsideAngular()`](api/core/NgZone#runoutsideangular).

<code-example format="typescript" language="typescript">

export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone) {}
  ngOnInit() {
    // You know no data will be updated,
    // so you don't want to trigger change detection in this
    // specified operation. Instead, call ngZone.runOutsideAngular()
    this.ngZone.runOutsideAngular(() =&gt; {
      setTimeout(() =&gt; {
        // update component data
        // but don't trigger change detection.
      });
    });
  }
}

</code-example>

<!-- vale Angular.Google_Headings = NO -->

### Setting up Zone.js

<!-- vale Angular.Google_Headings = YES -->

To make Zone.js available in Angular, you need to import the `zone.js` package.
If you are using the Angular CLI, this step is done automatically, and you can see the following line in the `src/polyfills.ts`:

<code-example format="typescript" language="typescript">

/***************************************************************************************************
 &ast; Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.

</code-example>

Before importing the `zone.js` package, you can set the following configurations:

*   Disabling some asynchronous API monkey patching for better performance.
    For example, disabling the `requestAnimationFrame()` monkey patch, so the callback of `requestAnimationFrame()` does not trigger change detection.
    This is useful if, in your application, the callback of the `requestAnimationFrame()` does not update any data.

*   Specify that certain DOM events do not run inside the Angular zone. For example, to prevent a `mousemove` or `scroll` event to trigger change detection

Several other settings can be changed.
To make these changes, you need to create a `zone-flags.ts` file, such as the following.

<code-example format="typescript" language="typescript">

// disable patching requestAnimationFrame
(window as any).__Zone_disable_requestAnimationFrame = true;

// disable patching specified eventNames
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];

</code-example>

Next, import `zone-flags` before you import `zone.js` in the `polyfills.ts`:

<code-example format="typescript" language="typescript">

/***************************************************************************************************
 &ast; Zone JS is required by default for Angular.
 */
import `./zone-flags`;
import 'zone.js';  // Included with Angular CLI.

</code-example>

For more information about what you can configure, see the [Zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) documentation.

<!-- vale Angular.Google_Headings = NO -->

### NoopZone

<!-- vale Angular.Google_Headings = YES -->

`Zone` helps Angular know when to trigger change detection and let the developers focus on the application development.
By default, `Zone` is loaded and works without further configuration.
You don't necessarily have to use `Zone` to make Angular work.
Instead, you can opt to trigger change detection on your own.

<div class="callout is-helpful">

<header>Disabling Zone</header>

**Disabling `Zone` requires you to trigger all change detection at the correct timing yourself, which requires comprehensive knowledge of change detection**.

</div>

To remove Zone.js, make the following changes.

1.  Remove the `zone.js` import from `polyfills.ts`:

    <code-example format="typescript" language="typescript">

    /***************************************************************************************************
     &ast; Zone JS is required by default for Angular itself.
     */
    // import 'zone.js';  // Included with Angular CLI.

    </code-example>

1.  Bootstrap Angular with the `noop` zone in `src/main.ts`:

    <code-example format="typescript" language="typescript">

    platformBrowserDynamic().bootstrapModule(AppModule, { ngZone: 'noop' })
    .catch(err =&gt; console.error(err));

    </code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
