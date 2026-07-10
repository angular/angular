<docs-decorative-header title="Select">
</docs-decorative-header>

## Обзор {#overview}

Паттерн, сочетающий combobox с listbox для создания dropdown с одиночным выбором, клавиатурной навигацией и поддержкой screen reader.

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

## Использование {#usage}

Паттерн select лучше всего подходит, когда пользователям нужно выбрать одно значение из знакомого набора опций.

Рассмотрите этот паттерн, когда:

- **Список опций фиксирован** (меньше 20 элементов) — пользователи могут просмотреть и выбрать без фильтрации
- **Опции знакомы** — пользователи узнают варианты без поиска
- **В формах нужны стандартные поля** — выбор страны, штата, категории или статуса
- **Настройки и конфигурация** — выпадающие меню для предпочтений или опций
- **Понятные метки опций** — у каждого варианта есть отличимое, легко сканируемое имя

Избегайте этого паттерна, когда:

- **В списке больше 20 элементов** — используйте [паттерн Autocomplete](guide/aria/autocomplete) для лучшей фильтрации
- **Пользователям нужно искать опции** — [Autocomplete](guide/aria/autocomplete) даёт текстовый ввод и фильтрацию
- **Нужен множественный выбор** — вместо этого используйте [паттерн Multiselect](guide/aria/multiselect)
- **Очень мало опций (2–3)** — radio buttons дают лучшую видимость всех вариантов

## Возможности {#features}

Паттерн select сочетает директивы [Combobox](guide/aria/combobox) и [Listbox](guide/aria/listbox), предоставляя полностью доступный dropdown с:

- **Клавиатурной навигацией** — перемещение по опциям стрелками, выбор Enter, закрытие Escape
- **Поддержкой screen reader** — встроенные ARIA-атрибуты для вспомогательных технологий
- **Кастомным отображением** — показ выбранных значений с иконками, форматированием или rich content
- **Signal-based реактивностью** — реактивное управление состоянием через сигналы Angular
- **Умным позиционированием** — CDK Overlay обрабатывает края viewport и прокрутку
- **Поддержкой двунаправленного текста** — автоматическая обработка языков справа налево (RTL)

## Примеры {#examples}

### Базовый select {#basic-select}

Пользователям нужен стандартный dropdown для выбора из списка значений. Combobox в паре с listbox даёт привычный опыт select с полной поддержкой accessibility.

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

Текстовый ввод предотвращается применением директивы `ngCombobox` напрямую к неинтерактивному host-элементу (например, `div` или `button`) вместо `<input>`. Пользователи взаимодействуют с dropdown стрелками и Enter — как с нативным элементом select.

### Select с кастомным отображением {#select-with-custom-display}

Опциям часто нужны визуальные индикаторы — иконки или badges — чтобы пользователи быстрее узнавали варианты. Кастомные шаблоны внутри опций позволяют rich-форматирование с сохранением accessibility.

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

Каждая опция показывает иконку рядом с меткой. Выбранное значение обновляется, показывая иконку и текст выбранной опции — понятная визуальная обратная связь.

### Отключённый select {#disabled-select}

Select можно отключить, чтобы предотвратить взаимодействие пользователя, когда условия формы не выполнены. Состояние disabled даёт визуальную обратную связь и блокирует клавиатурное взаимодействие.

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

В состоянии disabled select показывает disabled-визуал и блокирует всё взаимодействие пользователя. Screen readers объявляют состояние disabled пользователям вспомогательных технологий.

## Тестирование {#testing}

Паттерн select можно тестировать комбинацией `ComboboxHarness` и `ListboxHarness` из `@angular/aria/combobox/testing` и `@angular/aria/listbox/testing`.
Пример использования harnesses для тестирования компонента select:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MySelectComponent} from './my-select'; // Your component

describe('MySelectComponent', () => {
  let fixture: ComponentFixture<MySelectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MySelectComponent],
    });

    fixture = TestBed.createComponent(MySelectComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting an option', async () => {
    // Load the combobox harness (which acts as the select trigger)
    const select = await loader.getHarness(ComboboxHarness);

    // Verify it is closed initially
    expect(await select.isOpen()).toBe(false);

    // Open the dropdown
    await select.open();
    expect(await select.isOpen()).toBe(true);

    // Get the listbox harness from the popup
    const listbox = await select.getPopupWidget(ListboxHarness);
    const options = await listbox.getOptions();
    expect(options.length).toBe(3);

    // Click the second option
    await options[1].click();

    // Verify the dropdown closed and the value updated
    expect(await select.isOpen()).toBe(false);
    expect(await (await select.host()).text()).toContain('Option 2');
  });
});
```

## API reference {#api-reference}

Подробную API-документацию смотрите в следующих API reference:

- [`Combobox`](/api/aria/combobox/Combobox)
- [`ComboboxPopup`](/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](/api/aria/combobox/ComboboxWidget)
- [`Listbox`](/api/aria/listbox/Listbox)
- [`Option`](/api/aria/listbox/Option)

### Позиционирование {#positioning}

Паттерн select интегрируется с [CDK Overlay](https://material.angular.io/cdk/overlay/overview) для умного позиционирования. Используйте `cdkConnectedOverlay` для автоматической обработки краёв viewport и прокрутки.
