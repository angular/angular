<docs-decorative-header title="Select">
</docs-decorative-header>

## Обзор

Паттерн, объединяющий combobox (только для чтения) и listbox для создания выпадающих списков с одиночным выбором,
поддержкой навигации с клавиатуры и скринридеров.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование

Паттерн Select лучше всего подходит, когда пользователям нужно выбрать одно значение из знакомого набора опций.

Рассмотрите использование этого паттерна, когда:

- **Список опций фиксирован** (менее 20 элементов) — Пользователи могут просмотреть и выбрать без фильтрации.
- **Опции знакомы** — Пользователи узнают варианты без необходимости поиска.
- **Формам нужны стандартные поля** — Выбор страны, штата, категории или статуса.
- **Настройки и конфигурация** — Выпадающие меню для предпочтений или опций.
- **Понятные метки опций** — Каждый вариант имеет четкое, легко считываемое название.

Избегайте этого паттерна, когда:

- **В списке более 20 элементов** — Используйте [паттерн Autocomplete](guide/aria/autocomplete) для лучшей фильтрации.
- **Пользователям нужно искать опции** — [Autocomplete](guide/aria/autocomplete) предоставляет текстовый ввод и
  фильтрацию.
- **Требуется множественный выбор** — Используйте [паттерн Multiselect](guide/aria/multiselect).
- **Существует очень мало опций (2-3)** — Радиокнопки обеспечивают лучшую видимость всех вариантов.

## Возможности

Паттерн Select объединяет директивы [Combobox](guide/aria/combobox) и [Listbox](guide/aria/listbox) для создания
полностью доступного выпадающего списка с:

- **Навигацией с клавиатуры** — Перемещение по опциям стрелками, выбор через Enter, закрытие через Escape.
- **Поддержкой скринридеров** — Встроенные ARIA-атрибуты для вспомогательных технологий.
- **Настраиваемым отображением** — Показ выбранных значений с иконками, форматированием или богатым контентом.
- **Реактивностью на основе Сигналов** — Управление реактивным состоянием с использованием сигналов Angular.
- **Умным позиционированием** — CDK Overlay обрабатывает границы области просмотра (viewport) и прокрутку.
- **Поддержкой двунаправленного текста** — Автоматическая обработка языков с письмом справа налево (RTL).

## Примеры

### Базовый select

Пользователям нужен стандартный выпадающий список для выбора из перечня значений. Combobox (только для чтения) в паре с
listbox обеспечивает привычный опыт использования select с полной поддержкой доступности.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Атрибут `readonly` в `ngCombobox` предотвращает ввод текста, сохраняя при этом навигацию с клавиатуры. Пользователи
взаимодействуют с выпадающим списком с помощью клавиш со стрелками и Enter, точно так же, как с нативным элементом
select.

### Select с кастомным отображением

Опциям часто требуются визуальные индикаторы, такие как иконки или значки, чтобы помочь пользователям быстро
идентифицировать выбор. Пользовательские шаблоны внутри опций позволяют использовать сложное форматирование, сохраняя
доступность.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Каждая опция отображает иконку рядом с меткой. Выбранное значение обновляется, показывая иконку и текст выбранной опции,
обеспечивая четкую визуальную обратную связь.

### Отключенный select

Select можно отключить, чтобы предотвратить взаимодействие с пользователем, когда определенные условия формы не
соблюдены. Отключенное состояние обеспечивает визуальную обратную связь и блокирует взаимодействие с клавиатурой.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

В отключенном состоянии select показывает соответствующий визуальный стиль и блокирует любое взаимодействие с
пользователем. Скринридеры объявляют об отключенном состоянии пользователям вспомогательных технологий.

## API

Паттерн Select использует следующие директивы из библиотеки Angular Aria. Полную документацию по API смотрите в
связанных руководствах.

### Директивы Combobox

Паттерн Select использует `ngCombobox` с атрибутом `readonly`, чтобы предотвратить ввод текста, сохраняя навигацию с
клавиатуры.

#### Input-свойства

| Свойство   | Тип       | По умолчанию | Описание                                                      |
| ---------- | --------- | ------------ | ------------------------------------------------------------- |
| `readonly` | `boolean` | `false`      | Установите в `true` для создания поведения выпадающего списка |
| `disabled` | `boolean` | `false`      | Отключает весь select                                         |

Смотрите [документацию API Combobox](guide/aria/combobox#apis) для получения полной информации обо всех доступных
Input-свойствах и сигналах.

### Директивы Listbox

Паттерн Select использует `ngListbox` для выпадающего списка и `ngOption` для каждого выбираемого элемента.

#### Модель

| Свойство | Тип     | Описание                                                                               |
| -------- | ------- | -------------------------------------------------------------------------------------- |
| `values` | `any[]` | Массив выбранных значений с двусторонней привязкой (содержит одно значение для select) |

Смотрите [документацию API Listbox](guide/aria/listbox#apis) для получения полной информации о конфигурации listbox,
режимах выбора и свойствах опций.

### Позиционирование

Паттерн Select интегрируется с [CDK Overlay](api/cdk/overlay/CdkConnectedOverlay) для умного позиционирования.
Используйте `cdkConnectedOverlay` для автоматической обработки границ области просмотра и прокрутки.
