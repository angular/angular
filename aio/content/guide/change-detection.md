# Change Detection in Angular apps

Angular Change Detection is a core mechanism of the `Angular` framework. While using the framework if we change any data property the HTML is automatically updated. This is where change detection comes in. The mechanism of syncing changes the DOM elements with our data properties is Change Detection.

Let us know more about it in detail.

## What is Change Detection

`Angular` tries to maintain the state of our application on the UI by combining our data, template and update the view if any changes happens to our data.

Change Detection: The process of updating the view (DOM) when the data has changed.

A change detection can be split into 4 parts:

- Change in data properties
- `Angular` detects the change
- Change detection checks every component in the component tree from top to bottom to see if the corresponding model has changed
- If there is a new value, it will update the component’s view (DOM)

In an `Angular` component tree there is a change detector for each component which is created during the initial build of the app. This detector compares our current and previous data property and if the values are changed it will start the process of implementing the new data in the template from top to botom of the component tree.

## Zone.js

In general, a zone can keep track and intercept any asynchronous tasks.

A zone normally has these phases:

- it starts stable
- it becomes unstable if tasks run in the zone
- it becomes stable again if the tasks completed
- Angular patches several low-level browser APIs at startup to be able to detect changes in the application. This is done using zone.js which patches APIs such as EventEmitter, DOM event listeners, XMLHttpRequest, fs API in Node.js and more.

In short, the framework will trigger a change detection if one of the following events occurs:

- any browser event (click, keyup, etc.)
- setInterval() and setTimeout()
- HTTP requests via XMLHttpRequest
- Angular uses its zone called NgZone. There exists only one NgZone and change detection is only triggered for async operations triggered in this zone.

## Performance

If `angular` checks all components after each Detection from top to bottom the first thing tat comes to mind is it performant enough. `Angular` actually does a lot of optimizations behind the scenes and can do thousands of checks in milliseconds but still for large applications if it is not performing well you need to checkout your change detection stratergy.

## Change Detection Stratergies

Angular provides two startergies to run change detections:

- Default
- OnPush

Let us look at each of these in detail.

### Default Change Detection Stratergy

Angular by default uses this stratergy. THis stratergy checks every component in the component tree from top to bottom every time an event triggers a change detection. This way of checking can negatively affect the performance of your app in large applications. Example

``` javascript
@Component({
    selector: 'hero-card',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class HeroCard {
    ...
}
```

This does not need to be added to your components it is added by default.

### OnPush Change Detection Strategy

By using this stratergy it is possible to skip unnecessary checks by default for its components and its child components. To start change detection via this stratergy you need to change the `changeDetection` metadata in the component decorator.

``` javascript
@Component({
    selector: 'hero-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ...
})
export class HeroCard {
    ...
}
```

Using this the framework knows that the component needs to updated only when the following happens:

- the input reference has changed
- the component or one of its children triggers an event handler
- change detection triggered manually
- an observable linked to the template via the async pipe emits a new value

Lets now look at each of On push change detection in detail:

#### Input Changes

It the default change detection for `OnPush` change detection. In this change detection runs anytime `@Input` data is changed or modified. In this, change detection is only triggered if a new reference is passed as `@Input` value.

`Primitive types` like numbers, string, booleans, null and undefined are passed by value. Object and arrays are also passed by value but modifying object properties or array entries does not create a new reference and therefore does not trigger change detection on an OnPush component. To trigger the change detector you need to pass a new object or array reference instead.

You can prevent bugs on using `OnPush` stratergy if you use only `Immuable objects` and arrays because it will create a new object and array reference each time we create it.

#### Event Handler is triggered

Change detection is triggered if the component or one of its child compnents triggers an event handler, like `clicking on a button`. Be careful as the following actions do not trigger change detection when used in the `OnPush` stratergy.

- setTimeout
- setInterval
- `Promise.resolve().then()` , `Promise.reject().then()`
- `this.http.get('...').subscribe()` (in general, any RxJS observable subscription)

### Manually trigger Change detection

There are three methods to manually trigger change detection:

- `detectChanges()` on ChangeDetectorRef which runs change detection on this view and its children by keeping the change detection strategy in mind.

- `ApplicationRef.tick()` which triggers change detection for the whole application by respecting the change detection strategy of a component

- `markForCheck()` on `ChangeDetectorRef` which does not trigger change detection but marks all OnPush ancestors as to be checked once, either as part of the current or next change detection cycle. It will run change detection on marked components even though they are using the `OnPush` strategy.

#### Async Pipe

Internally the `AsyncPipe` calls `markForCheck` each time a new value is emitted. So, that is how it triggers change detection on the component tree.

The `AsyncPipe` automatically works using `OnPush` change detection strategy. So it is recommended to use it as much as possible to easier perform a later switch from default change detection strategy to `OnPush`.

## Avoiding Change Detection Loops and ExpressionChangedAfterCheckedError

By default, in development mode the frame work runs change detection twic o see if a loop is created in change detection. In production change detection only runs once to have a better performance. If a change detection loop is created angular throws a `ExpressionChangedAfterCheckedError`.

## Run code without Change detection

It is possible to run certain code blocks outside NgZone so that it does not trigger `change detection`. The following is the example of how to run code withou `change detection`.

``` javascript
constructor(private ngZone: NgZone) {}

runWithoutChangeDetection() {
    this.ngZone.runOutsideAngular(() => {
        // the following setTimeout will not trigger change detection
        setTimeout(() => doStuff(), 1000);
    });
}
```

## Deactivate Change Detection

There are special use cases where it makes sense to deactivate change detection. For example, if you are using a WebSocket to push a lot of data from the backend to the frontend and the corresponding frontend components should only be updated every 10 seconds. In this case we can deactivate change detection by calling `detach()` and trigger it manually using `detectChanges()`.

```javascript

constructor(private ref: ChangeDetectorRef) {
    ref.detach(); // deactivate change detection
    setInterval(() => {
      this.ref.detectChanges(); // manually trigger change detection
    }, 10 * 1000);
  }

```

It is also possible to completely deactivate `Zone.js` during bootstrapping of an Angular application. This means that automatic change detection is completely deactivated and we need to manually trigger UI changes, e.g. by calling ChangeDetectorRef.detectChanges().

First, we need to comment out the `Zone.js` import from `polyfills.ts`:

```javascript
import 'zone.js/dist/zone';  // Included with Angular CLI.
```

Next, we need to pass the noop zone in main.ts.

```javascript
platformBrowserDynamic().bootstrapModule(AppModule, {
      ngZone: 'noop';
}).catch(err => console.log(err));
```
