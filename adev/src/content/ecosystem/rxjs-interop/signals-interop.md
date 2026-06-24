# Взаимодействие RxJS и сигналов Angular

Пакет `@angular/core/rxjs-interop` предоставляет API, помогающие интегрировать RxJS и сигналы Angular.

## Создание сигнала из RxJS Observable с помощью `toSignal`

Используйте функцию `toSignal` для создания сигнала, который отслеживает значение Observable. Она ведет себя аналогично
пайпу `async` в шаблонах, но является более гибкой и может использоваться в любом месте приложения.

```angular-ts
import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { interval } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);

  // Get a `Signal` representing the `counterObservable`'s value.
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

Как и пайп `async`, `toSignal` подписывается на Observable немедленно, что может вызвать побочные эффекты. Подписка,
созданная `toSignal`, автоматически отменяется, когда компонент или сервис, вызывающий `toSignal`, уничтожается.

ВАЖНО: `toSignal` создает подписку. Следует избегать повторных вызовов для одного и того же Observable; вместо этого
повторно используйте возвращаемый сигнал.

### Контекст внедрения

По умолчанию `toSignal` должен выполняться в [контексте внедрения](guide/di/dependency-injection-context), например, во
время создания компонента или сервиса. Если контекст внедрения недоступен, можно вручную указать `Injector`.

### Начальные значения

Observable могут не выдавать значение синхронно при подписке, но сигналам всегда требуется текущее значение. Существует
несколько способов работы с этим "начальным" значением сигналов, созданных через `toSignal`.

#### Опция `initialValue`

Как и в примере выше, вы можете указать опцию `initialValue` со значением, которое сигнал должен возвращать до того, как
Observable выдаст данные в первый раз.

#### Начальные значения `undefined`

Если вы не предоставите `initialValue`, результирующий сигнал будет возвращать `undefined`, пока Observable не выдаст
значение. Это похоже на поведение пайпа `async`, возвращающего `null`.

#### Опция `requireSync`

Некоторые Observable гарантированно выдают значения синхронно, например `BehaviorSubject`. В таких случаях можно указать
опцию `requireSync: true`.

Когда `requireSync` установлено в `true`, `toSignal` требует, чтобы Observable выдавал значение синхронно при подписке.
Это гарантирует, что сигнал всегда имеет значение, и тип `undefined` или начальное значение не требуются.

### `manualCleanup`

По умолчанию `toSignal` автоматически отписывается от Observable при уничтожении компонента или сервиса, который его
создал.

Чтобы переопределить это поведение, можно передать опцию `manualCleanup`. Эту настройку можно использовать для
Observable, которые завершаются естественным образом.

#### Пользовательское сравнение на равенство

Некоторые Observable могут выдавать значения, которые считаются **равными**, даже если они отличаются ссылкой или
мелкими деталями. Опция `equal` позволяет определить **пользовательскую функцию сравнения**, чтобы определить, когда два
последовательных значения следует считать одинаковыми.

Когда два выданных значения считаются равными, результирующий сигнал **не обновляется**. Это предотвращает избыточные
вычисления, обновления DOM или ненужный перезапуск эффектов.

```ts
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

@Component(/* ... */)
export class EqualExample {
  temperature$ = interval(1000).pipe(
    map(() => ({ temperature: Math.floor(Math.random() * 3) + 20 }) ) // 20, 21, or 22 randomly
  );

  // Only update if the temperature changes
  temperature = toSignal(this.temperature$, {
    initialValue: { temperature : 20  },
    equal: (prev, curr) => prev.temperature === curr.temperature
  });
}
```

### Ошибки и завершение

Если Observable, используемый в `toSignal`, выдает ошибку, эта ошибка выбрасывается при чтении сигнала.

Если Observable, используемый в `toSignal`, завершается (completes), сигнал продолжает возвращать последнее выданное
значение до завершения.

## Создание RxJS Observable из сигнала с помощью `toObservable`

Используйте утилиту `toObservable` для создания `Observable`, который отслеживает значение сигнала. Значение сигнала
отслеживается с помощью `effect`, который передает значение в Observable при его изменении.

```ts
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(
    switchMap(query => this.http.get('/search?q=' + query ))
  );
}
```

При изменении сигнала `query`, Observable `query$` выдает последний запрос и инициирует новый HTTP-запрос.

### Контекст внедрения

По умолчанию `toObservable` должен выполняться в [контексте внедрения](guide/di/dependency-injection-context), например,
во время создания компонента или сервиса. Если контекст внедрения недоступен, можно вручную указать `Injector`.

### Тайминг `toObservable`

`toObservable` использует эффект для отслеживания значения сигнала в `ReplaySubject`. При подписке первое значение (если
доступно) может быть выдано синхронно, а все последующие значения будут асинхронными.

В отличие от Observable, сигналы никогда не предоставляют синхронное уведомление об изменениях. Даже если вы обновите
значение сигнала несколько раз, `toObservable` выдаст значение только после стабилизации сигнала.

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe(value => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Здесь будет выведено только последнее значение (3).

## Использование `rxResource` для асинхронных данных

ВАЖНО: `rxResource` является [экспериментальным](reference/releases#experimental). Он готов к тому, чтобы вы его
попробовали, но может измениться до того, как станет стабильным.

Функция Angular [`resource`](/guide/signals/resource) дает возможность внедрять асинхронные данные в код приложения,
основанный на сигналах. Основываясь на этом паттерне, `rxResource` позволяет определить ресурс, где источник данных
определяется через RxJS `Observable`. Вместо функции `loader`, `rxResource` принимает функцию `stream`, которая работает
с RxJS `Observable`.

```typescript
import {Component, inject} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class UserProfile {
  // This component relies on a service that exposes data through an RxJS Observable.
  private userData = inject(MyUserDataClient);

  protected userId = input<string>();

  private userResource = rxResource({
    params: () => ({ userId: this.userId() }),

    // The `stream` property expects a factory function that returns
    // a data stream as an RxJS Observable.
    stream: ({params}) => this.userData.load(params.userId),
  });
}
```

Свойство `stream` принимает фабричную функцию для RxJS `Observable`. Этой фабричной функции передается значение `params`
ресурса, и она возвращает `Observable`. Ресурс вызывает эту фабричную функцию каждый раз, когда вычисление `params`
выдает новое значение. См. [Загрузчики ресурсов](/guide/signals/resource#resource-loaders) для получения подробной
информации о параметрах, передаваемых фабричной функции.

Во всем остальном `rxResource` ведет себя так же и предоставляет те же API, что и `resource`, для указания параметров,
чтения значений, проверки состояния загрузки и обработки ошибок.
