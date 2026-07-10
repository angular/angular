<docs-decorative-header title="Grid">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/grid/" title="Grid ARIA pattern"/>
  <docs-pill href="/api?query=grid#angular_aria_grid" title="Grid API Reference"/>
</docs-pill-row>

## Обзор {#overview}

Grid позволяет пользователям перемещаться по двумерным данным или интерактивным элементам с помощью стрелок, Home, End и Page Up/Down. Grids подходят для таблиц данных, календарей, электронных таблиц и layout-паттернов, группирующих связанные интерактивные элементы.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.css"/>
</docs-code-multifile>

## Использование {#usage}

Grids хорошо подходят для данных или интерактивных элементов, организованных в строки и столбцы, где нужна клавиатурная навигация в нескольких направлениях.

**Используйте grids, когда:**

- Строите интерактивные таблицы данных с редактируемыми или выбираемыми ячейками
- Создаёте календари или date pickers
- Реализуете интерфейсы в стиле spreadsheet
- Группируете интерактивные элементы (кнопки, checkboxes), чтобы уменьшить число tab stops на странице
- Строите интерфейсы, требующие двумерной клавиатурной навигации

**Избегайте grids, когда:**

- Показываете простые read-only таблицы (вместо этого используйте семантический HTML `<table>`)
- Показываете одноколоночные списки (вместо этого используйте [Listbox](guide/aria/listbox))
- Отображаете иерархические данные (вместо этого используйте [Tree](guide/aria/tree))
- Строите формы без табличного layout (используйте стандартные form controls)

## Возможности {#features}

- **Двумерная навигация** — стрелки перемещают между ячейками во всех направлениях
- **Режимы фокуса** — выбор между roving tabindex или activedescendant
- **Поддержка выбора** — опциональный выбор ячеек в режимах single или multi-select
- **Поведение wrapping** — настройка того, как навигация оборачивается на краях grid (continuous, loop или nowrap)
- **Выбор диапазона** — выбор нескольких ячеек с modifier-клавишами или перетаскиванием
- **Состояния disabled** — отключение всего grid или отдельных ячеек
- **Поддержка RTL** — автоматическая навигация для языков справа налево

## Примеры {#examples}

### Grid таблицы данных {#data-table-grid}

Используйте grid для интерактивных таблиц, где пользователям нужно перемещаться между ячейками стрелками. Пример показывает базовую таблицу данных с клавиатурной навигацией.

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

Примените директиву `ngGrid` к элементу table, `ngGridRow` к каждой строке и `ngGridCell` к каждой ячейке.

### Grid календаря {#calendar-grid}

Календари — распространённый сценарий для grids. Пример показывает вид месяца, где пользователи перемещаются по датам стрелками.

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

Пользователи могут активировать дату, нажав Enter или Space, когда фокус на ячейке.

### Layout grid {#layout-grid}

Используйте layout grid, чтобы группировать интерактивные элементы и уменьшить число tab stops. Пример показывает сетку pill-кнопок.

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

Вместо Tab по каждой кнопке пользователи перемещаются стрелками, и только одна кнопка получает tab-фокус.

### Режимы выбора и фокуса {#selection-and-focus-modes}

Включите выбор через `[enableSelection]="true"` и настройте взаимодействие фокуса и выбора.

```angular-html
<table
  ngGrid
  [enableSelection]="true"
  [selectionMode]="'explicit'"
  [multi]="true"
  [focusMode]="'roving'"
>
  <tr ngGridRow>
    <td ngGridCell>Cell 1</td>
    <td ngGridCell>Cell 2</td>
  </tr>
</table>
```

**Режимы выбора:**

- `follow`: ячейка в фокусе выбирается автоматически
- `explicit`: пользователи выбирают ячейки Space или кликом

**Режимы фокуса:**

- `roving`: фокус перемещается к ячейкам через `tabindex` (лучше для простых grids)
- `activedescendant`: фокус остаётся на контейнере grid, `aria-activedescendant` указывает активную ячейку (лучше для virtual scrolling)

## Тестирование {#testing}

Angular Aria предоставляет component harnesses для тестирования компонентов grid.
Пример использования harnesses в тесте компонента:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {GridHarness} from '@angular/aria/grid/testing';
import {MyGridComponent} from './my-grid'; // Your component

describe('MyGridComponent', () => {
  let fixture: ComponentFixture<MyGridComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyGridComponent],
    });

    fixture = TestBed.createComponent(MyGridComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should read cell values and focus cells', async () => {
    const grid = await loader.getHarness(GridHarness);

    // Get all cells text in a 2D array organized by rows
    const cellTexts = await grid.getCellTextByIndex();
    expect(cellTexts).toEqual([
      ['Cell 1.1', 'Cell 1.2'],
      ['Cell 2.1', 'Cell 2.2'],
    ]);

    // Get a specific cell by text
    const cells = await grid.getCells({text: 'Cell 1.1'});
    expect(cells.length).toBe(1);
    const cell = cells[0];

    // Verify cell state
    expect(await cell.isSelected()).toBe(true);
    expect(await cell.isActive()).toBe(true);

    // Focus the cell
    await cell.focus();
    expect(await cell.isFocused()).toBe(true);
  });
});
```

## API reference {#api-reference}

Подробную API-документацию смотрите в следующих API reference:

- [`Grid`](/api/aria/grid/Grid)
- [`GridRow`](/api/aria/grid/GridRow)
- [`GridCell`](/api/aria/grid/GridCell)
- [`GridCellWidget`](/api/aria/grid/GridCellWidget)
