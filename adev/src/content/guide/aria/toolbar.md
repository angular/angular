<docs-decorative-header title="Toolbar">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Паттерн ARIA Toolbar"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Справочник API Toolbar"/>
</docs-pill-row>

## Обзор {#overview}

Контейнер для группировки связанных элементов управления и действий с навигацией с клавиатуры, широко используемый для форматирования текста, панелей инструментов и командных панелей.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Применение {#usage}

Toolbar лучше всего подходит для группировки связанных элементов управления, к которым пользователи обращаются часто. Используйте toolbar, когда:

- **Несколько связанных действий** — у вас есть несколько элементов управления, выполняющих связанные функции (например, кнопки форматирования текста)
- **Важна эффективность клавиатурной работы** — пользователи выигрывают от быстрой навигации с помощью клавиш стрелок
- **Группировка элементов управления** — нужно организовать элементы управления в логические секции с разделителями
- **Частое использование** — элементы управления используются неоднократно в рамках рабочего процесса

Избегайте toolbar, когда:

- Достаточно простой группы кнопок — для 2–3 несвязанных действий лучше подойдут отдельные кнопки
- Элементы управления не связаны — Toolbar предполагает логическую группировку; несвязанные элементы сбивают пользователей с толку
- Требуется сложная вложенная навигация — глубокие иерархии лучше обслуживаются меню или навигационными компонентами

## Возможности {#features}

Angular toolbar предоставляет полностью доступную реализацию панели инструментов с:

- **Навигацией с клавиатуры** — навигация по виджетам стрелками, активация клавишами Enter или Space
- **Поддержкой программ чтения с экрана** — встроенные атрибуты ARIA для вспомогательных технологий
- **Группами виджетов** — организация связанных виджетов, например групп переключателей или кнопок-тоглов
- **Гибкой ориентацией** — горизонтальные или вертикальные макеты с автоматической навигацией с клавиатуры
- **Реактивностью на основе сигналов** — управление реактивным состоянием с использованием Angular-сигналов
- **Поддержкой двунаправленного текста** — автоматическая обработка языков с написанием справа налево (RTL)
- **Настраиваемым фокусом** — выбор между зацикленной навигацией или жёсткой остановкой на краях

## Примеры {#examples}

### Базовая горизонтальная панель инструментов {#basic-horizontal-toolbar}

Горизонтальные панели инструментов организуют элементы управления слева направо, соответствуя распространённому паттерну в текстовых редакторах и инструментах дизайна. Клавиши стрелок позволяют навигировать между виджетами, удерживая фокус внутри панели инструментов до нажатия Tab для перехода к следующему элементу страницы.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Вертикальная панель инструментов {#vertical-toolbar}

Вертикальные панели инструментов располагают элементы управления сверху вниз, что удобно для боковых панелей или вертикальных командных панелей. Клавиши стрелок вверх и вниз позволяют навигировать между виджетами.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Группы виджетов {#widget-groups}

Группы виджетов объединяют связанные элементы управления, работающие вместе, — например, варианты выравнивания текста или параметры форматирования списков. Группы поддерживают собственное внутреннее состояние, участвуя в навигации по панели инструментов.

В приведённых выше примерах кнопки выравнивания обёрнуты в `ngToolbarWidgetGroup` с `role="radiogroup"` для создания группы взаимоисключающего выбора.

Входной параметр `multi` управляет тем, могут ли несколько виджетов внутри группы быть выбраны одновременно:

```html {highlight: [15]}
<!-- Одиночный выбор (группа переключателей) -->
<div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
  <button ngToolbarWidget value="left">Left</button>
  <button ngToolbarWidget value="center">Center</button>
  <button ngToolbarWidget value="right">Right</button>
</div>

<!-- Множественный выбор (группа тоглов) -->
<div ngToolbarWidgetGroup [multi]="true" aria-label="Formatting">
  <button ngToolbarWidget value="bold">Bold</button>
  <button ngToolbarWidget value="italic">Italic</button>
  <button ngToolbarWidget value="underline">Underline</button>
</div>
```

### Отключённые виджеты {#disabled-widgets}

Панели инструментов поддерживают два режима отключения:

1. **Мягко отключённые** виджеты остаются доступными для фокуса, но визуально сигнализируют о недоступности
2. **Жёстко отключённые** виджеты полностью исключаются из навигации с клавиатуры

По умолчанию `softDisabled` равно `true`, что позволяет отключённым виджетам получать фокус. Чтобы включить режим жёсткого отключения, установите `[softDisabled]="false"` на панели инструментов.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Поддержка написания справа налево (RTL) {#right-to-left-rtl-support}

Панели инструментов автоматически поддерживают языки с написанием справа налево. Оберните панель инструментов в контейнер с `dir="rtl"` для изменения макета и направления навигации с клавиатуры на противоположное. Навигация по стрелкам регулируется автоматически: стрелка влево переходит к следующему виджету, стрелка вправо — к предыдущему.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## API {#apis}

### Директива Toolbar {#toolbar-directive}

Директива `ngToolbar` предоставляет контейнер для функциональности панели инструментов.

#### Входные параметры {#toolbar-inputs}

| Свойство       | Тип                            | По умолчанию   | Описание                                                            |
| -------------- | ------------------------------ | -------------- | ------------------------------------------------------------------- |
| `orientation`  | `'vertical'` \| `'horizontal'` | `'horizontal'` | Вертикальная или горизонтальная ориентация панели инструментов      |
| `disabled`     | `boolean`                      | `false`        | Отключает всю панель инструментов                                   |
| `softDisabled` | `boolean`                      | `true`         | Могут ли отключённые элементы получать фокус                        |
| `wrap`         | `boolean`                      | `true`         | Зацикливается ли фокус на краях                                     |

### Директива ToolbarWidget {#toolbarwidget-directive}

Директива `ngToolbarWidget` помечает элемент как навигируемый виджет внутри панели инструментов.

#### Входные параметры {#toolbarwidget-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                              |
| ---------- | --------- | ------------ | ----------------------------------------------------- |
| `id`       | `string`  | авто         | Уникальный идентификатор виджета                      |
| `disabled` | `boolean` | `false`      | Отключает виджет                                      |
| `value`    | `V`       | —            | Значение, связанное с виджетом (обязательно)          |

#### Сигналы {#toolbarwidget-signals}

| Свойство   | Тип               | Описание                                        |
| ---------- | ----------------- | ----------------------------------------------- |
| `active`   | `Signal<boolean>` | Находится ли виджет в фокусе в данный момент    |
| `selected` | `Signal<boolean>` | Выбран ли виджет (в группе)                     |

### Директива ToolbarWidgetGroup {#toolbarwidgetgroup-directive}

Директива `ngToolbarWidgetGroup` группирует связанные виджеты вместе.

#### Входные параметры {#toolbarwidgetgroup-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                           |
| ---------- | --------- | ------------ | -------------------------------------------------- |
| `disabled` | `boolean` | `false`      | Отключает все виджеты в группе                     |
| `multi`    | `boolean` | `false`      | Могут ли несколько виджетов быть выбраны одновременно |

### Связанные компоненты {#related-components}

Toolbar может содержать различные типы виджетов, включая кнопки, деревья и combobox. Подробнее о конкретных реализациях виджетов см. в документации по отдельным компонентам.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Паттерн ARIA Toolbar"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Справочник API Toolbar"/>
</docs-pill-row>
