## Effects

Сигналы полезны тем, что уведомляют заинтересованных потребителей при изменении. **Effect** — операция, которая выполняется всякий раз, когда меняется одно или несколько значений сигналов. Effect можно создать функцией `effect`:

```ts
import {effect} from '@angular/core';

effect(() => {
  console.log(`The current count is: ${count()}`);
});
```

Effects всегда выполняются **хотя бы один раз.** Когда effect выполняется, он отслеживает любые чтения значений сигналов. Когда любое из этих значений меняется, effect выполняется снова. Подобно computed-сигналам, effects динамически отслеживают зависимости и отслеживают только сигналы, прочитанные в самом последнем выполнении.

Effects всегда выполняются **асинхронно**, во время процесса обнаружения изменений.

### Сценарии использования effects {#use-cases-for-effects}

Effects должны быть последним API, к которому вы обращаетесь. Всегда предпочитайте `computed()` для производных значений и `linkedSignal()` для значений, которые могут быть и производными, и задаваться вручную. Если вы копируете данные из одного сигнала в другой через effect — это признак, что source-of-truth нужно поднять выше и использовать `computed()` или `linkedSignal()`. Effects лучше всего подходят для синхронизации состояния сигналов с императивными, не-signal API.

TIP: Нет ситуаций, где effect хорош — есть только ситуации, где он уместен.

- Логирование значений сигналов — для analytics или как инструмент отладки.
- Синхронизация данных с разными видами хранилищ: `window.localStorage`, session storage, cookies и т.д.
- Добавление кастомного DOM-поведения, которое нельзя выразить синтаксисом шаблона.
- Кастомный рендеринг в элемент `<canvas>`, charting-библиотеку или другую стороннюю UI-библиотеку.

<docs-callout critical title="When not to use effects">
Избегайте использования effects для распространения изменений состояния. Это может привести к ошибкам `ExpressionChangedAfterItHasBeenChecked`, бесконечным циклическим обновлениям или ненужным циклам обнаружения изменений.

Вместо этого используйте `computed`-сигналы для моделирования состояния, зависящего от другого состояния.
</docs-callout>

### Контекст внедрения {#injection-context}

По умолчанию `effect()` можно создать только внутри [контекста внедрения](guide/di/dependency-injection-context) (где есть доступ к функции `inject`). Самый простой способ удовлетворить это требование — вызвать `effect` в `constructor` компонента, директивы или сервиса:

```ts
@Component(/* ... */)
export class EffectiveCounter {
  readonly count = signal(0);

  constructor() {
    // Register a new effect.
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    });
  }
}
```

Чтобы создать effect вне конструктора, можно передать `Injector` в `effect` через его опции:

```ts
@Component(/* ... */)
export class EffectiveCounter {
  readonly count = signal(0);
  private injector = inject(Injector);

  initializeLogging(): void {
    effect(
      () => {
        console.log(`The count is: ${this.count()}`);
      },
      {injector: this.injector},
    );
  }
}
```

### Выполнение effects {#execution-of-effects}

Angular неявно определяет два поведения для effects в зависимости от контекста, в котором они созданы.

«View Effect» — это `effect`, созданный в контексте инстанцирования компонента. Сюда входят effects, созданные сервисами, привязанными к injectors компонентов.<br>
«Root Effect» создаётся в контексте инстанцирования root-provided сервиса.

Выполнение обоих видов `effect` связано с процессом обнаружения изменений.

- «View effects» выполняются _до_ проверки соответствующего компонента процессом обнаружения изменений.
- «Root effects» выполняются до проверки всех компонентов процессом обнаружения изменений.

В обоих случаях, если хотя бы одна зависимость effect изменилась во время выполнения effect, effect выполнится снова, прежде чем процесс обнаружения изменений пойдёт дальше.

### Уничтожение effects {#destroying-effects}

Когда компонент или директива уничтожаются, Angular автоматически очищает связанные effects.

`effect` может быть создан в двух разных контекстах, влияющих на момент уничтожения:

- «View effect» уничтожается при уничтожении компонента.
- «Root effect» уничтожается при уничтожении приложения.

Effects возвращают `EffectRef`. Можно использовать метод `destroy` у ref, чтобы вручную освободить effect. Это можно сочетать с опцией `manualCleanup` при создании effect, чтобы отключить автоматическую очистку. Будьте осторожны и действительно уничтожайте такие effects, когда они больше не нужны.

### Cleanup-функции effect {#effect-cleanup-functions}

