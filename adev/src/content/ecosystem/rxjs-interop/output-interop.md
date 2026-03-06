# Взаимодействие RxJS с выходными событиями компонентов и директив {#rxjs-interop-with-component-and-directive-outputs}

TIP: Это руководство предполагает знакомство с [выходными событиями компонентов и директив](guide/components/outputs).

Пакет `@angular/rxjs-interop` предоставляет два API, связанных с выходными событиями компонентов и директив.

## Создание выходного события на основе Observable RxJS {#creating-an-output-based-on-an-rxjs-observable}

Функция `outputFromObservable` позволяет создать выходное событие компонента или директивы, которое генерирует события на основе Observable RxJS:

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

При подписке на выходное событие Angular автоматически перенаправляет подписку на базовый Observable. Angular прекращает передачу значений при уничтожении компонента или директивы.

HELPFUL: Рассмотрите возможность использования `output()` напрямую, если значения можно генерировать императивно.

## Создание Observable RxJS из выходного события компонента или директивы {#creating-an-rxjs-observable-from-a-component-or-directive-output}

Функция `outputToObservable` позволяет создать Observable RxJS из выходного события компонента.

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

HELPFUL: Рассмотрите возможность прямого использования метода `subscribe` на `OutputRef`, если это подходит для вашего случая.
