<docs-decorative-header title="Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Angular Signals — система, которая гранулярно отслеживает, как и где состояние используется в приложении, позволяя фреймворку оптимизировать обновления рендеринга.
</docs-decorative-header>

TIP: Перед этим подробным руководством ознакомьтесь с [Essentials](essentials/signals) по Angular.

## Что такое сигналы? {#what-are-signals}

**Сигнал** — обёртка вокруг значения, которая уведомляет заинтересованных потребителей при изменении этого значения. Сигналы могут содержать любое значение — от примитивов до сложных структур данных.

Значение сигнала читается вызовом его getter-функции, что позволяет Angular отслеживать, где сигнал используется.

Сигналы могут быть _writable_ или _read-only_.

### Writable-сигналы {#writable-signals}

Writable-сигналы предоставляют API для прямого обновления своих значений. Создавайте writable-сигналы вызовом функции `signal` с начальным значением:

```ts
const count = signal(0);

// Signals are getter functions - calling them reads their value.
console.log('The count is: ' + count());
```

Чтобы изменить значение writable-сигнала, либо задайте его напрямую через `.set()`:

```ts
count.set(3);
```

либо используйте операцию `.update()`, чтобы вычислить новое значение из предыдущего:

```ts
// Increment the count by 1.
count.update((value) => value + 1);
```

Writable-сигналы имеют тип `WritableSignal`.

#### Преобразование writable-сигналов в readonly {#converting-writable-signals-to-readonly}

`WritableSignal` предоставляет метод `asReadonly()`, который возвращает readonly-версию сигнала. Это полезно, когда нужно предоставить значение сигнала потребителям без возможности изменять его напрямую:

```ts
@Service()
export class CounterState {
  // Private writable state
  private readonly _count = signal(0);

  readonly count = this._count.asReadonly(); // public readonly

  increment() {
    this._count.update((v) => v + 1);
  }
}

@Component({
  /* ... */
})
export class AwesomeCounter {
  state = inject(CounterState);

  count = this.state.count; // can read but not modify

  increment() {
    this.state.increment();
  }
}
```

Readonly-сигнал отражает любые изменения исходного writable-сигнала, но не может быть изменён методами `set()` или `update()`.

IMPORTANT: У readonly-сигналов **нет** встроенного механизма, который предотвращал бы глубокую мутацию их значения.

### Computed-сигналы {#computed-signals}

**Computed-сигналы** — read-only сигналы, которые выводят своё значение из других сигналов. Определяйте computed-сигналы с помощью функции `computed` и указания derivation:

```typescript
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

Сигнал `doubleCount` зависит от сигнала `count`. Когда `count` обновляется, Angular знает, что `doubleCount` тоже нужно обновить.

#### Computed-сигналы лениво вычисляются и мемоизируются {#computed-signals-are-both-lazily-evaluated-and-memoized}

Функция derivation у `doubleCount` не выполняется для расчёта значения, пока вы впервые не прочитаете `doubleCount`. Вычисленное значение затем кэшируется, и при повторном чтении `doubleCount` возвращается кэшированное значение без пересчёта.

Если затем изменить `count`, Angular знает, что кэшированное значение `doubleCount` больше недействительно, и при следующем чтении `doubleCount` будет вычислено новое значение.

В результате в computed-сигналах можно безопасно выполнять вычислительно дорогие derivation — например, фильтрацию массивов.

#### Computed-сигналы не являются writable {#computed-signals-are-not-writable-signals}

Нельзя напрямую присваивать значения computed-сигналу. То есть

```ts
doubleCount.set(3);
```

вызывает ошибку компиляции, потому что `doubleCount` не является `WritableSignal`.

#### Зависимости computed-сигналов динамичны {#computed-signal-dependencies-are-dynamic}

Отслеживаются только сигналы, реально прочитанные во время derivation. Например, в этом `computed` сигнал `count` читается только если сигнал `showCount` равен true:

```ts
const showCount = signal(false);
const count = signal(0);
const conditionalCount = computed(() => {
  if (showCount()) {
    return `The count is ${count()}.`;
  } else {
    return 'Nothing to see here!';
  }
});
```

Когда вы читаете `conditionalCount`, если `showCount` равен `false`, возвращается сообщение «Nothing to see here!» _без_ чтения сигнала `count`. Это значит, что последующее обновление `count` _не_ приведёт к пересчёту `conditionalCount`.

Если задать `showCount` в `true` и снова прочитать `conditionalCount`, derivation выполнится заново и пойдёт по ветке, где `showCount` равен `true`, вернув сообщение со значением `count`. Изменение `count` тогда инвалидирует кэшированное значение `conditionalCount`.

Зависимости могут удаляться во время derivation так же, как и добавляться. Если позже вернуть `showCount` в `false`, то `count` больше не будет считаться зависимостью `conditionalCount`.

## Реактивные контексты {#reactive-contexts}

**Реактивный контекст** — runtime-состояние, в котором Angular отслеживает чтения сигналов, чтобы установить зависимость. Код, читающий сигнал, — _consumer_, а читаемый сигнал — _producer_.

Angular автоматически входит в реактивный контекст при:

- Выполнении callback `effect`, `afterRenderEffect`.
- Вычислении `computed`-сигнала.
- Вычислении `linkedSignal`.
- Вычислении params или loader-функции `resource`.
- Рендеринге шаблона компонента (включая bindings в [свойстве host](guide/components/host-elements#binding-to-the-host-element)).

Во время этих операций Angular создаёт _живое_ соединение. Если отслеживаемый сигнал изменится, Angular _в итоге_ повторно выполнит consumer.

### Проверка реактивного контекста {#asserts-the-reactive-context}

Angular предоставляет вспомогательную функцию `assertNotInReactiveContext`, чтобы утверждать, что код не выполняется внутри реактивного контекста. Передайте ссылку на вызывающую функцию, чтобы сообщение об ошибке указывало на правильную точку входа API при сбое assertion. Это даёт более ясное и actionable сообщение об ошибке, чем общая ошибка реактивного контекста.

```ts
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // Safe to proceed - subscription logic here
}
```

### Чтение без отслеживания зависимостей {#reading-without-tracking-dependencies}

Иногда нужно выполнить код, который может читать сигналы внутри реактивной функции вроде `computed` или `effect`, _не_ создавая зависимость.

Например, предположим, что при изменении `currentUser` нужно залогировать значение `counter`. Можно создать `effect`, который читает оба сигнала:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);
});
```

