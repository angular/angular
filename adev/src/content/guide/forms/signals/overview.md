<docs-decorative-header title="Формы с использованием Angular-сигналов" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

ВАЖНО: Формы на сигналах (Signal Forms) являются [экспериментальными](/reference/releases#experimental). API может
измениться в будущих релизах. Избегайте использования экспериментальных API в продакшн-приложениях без полного понимания
рисков.

Signal Forms — это экспериментальная библиотека, которая позволяет управлять состоянием форм в приложениях Angular,
основываясь на реактивном фундаменте сигналов. Благодаря автоматической двусторонней привязке, типобезопасному доступу к
полям и валидации на основе схем, формы на сигналах помогают создавать надежные формы.

СОВЕТ: Для быстрого знакомства с формами на сигналах ознакомьтесь
с [руководством по основам форм на сигналах](essentials/signal-forms).

## Почему формы на сигналах?

Создание форм в веб-приложениях подразумевает управление несколькими взаимосвязанными задачами: отслеживание значений
полей, валидация пользовательского ввода, обработка состояний ошибок и синхронизация пользовательского интерфейса (UI) с
моделью данных. Раздельное управление этими задачами приводит к появлению шаблонного кода и усложнению логики.

Формы на сигналах решают эти проблемы следующим образом:

- **Автоматическая синхронизация состояния** — Автоматически синхронизирует модель данных формы с привязанными полями
  формы.
- **Обеспечение типобезопасности** — Поддерживает полностью типизированные схемы и привязки между элементами управления
  UI и моделью данных.
- **Централизация логики валидации** — Определение всех правил валидации в одном месте с использованием схемы валидации.

Формы на сигналах лучше всего подходят для новых приложений, построенных на сигналах. Если вы работаете с существующим
приложением, использующим реактивные формы (Reactive Forms), или если вам нужны гарантии стабильности в продакшене,
реактивные формы остаются надежным выбором.

<!-- TODO: UNCOMMENT SECTION BELOW WHEN AVAILABLE -->
<!-- NOTE: If you're coming from template or reactive forms, you may be interested in our [comparison guide](guide/forms/signals/comparison). -->

## Предварительные требования

Для использования форм на сигналах требуется:

- Angular v21 или выше

## Настройка

Формы на сигналах уже включены в пакет `@angular/forms`. Импортируйте необходимые функции и директивы из
`@angular/forms/signals`:

```ts
import { form, Field, required, email } from '@angular/forms/signals'
```

Директиву `Field` необходимо импортировать в любой компонент, который привязывает поля формы к HTML-элементам ввода (
inputs):

```ts
@Component({
  // ...
  imports: [Field],
})
```

## Next steps

To learn more about how Signal Forms work, check out the following guides:

<!-- TODO: UNCOMMENT SECTION BELOW WHEN AVAILABLE -->
<docs-pill-row>
  <docs-pill href="essentials/signal-forms" title="Signal forms essentials" />
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
