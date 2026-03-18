<docs-decorative-header title="Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Angular Signals — это система, которая детально отслеживает, как и где используется состояние приложения, позволяя фреймворку оптимизировать обновления рендеринга.
</docs-decorative-header>

TIP: Ознакомьтесь с разделом [Основы](essentials/signals) Angular, прежде чем углубляться в это подробное руководство.

## Что такое сигналы? {#what-are-signals}

**Сигнал** — это обёртка вокруг значения, которая уведомляет заинтересованных потребителей при изменении этого значения. Сигналы могут содержать любые значения: от примитивов до сложных структур данных.

Значение сигнала считывается вызовом его функции-геттера, что позволяет Angular отслеживать, где используется сигнал.

Сигналы бывают _записываемыми_ или _доступными только для чтения_.

### Записываемые сигналы {#writable-signals}

Записываемые сигналы предоставляют API для непосредственного обновления своих значений. Записываемый сигнал создаётся вызовом функции `signal` с начальным значением:

```ts
const count = signal(0);

// Signals are getter functions - calling them reads their value.
console.log('The count is: ' + count());
```

Чтобы изменить значение записываемого сигнала, можно задать его напрямую через `.set()`:

```ts
count.set(3);
```

или использовать операцию `.update()` для вычисления нового значения на основе предыдущего:

```ts
// Increment the count by 1.
count.update((value) => value + 1);
```

Записываемые сигналы имеют тип `WritableSignal`.

#### Преобразование записываемых сигналов в сигналы только для чтения {#converting-writable-signals-to-readonly}

`WritableSignal` предоставляет метод `asReadonly()`, возвращающий версию сигнала только для чтения. Это полезно, когда нужно предоставить значение сигнала потребителям без возможности его изменения:

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

Сигнал только для чтения отражает все изменения исходного записываемого сигнала, но не может быть изменён методами `set()` или `update()`.

IMPORTANT: Сигналы только для чтения **не** имеют встроенного механизма, предотвращающего глубокую мутацию их значения.

### Вычисляемые сигналы {#computed-signals}

**Вычисляемый сигнал** — это сигнал только для чтения, который получает своё значение из других сигналов. Вычисляемые сигналы определяются с помощью функции `computed` и указания функции-деривации:

```typescript
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

Сигнал `doubleCount` зависит от сигнала `count`. Всякий раз когда обновляется `count`, Angular знает, что `doubleCount` тоже нужно обновить.

#### Вычисляемые сигналы вычисляются лениво и кешируются {#computed-signals-are-both-lazily-evaluated-and-memoized}

Функция деривации `doubleCount` не запускается для вычисления значения до первого чтения `doubleCount`. Вычисленное значение затем кешируется, и при повторном чтении `doubleCount` возвращается кешированное значение без повторного вычисления.

Если изменить `count`, Angular знает, что кешированное значение `doubleCount` больше недействительно, и при следующем чтении `doubleCount` будет вычислено новое значение.

В результате в вычисляемых сигналах можно безопасно выполнять вычислительно дорогие деривации, например фильтрацию массивов.

#### Вычисляемые сигналы не являются записываемыми {#computed-signals-are-not-writable-signals}

Нельзя напрямую присваивать значения вычисляемому сигналу. То есть:

```ts
doubleCount.set(3);
```

приведёт к ошибке компиляции, поскольку `doubleCount` не является `WritableSignal`.

#### Зависимости вычисляемых сигналов динамичны {#computed-signal-dependencies-are-dynamic}

Отслеживаются только сигналы, которые фактически читаются в процессе деривации. Например, в следующем `computed` сигнал `count` читается только если сигнал `showCount` равен `true`:

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

При чтении `conditionalCount`, если `showCount` равен `false`, возвращается сообщение "Nothing to see here!" _без_ чтения сигнала `count`. Это означает, что последующее обновление `count` _не_ приведёт к пересчёту `conditionalCount`.

Если установить `showCount` в `true` и снова прочитать `conditionalCount`, деривация выполнится повторно и пойдёт по ветке, где `showCount` равен `true`, вернув сообщение, содержащее значение `count`. После этого изменение `count` будет инвалидировать кешированное значение `conditionalCount`.

Обратите внимание, что зависимости могут как добавляться, так и удаляться в процессе деривации. Если позже установить `showCount` обратно в `false`, то `count` больше не будет считаться зависимостью `conditionalCount`.

## Реактивные контексты {#reactive-contexts}

**Реактивный контекст** — это состояние выполнения, в котором Angular отслеживает чтения сигналов для установления зависимостей. Код, читающий сигнал, называется _потребителем_, а считываемый сигнал — _поставщиком_.

Angular автоматически входит в реактивный контекст при:

- Выполнении колбэка `effect` или `afterRenderEffect`.
- Вычислении сигнала `computed`.
- Вычислении `linkedSignal`.
- Вычислении функций `params` или `loader` у `resource`.
- Рендеринге шаблона компонента (включая привязки в [host property](guide/components/host-elements#binding-to-the-host-element)).

Во время этих операций Angular создаёт _живую_ связь. Если отслеживаемый сигнал изменится, Angular _в конечном счёте_ перезапустит потребителя.

### Проверка реактивного контекста {#asserts-the-reactive-context}

Angular предоставляет вспомогательную функцию `assertNotInReactiveContext`, позволяющую убедиться, что код не выполняется в реактивном контексте. Передайте ссылку на вызывающую функцию, чтобы сообщение об ошибке указывало на правильную точку входа в API в случае сбоя проверки. Это даёт более чёткое и понятное сообщение об ошибке по сравнению с общим сообщением о реактивном контексте.

```ts
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // Safe to proceed - subscription logic here
}
```

### Чтение без отслеживания зависимостей {#reading-without-tracking-dependencies}

В редких случаях может потребоваться выполнить код, читающий сигналы в реактивной функции, такой как `computed` или `effect`, _без_ создания зависимости.

Например, предположим, что при изменении `currentUser` нужно логировать значение `counter`. Для этого можно создать `effect`, читающий оба сигнала:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);
});
```

