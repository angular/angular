<docs-decorative-header title="Combobox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/" title="ARIA-паттерн Combobox"/>
  <docs-pill href="/api?query=combobox#angular_aria_combobox" title="Справочник API Combobox"/>
</docs-pill-row>

## Обзор

Директива, которая координирует текстовый ввод с всплывающим окном, предоставляя примитив для паттернов автозаполнения (
autocomplete), выбора (select) и множественного выбора (multiselect).

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

## Использование

Combobox — это базовая директива, координирующая текстовый ввод с всплывающим окном. Она обеспечивает основу для
паттернов автозаполнения, выбора и множественного выбора. Рассмотрите возможность использования Combobox напрямую, если:

- **Создаете кастомные паттерны автозаполнения** - Создание специализированной логики фильтрации или предложений.
- **Создаете кастомные компоненты выбора** - Разработка выпадающих списков с уникальными требованиями.
- **Координируете ввод с всплывающим окном** - Сочетание текстового ввода с listbox, деревом или содержимым диалога.
- **Реализуете специфические режимы фильтрации** - Использование ручного режима, автовыбора или поведения с подсветкой.

Вместо этого используйте документированные паттерны, если:

- Требуется стандартное автозаполнение с фильтрацией — см. [Паттерн Autocomplete](guide/aria/autocomplete) для готовых
  примеров.
- Требуются выпадающие списки с одиночным выбором — см. [Паттерн Select](guide/aria/select) для полной реализации.
- Требуются выпадающие списки с множественным выбором — см. [Паттерн Multiselect](guide/aria/multiselect) для
  мультивыбора с компактным отображением.

Примечание: Руководства по [Autocomplete](guide/aria/autocomplete), [Select](guide/aria/select)
и [Multiselect](guide/aria/multiselect) демонстрируют документированные паттерны, комбинирующие эту директиву
с [Listbox](guide/aria/listbox) для конкретных случаев использования.

## Возможности

Combobox в Angular предоставляет полностью доступную систему координации ввода и всплывающего окна, включающую:

- **Текстовый ввод с всплывающим окном** - Координирует поле ввода с содержимым всплывающего окна.
- **Три режима фильтрации** - Ручной, автовыбор или поведение с подсветкой.
- **Клавиатурная навигация** - Обработка клавиш со стрелками, Enter, Escape.
- **Поддержка скринридеров** - Встроенные ARIA-атрибуты, включая role="combobox" и aria-expanded.
- **Управление всплывающим окном** - Автоматическое отображение/скрытие на основе взаимодействия с пользователем.
- **Реактивность на основе сигналов** - Управление реактивным состоянием с использованием Сигналов Angular.

## Примеры

### Autocomplete (Автозаполнение)

Доступное поле ввода, которое фильтрует и предлагает варианты по мере ввода пользователем, помогая находить и выбирать
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

Настройка `filterMode="manual"` дает полный контроль над фильтрацией и выбором. Ввод обновляет Сигнал, который фильтрует
список опций. Пользователи перемещаются с помощью клавиш со стрелками и выбирают нажатием Enter или кликом. Этот режим
обеспечивает наибольшую гибкость для кастомной логики фильтрации.
См. [руководство по Autocomplete](guide/aria/autocomplete) для полных паттернов фильтрации и примеров.

### Режим только для чтения (Readonly)

Паттерн, сочетающий Combobox только для чтения (readonly) с Listbox для создания выпадающих списков с одиночным выбором,
поддержкой клавиатуры и скринридеров.

<docs-tab-group>
  <docs-tab label="Базовый">
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

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Атрибут `readonly` предотвращает ввод текста в поле. Всплывающее окно открывается по клику или нажатию клавиш со
стрелками. Пользователи перемещаются по опциям с помощью клавиатуры и выбирают нажатием Enter или кликом.

Эта конфигурация обеспечивает основу для паттернов [Select](guide/aria/select) и [Multiselect](guide/aria/multiselect).
См. эти руководства для полной реализации выпадающих списков с триггерами и позиционированием оверлея.

### Диалоговое всплывающее окно

Всплывающим окнам иногда требуется модальное поведение с подложкой (backdrop) и ловушкой фокуса (focus trap). Директива
диалога Combobox предоставляет этот паттерн для специализированных случаев использования.

<docs-tab-group>
  <docs-tab label="Базовый">
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

  <docs-tab label="Ретро">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Директива `ngComboboxDialog` создает модальное всплывающее окно, используя нативный элемент dialog. Это обеспечивает
