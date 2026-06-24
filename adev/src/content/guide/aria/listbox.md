---

<docs-decorative-header title="Listbox">
</docs-decorative-header>

<docs-pill-row>
<docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Паттерн Listbox"/>
<docs-pill href="/api?query=listbox#angular_aria_listbox" title="Справочник API Listbox"/>
</docs-pill-row>

## Обзор

Директива, которая отображает список опций для выбора пользователем, поддерживающая клавиатурную навигацию, одиночный или множественный выбор, а также поддержку скринридеров.

<docs-tab-group>
<docs-tab label="Базовый">
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

<docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование

Listbox — это базовая директива, используемая паттернами [Select](guide/aria/select), [Multiselect](guide/aria/multiselect) и [Autocomplete](guide/aria/autocomplete). Для большинства задач с выпадающими списками используйте эти документированные паттерны.

Рассмотрите возможность использования listbox напрямую, если:

- **Создаете кастомные компоненты выбора** — Создание специализированных интерфейсов со специфическим поведением.
- **Списки выбора всегда видны** — Отображение выбираемых элементов непосредственно на странице (не в выпадающих списках).
- **Кастомные паттерны интеграции** — Интеграция с уникальными требованиями к всплывающим окнам или макету.

Избегайте использования listbox, когда:

- **Требуются навигационные меню** — Используйте директиву [Menu](guide/aria/menu) для действий и команд.

## Возможности

Listbox в Angular предоставляет полностью доступную реализацию списка с:

- **Клавиатурная навигация** — Перемещение по опциям с помощью стрелок, выбор с помощью Enter или Пробела.
- **Поддержка скринридеров** — Встроенные ARIA-атрибуты, включая role="listbox".
- **Одиночный или множественный выбор** — Атрибут `multi` управляет режимом выбора.
- **Горизонтальный или вертикальный** — Атрибут `orientation` для направления макета.
- **Поиск с опережающим вводом (Type-ahead)** — Ввод символов для перехода к соответствующим опциям.
- **Реактивность на основе сигналов** — Управление реактивным состоянием с использованием Сигналов Angular.

## Примеры

### Базовый listbox

Приложениям иногда требуются списки выбора, видимые непосредственно на странице, а не скрытые в выпадающем меню. Автономный (standalone) listbox обеспечивает клавиатурную навигацию и выбор для таких интерфейсов.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html" />
</docs-code-multifile>

Сигнал модели `values` обеспечивает двустороннюю привязку к выбранным элементам. При `selectionMode="explicit"` пользователи нажимают Пробел или Enter для выбора опций. Для паттернов выпадающих списков, сочетающих listbox с combobox и позиционированием оверлея, см. паттерн [Select](guide/aria/select).

### Горизонтальный listbox

Списки иногда лучше работают в горизонтальном виде, например, в интерфейсах типа панелей инструментов или при выборе в стиле вкладок. Атрибут `orientation` изменяет как макет, так и направление навигации с клавиатуры.

<docs-tab-group>
<docs-tab label="Базовый">
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

<docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

При `orientation="horizontal"` клавиши со стрелками влево и вправо перемещают фокус между опциями вместо вверх и вниз. Listbox автоматически обрабатывает языки с письмом справа налево (RTL), инвертируя направление навигации.

### Режимы выбора

Listbox поддерживает два режима выбора, которые определяют, когда элементы становятся выбранными. Выберите режим, соответствующий паттерну взаимодействия вашего интерфейса.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/app.html" />
</docs-code-multifile>

Режим `'follow'` автоматически выбирает элемент, на котором находится фокус, обеспечивая более быстрое взаимодействие при частой смене выбора. Режим `'explicit'` требует нажатия Пробела или Enter для подтверждения выбора, предотвращая случайные изменения при навигации. Паттерны выпадающих списков обычно используют режим `'follow'` для одиночного выбора.

## API

### Директива Listbox

Директива `ngListbox` создает доступный список выбираемых опций.

#### Входные свойства (Inputs)

| Свойство         | Тип                                | По умолчанию | Описание                                           |
| ---------------- | ---------------------------------- | ------------ | -------------------------------------------------- |
| `id`             | `string`                           | auto         | Уникальный идентификатор для listbox               |
| `multi`          | `boolean`                          | `false`      | Включает множественный выбор                       |
| `orientation`    | `'vertical'` \| `'horizontal'`     | `'vertical'` | Направление макета списка                          |
| `wrap`           | `boolean`                          | `true`       | Переносится ли фокус на краях списка               |
| `selectionMode`  | `'follow'` \| `'explicit'`         | `'follow'`   | Как инициируется выбор                             |
| `focusMode`      | `'roving'` \| `'activedescendant'` | `'roving'`   | Стратегия управления фокусом                       |
| `softDisabled`   | `boolean`                          | `true`       | Являются ли отключенные элементы фокусируемыми     |
| `disabled`       | `boolean`                          | `false`      | Отключает весь listbox                             |
| `readonly`       | `boolean`                          | `false`      | Делает listbox доступным только для чтения         |
| `typeaheadDelay` | `number`                           | `500`        | Миллисекунды до сброса поиска с опережающим вводом |

#### Модель

| Свойство | Тип   | Описание                                           |
| -------- | ----- | -------------------------------------------------- |
| `values` | `V[]` | Массив выбранных значений с двусторонней привязкой |

#### Сигналы

| Свойство | Тип           | Описание                              |
| -------- | ------------- | ------------------------------------- |
| `values` | `Signal<V[]>` | Текущие выбранные значения как сигнал |

#### Методы

| Метод                      | Параметры                         | Описание                                          |
| -------------------------- | --------------------------------- | ------------------------------------------------- |
| `scrollActiveItemIntoView` | `options?: ScrollIntoViewOptions` | Прокручивает активный элемент в область видимости |
| `gotoFirst`                | нет                               | Переходит к первому элементу в listbox            |

### Директива Option

Директива `ngOption` помечает элемент внутри listbox.

#### Входные свойства (Inputs)

| Свойство   | Тип       | По умолчанию | Описание                                        |
| ---------- | --------- | ------------ | ----------------------------------------------- |
| `id`       | `string`  | auto         | Уникальный идентификатор опции                  |
| `value`    | `V`       | -            | Значение, связанное с этой опцией (обязательно) |
| `label`    | `string`  | -            | Необязательная метка для скринридеров           |
| `disabled` | `boolean` | `false`      | Отключена ли эта опция                          |

#### Сигналы

| Свойство   | Тип               | Описание                 |
| ---------- | ----------------- | ------------------------ |
| `selected` | `Signal<boolean>` | Выбрана ли эта опция     |
| `active`   | `Signal<boolean>` | Имеет ли эта опция фокус |

### Связанные паттерны

Listbox используется следующими документированными паттернами выпадающих списков:

- **[Select](guide/aria/select)** — Паттерн выпадающего списка с одиночным выбором, использующий combobox только для чтения + listbox
- **[Multiselect](guide/aria/multiselect)** — Паттерн выпадающего списка с множественным выбором, использующий combobox только для чтения + listbox с `multi`
- **[Autocomplete](guide/aria/autocomplete)** — Паттерн фильтруемого выпадающего списка, использующий combobox + listbox

Для полноценных паттернов выпадающих списков с триггером, всплывающим окном и позиционированием оверлея смотрите соответствующие руководства вместо использования listbox отдельно.

<docs-pill-row>
<docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="ARIA-паттерн Listbox"/>
<docs-pill href="/api/aria/listbox/Listbox" title="Справочник API Listbox"/>
</docs-pill-row>
