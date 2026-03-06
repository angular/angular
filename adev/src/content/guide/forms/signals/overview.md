<docs-decorative-header title="Формы с Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

CRITICAL: Signal Forms являются [экспериментальными](/reference/releases#experimental). API может измениться в будущих версиях. Избегайте использования экспериментальных API в производственных приложениях без понимания рисков.

Signal Forms — это экспериментальная библиотека, позволяющая управлять состоянием форм в Angular-приложениях, опираясь на реактивную основу сигналов. Благодаря автоматической двусторонней привязке, типобезопасному доступу к полям и валидации на основе схемы Signal Forms помогают создавать надёжные формы.

TIP: Для быстрого введения в Signal Forms см. [руководство по основам Signal Forms](essentials/signal-forms).

## Почему Signal Forms? {#why-signal-forms}

Создание форм в веб-приложениях предполагает управление несколькими взаимосвязанными задачами: отслеживание значений полей, валидация пользовательского ввода, обработка состояний ошибок и синхронизация UI с моделью данных. Раздельное управление этими задачами создаёт шаблонный код и сложность.

Signal Forms решают эти проблемы следующим образом:

- **Автоматическая синхронизация состояния** — Автоматически синхронизирует модель данных формы с привязанными полями формы
- **Типобезопасность** — Поддерживает полностью типобезопасные схемы и привязки между элементами UI и моделью данных
- **Централизация логики валидации** — Определяет все правила валидации в одном месте с помощью схемы валидации

Signal Forms лучше всего подходят для новых приложений, созданных с использованием сигналов. Если вы работаете с существующим приложением, использующим реактивные формы, или вам нужны гарантии стабильности для производства, реактивные формы остаются надёжным выбором.

NOTE: Если вы переходите с форм на основе шаблонов или реактивных форм, вам может быть интересно [руководство по сравнению](guide/forms/signals/comparison).

## Предварительные требования {#prerequisites}

Signal Forms требуют:

- Angular v21 или выше

## Настройка {#setup}

Signal Forms уже включены в пакет `@angular/forms`. Импортируйте необходимые функции и директивы из `@angular/forms/signals`:

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

Директива `FormField` должна быть импортирована в любой компонент, привязывающий поля формы к HTML-вводу:

```ts
@Component({
  // ...
  imports: [FormField],
})
```

## Следующие шаги {#next-steps}

Чтобы узнать больше о работе Signal Forms, ознакомьтесь со следующими руководствами:

<docs-pill-row>
  <docs-pill href="essentials/signal-forms" title="Основы Signal Forms" />
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/model-design" title="Проектирование модели формы" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием поля" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <docs-pill href="guide/forms/signals/comparison" title="Сравнение с другими системами форм" />
</docs-pill-row>
