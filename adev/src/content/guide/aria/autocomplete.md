<docs-decorative-header title="Автозаполнение">
</docs-decorative-header>

## Обзор {#overview}

Доступное поле ввода, которое фильтрует и предлагает варианты по мере ввода, помогая пользователям находить и выбирать
значения из списка.

<docs-tab-group>
  <docs-tab label="Базовый">
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

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование {#usage}

Автозаполнение лучше всего работает, когда пользователям нужно выбрать из большого набора опций, где ввод текста
быстрее, чем прокрутка. Рассмотрите возможность использования автозаполнения, когда:

- **Список опций длинный** (более 20 элементов) — Ввод текста сужает выбор быстрее, чем прокрутка выпадающего списка.
- **Пользователи знают, что ищут** — Они могут ввести часть ожидаемого значения (например, название штата, продукт или
  имя пользователя).
- **Опции следуют предсказуемым шаблонам** — Пользователи могут угадать частичные совпадения (например, коды стран,
  домены электронной почты или категории).
- **Скорость имеет значение** — Формы выигрывают от быстрого выбора без длительной навигации.

Избегайте автозаполнения, когда:

- В списке менее 10 опций — Обычный выпадающий список или группа переключателей (radio group) обеспечивают лучшую
  видимость.
- Пользователям нужно просматривать опции — Если важно ознакомление, покажите все опции сразу.
- Опции незнакомы — Пользователи не могут ввести то, о существовании чего в списке они не знают.

## Возможности {#features}

Автозаполнение в Angular предоставляет полностью доступную реализацию combobox с:

- **Навигация с клавиатуры** — Перемещение по опциям с помощью стрелок, выбор через Enter, закрытие через Escape.
- **Поддержка скринридеров** — Встроенные ARIA-атрибуты для вспомогательных технологий.
- **Три режима фильтрации** — Выбор между автовыбором, ручным выбором или режимом подсветки.
- **Реактивность на основе Сигналов** — Управление реактивным состоянием с использованием сигналов Angular.
- **Интеграция с Popover API** — Использует нативный HTML Popover API для оптимального позиционирования.
- **Поддержка двунаправленного текста** — Автоматически обрабатывает языки с письмом справа налево (RTL).

## Примеры {#examples}

### Режим автовыбора {#auto-select-mode}

Пользователи, вводящие частичный текст, ожидают немедленного подтверждения того, что их ввод совпадает с доступной
опцией. Режим автовыбора обновляет значение ввода, чтобы оно соответствовало первой отфильтрованной опции по мере ввода,
уменьшая количество нажатий клавиш и обеспечивая мгновенную обратную связь о том, что поиск идет в правильном
направлении.

<docs-tab-group>
  <docs-tab label="Базовый">
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

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Режим ручного выбора {#manual-selection-mode}

Режим ручного выбора оставляет введенный текст без изменений, пока пользователи перемещаются по списку предложений,
предотвращая путаницу от автоматических обновлений. Ввод изменяется только тогда, когда пользователи явно подтверждают
свой выбор нажатием Enter или кликом.

<docs-tab-group>
  <docs-tab label="Базовый">
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

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Режим подсветки {#highlight-mode}

Режим подсветки позволяет пользователю перемещаться по опциям с помощью клавиш со стрелками, не изменяя значение ввода
во время просмотра, пока он явно не выберет новую опцию нажатием Enter или кликом.

<docs-tab-group>
  <docs-tab label="Базовый">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## API {#api}

### Директива Combobox {#combobox-directive}

Директива `ngCombobox` предоставляет контейнер для функциональности автозаполнения.

#### Входные параметры (Inputs) {#combobox-inputs}

| Свойство     | Тип                                            | По умолчанию | Описание                                                   |
| ------------ | ---------------------------------------------- | ------------ | ---------------------------------------------------------- |
| `filterMode` | `'auto-select'` \| `'manual'` \| `'highlight'` | `'manual'`   | Управляет поведением выбора                                |
| `disabled`   | `boolean`                                      | `false`      | Отключает combobox                                         |
| `firstMatch` | `string`                                       | -            | Значение первого совпадающего элемента во всплывающем окне |

#### Выходные параметры (Outputs) {#combobox-outputs}

| Свойство   | Тип               | Описание                                                         |
| ---------- | ----------------- | ---------------------------------------------------------------- |
| `expanded` | `Signal<boolean>` | Сигнал, указывающий, открыто ли в данный момент всплывающее окно |

### Директива ComboboxInput {#comboboxinput-directive}

Директива `ngComboboxInput` связывает элемент ввода с combobox.

#### Модель {#comboboxinput-model}

| Свойство | Тип      | Описание                                                                    |
| -------- | -------- | --------------------------------------------------------------------------- |
| `value`  | `string` | Строковое значение ввода с двусторонней привязкой, использующее `[(value)]` |

### Директива ComboboxPopupContainer {#comboboxpopupcontainer-directive}

Директива `ngComboboxPopupContainer` оборачивает содержимое всплывающего окна и управляет его отображением.

Должна использоваться с `<ng-template>` внутри элемента popover.

### Связанные компоненты {#related-components}

Автозаполнение использует директивы [Listbox](/api/aria/listbox/Listbox) и [Option](/api/aria/listbox/Option) для
рендеринга списка предложений. См. [документацию Listbox](/guide/aria/listbox) для дополнительных возможностей
настройки.
