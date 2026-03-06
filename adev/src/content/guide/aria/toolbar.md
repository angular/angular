<docs-decorative-header title="Toolbar">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Паттерн Toolbar (ARIA)"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="API-справочник Toolbar"/>
</docs-pill-row>

## Обзор {#overview}

Контейнер для группировки связанных элементов управления и действий с навигацией с клавиатуры; широко применяется в панелях форматирования текста, панелях инструментов и командных панелях.

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

Панель инструментов лучше всего подходит для группировки связанных элементов управления, к которым пользователи обращаются часто. Используйте панель инструментов, когда:

- **Несколько связанных действий** — есть несколько элементов управления, выполняющих схожие функции (например, кнопки форматирования текста)
- **Важна эффективность клавиатуры** — пользователи выигрывают от быстрой навигации стрелками
- **Нужна группировка** — элементы управления необходимо организовать в логические секции с разделителями
- **Частый доступ** — элементы управления используются многократно в рамках рабочего процесса

Не используйте панель инструментов, когда:

- Достаточно простой группы кнопок — для 2–3 несвязанных действий лучше подойдут отдельные кнопки
- Элементы управления не связаны — панель инструментов подразумевает логическую группировку; несвязанные элементы управления вводят пользователей в замешательство
- Навигация сложно вложена — глубокие иерархии лучше реализуются через меню или навигационные компоненты

## Возможности {#features}

Панель инструментов от Angular предоставляет полностью доступную реализацию:

- **Навигация с клавиатуры** — перемещение по виджетам стрелками, активация клавишами Enter или Space
- **Поддержка программ чтения с экрана** — встроенные ARIA-атрибуты для вспомогательных технологий
- **Группы виджетов** — организация связанных виджетов, например группы переключателей или группы кнопок-тоглов
- **Гибкая ориентация** — горизонтальная или вертикальная компоновка с автоматической адаптацией навигации
- **Реактивность на основе Сигналов** — реактивное управление состоянием с использованием Angular-сигналов
- **Поддержка двунаправленного текста** — автоматическая обработка языков с написанием справа налево (RTL)
- **Настраиваемый фокус** — выбор между зацикленной навигацией или остановкой на краях

## Примеры {#examples}

### Базовая горизонтальная панель инструментов {#basic-horizontal-toolbar}

Горизонтальные панели инструментов организуют элементы управления слева направо, следуя общему паттерну в текстовых редакторах и дизайн-инструментах. Стрелки перемещают фокус между виджетами, удерживая его внутри панели инструментов до тех пор, пока пользователь не нажмёт Tab для перехода к следующему элементу страницы.

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

Вертикальные панели инструментов располагают элементы управления сверху вниз — удобно для боковых панелей или вертикальных командных панелей. Навигацию между виджетами обеспечивают стрелки вверх и вниз.

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

Группы виджетов содержат связанные элементы управления, работающие вместе, — например, варианты выравнивания текста или стили списков. Группы сохраняют собственное внутреннее состояние, участвуя при этом в навигации по панели инструментов.

В приведённых выше примерах кнопки выравнивания обёрнуты в `ngToolbarWidgetGroup` с `role="radiogroup"`, чтобы создать группу взаимоисключающего выбора.

Входной параметр `multi` управляет тем, может ли одновременно быть выбрано несколько виджетов в группе:

```html {highlight: [15]}
<!-- Одиночный выбор (группа переключателей) -->
<div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
  <button ngToolbarWidget value="left">Left</button>
  <button ngToolbarWidget value="center">Center</button>
  <button ngToolbarWidget value="right">Right</button>
</div>

<!-- Множественный выбор (группа кнопок-тоглов) -->
<div ngToolbarWidgetGroup [multi]="true" aria-label="Formatting">
  <button ngToolbarWidget value="bold">Bold</button>
  <button ngToolbarWidget value="italic">Italic</button>
  <button ngToolbarWidget value="underline">Underline</button>
</div>
```

### Отключённые виджеты {#disabled-widgets}

Панели инструментов поддерживают два режима отключения:

1. **Мягко отключённые** виджеты остаются доступными для фокуса, но визуально указывают на недоступность
2. **Жёстко отключённые** виджеты полностью исключаются из навигации с клавиатуры.

По умолчанию `softDisabled` равно `true`, что позволяет отключённым виджетам всё равно получать фокус. Чтобы включить режим жёсткого отключения, установите `[softDisabled]="false"` на панели инструментов.

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

### Поддержка письма справа налево (RTL) {#right-to-left-rtl-support}

Панели инструментов автоматически поддерживают языки с написанием справа налево. Оберните панель инструментов в контейнер с `dir="rtl"`, чтобы изменить компоновку и направление навигации с клавиатуры на противоположные. Навигация стрелками адаптируется автоматически: стрелка влево переходит к следующему виджету, стрелка вправо — к предыдущему.

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

Директива `ngToolbar` предоставляет контейнер с функциональностью панели инструментов.

#### Входные параметры {#toolbar-inputs}

| Свойство       | Тип                            | По умолчанию   | Описание                                                  |
| -------------- | ------------------------------ | -------------- | --------------------------------------------------------- |
| `orientation`  | `'vertical'` \| `'horizontal'` | `'horizontal'` | Вертикальная или горизонтальная ориентация панели         |
| `disabled`     | `boolean`                      | `false`        | Отключает всю панель инструментов                         |
| `softDisabled` | `boolean`                      | `true`         | Могут ли отключённые элементы получать фокус              |
| `wrap`         | `boolean`                      | `true`         | Зацикливать ли фокус на краях                             |

### Директива ToolbarWidget {#toolbarwidget-directive}

Директива `ngToolbarWidget` помечает элемент как навигируемый виджет внутри панели инструментов.

#### Входные параметры {#toolbarwidget-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                         |
| ---------- | --------- | ------------ | ------------------------------------------------ |
| `id`       | `string`  | auto         | Уникальный идентификатор виджета                 |
| `disabled` | `boolean` | `false`      | Отключает виджет                                 |
| `value`    | `V`       | -            | Значение, связанное с виджетом (обязательно)     |

#### Сигналы {#toolbarwidget-signals}

| Свойство   | Тип               | Описание                                    |
| ---------- | ----------------- | ------------------------------------------- |
| `active`   | `Signal<boolean>` | Находится ли виджет в фокусе в данный момент|
| `selected` | `Signal<boolean>` | Выбран ли виджет (в группе)                 |

### Директива ToolbarWidgetGroup {#toolbarwidgetgroup-directive}

Директива `ngToolbarWidgetGroup` группирует связанные виджеты вместе.

#### Входные параметры {#toolbarwidgetgroup-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                       |
| ---------- | --------- | ------------ | ---------------------------------------------- |
| `disabled` | `boolean` | `false`      | Отключает все виджеты в группе                 |
| `multi`    | `boolean` | `false`      | Разрешить ли выбор нескольких виджетов         |

### Связанные компоненты {#related-components}

Панель инструментов может содержать различные типы виджетов: кнопки, деревья и комбобоксы. Обратитесь к документации отдельных компонентов для получения информации о конкретных реализациях виджетов.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Паттерн Toolbar (ARIA)"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="API-справочник Toolbar"/>
</docs-pill-row>
