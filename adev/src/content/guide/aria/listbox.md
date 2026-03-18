<docs-decorative-header title="Listbox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Паттерн Listbox"/>
  <docs-pill href="/api?query=listbox#angular_aria_listbox" title="Справочник API Listbox"/>
</docs-pill-row>

## Обзор {#overview}

Директива, которая отображает список вариантов для выбора пользователем, поддерживая навигацию с клавиатуры, одиночный или множественный выбор и поддержку программ чтения с экрана.

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

## Применение {#usage}

Listbox — это базовая директива, используемая паттернами [Select](guide/aria/select), [Multiselect](guide/aria/multiselect) и [Autocomplete](guide/aria/autocomplete). Для большинства задач с выпадающими списками рекомендуется использовать именно эти задокументированные паттерны.

Используйте listbox напрямую, когда:

- **Создание нестандартных компонентов выбора** — разработка специализированных интерфейсов с особым поведением
- **Видимые списки выбора** — отображение выбираемых элементов непосредственно на странице (не в выпадающих списках)
- **Нестандартные паттерны интеграции** — интеграция с уникальными всплывающими окнами или требованиями к макету

Избегайте использования listbox, когда:

- **Требуются меню навигации** — используйте директиву [Menu](guide/aria/menu) для действий и команд

## Возможности {#features}

Angular listbox предоставляет полностью доступную реализацию списка с:

- **Навигацией с клавиатуры** — навигация по вариантам стрелками, выбор клавишами Enter или Space
- **Поддержкой программ чтения с экрана** — встроенные атрибуты ARIA, включая `role="listbox"`
- **Одиночным или множественным выбором** — атрибут `multi` управляет режимом выбора
- **Горизонтальной или вертикальной ориентацией** — атрибут `orientation` задаёт направление расположения
- **Поиском по введённым символам** — ввод символов для перехода к совпадающим вариантам
- **Реактивностью на основе сигналов** — управление реактивным состоянием с использованием Angular-сигналов

## Примеры {#examples}

### Базовый listbox {#basic-listbox}

Иногда приложениям нужны списки выбора, видимые непосредственно на странице, а не скрытые в выпадающем меню. Отдельный listbox обеспечивает навигацию с клавиатуры и выбор для таких видимых списковых интерфейсов.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html" />
</docs-code-multifile>

Модельный сигнал `values` обеспечивает двустороннее связывание с выбранными элементами. При `selectionMode="explicit"` пользователи нажимают Space или Enter для выбора вариантов. Для паттернов с выпадающими списками, сочетающих listbox с combobox и позиционированием оверлея, см. паттерн [Select](guide/aria/select).

### Горизонтальный listbox {#horizontal-listbox}

Иногда списки лучше работают горизонтально — например, интерфейсы в стиле панели инструментов или вкладочного выбора. Атрибут `orientation` меняет как расположение, так и направление навигации с клавиатуры.

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

При `orientation="horizontal"` для навигации между вариантами используются клавиши стрелок влево и вправо, а не вверх и вниз. Listbox автоматически обрабатывает языки с написанием справа налево (RTL), меняя направление навигации на противоположное.

### Режимы выбора {#selection-modes}

Listbox поддерживает два режима выбора, управляющих тем, когда элементы становятся выбранными.

Режим `'follow'` автоматически выбирает сфокусированный элемент, обеспечивая более быстрое взаимодействие при частом изменении выбора. Режим `'explicit'` требует нажатия Space или Enter для подтверждения выбора, предотвращая случайные изменения при навигации. Паттерны с выпадающими списками обычно используют режим `'follow'` для одиночного выбора.

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

| Режим        | Описание                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `'follow'`   | Автоматически выбирает сфокусированный элемент, обеспечивая более быстрое взаимодействие при частом изменении выбора |
| `'explicit'` | Требует нажатия Space или Enter для подтверждения выбора, предотвращая случайные изменения при навигации             |

