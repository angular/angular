<docs-decorative-header title="Toolbar">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="ARIA-паттерн Toolbar"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Справочник API Toolbar"/>
</docs-pill-row>

## Обзор

Контейнер для группировки связанных элементов управления и действий с поддержкой навигации с помощью клавиатуры. Обычно
используется для форматирования текста, панелей инструментов и командных панелей.

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

## Использование

Toolbar лучше всего подходит для группировки связанных элементов управления, к которым пользователи обращаются часто.
Рассмотрите возможность использования toolbar, если:

- **Несколько связанных действий** — У вас есть несколько элементов управления, выполняющих связанные функции (например,
  кнопки форматирования текста).
- **Важна эффективность работы с клавиатурой** — Пользователям удобно быстро перемещаться с помощью клавиш со стрелками.
- **Сгруппированные элементы управления** — Вам необходимо организовать элементы управления в логические разделы с
  разделителями.
- **Частый доступ** — Элементы управления используются многократно в рамках рабочего процесса.

Избегайте использования toolbar, если:

- Достаточно простой группы кнопок — Для 2-3 несвязанных действий лучше подходят отдельные кнопки.
- Элементы управления не связаны — Toolbar подразумевает логическую группировку; несвязанные элементы сбивают
  пользователей с толку.
- Сложная вложенная навигация — Для глубоких иерархий лучше подходят меню или компоненты навигации.

## Возможности

Angular toolbar предоставляет полностью доступную реализацию панели инструментов с следующими возможностями:

- **Навигация с помощью клавиатуры** — Перемещение между виджетами с помощью клавиш со стрелками, активация с помощью
  Enter или Пробела.
- **Поддержка скринридеров** — Встроенные ARIA-атрибуты для вспомогательных технологий.
- **Группы виджетов** — Организация связанных виджетов, таких как группы радиокнопок или группы кнопок-переключателей.
- **Гибкая ориентация** — Горизонтальная или вертикальная компоновка с автоматической навигацией с помощью клавиатуры.
- **Реактивность на основе сигналов** — Управление реактивным состоянием с использованием сигналов Angular.
- **Поддержка двунаправленного текста** — Автоматическая обработка языков с письмом справа налево (RTL).
- **Настраиваемый фокус** — Выбор между зацикливанием навигации или жесткой остановкой на краях.

## Примеры

### Базовая горизонтальная панель инструментов

Горизонтальные панели инструментов организуют элементы управления слева направо, что соответствует распространенному
паттерну в текстовых редакторах и инструментах дизайна. Клавиши со стрелками перемещают фокус между виджетами, удерживая
его внутри панели инструментов, пока пользователь не нажмет Tab для перехода к следующему элементу страницы.

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

### Вертикальная панель инструментов

Вертикальные панели инструментов располагают элементы управления сверху вниз, что полезно для боковых панелей или
вертикальных командных палитр. Клавиши со стрелками вверх и вниз перемещают фокус между виджетами.

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

### Группы виджетов

Группы виджетов содержат связанные элементы управления, которые работают вместе, например, параметры выравнивания текста
или варианты форматирования списка. Группы поддерживают свое внутреннее состояние, участвуя при этом в навигации по
панели инструментов.

В примерах выше кнопки выравнивания обернуты в `ngToolbarWidgetGroup` с `role="radiogroup"` для создания группы
взаимоисключающего выбора.

Input `multi` управляет тем, можно ли выбрать несколько виджетов в группе одновременно:

```html {highlight: [15]}
<!-- Одиночный выбор (radio group) -->
<div
  ngToolbarWidgetGroup
  role="radiogroup"
  aria-label="Alignment"
>
  <button ngToolbarWidget value="left">Left</button>
  <button ngToolbarWidget value="center">Center</button>
  <button ngToolbarWidget value="right">Right</button>
</div>

<!-- Множественный выбор (toggle group) -->
<div
  ngToolbarWidgetGroup
  [multi]="true"
  aria-label="Formatting"
>
  <button ngToolbarWidget value="bold">Bold</button>
  <button ngToolbarWidget value="italic">Italic</button>
  <button ngToolbarWidget value="underline">Underline</button>
</div>
```

### Отключенные виджеты

Панели инструментов поддерживают два режима отключения:

1. **Мягкое отключение (Soft-disabled)** — виджеты остаются в фокусе, но визуально обозначаются как недоступные.
2. **Жесткое отключение (Hard-disabled)** — виджеты полностью исключаются из навигации с помощью клавиатуры.

По умолчанию `softDisabled` имеет значение `true`, что позволяет отключенным виджетам по-прежнему получать фокус. Если
вы хотите включить режим жесткого отключения, установите `[softDisabled]="false"` на панели инструментов.

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

### Поддержка RTL (справа налево)

Панели инструментов автоматически поддерживают языки с письмом справа налево. Оберните toolbar в контейнер с
`dir="rtl"`, чтобы изменить направление макета и навигации с помощью клавиатуры на противоположное. Навигация стрелками
адаптируется автоматически: стрелка влево перемещает к следующему виджету, стрелка вправо — к предыдущему.

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

## API

### Директива Toolbar

Директива `ngToolbar` предоставляет контейнер для функциональности панели инструментов.

#### Inputs

| Свойство       | Тип                            | По умолчанию   | Описание                                          |
| -------------- | ------------------------------ | -------------- | ------------------------------------------------- |
| `orientation`  | `'vertical'` \| `'horizontal'` | `'horizontal'` | Вертикальная или горизонтальная ориентация панели |
| `disabled`     | `boolean`                      | `false`        | Отключает всю панель инструментов                 |
| `softDisabled` | `boolean`                      | `true`         | Могут ли отключенные элементы получать фокус      |
| `wrap`         | `boolean`                      | `true`         | Должен ли фокус зацикливаться на краях            |

### Директива ToolbarWidget

Директива `ngToolbarWidget` помечает элемент как виджет, доступный для навигации внутри панели инструментов.

#### Inputs

| Свойство   | Тип       | По умолчанию | Описание                                     |
| ---------- | --------- | ------------ | -------------------------------------------- |
| `id`       | `string`  | auto         | Уникальный идентификатор виджета             |
| `disabled` | `boolean` | `false`      | Отключает виджет                             |
| `value`    | `V`       | -            | Значение, связанное с виджетом (обязательно) |

#### Сигналы

| Свойство   | Тип               | Описание                                     |
| ---------- | ----------------- | -------------------------------------------- |
| `active`   | `Signal<boolean>` | Находится ли виджет в данный момент в фокусе |
| `selected` | `Signal<boolean>` | Выбран ли виджет (в группе)                  |

### Директива ToolbarWidgetGroup

Директива `ngToolbarWidgetGroup` объединяет связанные виджеты.

#### Inputs

| Свойство   | Тип       | По умолчанию | Описание                            |
| ---------- | --------- | ------------ | ----------------------------------- |
| `disabled` | `boolean` | `false`      | Отключает все виджеты в группе      |
| `multi`    | `boolean` | `false`      | Можно ли выбрать несколько виджетов |

### Связанные компоненты

Toolbar может содержать различные типы виджетов, включая кнопки, деревья и комбинированные списки (comboboxes). См.
документацию по отдельным компонентам для реализации конкретных виджетов.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="ARIA-паттерн Toolbar"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Справочник API Toolbar"/>
</docs-pill-row>
