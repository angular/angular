<docs-decorative-header title="Menu">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="Паттерн Menu (ARIA)"/>
  <docs-pill href="/api/aria/menu/Menu" title="API-справочник Menu"/>
</docs-pill-row>

## Обзор {#overview}

Меню предлагает пользователям список действий или вариантов — как правило, появляясь по нажатию кнопки или правой кнопки мыши. Меню поддерживает навигацию с клавиатуры стрелками, подменю, флажки, переключатели и отключённые элементы.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Применение {#usage}

Меню хорошо подходят для представления списков действий или команд, из которых пользователь может выбирать.

**Используйте меню, когда:**

- Создаёте меню команд приложения (Файл, Правка, Вид)
- Реализуете контекстное меню (действия по правому клику)
- Отображаете выпадающие списки действий
- Реализуете выпадающие меню на панели инструментов
- Упорядочиваете настройки или варианты выбора

**Не используйте меню, когда:**

- Нужна навигация по сайту (используйте навигационные ориентиры)
- Создаёте элементы выбора формы (используйте компонент [Select](guide/aria/select))
- Переключаетесь между панелями контента (используйте [Tabs](guide/aria/tabs))
- Отображаете сворачиваемый контент (используйте [Accordion](guide/aria/accordion))

## Возможности {#features}

- **Навигация с клавиатуры** — стрелки, Home/End и поиск по символам для эффективной навигации
- **Подменю** — поддержка вложенных меню с автоматическим позиционированием
- **Типы меню** — автономные меню, меню с триггером и менюбары
- **Флажки и переключатели** — элементы меню с переключением и выбором
- **Отключённые элементы** — мягко или жёстко отключённые состояния с управлением фокусом
- **Автоматическое закрытие** — настраиваемое закрытие при выборе
- **Поддержка RTL** — навигация для языков с написанием справа налево

## Примеры {#examples}

### Меню с триггером {#menu-with-trigger}

Создайте выпадающее меню, связав кнопку-триггер с меню. Триггер открывает и закрывает меню.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Меню автоматически закрывается, когда пользователь выбирает элемент или нажимает Escape.

### Контекстное меню {#context-menu}

Контекстные меню появляются в позиции курсора при правом клике на элементе.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.html"/>
</docs-code-multifile>

Позиционируйте меню, используя координаты из события `contextmenu`.

### Автономное меню {#standalone-menu}

Автономное меню не требует триггера и остаётся видимым в интерфейсе.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Автономные меню хорошо подходят для всегда видимых списков действий или навигации.

### Отключённые элементы меню {#disabled-menu-items}

Отключите конкретные элементы меню с помощью входного параметра `disabled`. Управляйте поведением фокуса с помощью `softDisabled`.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

При `[softDisabled]="true"` отключённые элементы могут получать фокус, но не могут быть активированы. При `[softDisabled]="false"` отключённые элементы пропускаются при навигации с клавиатуры.

## API {#apis}

### Menu {#menu}

Директива-контейнер для элементов меню.

#### Входные параметры {#menu-inputs}

| Свойство       | Тип       | По умолчанию | Описание                                                             |
| -------------- | --------- | ------------ | -------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает все элементы в меню                                        |
| `wrap`         | `boolean` | `true`       | Зацикливать ли навигацию с клавиатуры на краях                       |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключённые элементы можно фокусировать, но не активировать |

#### Методы {#menu-methods}

| Метод   | Параметры | Описание          |
| ------- | --------- | ----------------- |
| `close` | нет       | Закрывает меню    |

### MenuBar {#menubar}

Горизонтальный контейнер для нескольких меню.

#### Входные параметры {#menubar-inputs}

| Свойство       | Тип       | По умолчанию | Описание                                                             |
| -------------- | --------- | ------------ | -------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает весь менюбар                                               |
| `wrap`         | `boolean` | `true`       | Зацикливать ли навигацию с клавиатуры на краях                       |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключённые элементы можно фокусировать, но не активировать |

### MenuItem {#menuitem}

Отдельный элемент внутри меню.

#### Входные параметры {#menuitem-inputs}

| Свойство     | Тип       | По умолчанию | Описание                                                     |
| ------------ | --------- | ------------ | ------------------------------------------------------------ |
| `value`      | `any`     | —            | **Обязательно.** Значение данного элемента                   |
| `disabled`   | `boolean` | `false`      | Отключает данный элемент меню                                |
| `submenu`    | `Menu`    | —            | Ссылка на подменю                                            |
| `searchTerm` | `string`  | `''`         | Строка поиска для поиска по первым символам (поддерживает двустороннюю привязку) |

#### Сигналы {#menuitem-signals}

| Свойство   | Тип               | Описание                                   |
| ---------- | ----------------- | ------------------------------------------ |
| `active`   | `Signal<boolean>` | Имеет ли элемент фокус в данный момент     |
| `expanded` | `Signal<boolean>` | Развёрнуто ли подменю                      |
| `hasPopup` | `Signal<boolean>` | Есть ли у элемента связанное подменю       |

NOTE: MenuItem не предоставляет публичных методов. Используйте входной параметр `submenu` для связывания подменю с элементами меню.

### MenuTrigger {#menutrigger}

Кнопка или элемент, открывающий меню.

#### Входные параметры {#menutrigger-inputs}

| Свойство       | Тип       | По умолчанию | Описание                                             |
| -------------- | --------- | ------------ | ---------------------------------------------------- |
| `menu`         | `Menu`    | —            | **Обязательно.** Меню для открытия                   |
| `disabled`     | `boolean` | `false`      | Отключает триггер                                    |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключённый триггер можно фокусировать  |

#### Сигналы {#menutrigger-signals}

| Свойство   | Тип               | Описание                                   |
| ---------- | ----------------- | ------------------------------------------ |
| `expanded` | `Signal<boolean>` | Открыто ли меню в данный момент            |
| `hasPopup` | `Signal<boolean>` | Есть ли у триггера связанное меню          |

#### Методы {#menutrigger-methods}

| Метод    | Параметры | Описание                         |
| -------- | --------- | -------------------------------- |
| `open`   | нет       | Открывает меню                   |
| `close`  | нет       | Закрывает меню                   |
| `toggle` | нет       | Переключает состояние меню       |
