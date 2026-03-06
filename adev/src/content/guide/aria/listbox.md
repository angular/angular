<docs-decorative-header title="Listbox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Паттерн Listbox (ARIA)"/>
  <docs-pill href="/api?query=listbox#angular_aria_listbox" title="API-справочник Listbox"/>
</docs-pill-row>

## Обзор {#overview}

Директива, отображающая список вариантов для выбора пользователем; поддерживает навигацию с клавиатуры, одиночный или множественный выбор, а также работу с программами чтения с экрана.

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

Listbox — базовая директива, используемая паттернами [Select](guide/aria/select), [Multiselect](guide/aria/multiselect) и [Autocomplete](guide/aria/autocomplete). В большинстве случаев с выпадающими списками следует использовать именно эти задокументированные паттерны.

Используйте listbox напрямую, когда:

- **Создаёте нестандартные компоненты выбора** — разрабатываете специализированные интерфейсы с особым поведением
- **Нужны видимые списки выбора** — отображаете доступные для выбора элементы непосредственно на странице (не в выпадающих списках)
- **Требуется нестандартная интеграция** — интеграция с уникальными всплывающими окнами или особой компоновкой

Не используйте listbox, когда:

- **Нужны навигационные меню** — используйте директиву [Menu](guide/aria/menu) для действий и команд

## Возможности {#features}

Listbox от Angular предоставляет полностью доступную реализацию списка:

- **Навигация с клавиатуры** — перемещение по вариантам стрелками, выбор клавишами Enter или Space
- **Поддержка программ чтения с экрана** — встроенные ARIA-атрибуты, включая `role="listbox"`
- **Одиночный или множественный выбор** — атрибут `multi` управляет режимом выбора
- **Горизонтальная или вертикальная ориентация** — атрибут `orientation` задаёт направление компоновки
- **Поиск по первым символам** — введите символы для перехода к соответствующим вариантам
- **Реактивность на основе Сигналов** — реактивное управление состоянием с использованием Angular-сигналов

## Примеры {#examples}

### Базовый listbox {#basic-listbox}

Иногда приложениям нужны списки с выбором, видимые непосредственно на странице, а не скрытые в выпадающем списке. Автономный listbox обеспечивает навигацию с клавиатуры и выбор для таких видимых списков.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html" />
</docs-code-multifile>

Сигнал-модель `values` обеспечивает двустороннее связывание с выбранными элементами. При `selectionMode="explicit"` пользователь нажимает Space или Enter для выбора варианта. Чтобы реализовать паттерн выпадающего списка с combobox и позиционированием оверлея, см. паттерн [Select](guide/aria/select).

### Горизонтальный listbox {#horizontal-listbox}

Списки иногда лучше работают горизонтально — например, в интерфейсах, похожих на панели инструментов, или при выборе в стиле вкладок. Атрибут `orientation` изменяет как компоновку, так и направление навигации с клавиатуры.

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

При `orientation="horizontal"` для навигации между вариантами используются стрелки влево и вправо вместо вверх и вниз. Listbox автоматически обрабатывает языки с написанием справа налево (RTL), меняя направление навигации.

### Режимы выбора {#selection-modes}

Listbox поддерживает два режима выбора, определяющих момент фиксации выбора.

Режим `'follow'` автоматически выбирает элемент, получивший фокус, что ускоряет взаимодействие при частой смене выбора. Режим `'explicit'` требует подтверждения выбора клавишами Space или Enter, предотвращая случайные изменения при навигации. Паттерны выпадающих списков обычно используют режим `'follow'` для одиночного выбора.

#### Явный (Explicit) {#explicit}

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.html" />
</docs-code-multifile>

#### Следование (Follow) {#follow}

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.html" />
</docs-code-multifile>

| Режим        | Описание                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `'follow'`   | Автоматически выбирает элемент с фокусом; ускоряет взаимодействие при частой смене выбора                    |
| `'explicit'` | Требует подтверждения выбора клавишами Space или Enter; предотвращает случайные изменения при навигации       |

