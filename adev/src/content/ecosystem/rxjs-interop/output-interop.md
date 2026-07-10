# RxJS interop с output компонентов и директив

TIP: Это руководство предполагает знакомство с [output компонентов и директив](guide/components/outputs).

Пакет `@angular/rxjs-interop` предлагает два API, связанных с output компонентов и директив.

## Создание output на основе RxJS Observable {#creating-an-output-based-on-an-rxjs-observable}

`outputFromObservable` позволяет создать output компонента или директивы, который эмитит на основе RxJS Observable:

```ts {highlight:[11]}
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive(/* ... */)
class Draggable {
  pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();

  // Whenever `pointerMoves$` emits, the `pointerMove` event fires.
  pointerMove = outputFromObservable(this.pointerMoves$);
}
```

Функция `outputFromObservable` имеет особое значение для компилятора Angular. **Вызывать `outputFromObservable` можно только в инициализаторах свойств компонентов и директив.**

Когда вы `subscribe` на output, Angular автоматически пробрасывает подписку в нижележащий Observable. Angular прекращает проброс значений при уничтожении компонента или директивы.

HELPFUL: Если значения можно эмитить императивно, рассмотрите прямое использование `output()`.

## Создание RxJS Observable из output компонента или директивы {#creating-an-rxjs-observable-from-a-component-or-directive-output}

Функция `outputToObservable` позволяет создать RxJS Observable из output компонента.

```ts {highlight:[11]}
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
```

HELPFUL: Если метод `subscribe` на `OutputRef` покрывает ваши нужды, рассмотрите его прямое использование.
