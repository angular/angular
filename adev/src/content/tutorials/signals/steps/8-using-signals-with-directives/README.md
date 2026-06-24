# Использование сигналов с директивами

Теперь, когда вы узнали об [использовании сигналов с сервисами](/tutorials/signals/7-using-signals-with-services),
давайте рассмотрим, как директивы используют сигналы. **Отличная новость: сигналы работают в директивах точно так же,
как и в компонентах!** Главное отличие заключается в том, что, поскольку у директив нет шаблонов, вы будете использовать
сигналы в основном в привязках к хосту (host bindings) для реактивного обновления хост-элемента.

В этом задании вы создадите директиву подсветки, которая продемонстрирует, как сигналы создают реактивное поведение в
директивах.

<hr />

<docs-workflow>

<docs-step title="Настройка сигналов так же, как в компоненте">
Импортируйте функции сигналов и создайте свое реактивное состояние. Это работает точно так же, как и в компонентах:

```ts
import {Directive, input, signal, computed} from '@angular/core';

@Directive({
  selector: '[highlight]',
})
export class HighlightDirective {
  // Signal inputs - так же, как в компонентах!
  color = input<string>('yellow');
  intensity = input<number>(0.3);

  // Внутреннее состояние - так же, как в компонентах!
  private isHovered = signal(false);

  // Вычисляемые сигналы (Computed signals) - так же, как в компонентах!
  backgroundStyle = computed(() => {
    const baseColor = this.color();
    const alpha = this.isHovered() ? this.intensity() : this.intensity() * 0.5;

    const colorMap: Record<string, string> = {
      'yellow': `rgba(255, 255, 0, ${alpha})`,
      'blue': `rgba(0, 100, 255, ${alpha})`,
      'green': `rgba(0, 200, 0, ${alpha})`,
      'red': `rgba(255, 0, 0, ${alpha})`,
    };

    return colorMap[baseColor] || colorMap['yellow'];
  });
}
```

Обратите внимание, что это идентично паттернам компонентов — единственная разница в том, что мы находимся в
`@Directive`, а не в `@Component`.
</docs-step>

<docs-step title="Использование сигналов в привязках к хосту">
Поскольку у директив нет шаблонов, вы будете использовать сигналы в **привязках к хосту** для реактивного обновления хост-элемента. Добавьте конфигурацию `host` и обработчики событий:

```ts
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'backgroundStyle()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  // ... сигналы из предыдущего шага ...

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }
}
```

Привязки к хосту автоматически пересчитываются при изменении сигналов — точно так же, как привязки в шаблонах
компонентов! Когда изменяется `isHovered`, вычисляемый сигнал `backgroundStyle` пересчитывается, и привязка к хосту
обновляет стиль элемента.
</docs-step>

<docs-step title="Использование директивы в шаблоне">
Обновите шаблон приложения, чтобы продемонстрировать реактивную директиву:

```angular-ts
template: `
  <div>
    <h1>Directive with Signals</h1>

    <div highlight color="yellow" [intensity]="0.2">
      Hover me - Yellow highlight
    </div>

    <div highlight color="blue" [intensity]="0.4">
      Hover me - Blue highlight
    </div>

    <div highlight color="green" [intensity]="0.6">
      Hover me - Green highlight
    </div>
  </div>
`,
```

Директива автоматически применяет реактивную подсветку на основе входных сигналов (signal inputs)!
</docs-step>

</docs-workflow>

Отлично! Теперь вы увидели, как сигналы работают с директивами. Вот ключевые выводы из этого урока:

- **Сигналы универсальны** — Все API сигналов (`input()`, `signal()`, `computed()`, `effect()`) работают одинаково как в
  директивах, так и в компонентах.
- **Привязки к хосту — основной вариант использования** — Поскольку у директив нет шаблонов, вы используете сигналы в
  привязках к хосту для реактивного изменения хост-элемента.
- **Те же реактивные паттерны** — Обновления сигналов вызывают автоматический пересчет вычисляемых сигналов и привязок к
  хосту, точно так же, как в шаблонах компонентов.

В следующем уроке
вы [узнаете, как запрашивать дочерние элементы с помощью сигнальных запросов](/tutorials/signals/9-query-child-elements-with-signal-queries)!
