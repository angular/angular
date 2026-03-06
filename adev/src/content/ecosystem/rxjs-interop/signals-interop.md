# Взаимодействие RxJS с сигналами Angular {#rxjs-interop-with-angular-signals}

Пакет `@angular/core/rxjs-interop` предоставляет API для интеграции RxJS и сигналов Angular.

## Создание сигнала из Observable RxJS с помощью `toSignal` {#create-a-signal-from-an-rxjs-observable-with-tosignal}

Используйте функцию `toSignal` для создания сигнала, отслеживающего значение Observable. Она ведёт себя аналогично каналу `async` в шаблонах, но является более гибкой и может использоваться в любом месте приложения.

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

Как и канал `async`, `toSignal` подписывается на Observable немедленно, что может вызвать побочные эффекты. Подписка, созданная `toSignal`, автоматически отписывается от заданного Observable при уничтожении компонента или сервиса, вызвавшего `toSignal`.

IMPORTANT: `toSignal` создаёт подписку. Следует избегать повторных вызовов для одного и того же Observable — вместо этого повторно используйте возвращаемый сигнал.

### Контекст внедрения {#injection-context}

По умолчанию `toSignal` требует выполнения в [контексте внедрения](guide/di/dependency-injection-context), например во время создания компонента или сервиса. Если контекст внедрения недоступен, можно явно указать используемый `Injector`.

### Начальные значения {#initial-values}

Observable может не генерировать значение синхронно при подписке, тогда как сигналы всегда требуют текущего значения. Существует несколько способов задать «начальное» значение для сигналов `toSignal`.

#### Опция `initialValue` {#the-initialvalue-option}

Как в примере выше, можно задать опцию `initialValue` со значением, которое сигнал будет возвращать до первого события Observable.

#### Начальное значение `undefined` {#undefined-initial-values}

Если `initialValue` не задан, результирующий сигнал будет возвращать `undefined` до первого события Observable. Это аналогично поведению канала `async`, возвращающего `null`.

#### Опция `requireSync` {#the-requiresync-option}

Некоторые Observable гарантированно генерируют значения синхронно, например `BehaviorSubject`. В таких случаях можно указать опцию `requireSync: true`.

При `requireSync: true` функция `toSignal` обеспечивает синхронную генерацию значения Observable при подписке. Это гарантирует, что сигнал всегда имеет значение, и тип `undefined` или начальное значение не требуются.

### `manualCleanup` {#manualcleanup}

По умолчанию `toSignal` автоматически отписывается от Observable при уничтожении создавшего его компонента или сервиса.

Это поведение можно переопределить, передав опцию `manualCleanup`. Этот параметр полезен для Observable, которые завершаются самостоятельно.

#### Пользовательское сравнение на равенство {#custom-equality-comparison}

Некоторые Observable могут генерировать значения, которые **равны**, несмотря на различия по ссылке или незначительные отличия. Опция `equal` позволяет определить **пользовательскую функцию сравнения** для определения того, когда два последовательных значения следует считать одинаковыми.

Если два выданных значения считаются равными, результирующий сигнал **не обновляется**. Это предотвращает избыточные вычисления, обновления DOM или повторный запуск эффектов.

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

Если Observable, используемый в `toSignal`, генерирует ошибку, она будет выброшена при чтении сигнала.

Если Observable, используемый в `toSignal`, завершается, сигнал продолжает возвращать последнее выданное значение до завершения.

## Создание Observable RxJS из сигнала с помощью `toObservable` {#create-an-rxjs-observable-from-a-signal-with-toobservable}

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

По мере изменения сигнала `query`, Observable `query$` генерирует последний запрос и инициирует новый HTTP-запрос.

### Контекст внедрения {#toobservable-injection-context}

По умолчанию `toObservable` требует выполнения в [контексте внедрения](guide/di/dependency-injection-context), например во время создания компонента или сервиса. Если контекст внедрения недоступен, можно явно указать используемый `Injector`.

### Время работы `toObservable` {#timing-of-toobservable}

`toObservable` использует эффект для отслеживания значения сигнала в `ReplaySubject`. При подписке первое значение (если доступно) может быть выдано синхронно, все последующие значения будут асинхронными.

В отличие от Observable, сигналы никогда не уведомляют синхронно об изменениях. Даже если значение сигнала изменяется несколько раз, `toObservable` выдаст значение только после стабилизации сигнала.

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

Здесь в лог будет записано только последнее значение (3).

## Использование `rxResource` для асинхронных данных {#using-rxresource-for-async-data}

IMPORTANT: `rxResource` является [экспериментальным](reference/releases#experimental). Функция доступна для использования, но может измениться до стабильного выпуска.

[Функция `resource`](/guide/signals/resource) Angular позволяет включать асинхронные данные в сигнально-ориентированный код приложения. Основываясь на этом паттерне, `rxResource` позволяет определить ресурс, источник данных которого задаётся с помощью Observable RxJS. Вместо функции `loader` функция `rxResource` принимает функцию `stream`, принимающую Observable RxJS.

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

Свойство `stream` принимает фабричную функцию для Observable RxJS. Этой фабричной функции передаётся значение `params` ресурса, и она возвращает Observable. Ресурс вызывает эту фабричную функцию каждый раз, когда вычисление `params` даёт новое значение. Подробнее о параметрах, передаваемых фабричной функции, см. в разделе [Загрузчики ресурсов](/guide/signals/resource#resource-loaders).

Во всём остальном `rxResource` ведёт себя как `resource` и предоставляет те же API для задания параметров, чтения значений, проверки состояния загрузки и изучения ошибок.
