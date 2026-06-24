# Взаимодействие RxJS с Output-ами компонентов и директив

TIP: Это руководство предполагает, что вы знакомы с [Output-ами компонентов и директив](guide/components/outputs).

Пакет `@angular/rxjs-interop` предлагает два API, связанных с Output-ами компонентов и директив.

## Создание Output-а на основе RxJS Observable

Функция `outputFromObservable` позволяет создать Output компонента или директивы, который эмитит значения на основе RxJS
Observable:

```ts {highlight:[9]}
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({/*...*/})
class Draggable {
    pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();

    // Каждый раз, когда `pointerMoves$` эмитит значение, срабатывает событие `pointerMove`.
    pointerMove = outputFromObservable(this.pointerMoves$);
}
```

Функция `outputFromObservable` имеет особое значение для компилятора Angular. **Вы можете
вызывать `outputFromObservable` только в инициализаторах свойств компонентов и директив.**

Когда вы подписываетесь (`subscribe`) на Output, Angular автоматически передает подписку базовому Observable. Angular
прекращает передачу значений, когда компонент или директива уничтожаются.

HELPFUL: Рассмотрите возможность использования `output()` напрямую, если вы можете эмитить значения императивно.

## Создание RxJS Observable из Output-а компонента или директивы

Функция `outputToObservable` позволяет создать RxJS Observable из Output-а компонента.

```ts {highlight:[11]}
import {outputToObservable} from '@angular/core/rxjs-interop';

@Component(/*...*/)
    class CustomSlider {
    valueChange = output<number>();
}

// Ссылка на экземпляр `CustomSlider`.
const slider: CustomSlider = createSlider();

outputToObservable(slider.valueChange) // Observable<number>
    .pipe(...)
    .subscribe(...);
```

HELPFUL: Рассмотрите возможность использования метода `subscribe` непосредственно в `OutputRef`, если это соответствует
вашим потребностям.
