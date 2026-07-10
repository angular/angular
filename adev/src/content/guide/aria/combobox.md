<docs-decorative-header title="Combobox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/" title="Combobox ARIA pattern"/>
  <docs-pill href="/api?query=combobox#angular_aria_combobox" title="Combobox API Reference"/>
</docs-pill-row>

## Обзор {#overview}

Директива, координирующая trigger-элемент (текстовый input, кнопку или `div`) с popup — примитивная директива для паттернов autocomplete, select и multiselect.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование {#usage}

Combobox — примитивная директива, координирующая интерактивный trigger-элемент (текстовый input, кнопку или `div`) с popup. Она даёт основу для паттернов autocomplete, select и multiselect. Рассмотрите прямое использование combobox, когда:

- **Строите кастомные паттерны autocomplete** — специализированная фильтрация или поведение подсказок
- **Создаёте кастомные компоненты выбора** — dropdown с уникальными требованиями
- **Координируете input с popup** — связываете текстовый ввод с контентом listbox, tree или dialog
- **Реализуете кастомную фильтрацию** — фильтрация и оркестрация совпадающих опций в user space

Используйте задокументированные паттерны, когда:

- Нужен стандартный autocomplete с фильтрацией — см. [паттерн Autocomplete](guide/aria/autocomplete) для готовых примеров
- Нужны dropdown с одиночным выбором — см. [паттерн Select](guide/aria/select) для полной реализации dropdown
- Нужны dropdown с множественным выбором — см. [паттерн Multiselect](guide/aria/multiselect) для multi-select с компактным отображением

NOTE: Руководства [Autocomplete](guide/aria/autocomplete), [Select](guide/aria/select) и [Multiselect](guide/aria/multiselect) показывают задокументированные паттерны, сочетающие эту директиву с [Listbox](guide/aria/listbox) для конкретных сценариев.

## Возможности {#features}

Combobox Angular предоставляет полностью доступную систему координации input-popup с:

- **Trigger-элементом с popup** — координация trigger-элемента с контентом popup
- **Гибкой координацией** — бесшовная интеграция со стандартными layout (listbox, tree, grid или dialog)
- **Клавиатурной навигацией** — обработка стрелок, Enter, Escape
- **Поддержкой screen reader** — встроенные ARIA-атрибуты, включая role="combobox" и aria-expanded
- **Управлением popup** — автоматический показ/скрытие на основе взаимодействия пользователя
- **Signal-based реактивностью** — реактивное управление состоянием через сигналы Angular

## Примеры {#examples}

### Autocomplete {#autocomplete}

Доступное поле ввода, которое фильтрует и предлагает опции по мере ввода, помогая находить и выбирать значения из списка.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Фильтрация управляется в user space обновлением сигнала, который реактивно фильтрует список опций. Пользователи перемещаются стрелками и выбирают Enter или кликом. Это даёт полный контроль и максимальную гибкость для кастомной логики выбора. Полные паттерны фильтрации и примеры — в [руководстве Autocomplete](guide/aria/autocomplete).

### Режим readonly {#readonly-mode}

Паттерн, сочетающий readonly combobox с listbox для создания dropdown с одиночным выбором, клавиатурной навигацией и поддержкой screen reader.

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

Запуск dropdown без текстового ввода достигается использованием кнопки как host trigger или применением нативного HTML-атрибута `readonly` к input trigger. Popup открывается по клику или стрелкам.

Эта конфигурация даёт основу для паттернов [Select](guide/aria/select) и [Multiselect](guide/aria/multiselect). Полные реализации dropdown с triggers и позиционированием overlay — в этих руководствах.

### Datepicker grid {#datepicker-grid}

Combobox может координироваться с двумерным grid для создания доступных datepickers. Пользователи перемещаются по датам внутри таблицы calendar grid стрелками и подтверждают выбор кликом, Enter или Spacebar.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Dialog popup {#dialog-popup}

Dialog popups сочетают combobox trigger со стандартными dialog layout и focus traps (например, `cdkTrapFocus` CDK). Используйте dialog popups, когда overlay требует modal-поведения или взаимодействия с backdrop.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Тестирование {#testing}

Angular Aria предоставляет `ComboboxHarness` для тестирования компонентов combobox.
Пример использования harness в тесте компонента:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {MyComboboxComponent} from './my-combobox'; // Your component

describe('MyComboboxComponent', () => {
  let fixture: ComponentFixture<MyComboboxComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyComboboxComponent],
    });

    fixture = TestBed.createComponent(MyComboboxComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow opening and closing the popup', async () => {
    const combobox = await loader.getHarness(ComboboxHarness);

    // Verify initial state
    expect(await combobox.isOpen()).toBe(false);

    // Open the popup
    await combobox.open();
    expect(await combobox.isOpen()).toBe(true);

    // Close the popup
    await combobox.close();
    expect(await combobox.isOpen()).toBe(false);
  });
});
```

## API reference {#api-reference}

Подробную API-документацию смотрите в следующих API reference:

- [`Combobox`](/api/aria/combobox/Combobox)
- [`ComboboxPopup`](/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](/api/aria/combobox/ComboboxWidget)

### Связанные паттерны и директивы {#related-patterns-and-directives}

Combobox — примитивная директива для этих задокументированных паттернов:

- [Autocomplete](guide/aria/autocomplete) — паттерн фильтрации и подсказок (координирует ввод с списком опций)
- [Select](guide/aria/select) — паттерн dropdown с одиночным выбором (применяется напрямую к нередактируемым button triggers)
- [Multiselect](guide/aria/multiselect) — паттерн множественного выбора (применяется к нередактируемым triggers с multi-enabled Listbox)

Combobox обычно сочетается с:

- [Listbox](guide/aria/listbox) — самый частый контент popup
- [Tree](guide/aria/tree) — иерархический контент popup (примеры — в руководстве Tree)
