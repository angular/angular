# Взаимодействие RxJS с сигналами Angular

Пакет `@angular/core/rxjs-interop` предоставляет API для интеграции RxJS и сигналов Angular.

## Создание сигнала из RxJS Observable с помощью `toSignal` {#create-a-signal-from-an-rxjs-observable-with-tosignal}

Используйте функцию `toSignal` для создания сигнала, отслеживающего значение Observable. Она ведёт себя аналогично pipe `async` в шаблонах, но более гибка и может использоваться в любом месте приложения.

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

Как и pipe `async`, `toSignal` подписывается на Observable немедленно, что может вызвать побочные эффекты. Подписка, созданная `toSignal`, автоматически отписывается от переданного Observable при уничтожении компонента или сервиса, вызвавшего `toSignal`.

IMPORTANT: `toSignal` создаёт подписку. Следует избегать многократного вызова для одного Observable — вместо этого повторно используйте возвращаемый сигнал.

### Контекст внедрения {#injection-context}

`toSignal` по умолчанию требует выполнения в [контексте внедрения](guide/di/dependency-injection-context), например, во время создания компонента или сервиса. Если контекст внедрения недоступен, можно вручную указать используемый `Injector`.

### Начальные значения {#initial-values}

Observable может не выдавать значение синхронно при подписке, но сигналы всегда требуют текущего значения. Есть несколько способов работы с этим «начальным» значением сигналов `toSignal`.

#### Опция `initialValue` {#the-initialvalue-option}

Как в примере выше, можно указать опцию `initialValue` со значением, которое сигнал должен возвращать до первого генерирования Observable.

#### Начальное значение `undefined` {#undefined-initial-values}

Если `initialValue` не указан, результирующий сигнал будет возвращать `undefined` до первой генерации Observable. Это аналогично поведению pipe `async`, возвращающего `null`.

#### Опция `requireSync` {#the-requiresync-option}

Некоторые Observable гарантированно генерируют значение синхронно, например `BehaviorSubject`. В таких случаях можно указать опцию `requireSync: true`.

Когда `requireSync` равен `true`, `toSignal` обеспечивает синхронную генерацию значения Observable при подписке. Это гарантирует, что сигнал всегда имеет значение, и тип `undefined` или начальное значение не требуются.

### `manualCleanup` {#manualcleanup}

По умолчанию `toSignal` автоматически отписывается от Observable при уничтожении компонента или сервиса, создавшего его.

Чтобы переопределить это поведение, можно передать опцию `manualCleanup`. Это полезно для Observable, которые естественным образом завершаются сами.

#### Пользовательское сравнение на равенство {#custom-equality-comparison}

Некоторые Observable могут генерировать значения, которые считаются **равными**, даже если они различаются по ссылке или незначительным деталям. Опция `equal` позволяет определить **пользовательскую функцию сравнения**, чтобы определить, когда два последовательных значения следует считать одинаковыми.

Когда два генерируемых значения считаются равными, результирующий сигнал **не обновляется**. Это предотвращает избыточные вычисления, обновления DOM или повторный запуск эффектов.

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

Если Observable, используемый в `toSignal`, генерирует ошибку, эта ошибка выбрасывается при чтении сигнала.

Если Observable, используемый в `toSignal`, завершается, сигнал продолжает возвращать последнее значение, сгенерированное до завершения.

## Создание RxJS Observable из сигнала с помощью `toObservable` {#create-an-rxjs-observable-from-a-signal-with-toobservable}

Используйте утилиту `toObservable` для создания `Observable`, отслеживающего значение сигнала. Значение сигнала отслеживается с помощью `effect`, который генерирует значение в Observable при его изменении.

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

По мере изменения сигнала `query` Observable `query$` генерирует последний запрос и инициирует новый HTTP-запрос.

### Контекст внедрения {#injection-context-toobservable}

`toObservable` по умолчанию требует выполнения в [контексте внедрения](guide/di/dependency-injection-context), например, во время создания компонента или сервиса. Если контекст внедрения недоступен, можно вручную указать используемый `Injector`.

### Временны́е характеристики `toObservable` {#timing-of-toobservable}

`toObservable` использует effect для отслеживания значения сигнала в `ReplaySubject`. При подписке первое значение (если доступно) может быть сгенерировано синхронно, а все последующие значения будут асинхронными.

В отличие от Observable, сигналы никогда не предоставляют синхронное уведомление об изменениях. Даже если обновить значение сигнала несколько раз, `toObservable` сгенерирует значение только после стабилизации сигнала.

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Здесь будет записано только последнее значение (3).

## Использование `rxResource` для асинхронных данных {#using-rxresource-for-async-data}

IMPORTANT: `rxResource` является [экспериментальным](reference/releases#experimental). Готов к использованию, но API может измениться до стабилизации.

[Функция `resource`](/guide/signals/resource) Angular даёт возможность включать асинхронные данные в сигнальный код приложения. Развивая этот паттерн, `rxResource` позволяет определить ресурс, источник данных которого задан в виде RxJS `Observable`. Вместо функции `loader` `rxResource` принимает функцию `stream`, которая принимает RxJS `Observable`.

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

Свойство `stream` принимает фабричную функцию для RxJS `Observable`. Эта фабричная функция получает значение `params` ресурса и возвращает `Observable`. Ресурс вызывает эту фабричную функцию каждый раз, когда вычисление `params` выдаёт новое значение. Подробнее о параметрах, передаваемых фабричной функции, см. в разделе [Загрузчики ресурсов](/guide/signals/resource#resource-loaders).

Во всех остальных отношениях `rxResource` ведёт себя как `resource` и предоставляет те же API для указания параметров, чтения значений, проверки состояния загрузки и изучения ошибок.