TIP: Паттерны выпадающих списков обычно используют режим `'follow'` для одиночного выбора.

## API {#apis}

### Директива Listbox {#listbox-directive}

Директива `ngListbox` создаёт доступный список вариантов для выбора.

#### Входные параметры {#inputs}

| Свойство         | Тип                                | По умолчанию | Описание                                               |
| ---------------- | ---------------------------------- | ------------ | ------------------------------------------------------ |
| `id`             | `string`                           | auto         | Уникальный идентификатор listbox                       |
| `multi`          | `boolean`                          | `false`      | Включает множественный выбор                           |
| `orientation`    | `'vertical'` \| `'horizontal'`     | `'vertical'` | Направление компоновки списка                          |
| `wrap`           | `boolean`                          | `true`       | Зацикливать ли фокус на краях списка                   |
| `selectionMode`  | `'follow'` \| `'explicit'`         | `'follow'`   | Как фиксируется выбор                                  |
| `focusMode`      | `'roving'` \| `'activedescendant'` | `'roving'`   | Стратегия управления фокусом                           |
| `softDisabled`   | `boolean`                          | `true`       | Могут ли отключённые элементы получать фокус           |
| `disabled`       | `boolean`                          | `false`      | Отключает весь listbox                                 |
| `readonly`       | `boolean`                          | `false`      | Делает listbox только для чтения                       |
| `typeaheadDelay` | `number`                           | `500`        | Миллисекунды до сброса поиска по первым символам       |

#### Модель {#model}

| Свойство | Тип   | Описание                                            |
| -------- | ----- | --------------------------------------------------- |
| `values` | `V[]` | Массив выбранных значений с поддержкой двусторонней привязки |

#### Сигналы {#signals}

| Свойство | Тип           | Описание                              |
| -------- | ------------- | ------------------------------------- |
| `values` | `Signal<V[]>` | Текущие выбранные значения как Сигнал |

#### Методы {#methods}

| Метод                      | Параметры                         | Описание                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------- |
| `scrollActiveItemIntoView` | `options?: ScrollIntoViewOptions` | Прокручивает активный элемент в зону видимости |
| `gotoFirst`                | нет                               | Переходит к первому элементу в listbox         |

### Директива Option {#option-directive}

Директива `ngOption` обозначает элемент внутри listbox.

#### Входные параметры {#option-inputs}

| Свойство   | Тип       | По умолчанию | Описание                                              |
| ---------- | --------- | ------------ | ----------------------------------------------------- |
| `id`       | `string`  | auto         | Уникальный идентификатор варианта                     |
| `value`    | `V`       | -            | Значение, связанное с этим вариантом (обязательно)    |
| `label`    | `string`  | -            | Необязательная метка для программ чтения с экрана     |
| `disabled` | `boolean` | `false`      | Отключён ли данный вариант                            |

#### Сигналы {#option-signals}

| Свойство   | Тип               | Описание                          |
| ---------- | ----------------- | --------------------------------- |
| `selected` | `Signal<boolean>` | Выбран ли данный вариант          |
| `active`   | `Signal<boolean>` | Имеет ли данный вариант фокус     |

### Связанные паттерны {#related-patterns}

Listbox используется следующими задокументированными паттернами выпадающих списков:

- **[Select](guide/aria/select)** — паттерн выпадающего списка с одиночным выбором: combobox только для чтения + listbox
- **[Multiselect](guide/aria/multiselect)** — паттерн выпадающего списка с множественным выбором: combobox только для чтения + listbox с `multi`
- **[Autocomplete](guide/aria/autocomplete)** — паттерн выпадающего списка с фильтрацией: combobox + listbox

Для реализации полноценных паттернов выпадающих списков с кнопкой-триггером, всплывающим окном и позиционированием оверлея обратитесь к соответствующим руководствам, а не используйте listbox самостоятельно.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Паттерн Listbox (ARIA)"/>
  <docs-pill href="/api/aria/listbox/Listbox" title="API-справочник Listbox"/>
</docs-pill-row>
