# Function-based outputs

The `output()` function declares an output in a directive or component.
Outputs allow you to emit values to parent components.

HELPFUL: The `output()` function is currently in [developer preview](/reference/releases#developer-preview).

<docs-code language="ts" highlight="[[5], [8]]">
import {Component, output} from '@angular/core';

@Component({...})
export class MyComp {
  onNameChange = output<string>()    // OutputEmitterRef<string>

  setNewName(newName: string) {
    this.onNameChange.emit(newName);
  }
}
</docs-code>

An output is automatically recognized by Angular whenever you use the `output` function as an initializer of a class member.
Parent components can listen to outputs in templates by using the event binding syntax.

```html
<my-comp (onNameChange)="showNewName($event)" />
```

## Aliasing an output

Angular uses the class member name as the name of the output.
You can alias outputs to change their public name to be different.

```typescript
class MyComp {
  onNameChange = output({alias: 'ngxNameChange'});
}
```

This allows users to bind to your output using `(ngxNameChange)`, while inside your component you can access the output emitter using `this.onNameChange`.

## Subscribing programmatically

Consumers may create your component dynamically with a reference to a `ComponentRef`.
In those cases, parents can subscribe to outputs by directly accessing the property of type `OutputRef`.

```ts
const myComp = viewContainerRef.createComponent(...);

myComp.instance.onNameChange.subscribe(newName => {
  console.log(newName);
});
```

Angular will automatically clean up the subscription when `myComp` is destroyed.
Alternatively, an object with a function to explicitly unsubscribe earlier is returned.

## Using RxJS observables as source

In some cases, you may want to emit output values based on RxJS observables.
Angular provides a way to use RxJS observables as source for outputs.

The `outputFromObservable` function is a compiler primitive, similar to the `output()` function, and declares outputs that are driven by RxJS observables.

<docs-code language="ts" highlight="[7]">
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive(...)
class MyDir {
  nameChange$ = this.dataService.get(); // Observable<Data>
  nameChange = outputFromObservable(this.nameChange$);
}
</docs-code>

Angular will forward subscriptions to the observable, but will stop forwarding values when the owning directive is destroyed.
In the example above, if `MyDir` is destroyed, `nameChange` will no longer emit values.

HELPFUL: Most of the time, using `output()` is sufficient and you can emit values imperatively.

## Converting an output to an observable

You can subscribe to outputs by calling `.subscribe` method on `OutputRef`.
In other cases, Angular provides a helper function that converts an `OutputRef` to an observable.

<docs-code language="ts" highlight="[11]">
import {outputToObservable} from '@angular/core/rxjs-interop';

@Component(...)
class MyComp {
  onNameChange = output<string>();
}

// Instance reference to `MyComp`.
const myComp: MyComp;

outputToObservable(this.myComp.instance.onNameChange) // Observable<string>
  .pipe(...)
  .subscribe(...);
</docs-code>

## Why you should use `output()` over decorator-based `@Output()`?

The `output()` function provides numerous benefits over decorator-based `@Output` and `EventEmitter`:

1. Simpler mental model and API:
  <br/>• No concept of error channel, completion channels, or other APIs from RxJS.
  <br/>• Outputs are simple emitters. You can emit values using the `.emit` function.
2. More accurate types.
  <br/>• `OutputEmitterRef.emit(value)` is now correctly typed, while `EventEmitter` has broken types and can cause runtime errors.
