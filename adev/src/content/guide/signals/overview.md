<docs-decorative-header title="Сигналы Angular" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Сигналы Angular — это система, которая детально отслеживает, как и где используется состояние в приложении, позволяя фреймворку оптимизировать обновления рендеринга.
</docs-decorative-header>

TIP: Ознакомьтесь с разделом [Основы](essentials/signals) Angular перед изучением этого подробного руководства.

## Что такое сигналы? {#what-are-signals}

**Сигнал** — это обёртка вокруг значения, которая уведомляет заинтересованных потребителей при изменении этого значения. Сигналы могут содержать любое значение — от примитивов до сложных структур данных.

Вы читаете значение сигнала, вызывая его функцию-геттер, что позволяет Angular отслеживать, где используется сигнал.

Сигналы могут быть либо _записываемыми_, либо _только для чтения_.

### Записываемые сигналы {#writable-signals}

Записываемые сигналы предоставляют API для прямого обновления их значений. Вы создаёте записываемые сигналы, вызывая функцию `signal` с начальным значением сигнала:

```ts
const count = signal(0);

// Signals are getter functions - calling them reads their value.
console.log('The count is: ' + count());
```

Чтобы изменить значение записываемого сигнала, можно напрямую установить его через `.set()`:

```ts
count.set(3);
```

или использовать операцию `.update()` для вычисления нового значения на основе предыдущего:

```ts
// Increment the count by 1.
count.update((value) => value + 1);
```

Записываемые сигналы имеют тип `WritableSignal`.

#### Преобразование записываемых сигналов в только для чтения {#converting-writable-signals-to-readonly}

`WritableSignal` предоставляет метод `asReadonly()`, который возвращает версию сигнала только для чтения. Это полезно, когда вы хотите предоставить значение сигнала потребителям, не позволяя им изменять его напрямую:

```ts
@Injectable({providedIn: 'root'})
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

Сигнал только для чтения отражает любые изменения, внесённые в исходный записываемый сигнал, но не может быть изменён с помощью методов `set()` или `update()`.

IMPORTANT: Сигналы только для чтения **не** имеют встроенного механизма, который предотвращал бы глубокую мутацию их значения.

### Вычисляемые сигналы {#computed-signals}

**Вычисляемый сигнал** — это сигнал только для чтения, который получает своё значение из других сигналов. Вы определяете вычисляемые сигналы с помощью функции `computed`, указывая функцию вычисления:

```typescript
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

Сигнал `doubleCount` зависит от сигнала `count`. Каждый раз, когда `count` обновляется, Angular знает, что `doubleCount` тоже нужно обновить.

#### Вычисляемые сигналы вычисляются лениво и мемоизируются {#computed-signals-are-both-lazily-evaluated-and-memoized}

Функция вычисления `doubleCount` не запускается для вычисления его значения до тех пор, пока вы впервые не прочитаете `doubleCount`. Вычисленное значение затем кешируется, и если вы прочитаете `doubleCount` снова, оно вернёт кешированное значение без повторного вычисления.

Если вы затем измените `count`, Angular узнает, что кешированное значение `doubleCount` больше недействительно, и при следующем чтении `doubleCount` будет вычислено его новое значение.

В результате вы можете безопасно выполнять вычислительно затратные операции в вычисляемых сигналах, например фильтрацию массивов.

#### Вычисляемые сигналы не являются записываемыми {#computed-signals-are-not-writable-signals}

Вы не можете напрямую присваивать значения вычисляемому сигналу. То есть

```ts
doubleCount.set(3);
```

приведёт к ошибке компиляции, поскольку `doubleCount` не является `WritableSignal`.

#### Зависимости вычисляемых сигналов являются динамическими {#computed-signal-dependencies-are-dynamic}

Отслеживаются только те сигналы, которые были фактически прочитаны во время вычисления. Например, в этом `computed` сигнал `count` читается только если сигнал `showCount` равен true:

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

Когда вы читаете `conditionalCount`, если `showCount` равен `false`, возвращается сообщение "Nothing to see here!" _без_ чтения сигнала `count`. Это означает, что если вы позже обновите `count`, это _не_ приведёт к повторному вычислению `conditionalCount`.

Если вы установите `showCount` в `true` и затем снова прочитаете `conditionalCount`, функция вычисления выполнится заново и пойдёт по ветке, где `showCount` равен `true`, вернув сообщение со значением `count`. Изменение `count` тогда инвалидирует кешированное значение `conditionalCount`.

Обратите внимание, что зависимости могут быть как удалены во время вычисления, так и добавлены. Если вы позже вернёте `showCount` обратно в `false`, то `count` больше не будет считаться зависимостью `conditionalCount`.

## Реактивные контексты {#reactive-contexts}

**Реактивный контекст** — это состояние среды выполнения, в котором Angular отслеживает чтение сигналов для установления зависимостей. Код, читающий сигнал, является _потребителем_, а читаемый сигнал — _источником_.

Angular автоматически входит в реактивный контекст при:

