<docs-decorative-header title="Формы с Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

CRITICAL: Signal Forms являются [экспериментальной функцией](/reference/releases#experimental). API может меняться в будущих релизах. Избегайте использования экспериментальных API в производственных приложениях без понимания рисков.

Signal Forms — это экспериментальная библиотека, которая позволяет управлять состоянием форм в приложениях Angular, опираясь на реактивный фундамент сигналов. Благодаря автоматической двусторонней привязке, типобезопасному доступу к полям и валидации на основе схемы Signal Forms помогают создавать надёжные формы.

TIP: Краткое введение в Signal Forms см. в [руководстве по основам Signal Forms](essentials/signal-forms).

## Почему Signal Forms? {#why-signal-forms}

Создание форм в веб-приложениях предполагает управление несколькими взаимосвязанными аспектами: отслеживание значений полей, валидация ввода пользователя, обработка состояний ошибок и синхронизация UI с моделью данных. Раздельное управление этими аспектами порождает шаблонный код и сложность.

Signal Forms решают эти проблемы, предоставляя:

- **Автоматическую синхронизацию состояния** — автоматически синхронизирует модель данных формы с привязанными полями
- **Типобезопасность** — поддерживает полностью типобезопасные схемы и привязки между элементами UI и моделью данных
- **Централизацию логики валидации** — определяйте все правила валидации в одном месте с помощью схемы валидации

Signal Forms лучше всего подходят для новых приложений, построенных на сигналах. Если вы работаете с существующим приложением, использующим реактивные формы, или вам нужны гарантии стабильности для продакшена, реактивные формы по-прежнему остаются надёжным выбором.

NOTE: Если вы переходите с шаблонных или реактивных форм, вам может быть интересно [руководство по сравнению](guide/forms/signals/comparison).

## Предварительные требования {#prerequisites}

Signal Forms требуют:

- Angular v21 или выше

## Настройка {#setup}

Signal Forms уже включены в пакет `@angular/forms`. Импортируйте необходимые функции и директивы из `@angular/forms/signals`:

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

Директиву `FormField` необходимо импортировать в каждый компонент, который привязывает поля формы к HTML-элементам ввода:

```ts
@Component({
  // ...
  imports: [FormField],
})
```

## Дальнейшие шаги {#next-steps}

Чтобы узнать больше о том, как работают Signal Forms, ознакомьтесь со следующими руководствами:

<docs-pill-row>
  <docs-pill href="essentials/signal-forms" title="Основы Signal Forms" />
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/model-design" title="Проектирование модели формы" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием полей" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <docs-pill href="guide/forms/signals/comparison" title="Сравнение с другими системами форм" />
</docs-pill-row>