поведение с подложкой и захват фокуса. Используйте диалоговые всплывающие окна, когда интерфейс выбора требует
модального взаимодействия или когда содержимое всплывающего окна достаточно сложное, чтобы требовать полноэкранного
фокуса.

## API

### Директива Combobox

Директива `ngCombobox` координирует текстовый ввод с всплывающим окном.

#### Inputs (Входные свойства)

| Свойство         | Тип                                            | По умолчанию | Описание                                                             |
| ---------------- | ---------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `filterMode`     | `'manual'` \| `'auto-select'` \| `'highlight'` | `'manual'`   | Управляет поведением выбора                                          |
| `disabled`       | `boolean`                                      | `false`      | Отключает Combobox                                                   |
| `readonly`       | `boolean`                                      | `false`      | Делает Combobox доступным только для чтения (для Select/Multiselect) |
| `firstMatch`     | `V`                                            | -            | Значение первого совпадающего элемента для автовыбора                |
| `alwaysExpanded` | `boolean`                                      | `false`      | Держит всплывающее окно всегда открытым                              |

**Режимы фильтрации (Filter Modes):**

- **`'manual'`** - Пользователь явно управляет фильтрацией и выбором. Всплывающее окно показывает опции на основе вашей
  логики фильтрации. Пользователи выбирают нажатием Enter или кликом. Этот режим обеспечивает наибольшую гибкость.
- **`'auto-select'`** - Значение ввода автоматически обновляется до первой совпадающей опции по мере ввода
  пользователем. Требует Input `firstMatch` для координации.
  См. [руководство по Autocomplete](guide/aria/autocomplete#auto-select-mode) для примеров.
- **`'highlight'`** - Подсвечивает совпадающий текст без изменения значения ввода. Пользователи перемещаются с помощью
  клавиш со стрелками и выбирают нажатием Enter.

#### Сигналы

| Свойство   | Тип               | Описание                                    |
| ---------- | ----------------- | ------------------------------------------- |
| `expanded` | `Signal<boolean>` | Открыто ли всплывающее окно в данный момент |

#### Методы

| Метод      | Параметры | Описание               |
| ---------- | --------- | ---------------------- |
| `open`     | нет       | Открывает Combobox     |
| `close`    | нет       | Закрывает Combobox     |
| `expand`   | нет       | Разворачивает Combobox |
| `collapse` | нет       | Сворачивает Combobox   |

### Директива ComboboxInput

Директива `ngComboboxInput` связывает элемент ввода с Combobox.

#### Модель

| Свойство | Тип      | Описание                                            |
| -------- | -------- | --------------------------------------------------- |
| `value`  | `string` | Значение с двусторонней привязкой через `[(value)]` |

Элемент ввода автоматически получает обработку клавиатуры и ARIA-атрибуты.

### Директива ComboboxPopup

Директива `ngComboboxPopup` (хост-директива) управляет видимостью и координацией всплывающего окна. Обычно используется
с `ngComboboxPopupContainer` внутри `ng-template` или с CDK Overlay.

### Директива ComboboxPopupContainer

Директива `ngComboboxPopupContainer` помечает `ng-template` как содержимое всплывающего окна.

```html
<ng-template ngComboboxPopupContainer>
  <div ngListbox>...</div>
</ng-template>
```

Используется с Popover API или CDK Overlay для позиционирования.

### Директива ComboboxDialog

Директива `ngComboboxDialog` создает модальное всплывающее окно Combobox.

```html
<dialog ngComboboxDialog>
  <div ngListbox>...</div>
</dialog>
```

Используйте для модального поведения всплывающего окна с подложкой и ловушкой фокуса.

### Связанные паттерны и директивы

Combobox — это базовая директива для следующих документированных паттернов:

- **[Autocomplete](guide/aria/autocomplete)** - Паттерн фильтрации и предложений (использует Combobox с режимами
  фильтрации)
- **[Select](guide/aria/select)** - Паттерн выпадающего списка с одиночным выбором (использует Combobox с `readonly`)
- **[Multiselect](guide/aria/multiselect)** - Паттерн множественного выбора (использует Combobox с `readonly` + Listbox
  с поддержкой мультивыбора)

Combobox обычно комбинируется с:

- **[Listbox](guide/aria/listbox)** - Наиболее частое содержимое всплывающего окна
- **[Tree](guide/aria/tree)** - Иерархическое содержимое всплывающего окна (см. руководство по Tree для примеров)
