# RxJS interop with component and directive outputs

TIP: This guide assumes you're familiar with [component and directive outputs](guide/components/outputs).

The `@angular/rxjs-interop` package offers two APIs related to component and directive outputs.

## Creating an output based on an RxJs Observable

The `outputFromObservable` lets you create a component or directive output that emits based on an RxJS observable:

<docs-code language="ts" highlight="[7]">
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({/*...*/})
class Draggable {
  pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();
  
  // Whenever `pointerMoves$` emits, the `pointerMove` event fires.
  pointerMove = outputFromObservable(this.pointerMoves$);
}
</docs-code>

The `outputFromObservable` function has special meaning to the Angular compiler. **You may only call `outputFromObservable` in component and directive property initializers.**

When you `subscribe` to the output, Angular automatically forwards the subscription to the underlying observable. Angular stops forwarding values when the component or directive is destroyed.

HELPFUL: Consider using `output()` directly if you can emit values imperatively.

## Creating an RxJS Observable from a component or directive output

The `outputToObservable` function lets you create an RxJS observable from a component output.

<docs-code language="ts" highlight="[11]">
import {outputToObservable} from '@angular/core/rxjs-interop';

@Component(/*...*/)
class CustomSlider {
  valueChange = output<number>();
}

// Instance reference to `CustomSlider`.
const slider: CustomSlider = createSlider();

outputToObservable(slider.valueChange) // Observable<number>
  .pipe(...)
  .subscribe(...);
</docs-code>

HELPFUL: Consider using the `subscribe` method on `OutputRef` directly if it meets your needs.
