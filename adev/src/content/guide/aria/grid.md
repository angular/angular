---

<docs-decorative-header title="Grid">
</docs-decorative-header>

<docs-pill-row>
<docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/grid/" title="ARIA-паттерн Grid"/>
<docs-pill href="/api?query=grid#angular_aria_grid" title="Справочник API Grid"/>
</docs-pill-row>

## Обзор

Grid (сетка) позволяет пользователям перемещаться по двумерным данным или интерактивным элементам, используя клавиши со стрелками, Home, End и Page Up/Down. Grid подходит для таблиц данных, календарей, электронных таблиц и шаблонов макета, группирующих связанные интерактивные элементы.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.css"/>
</docs-code-multifile>

## Использование

Grid хорошо подходит для данных или интерактивных элементов, организованных в строки и столбцы, где пользователям необходима навигация с клавиатуры в нескольких направлениях.

**Используйте Grid, когда:**

- Создаете интерактивные таблицы данных с редактируемыми или выбираемыми ячейками
- Создаете календари или элементы выбора даты
- Реализуете интерфейсы, подобные электронным таблицам
- Группируете интерактивные элементы (кнопки, чекбоксы) для уменьшения количества остановок табуляции на странице
- Создаете интерфейсы, требующие двумерной навигации с клавиатуры

**Избегайте использования Grid, когда:**

- Отображаете простые таблицы только для чтения (используйте семантический HTML `<table>`)
- Показываете одноколоночные списки (используйте [Listbox](guide/aria/listbox))
- Отображаете иерархические данные (используйте [Tree](guide/aria/tree))
- Создаете формы без табличной структуры (используйте стандартные элементы управления форм)

## Возможности

- **Двумерная навигация** — Клавиши со стрелками перемещают фокус между ячейками во всех направлениях
- **Режимы фокуса** — Выбор между стратегиями фокуса `roving tabindex` или `activedescendant`
- **Поддержка выбора** — Опциональный выбор ячеек с режимами одиночного или множественного выбора
- **Поведение переноса** — Настройка того, как навигация переносится на краях сетки (непрерывная, зацикленная или без переноса)
- **Выбор диапазона** — Выбор нескольких ячеек с помощью клавиш-модификаторов или перетаскивания
- **Отключенные состояния** — Отключение всей сетки или отдельных ячеек
- **Поддержка RTL** — Автоматическая навигация для языков с письмом справа налево

## Примеры

### Сетка таблицы данных

Используйте Grid для интерактивных таблиц, где пользователям нужно перемещаться между ячейками с помощью стрелок. Этот пример показывает базовую таблицу данных с навигацией с клавиатуры.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/table/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/table/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Примените директиву `ngGrid` к элементу таблицы, `ngGridRow` к каждой строке и `ngGridCell` к каждой ячейке.

### Сетка календаря

Календари — частый случай использования Grid. Этот пример показывает вид месяца, где пользователи перемещаются по датам с помощью стрелок.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Пользователи могут активировать дату, нажав Enter или Пробел, когда фокус находится на ячейке.

### Сетка макета

Используйте сетку макета для группировки интерактивных элементов и сокращения количества остановок табуляции. Этот пример показывает сетку кнопок-pill.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Вместо переключения табуляцией по каждой кнопке, пользователи перемещаются с помощью стрелок, и только одна кнопка получает фокус табуляции.

### Режимы выбора и фокуса

Включите выбор с помощью `[enableSelection]="true"` и настройте взаимодействие фокуса и выбора.

```angular-html
<table ngGrid
       [enableSelection]="true"
       [selectionMode]="'explicit'"
       [multi]="true"
       [focusMode]="'roving'">
  <tr ngGridRow>
    <td ngGridCell>Cell 1</td>
    <td ngGridCell>Cell 2</td>
  </tr>
</table>
```

**Режимы выбора:**

- `follow`: Сфокусированная ячейка выбирается автоматически
- `explicit`: Пользователи выбирают ячейки нажатием Пробела или кликом

**Режимы фокуса:**

- `roving`: Фокус перемещается к ячейкам с использованием `tabindex` (лучше для простых сеток)
- `activedescendant`: Фокус остается на контейнере сетки, `aria-activedescendant` указывает на активную ячейку (лучше для виртуального скроллинга)

## API

### Grid

Контейнерная директива, обеспечивающая навигацию с клавиатуры и управление фокусом для строк и ячеек.

#### Входные свойства (Inputs)

| Свойство               | Тип                                  | По умолчанию | Описание                                                                   |
| ---------------------- | ------------------------------------ | ------------ | -------------------------------------------------------------------------- |
| `enableSelection`      | `boolean`                            | `false`      | Включен ли выбор для сетки                                                 |
| `disabled`             | `boolean`                            | `false`      | Отключает всю сетку                                                        |
| `softDisabled`         | `boolean`                            | `true`       | Если `true`, отключенные ячейки могут получать фокус, но не интерактивны   |
| `focusMode`            | `'roving' \| 'activedescendant'`     | `'roving'`   | Стратегия фокуса, используемая сеткой                                      |
| `rowWrap`              | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'`     | Поведение переноса навигации вдоль строк                                   |
| `colWrap`              | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'`     | Поведение переноса навигации вдоль столбцов                                |
| `multi`                | `boolean`                            | `false`      | Можно ли выбирать несколько ячеек                                          |
| `selectionMode`        | `'follow' \| 'explicit'`             | `'follow'`   | Следует ли выбор за фокусом или требует явного действия                    |
| `enableRangeSelection` | `boolean`                            | `false`      | Включить выбор диапазона с помощью клавиш-модификаторов или перетаскивания |

### GridRow

Представляет строку внутри сетки и служит контейнером для ячеек сетки.

#### Входные свойства (Inputs)

| Свойство   | Тип      | По умолчанию | Описание                        |
| ---------- | -------- | ------------ | ------------------------------- |
| `rowIndex` | `number` | auto         | Индекс этой строки внутри сетки |

### GridCell

Представляет отдельную ячейку внутри строки сетки.

#### Входные свойства (Inputs)

| Свойство      | Тип                          | По умолчанию   | Описание                                                |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------- |
| `id`          | `string`                     | auto           | Уникальный идентификатор ячейки                         |
| `role`        | `string`                     | `'gridcell'`   | Роль ячейки: `gridcell`, `columnheader` или `rowheader` |
| `disabled`    | `boolean`                    | `false`        | Отключает эту ячейку                                    |
| `selected`    | `boolean`                    | `false`        | Выбрана ли ячейка (поддерживает двустороннюю привязку)  |
| `selectable`  | `boolean`                    | `true`         | Можно ли выбрать ячейку                                 |
| `rowSpan`     | `number`                     | —              | Количество строк, которые занимает ячейка               |
| `colSpan`     | `number`                     | —              | Количество столбцов, которые занимает ячейка            |
| `rowIndex`    | `number`                     | —              | Индекс строки ячейки                                    |
| `colIndex`    | `number`                     | —              | Индекс столбца ячейки                                   |
| `orientation` | `'vertical' \| 'horizontal'` | `'horizontal'` | Ориентация виджетов внутри ячейки                       |
| `wrap`        | `boolean`                    | `true`         | Переносится ли навигация по виджетам внутри ячейки      |

#### Сигналы (Signals)

| Свойство | Тип               | Описание                                     |
| -------- | ----------------- | -------------------------------------------- |
| `active` | `Signal<boolean>` | Находится ли фокус в данный момент на ячейке |