Этот пример будет выводить сообщение при изменении _любого_ из сигналов — `currentUser` или `counter`. Однако если эффект должен запускаться только при изменении `currentUser`, то чтение `counter` является побочным, и изменения `counter` не должны приводить к новому сообщению.

Можно предотвратить отслеживание чтения сигнала, вызвав его геттер через `untracked`:

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);
});
```

`untracked` также полезен, когда эффекту нужно вызвать некоторый внешний код, который не должен считаться зависимостью:

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

Реактивный контекст активен только для синхронного кода. Чтения сигналов, происходящие после асинхронной границы, не отслеживаются как зависимости.

```ts {avoid}
effect(async () => {
  const data = await fetchUserData();
  // Reactive context is lost here - theme() won't be tracked
  console.log(`User: ${data.name}, Theme: ${theme()}`);
});
```

Чтобы все чтения сигналов отслеживались, читайте сигналы до `await`. Это касается и передачи их в качестве аргументов в ожидаемую функцию, поскольку аргументы вычисляются синхронно:

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

## Расширенные деривации {#advanced-derivations}

Хотя `computed` подходит для простых деривационных значений только для чтения, иногда нужно записываемое состояние, зависящее от других сигналов.
Подробнее см. в руководстве [Зависимое состояние с linkedSignal](guide/signals/linked-signal).

Все API сигналов синхронны — `signal`, `computed`, `input` и др. Однако приложениям часто нужно работать с данными, доступными асинхронно. `Resource` даёт способ встроить асинхронные данные в сигнальный код приложения, сохраняя возможность синхронного доступа к ним. Подробнее см. в руководстве [Асинхронная реактивность с ресурсами](guide/signals/resource).

## Выполнение побочных эффектов для нереактивных API {#executing-side-effects-on-non-reactive-apis}

Синхронные или асинхронные деривации рекомендуются, когда нужно реагировать на изменения состояния. Однако это не охватывает все возможные случаи — иногда нужно реагировать на изменения сигналов в нереактивных API. Для таких случаев используйте `effect` или `afterRenderEffect`. Подробнее см. в руководстве [Побочные эффекты для нереактивных API](guide/signals/effect).

## Чтение сигналов в компонентах `OnPush` {#reading-signals-in-onpush-components}

При чтении сигнала в шаблоне компонента `OnPush` Angular отслеживает сигнал как зависимость этого компонента. При изменении значения сигнала Angular автоматически [помечает](api/core/ChangeDetectorRef#markforcheck) компонент для обновления при следующем запуске обнаружения изменений. Подробнее об `OnPush`-компонентах см. в руководстве [Пропуск поддеревьев компонентов](best-practices/skipping-subtrees).

## Дополнительные темы {#advanced-topics}

### Функции равенства для сигналов {#signal-equality-functions}

При создании сигнала можно опционально указать функцию равенства, которая будет использоваться для проверки того, действительно ли новое значение отличается от предыдущего.

```ts
import isEqual from 'lodash/isEqual';

const data = signal(['test'], {equal: isEqual});

// Even though this is a different array instance, the deep equality
// function will consider the values to be equal, and the signal won't
// trigger any updates.
data.set(['test']);
```

Функции равенства можно указывать как для записываемых, так и для вычисляемых сигналов.

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

Чтобы проверить, является ли сигнал записываемым, используйте `isWritableSignal`:

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isWritableSignal(count); // true
isWritableSignal(doubled); // false
```

## Использование сигналов с RxJS {#using-signals-with-rxjs}

Подробнее об интероперабельности сигналов и RxJS см. в разделе [Интеграция RxJS с сигналами Angular](ecosystem/rxjs-interop).