TIP: Паттерны с выпадающими списками обычно используют режим `'follow'` для одиночного выбора.

## API {#apis}

### Директива Listbox {#listbox-directive}

Директива `ngListbox` создаёт доступный список выбираемых вариантов.

#### Входные параметры {#inputs}

| Свойство         | Тип                                | По умолчанию | Описание                                              |
| ---------------- | ---------------------------------- | ------------ | ----------------------------------------------------- |
| `id`             | `string`                           | авто         | Уникальный идентификатор listbox                      |
| `multi`          | `boolean`                          | `false`      | Включает множественный выбор                          |
| `orientation`    | `'vertical'` \| `'horizontal'`     | `'vertical'` | Направление расположения списка                       |
| `wrap`           | `boolean`                          | `true`       | Зацикливается ли фокус на краях списка                |
| `selectionMode`  | `'follow'` \| `'explicit'`         | `'follow'`   | Способ активации выбора                               |
| `focusMode`      | `'roving'` \| `'activedescendant'` | `'roving'`   | Стратегия управления фокусом                          |
| `softDisabled`   | `boolean`                          | `true`       | Может ли фокус попадать на отключённые элементы       |
| `disabled`       | `boolean`                          | `false`      | Отключает весь listbox                                |
| `readonly`       | `boolean`                          | `false`      | Делает listbox только для чтения                      |
| `typeaheadDelay` | `number`                           | `500`        | Миллисекунды до сброса поиска по введённым символам   |

#### Модель {#model}

| Свойство | Тип   | Описание                                          |
| -------- | ----- | ------------------------------------------------- |
| `values` | `V[]` | Массив выбранных значений с двусторонним связыванием |

#### Сигналы {#signals}

| Свойство | Тип           | Описание                               |
| -------- | ------------- | -------------------------------------- |
| `values` | `Signal<V[]>` | Текущие выбранные значения как сигнал  |

#### Методы {#methods}

| Метод                      | Параметры                         | Описание                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------- |
| `scrollActiveItemIntoView` | `options?: ScrollIntoViewOptions` | Прокручивает активный элемент в область видимости |
| `gotoFirst`                | нет                               | Переходит к первому элементу в listbox         |

### Директива Option {#option-directive}

Директива `ngOption` помечает элемент внутри listbox.

#### Входные параметры {#option-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                               |
| ---------- | --------- | ------------ | ------------------------------------------------------ |
| `id`       | `string`  | авто         | Уникальный идентификатор варианта                      |
| `value`    | `V`       | —            | Значение, связанное с этим вариантом (обязательно)     |
| `label`    | `string`  | —            | Необязательная метка для программ чтения с экрана      |
| `disabled` | `boolean` | `false`      | Отключён ли данный вариант                             |

#### Сигналы {#option-signals}

| Свойство   | Тип               | Описание                             |
| ---------- | ----------------- | ------------------------------------ |
| `selected` | `Signal<boolean>` | Выбран ли данный вариант             |
| `active`   | `Signal<boolean>` | Находится ли данный вариант в фокусе |

### Связанные паттерны {#related-patterns}

Listbox используется следующими задокументированными паттернами с выпадающими списками:

- **[Select](guide/aria/select)** — паттерн выпадающего списка с одиночным выбором, использующий readonly combobox + listbox
- **[Multiselect](guide/aria/multiselect)** — паттерн выпадающего списка с множественным выбором, использующий readonly combobox + listbox с `multi`
- **[Autocomplete](guide/aria/autocomplete)** — паттерн фильтруемого выпадающего списка, использующий combobox + listbox

Для полноценных паттернов выпадающих списков с триггером, всплывающим окном и позиционированием оверлея обратитесь к этим руководствам по паттернам, а не используйте listbox отдельно.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Паттерн ARIA Listbox"/>
  <docs-pill href="/api/aria/listbox/Listbox" title="Справочник API Listbox"/>
</docs-pill-row>
