<docs-decorative-header title="Listbox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Listbox pattern"/>
  <docs-pill href="/api?query=listbox#angular_aria_listbox" title="Listbox API Reference"/>
</docs-pill-row>

## Обзор {#overview}

Директива, отображающая список опций для выбора пользователем, с поддержкой клавиатурной навигации, одиночного или множественного выбора и screen reader.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование {#usage}

Listbox — базовая директива, используемая паттернами [Select](guide/aria/select), [Multiselect](guide/aria/multiselect) и [Autocomplete](guide/aria/autocomplete). Для большинства нужд dropdown используйте эти задокументированные паттерны.

Рассмотрите прямое использование listbox, когда:

- **Создаёте кастомные компоненты выбора** — специализированные интерфейсы с конкретным поведением
- **Видимые списки выбора** — отображение выбираемых элементов прямо на странице (не в dropdown)
- **Кастомные паттерны интеграции** — интеграция с уникальными требованиями popup или layout

Избегайте listbox, когда:

- **Нужны навигационные меню** — используйте директиву [Menu](guide/aria/menu) для действий и команд

## Возможности {#features}

Listbox Angular предоставляет полностью доступную реализацию списка с:

- **Клавиатурной навигацией** — перемещение по опциям стрелками, выбор Enter или Space
- **Поддержкой screen reader** — встроенные ARIA-атрибуты, включая role="listbox"
- **Одиночным или множественным выбором** — атрибут `multi` управляет режимом выбора
- **Горизонтальной или вертикальной ориентацией** — атрибут `orientation` для направления layout
- **Type-ahead поиском** — ввод символов для перехода к совпадающим опциям
- **Signal-based реактивностью** — реактивное управление состоянием через сигналы Angular

## Примеры {#examples}

### Базовый listbox {#basic-listbox}

Иногда приложениям нужны выбираемые списки, видимые прямо на странице, а не скрытые в dropdown. Standalone listbox обеспечивает клавиатурную навигацию и выбор для таких видимых списковых интерфейсов.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html" />
</docs-code-multifile>

Model-сигнал `value` обеспечивает двустороннюю привязку к выбранным элементам. С `selectionMode="explicit"` пользователи нажимают Space или Enter для выбора опций. Для паттернов dropdown, сочетающих listbox с combobox и позиционированием overlay, см. паттерн [Select](guide/aria/select).

### Горизонтальный listbox {#horizontal-listbox}

Иногда списки лучше работают горизонтально — например, интерфейсы в стиле toolbar или выбор в стиле вкладок. Атрибут `orientation` меняет и layout, и направление клавиатурной навигации.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

С `orientation="horizontal"` клавиши влево и вправо перемещают между опциями вместо вверх и вниз. Listbox автоматически обрабатывает языки справа налево (RTL), меняя направление навигации.

### Режимы выбора {#selection-modes}

Listbox поддерживает два режима выбора, управляющих тем, когда элементы становятся выбранными.

Режим `'follow'` автоматически выбирает элемент в фокусе, обеспечивая более быстрое взаимодействие при частой смене выбора. Режим `'explicit'` требует Space или Enter для подтверждения выбора, предотвращая случайные изменения при навигации. Паттерны dropdown обычно используют режим `'follow'` для одиночного выбора.

#### Explicit {#explicit}

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.html" />
</docs-code-multifile>

#### Follow {#follow}

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.html" />
</docs-code-multifile>

| Режим        | Описание                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `'follow'`   | Автоматически выбирает элемент в фокусе — быстрее при частой смене выбора                                  |
| `'explicit'` | Требует Space или Enter для подтверждения выбора, предотвращая случайные изменения при навигации           |

TIP: Паттерны dropdown обычно используют режим `'follow'` для одиночного выбора.

## Тестирование {#testing}

Angular Aria предоставляет component harnesses для тестирования компонентов listbox.
Пример использования harnesses в тесте компонента:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MyListboxComponent} from './my-listbox'; // Your component

describe('MyListboxComponent', () => {
  let fixture: ComponentFixture<MyListboxComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyListboxComponent],
    });

    fixture = TestBed.createComponent(MyListboxComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting options', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    // Verify listbox properties
    expect(await listbox.isMulti()).toBe(true);

    // Get all options
    const options = await listbox.getOptions();
    expect(options.length).toBe(2);

    // Click an option
    await options[0].click();

    // Verify option is selected
    expect(await options[0].isSelected()).toBe(true);

    // Filter options by text
    const bananaOption = await listbox.getOptions({text: 'Banana'});
    expect(bananaOption.length).toBe(1);
  });
});
```

## API reference {#api-reference}

Подробную API-документацию смотрите в следующих API reference:

- [`Listbox`](/api/aria/listbox/Listbox)
- [`Option`](/api/aria/listbox/Option)

### Связанные паттерны {#related-patterns}

Listbox используется этими задокументированными паттернами dropdown:

- [Select](guide/aria/select) — паттерн dropdown с одиночным выбором: readonly combobox + listbox
- [Multiselect](guide/aria/multiselect) — паттерн dropdown с множественным выбором: readonly combobox + listbox с `multi`
- [Autocomplete](guide/aria/autocomplete) — паттерн filterable dropdown: combobox + listbox

Для полных паттернов dropdown с trigger, popup и позиционированием overlay см. руководства по этим паттернам вместо использования listbox отдельно.
