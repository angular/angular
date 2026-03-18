# Взаимодействие RxJS с outputs компонентов и директив {#rxjs-interop-with-component-and-directive-outputs}

TIP: Это руководство предполагает знакомство с [outputs компонентов и директив](guide/components/outputs).

Пакет `@angular/rxjs-interop` предоставляет два API, связанных с outputs компонентов и директив.

## Создание output на основе RxJS Observable {#creating-an-output-based-on-an-rxjs-observable}

`outputFromObservable` позволяет создать output компонента или директивы, генерирующий события на основе RxJS Observable:

```ts {highlight:[11]}
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({
  /*...*/
})
class Draggable {
  pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();

  // Whenever `pointerMoves$` emits, the `pointerMove` event fires.
  pointerMove = outputFromObservable(this.pointerMoves$);
}
```

Функция `outputFromObservable` имеет особое значение для компилятора Angular. **Вызывать `outputFromObservable` можно только в инициализаторах свойств компонентов и директив.**

При `subscribe` на output Angular автоматически перенаправляет подписку на базовый Observable. Angular прекращает перенаправление значений при уничтожении компонента или директивы.

HELPFUL: Рассмотрите использование `output()` напрямую, если вы можете генерировать значения императивно.

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

HELPFUL: Рассмотрите использование метода `subscribe` на `OutputRef` напрямую, если это удовлетворяет вашим потребностям.