Когда компонент или директива уничтожаются, Angular автоматически очищает связанные effects.
Effects могут запускать долгоживущие операции, которые следует отменить, если effect уничтожен или выполняется снова до завершения первой операции. При создании effect ваша функция опционально может принять функцию `onCleanup` как первый параметр. Эта функция `onCleanup` позволяет зарегистрировать callback, вызываемый перед следующим запуском effect или при уничтожении effect.

```ts
effect((onCleanup) => {
  const user = currentUser();

  const timer = setTimeout(() => {
    console.log(`1 second ago, the user became ${user}`);
  }, 1000);

  onCleanup(() => {
    clearTimeout(timer);
  });
});
```

## Побочные эффекты на DOM-элементах {#side-effects-on-dom-elements}

Функция `effect` — универсальный инструмент для выполнения кода в реакции на изменения сигналов. Однако она выполняется _до_ того, как Angular обновит DOM. В некоторых ситуациях может понадобиться вручную проверить или изменить DOM либо интегрировать стороннюю библиотеку, требующую прямого доступа к DOM.

Для этих ситуаций можно использовать `afterRenderEffect`. Она работает как `effect`, но выполняется после того, как Angular закончил рендеринг и зафиксировал изменения в DOM.

```ts
@Component(/* ... */)
export class MyFancyChart {
  chartData = input.required<ChartData>();
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  chart: ChartInstance;

  constructor() {
    // Run a single time to create the chart instance
    afterNextRender({
      write: () => {
        this.chart = initializeChart(this.canvas().nativeElement(), this.chartData());
      },
    });

    // Re-run after DOM has been updated whenever `chartData` changes
    afterRenderEffect(() => {
      this.chart.updateData(this.chartData());
    });
  }
}
```

В этом примере `afterRenderEffect` используется для обновления графика, созданного сторонней библиотекой.

TIP: Часто `afterRenderEffect` не нужен для проверки изменений DOM. API вроде `ResizeObserver`, `MutationObserver` и `IntersectionObserver` предпочтительнее `effect` или `afterRenderEffect`, когда это возможно.

### Фазы рендера {#render-phases}

Доступ к DOM и его изменение могут влиять на производительность приложения, например вызывая слишком много ненужных [reflows](https://developer.mozilla.org/en-US/docs/Glossary/Reflow).

Чтобы оптимизировать эти операции, `afterRenderEffect` предлагает четыре фазы для группировки callback'ов и выполнения их в оптимизированном порядке.

Фазы:

| Фаза             | Описание                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `earlyRead`      | Используйте эту фазу для чтения из DOM перед последующим write-callback, например для кастомного layout, который браузер нативно не поддерживает. Предпочитайте фазу read, если чтение может подождать. |
| `write`          | Используйте эту фазу для записи в DOM. **Никогда** не читайте из DOM в этой фазе.                                                                                                                  |
| `mixedReadWrite` | Используйте эту фазу для одновременного чтения из DOM и записи в DOM. Никогда не используйте эту фазу, если работу можно разделить между другими фазами.                                            |
| `read`           | Используйте эту фазу для чтения из DOM. **Никогда** не пишите в DOM в этой фазе.                                                                                                                   |

Использование этих фаз помогает предотвратить layout thrashing и гарантирует, что DOM-операции выполняются безопасно и эффективно.

Фазу можно указать, передав объект со свойством `phase` в `afterRender` или `afterNextRender`:

```ts
afterRenderEffect({
  earlyRead: (cleanupFn) => {
    /* ... */
  },
  write: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  mixedReadWrite: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  read: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
});
```

CRITICAL: Если фазу не указать, `afterRenderEffect` выполняет callback'и во время фазы `mixedReadWrite`. Это может ухудшить производительность приложения, вызывая дополнительные DOM reflows.

#### Выполнение фаз {#phase-executions}

Callback фазы `earlyRead` не получает параметров. Каждая последующая фаза получает возвращаемое значение callback предыдущей фазы как Signal. Это можно использовать для координации работы между фазами.

Effects выполняются в следующем порядке фаз:

1. `earlyRead`
2. `write`
3. `mixedReadWrite`
4. `read`

Если одна из фаз изменяет значение сигнала, отслеживаемое `afterRenderEffect`, затронутые фазы выполняются снова.

#### Cleanup {#cleanup}

Каждая фаза предоставляет cleanup-callback как аргумент. Cleanup-callback'и выполняются при уничтожении `afterRenderEffect` или перед повторным запуском phase effects.

### Оговорки server-side rendering {#server-side-rendering-caveats}

`afterRenderEffect`, подобно `afterNextRender`/`afterEveryRender`, выполняется только на клиенте.

NOTE: Компоненты не гарантированно [гидратированы](/guide/hydration) до выполнения callback. Будьте осторожны при прямом чтении или записи DOM и layout.
