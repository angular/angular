<docs-decorative-header title="Menu">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="Паттерн ARIA Menu"/>
  <docs-pill href="/api/aria/menu/Menu" title="Справочник API Menu"/>
</docs-pill-row>

## Обзор {#overview}

Меню предлагает пользователям список действий или вариантов, как правило появляясь в ответ на нажатие кнопки или щелчок правой кнопкой мыши. Меню поддерживают навигацию с клавиатуры стрелками, вложенные меню, флажки, переключатели и отключённые элементы.

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

Меню хорошо подходят для представления списков действий или команд, из которых пользователь может выбрать нужное.

**Используйте меню, когда:**

- Создаёте командные меню приложения (Файл, Правка, Вид)
- Создаёте контекстные меню (действия по правому клику)
- Показываете выпадающие списки действий
- Реализуете выпадающие меню панели инструментов
- Организуете настройки или параметры

**Избегайте меню, когда:**

- Нужна навигация по сайту — используйте навигационные ориентиры вместо этого
- Создаёте элементы select формы — используйте компонент [Select](guide/aria/select)
- Переключаете панели содержимого — используйте [Tabs](guide/aria/tabs)
- Показываете сворачиваемое содержимое — используйте [Accordion](guide/aria/accordion)

## Возможности {#features}

- **Навигация с клавиатуры** — клавиши стрелок, Home/End и поиск по символам для эффективной навигации
- **Вложенные меню** — поддержка вложенных меню с автоматическим позиционированием
- **Типы меню** — отдельные меню, меню с триггером и строки меню
- **Флажки и переключатели** — переключаемые и выборочные элементы меню
- **Отключённые элементы** — мягкие или жёсткие состояния отключения с управлением фокусом
- **Поведение автозакрытия** — настраиваемое закрытие при выборе
- **Поддержка RTL** — навигация для языков с написанием справа налево

## Примеры {#examples}

### Меню с триггером {#menu-with-trigger}

Создайте выпадающее меню, соединив кнопку-триггер с меню. Триггер открывает и закрывает меню.

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

Контекстные меню появляются в позиции курсора при щелчке правой кнопкой мыши по элементу.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.html"/>
</docs-code-multifile>

Позиционируйте меню с использованием координат события `contextmenu`.

### Отдельное меню {#standalone-menu}

Отдельное меню не требует триггера и остаётся видимым в интерфейсе.

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

Отдельные меню хорошо подходят для всегда видимых списков действий или навигации.

### Отключённые элементы меню {#disabled-menu-items}

Отключайте отдельные элементы меню с помощью входного параметра `disabled`. Управляйте поведением фокуса с помощью `softDisabled`.

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

| Свойство       | Тип       | По умолчанию | Описание                                                              |
| -------------- | --------- | ------------ | --------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает все элементы в меню                                         |
| `wrap`         | `boolean` | `true`       | Зацикливается ли навигация с клавиатуры на краях                      |
| `softDisabled` | `boolean` | `true`       | При `true` отключённые элементы доступны для фокуса, но не интерактивны |

#### Методы {#menu-methods}

| Метод   | Параметры | Описание         |
| ------- | --------- | ---------------- |
| `close` | нет       | Закрывает меню   |

### MenuBar {#menubar}

Горизонтальный контейнер для нескольких меню.

#### Входные параметры {#menubar-inputs}

| Свойство       | Тип       | По умолчанию | Описание                                                              |
| -------------- | --------- | ------------ | --------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает всю строку меню                                             |
| `wrap`         | `boolean` | `true`       | Зацикливается ли навигация с клавиатуры на краях                      |
| `softDisabled` | `boolean` | `true`       | При `true` отключённые элементы доступны для фокуса, но не интерактивны |

### MenuItem {#menuitem}

Отдельный элемент внутри меню.

#### Входные параметры {#menuitem-inputs}

| Свойство     | Тип       | По умолчанию | Описание                                                          |
| ------------ | --------- | ------------ | ----------------------------------------------------------------- |
| `value`      | `any`     | —            | **Обязательно.** Значение данного элемента                        |
| `disabled`   | `boolean` | `false`      | Отключает данный элемент меню                                     |
| `submenu`    | `Menu`    | —            | Ссылка на вложенное меню                                          |
| `searchTerm` | `string`  | `''`         | Поисковый термин для поиска по вводу (поддерживает двустороннее связывание) |

#### Сигналы {#menuitem-signals}

| Свойство   | Тип               | Описание                                           |
| ---------- | ----------------- | -------------------------------------------------- |
| `active`   | `Signal<boolean>` | Находится ли элемент в фокусе в данный момент      |
| `expanded` | `Signal<boolean>` | Развёрнуто ли вложенное меню                       |
| `hasPopup` | `Signal<boolean>` | Есть ли у элемента связанное вложенное меню        |

NOTE: MenuItem не предоставляет публичных методов. Используйте входной параметр `submenu` для связывания вложенных меню с элементами меню.

### MenuTrigger {#menutrigger}

Кнопка или элемент, открывающий меню.

#### Входные параметры {#menutrigger-inputs}

| Свойство       | Тип       | По умолчанию | Описание                                            |
| -------------- | --------- | ------------ | --------------------------------------------------- |
| `menu`         | `Menu`    | —            | **Обязательно.** Меню для открытия                  |
| `disabled`     | `boolean` | `false`      | Отключает триггер                                   |
| `softDisabled` | `boolean` | `true`       | При `true` отключённый триггер доступен для фокуса  |

#### Сигналы {#menutrigger-signals}

| Свойство   | Тип               | Описание                                          |
| ---------- | ----------------- | ------------------------------------------------- |
| `expanded` | `Signal<boolean>` | Открыто ли меню в данный момент                   |
| `hasPopup` | `Signal<boolean>` | Есть ли у триггера связанное меню                 |

#### Методы {#menutrigger-methods}

| Метод    | Параметры | Описание                        |
| -------- | --------- | ------------------------------- |
| `open`   | нет       | Открывает меню                  |
| `close`  | нет       | Закрывает меню                  |
| `toggle` | нет       | Переключает состояние меню      |