- Выполнении колбэка `effect` или `afterRenderEffect`.
- Вычислении сигнала `computed`.
- Вычислении `linkedSignal`.
- Вычислении функции `params` или `loader` у `resource`.
- Рендеринге шаблона компонента (включая привязки в [host-элементе](guide/components/host-elements#binding-to-the-host-element)).

Во время этих операций Angular создаёт _живое_ соединение. Если отслеживаемый сигнал изменится, Angular _в конечном итоге_ перезапустит потребителя.

### Проверка реактивного контекста {#asserts-the-reactive-context}

Angular предоставляет вспомогательную функцию `assertNotInReactiveContext` для проверки того, что код не выполняется в реактивном контексте. Передайте ссылку на вызывающую функцию, чтобы сообщение об ошибке указывало на правильную точку входа API, если проверка не пройдёт. Это обеспечивает более понятное и полезное сообщение об ошибке по сравнению с общей ошибкой реактивного контекста.

```ts
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // Safe to proceed - subscription logic here
}
```

### Чтение без отслеживания зависимостей {#reading-without-tracking-dependencies}

В редких случаях вам может понадобиться выполнить код, который может читать сигналы внутри реактивной функции, такой как `computed` или `effect`, _без_ создания зависимости.

Например, предположим, что при изменении `currentUser` нужно логировать значение `counter`. Вы можете создать `effect`, который читает оба сигнала:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);
});
```

Этот пример будет логировать сообщение при изменении _любого_ из сигналов `currentUser` или `counter`. Однако если effect должен выполняться только при изменении `currentUser`, то чтение `counter` является случайным, и изменения `counter` не должны приводить к новому сообщению.

Вы можете предотвратить отслеживание чтения сигнала, вызвав его геттер с `untracked`:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);
});
```

`untracked` также полезен, когда effect должен вызвать внешний код, который не должен рассматриваться как зависимость:

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

Реактивный контекст активен только для синхронного кода. Любые чтения сигналов, происходящие после асинхронной границы, не будут отслеживаться как зависимости.

```ts {avoid}
effect(async () => {
  const data = await fetchUserData();
  // Reactive context is lost here - theme() won't be tracked
  console.log(`User: ${data.name}, Theme: ${theme()}`);
});
```

Чтобы обеспечить отслеживание всех чтений сигналов, читайте сигналы перед `await`. Это включает передачу их в качестве аргументов ожидаемой функции, поскольку аргументы вычисляются синхронно:

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

## Продвинутые вычисления {#advanced-derivations}

Хотя `computed` подходит для простых вычислений только для чтения, иногда вам может понадобиться записываемое состояние, которое зависит от других сигналов.
Подробнее см. руководство [Зависимое состояние с linkedSignal](guide/signals/linked-signal).

Все API сигналов являются синхронными — `signal`, `computed`, `input` и т.д. Однако приложениям часто приходится работать с данными, доступными асинхронно. `Resource` даёт вам возможность включить асинхронные данные в код приложения, основанный на сигналах, и при этом обращаться к данным синхронно. Подробнее см. руководство [Асинхронная реактивность с resource](guide/signals/resource).

## Выполнение побочных эффектов для нереактивных API {#executing-side-effects-on-non-reactive-apis}

Синхронные или асинхронные вычисления рекомендуются, когда нужно реагировать на изменения состояния. Однако это покрывает не все возможные случаи использования, и иногда вам потребуется реагировать на изменения сигналов в нереактивных API. Используйте `effect` или `afterRenderEffect` для таких конкретных случаев. Подробнее см. руководство [Побочные эффекты для нереактивных API](guide/signals/effect).

## Чтение сигналов в компонентах `OnPush` {#reading-signals-in-onpush-components}

Когда вы читаете сигнал в шаблоне компонента `OnPush`, Angular отслеживает сигнал как зависимость этого компонента. Когда значение этого сигнала изменяется, Angular автоматически [помечает](api/core/ChangeDetectorRef#markforcheck) компонент для обновления при следующем запуске обнаружения изменений. Подробнее о компонентах `OnPush` см. руководство [Пропуск поддеревьев компонентов](best-practices/skipping-subtrees).

## Продвинутые темы {#advanced-topics}

### Функции сравнения сигналов {#signal-equality-functions}

При создании сигнала вы можете опционально предоставить функцию сравнения, которая будет использоваться для проверки, действительно ли новое значение отличается от предыдущего.

```ts
import _ from 'lodash';

const data = signal(['test'], {equal: _.isEqual});

// Even though this is a different array instance, the deep equality
// function will consider the values to be equal, and the signal won't
// trigger any updates.
data.set(['test']);
```

Функции сравнения могут быть предоставлены как записываемым, так и вычисляемым сигналам.

HELPFUL: По умолчанию сигналы используют ссылочное сравнение (сравнение через [`Object.is()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is)).

### Проверка типа сигналов {#type-checking-signals}

Вы можете использовать `isSignal` для проверки, является ли значение `Signal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isSignal(count); // true
isSignal(doubled); // true
isSignal(42); // false
```

Чтобы конкретно проверить, является ли сигнал записываемым, используйте `isWritableSignal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isWritableSignal(count); // true
isWritableSignal(doubled); // false
```

## Использование сигналов с RxJS {#using-signals-with-rxjs}

Подробности о взаимодействии сигналов и RxJS см. в разделе [Взаимодействие RxJS с сигналами Angular](ecosystem/rxjs-interop).