Этот пример залогирует сообщение при изменении _либо_ `currentUser`, _либо_ `counter`. Однако если effect должен выполняться только при изменении `currentUser`, то чтение `counter` случайно, и изменения `counter` не должны логировать новое сообщение.

Можно предотвратить отслеживание чтения сигнала, вызвав его getter через `untracked`:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);
});
```

`untracked` также полезен, когда effect нужно вызвать внешний код, который не должен считаться зависимостью:

```ts
effect(() => {
  const user = currentUser();
  untracked(() => {
    // If the `loggingService` reads signals, they won't be counted as
    // dependencies of this effect.
    this.loggingService.log(`User set to ${user}`);
  });
});
```

### Реактивный контекст и асинхронные операции {#reactive-context-and-async-operations}

Реактивный контекст активен только для синхронного кода. Любые чтения сигналов после асинхронной границы не отслеживаются как зависимости.

```ts {avoid}
effect(async () => {
  const data = await fetchUserData();
  // Reactive context is lost here - theme() won't be tracked
  console.log(`User: ${data.name}, Theme: ${theme()}`);
});
```

Чтобы все чтения сигналов отслеживались, читайте сигналы до `await`. Это включает передачу их как аргументов в awaited-функцию, поскольку аргументы вычисляются синхронно:

```ts {prefer}
effect(async () => {
  const currentTheme = theme(); // Read before await
  const data = await fetchUserData();
  console.log(`User: ${data.name}, Theme: ${currentTheme}`);
});
```

```ts {prefer}
effect(async () => {
  // Also works: signal is read before await (as function argument)
  await renderContent(docContent());
});
```

## Продвинутые derivation {#advanced-derivations}

Пока `computed` обрабатывает простые readonly derivation, иногда нужен writable state, зависящий от других сигналов.
Подробнее см. руководство [Dependent state with linkedSignal](/guide/signals/linked-signal).

Все API сигналов синхронны — `signal`, `computed`, `input` и т.д. Однако приложениям часто нужно работать с данными, доступными асинхронно. `Resource` даёт способ включить async-данные в signal-based код приложения и при этом читать их синхронно. Подробнее см. руководство [Async reactivity with resources](/guide/signals/resource).

## Выполнение side effects на нереактивных API {#executing-side-effects-on-non-reactive-apis}

Синхронные или асинхронные derivation рекомендуются, когда нужно реагировать на изменения состояния. Однако это покрывает не все сценарии, и иногда нужно реагировать на изменения сигналов на нереактивных API. Используйте `effect` или `afterRenderEffect` для таких случаев. Подробнее см. руководство [Side effects for non-reactive APIs](/guide/signals/effect).

## Чтение сигналов в компонентах `OnPush` {#reading-signals-in-onpush-components}

Когда вы читаете сигнал в шаблоне компонента `OnPush`, Angular отслеживает сигнал как зависимость этого компонента. Когда значение сигнала меняется, Angular автоматически [помечает](api/core/ChangeDetectorRef#markforcheck) компонент, чтобы он обновился при следующем запуске change detection. См. руководство [Skipping component subtrees](best-practices/skipping-subtrees) для дополнительной информации о компонентах `OnPush`.

## Продвинутые темы {#advanced-topics}

### Функции равенства сигналов {#signal-equality-functions}

При создании сигнала можно опционально предоставить функцию равенства, которая будет проверять, действительно ли новое значение отличается от предыдущего.

```ts
import isEqual from 'lodash/isEqual';

const data = signal(['test'], {equal: isEqual});

// Even though this is a different array instance, the deep equality
// function will consider the values to be equal, and the signal won't
// trigger any updates.
data.set(['test']);
```

Функции равенства можно предоставлять и writable, и computed-сигналам.

HELPFUL: По умолчанию сигналы используют ссылочное равенство (сравнение [`Object.is()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is)).

### Проверка типов сигналов {#type-checking-signals}

Можно использовать `isSignal`, чтобы проверить, является ли значение `Signal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isSignal(count); // true
isSignal(doubled); // true
isSignal(42); // false
```

Чтобы специально проверить, является ли сигнал writable, используйте `isWritableSignal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isWritableSignal(count); // true
isWritableSignal(doubled); // false
```

## Использование сигналов с RxJS {#using-signals-with-rxjs}

См. [RxJS interop with Angular signals](ecosystem/rxjs-interop) для деталей о взаимодействии сигналов и RxJS.
