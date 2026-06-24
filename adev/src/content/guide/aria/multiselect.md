<docs-decorative-header title="Multiselect">
</docs-decorative-header>

## Обзор

Паттерн, объединяющий Combobox (только для чтения) и Listbox с поддержкой множественного выбора для создания выпадающих
списков с навигацией с клавиатуры и поддержкой скринридеров.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование

Паттерн Multiselect лучше всего подходит, когда пользователям нужно выбрать несколько связанных элементов из знакомого
набора опций.

Рассмотрите использование этого паттерна, когда:

- **Пользователям нужен множественный выбор** — теги, категории, фильтры или метки, где применимы несколько вариантов.
- **Список опций фиксирован** (менее 20 элементов) — пользователи могут просмотреть опции без поиска.
- **Фильтрация контента** — несколько критериев могут быть активны одновременно.
- **Назначение атрибутов** — метки, права доступа или функции, где имеет смысл несколько значений.
- **Связанные варианты** — опции, которые логически работают вместе (например, выбор нескольких членов команды).

Избегайте этого паттерна, когда:

- **Нужен только одиночный выбор** — используйте [паттерн Select](guide/aria/select) для более простых выпадающих
  списков с одним вариантом.
- **В списке более 20 элементов и нужен поиск** — используйте [паттерн Autocomplete](guide/aria/autocomplete) с
  возможностью множественного выбора.
- **Будет выбрано большинство или все опции** — паттерн чек-листа (списка с галочками) обеспечивает лучшую видимость.
- **Варианты являются независимыми бинарными опциями** — отдельные чекбоксы (checkboxes) передают выбор более четко.

## Возможности

Паттерн Multiselect объединяет директивы [Combobox](guide/aria/combobox) и [Listbox](guide/aria/listbox) для
предоставления полностью доступного выпадающего списка с:

- **Навигацией с клавиатуры** — перемещение по опциям стрелками, переключение пробелом, закрытие клавишей Escape.
- **Поддержкой скринридеров** — встроенные ARIA-атрибуты, включая `aria-multiselectable`.
- **Отображением количества выбранных** — показывает компактный вид "Элемент + еще 2" для множественного выбора.
- **Реактивностью на основе Сигналов** — управление реактивным состоянием с использованием сигналов Angular.
- **Умным позиционированием** — CDK Overlay обрабатывает границы вьюпорта и прокрутку.
- **Сохранением выбора** — выбранные опции остаются видимыми с галочками после выбора.

## Примеры

### Базовый multiselect

Пользователям нужно выбрать несколько элементов из списка опций. Combobox (только для чтения) в паре с Listbox (с
множественным выбором) обеспечивает привычную функциональность мультиселекта с полной поддержкой доступности.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Атрибут `multi` в `ngListbox` включает множественный выбор. Нажмите Пробел для переключения опций; всплывающее окно
остается открытым для дополнительных выборов. Дисплей показывает первый выбранный элемент плюс количество оставшихся
выбранных.

### Multiselect с пользовательским отображением

Опциям часто требуются визуальные индикаторы, такие как иконки или цвета, чтобы помочь пользователям идентифицировать
выбор. Пользовательские шаблоны внутри опций позволяют использовать расширенное форматирование, в то время как
отображаемое значение показывает краткую сводку.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Каждая опция отображает иконку рядом с меткой. Отображаемое значение обновляется, показывая иконку и текст первого
выбора, за которыми следует количество дополнительных выбранных элементов. Выбранные опции показывают галочку для четкой
визуальной обратной связи.

### Управляемый выбор

Формам иногда необходимо ограничить количество выбранных элементов или проверить выбор пользователя. Программное
управление выбором позволяет реализовать эти ограничения, сохраняя при этом доступность.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Этот пример ограничивает выбор тремя элементами. Когда лимит достигнут, невыбранные опции становятся отключенными (
disabled), предотвращая дальнейший выбор. Сообщение информирует пользователей об ограничении.

## API

Паттерн Multiselect использует следующие директивы из библиотеки Angular Aria. Полную документацию по API смотрите в
связанных руководствах.

### Директивы Combobox

Паттерн Multiselect использует `ngCombobox` с атрибутом `readonly` для предотвращения ввода текста при сохранении
навигации с клавиатуры.

#### Входные параметры (Inputs)

| Свойство   | Тип       | По умолчанию | Описание                                                      |
| ---------- | --------- | ------------ | ------------------------------------------------------------- |
| `readonly` | `boolean` | `false`      | Установите в `true` для создания поведения выпадающего списка |
| `disabled` | `boolean` | `false`      | Отключает весь мультиселект                                   |

См. [документацию по API Combobox](guide/aria/combobox#apis) для получения полной информации обо всех доступных входных
параметрах и сигналах.

### Директивы Listbox

Паттерн Multiselect использует `ngListbox` с атрибутом `multi` для множественного выбора и `ngOption` для каждого
выбираемого элемента.

#### Входные параметры (Inputs)

| Свойство | Тип       | По умолчанию | Описание                                                |
| -------- | --------- | ------------ | ------------------------------------------------------- |
| `multi`  | `boolean` | `false`      | Установите в `true`, чтобы включить множественный выбор |

#### Модель

| Свойство | Тип     | Описание                                           |
| -------- | ------- | -------------------------------------------------- |
| `values` | `any[]` | Массив выбранных значений с двусторонней привязкой |

Когда `multi` имеет значение true, пользователи могут выбирать несколько опций, используя Пробел для переключения
выбора. Всплывающее окно остается открытым после выбора, позволяя сделать дополнительные выборы.

См. [документацию по API Listbox](guide/aria/listbox#apis) для получения полной информации о конфигурации listbox,
режимах выбора и свойствах опций.

### Позиционирование

Паттерн Multiselect интегрируется с [CDK Overlay](api/cdk/overlay/CdkConnectedOverlay) для умного позиционирования.
Используйте `cdkConnectedOverlay` для автоматической обработки границ вьюпорта и прокрутки.
