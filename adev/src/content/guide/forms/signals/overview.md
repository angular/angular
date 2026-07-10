<docs-decorative-header title="Формы с Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

Signal Forms — библиотека для управления состоянием форм в приложениях Angular на реактивной основе сигналов. С автоматической двусторонней привязкой, типобезопасным доступом к полям и валидацией на основе схем Signal Forms помогают создавать надёжные формы.

TIP: Краткое введение в Signal Forms см. в [руководстве по основам Signal Forms](essentials/signal-forms).

## Зачем Signal Forms? {#why-signal-forms}

Создание форм в веб-приложениях включает управление несколькими взаимосвязанными задачами: отслеживание значений полей, валидация ввода, обработка состояний ошибок и синхронизация UI с моделью данных. Управление этими задачами по отдельности создаёт шаблонный код и сложность.

Signal Forms решают эти задачи за счёт:

- **Автоматической синхронизации состояния** — автоматически синхронизируют модель данных формы с привязанными полями
- **Типобезопасности** — поддерживают полностью типобезопасные схемы и привязки между UI-контролами и моделью данных
- **Централизации логики валидации** — все правила валидации определяются в одном месте с помощью схемы валидации

Signal Forms лучше всего подходят для новых приложений, построенных на сигналах. Если вы работаете с существующим приложением на reactive forms или вам нужны гарантии production-стабильности, reactive forms остаются надёжным выбором.

NOTE: Если вы пришли из template-driven или reactive forms, вам может быть интересно [руководство по сравнению](guide/forms/signals/comparison).

## Предварительные требования {#prerequisites}

Signal Forms требуют:

- Angular v21 или выше

## Настройка {#setup}

Signal Forms уже включены в пакет `@angular/forms`. Импортируйте необходимые функции и директивы из `@angular/forms/signals`:

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

Директиву `FormField` нужно импортировать в любой компонент, который привязывает поля формы к HTML-inputs:

```ts
@Component({
  // ...
  imports: [FormField],
})
```

## Следующие шаги {#next-steps}

Чтобы узнать больше о том, как работают Signal Forms, см. следующие руководства:

<docs-pill-row>
  <docs-pill href="essentials/signal-forms" title="Signal forms essentials" />
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/model-design" title="Designing your form model" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <docs-pill href="guide/forms/signals/comparison" title="Comparison with other form systems" />
</docs-pill-row>
