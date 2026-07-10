# RxJS interop с сигналами Angular

Пакет `@angular/core/rxjs-interop` предлагает API, помогающие интегрировать RxJS и сигналы Angular.

## Создание сигнала из RxJS Observable с `toSignal` {#create-a-signal-from-an-rxjs-observable-with-tosignal}

Используйте функцию `toSignal`, чтобы создать сигнал, отслеживающий значение Observable. Поведение похоже на pipe `async` в шаблонах, но гибче и доступно в любой части приложения.

```angular-ts
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);

  // Get a `Signal` representing the `counterObservable`'s value.
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

Как и pipe `async`, `toSignal` сразу подписывается на Observable, что может вызвать побочные эффекты. Подписка, созданная `toSignal`, автоматически отписывается от Observable при уничтожении компонента или сервиса, вызвавшего `toSignal`.

IMPORTANT: `toSignal` создаёт подписку. Избегайте повторных вызовов для одного и того же Observable — переиспользуйте возвращаемый сигнал.

### Контекст внедрения {#injection-context}

По умолчанию `toSignal` нужно запускать в [контексте внедрения](guide/di/dependency-injection-context), например при создании компонента или сервиса. Если контекст недоступен, можно вручную указать `Injector`.

### Начальные значения {#initial-values}

Observable может не выдать значение синхронно при подписке, а сигналы всегда требуют текущего значения. Есть несколько способов обработать «начальное» значение сигналов `toSignal`.

#### Опция `initialValue` {#the-initialvalue-option}

Как в примере выше, можно указать опцию `initialValue` — значение, которое сигнал вернёт до первого эмита Observable.

#### Начальные значения `undefined` {#undefined-initial-values}

Если `initialValue` не задан, результирующий сигнал будет возвращать `undefined`, пока Observable не эмитит. Это похоже на поведение pipe `async`, возвращающего `null`.

#### Опция `requireSync` {#the-requiresync-option}

Некоторые Observable гарантированно эмитят синхронно, например `BehaviorSubject`. В таких случаях можно указать `requireSync: true`.

Когда `requireSync` равен `true`, `toSignal` требует, чтобы Observable эмитил синхронно при подписке. Это гарантирует, что у сигнала всегда есть значение, и тип `undefined` или начальное значение не нужны.

### `manualCleanup` {#manualcleanup}

По умолчанию `toSignal` автоматически отписывается от Observable при уничтожении создавшего его компонента или сервиса.

Чтобы переопределить это поведение, передайте опцию `manualCleanup`. Её можно использовать для Observable, которые завершаются сами.

#### Пользовательское сравнение равенства {#custom-equality-comparison}

Некоторые Observable могут эмитить значения, которые **равны**, даже если отличаются по ссылке или мелким деталям. Опция `equal` позволяет задать **пользовательскую функцию равенства**, определяющую, когда два последовательных значения считаются одинаковыми.

Когда два эмитированных значения считаются равными, результирующий сигнал **не обновляется**. Это предотвращает лишние вычисления, обновления DOM или повторный запуск эффектов.

```ts
import {Component} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map} from 'rxjs';

@Component(/* ... */)
export class EqualExample {
  temperature$ = interval(1000).pipe(
    map(() => ({temperature: Math.floor(Math.random() * 3) + 20})), // 20, 21, or 22 randomly
  );

  // Only update if the temperature changes
  temperature = toSignal(this.temperature$, {
    initialValue: {temperature: 20},
    equal: (prev, curr) => prev.temperature === curr.temperature,
  });
}
```

### Ошибки и завершение {#error-and-completion}

Если Observable, используемый в `toSignal`, выдаёт ошибку, она выбрасывается при чтении сигнала.

Если Observable, используемый в `toSignal`, завершается, сигнал продолжает возвращать последнее эмитированное до завершения значение.

## Создание RxJS Observable из сигнала с `toObservable` {#create-an-rxjs-observable-from-a-signal-with-toobservable}

Утилита `toObservable` создаёт `Observable`, отслеживающий значение сигнала. Значение сигнала мониторится через `effect`, который эмитит в Observable при изменении.

```ts
import {Component, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(switchMap((query) => this.http.get('/search?q=' + query)));
}
```

При изменении сигнала `query` Observable `query$` эмитит последний запрос и запускает новый HTTP-запрос.

### Контекст внедрения {#injection-context-1}

По умолчанию `toObservable` нужно запускать в [контексте внедрения](guide/di/dependency-injection-context), например при создании компонента или сервиса. Если контекст недоступен, можно вручную указать `Injector`.

### Тайминг `toObservable` {#timing-of-toobservable}

`toObservable` использует эффект для отслеживания значения сигнала в `ReplaySubject`. При подписке первое значение (если есть) может быть эмитировано синхронно, все последующие — асинхронно.

В отличие от Observable, сигналы никогда не дают синхронного уведомления об изменениях. Даже если обновить значение сигнала несколько раз, `toObservable` эмитит значение только после стабилизации сигнала.

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Здесь будет залогировано только последнее значение (3).

## Использование `rxResource` для асинхронных данных {#using-rxresource-for-async-data}

Функция Angular [`resource`](/guide/signals/resource) позволяет включать асинхронные данные в код приложения на сигналах. На базе этого паттерна `rxResource` даёт определить resource, источник данных которого задан через RxJS `Observable`. Вместо функции `loader` `rxResource` принимает функцию `stream`, возвращающую RxJS `Observable`.

```typescript
import {Component, inject} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class UserProfile {
  // This component relies on a service that exposes data through an RxJS Observable.
  private userData = inject(MyUserDataClient);

  protected userId = input<string>();

  private userResource = rxResource({
    params: () => ({userId: this.userId()}),

    // The `stream` property expects a factory function that returns
    // a data stream as an RxJS Observable.
    stream: ({params}) => this.userData.load(params.userId),
  });
}
```

Свойство `stream` принимает фабричную функцию для RxJS `Observable`. Ей передаётся значение `params` resource, и она возвращает `Observable`. Resource вызывает эту фабрику каждый раз, когда вычисление `params` даёт новое значение. Подробнее о параметрах фабрики — в [Resource loaders](/guide/signals/resource#resource-loaders).

Во всём остальном `rxResource` ведёт себя как `resource` и предоставляет те же API для параметров, чтения значений, проверки состояния загрузки и ошибок.
