<docs-decorative-header title="Menu">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="ARIA-паттерн Menu"/>
  <docs-pill href="/api/aria/menu/Menu" title="Справочник API Menu"/>
</docs-pill-row>

## Обзор

Меню предлагает пользователям список действий или опций, обычно появляющийся в ответ на клик по кнопке или клик правой
кнопкой мыши. Меню поддерживают навигацию с клавиатуры с помощью клавиш со стрелками, подменю, чекбоксы, радиокнопки и
отключенные элементы.

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

## Использование

Меню хорошо подходят для представления списков действий или команд, из которых пользователи могут выбирать.

**Используйте меню, когда:**

- Создаете командные меню приложения (Файл, Правка, Вид)
- Создаете контекстные меню (действия по правому клику)
- Показываете выпадающие списки действий
- Реализуете выпадающие списки на панели инструментов
- Организуете настройки или опции

**Избегайте использования меню, когда:**

- Создаете навигацию по сайту (используйте навигационные ориентиры)
- Создаете селекты форм (используйте компонент [Select](guide/aria/select))
- Переключаетесь между панелями контента (используйте [Tabs](guide/aria/tabs))
- Показываете сворачиваемый контент (используйте [Accordion](guide/aria/accordion))

## Возможности

- **Навигация с клавиатуры** — Клавиши со стрелками, Home/End и поиск по символам для эффективной навигации
- **Подменю** — Поддержка вложенных меню с автоматическим позиционированием
- **Типы меню** — Standalone-меню, вызываемые меню и строки меню (menubars)
- **Чекбоксы и радиокнопки** — Пункты меню с переключением и выбором
- **Отключенные элементы** — Состояния мягкого (soft) или жесткого отключения с управлением фокусом
- **Автоматическое закрытие** — Настраиваемое закрытие при выборе
- **Поддержка RTL** — Навигация для языков с письмом справа налево

## Примеры

### Меню с триггером

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

Меню автоматически закрывается, когда пользователь выбирает пункт или нажимает Escape.

### Контекстное меню

Контекстные меню появляются в позиции курсора, когда пользователи кликают правой кнопкой мыши по элементу.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.html"/>
</docs-code-multifile>

Позиционируйте меню, используя координаты события `contextmenu`.

### Standalone-меню

Standalone-меню не требует триггера и остается видимым в интерфейсе.

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

Standalone-меню хорошо подходят для постоянно видимых списков действий или навигации.

### Отключенные пункты меню

Отключайте конкретные пункты меню, используя input `disabled`. Управляйте поведением фокуса с помощью `softDisabled`.

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

Когда `[softDisabled]="true"`, отключенные элементы могут получать фокус, но не могут быть активированы. Когда
`[softDisabled]="false"`, отключенные элементы пропускаются при навигации с клавиатуры.

## API

### Menu

Директива-контейнер для пунктов меню.

#### Inputs

| Свойство       | Тип       | По умолчанию | Описание                                                                   |
| -------------- | --------- | ------------ | -------------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает все пункты в меню                                                |
| `wrap`         | `boolean` | `true`       | Зацикливается ли навигация с клавиатуры по краям                           |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключенные элементы могут получать фокус, но не интерактивны |

#### Методы

| Метод            | Параметры | Описание                              |
| ---------------- | --------- | ------------------------------------- |
| `close`          | нет       | Закрывает меню                        |
| `focusFirstItem` | нет       | Перемещает фокус на первый пункт меню |

### MenuBar

Горизонтальный контейнер для нескольких меню.

#### Inputs

| Свойство       | Тип       | По умолчанию | Описание                                                                   |
| -------------- | --------- | ------------ | -------------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает всю строку меню                                                  |
| `wrap`         | `boolean` | `true`       | Зацикливается ли навигация с клавиатуры по краям                           |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключенные элементы могут получать фокус, но не интерактивны |

### MenuItem

Отдельный пункт внутри меню.

#### Inputs

| Свойство     | Тип       | По умолчанию | Описание                                                                     |
| ------------ | --------- | ------------ | ---------------------------------------------------------------------------- |
| `value`      | `any`     | —            | **Обязательно.** Значение для этого пункта                                   |
| `disabled`   | `boolean` | `false`      | Отключает этот пункт меню                                                    |
| `submenu`    | `Menu`    | —            | Ссылка на подменю                                                            |
| `searchTerm` | `string`  | `''`         | Поисковый запрос для опережающего ввода (поддерживает двустороннюю привязку) |

#### Сигналы

| Свойство   | Тип               | Описание                             |
| ---------- | ----------------- | ------------------------------------ |
| `active`   | `Signal<boolean>` | Имеет ли пункт фокус в данный момент |
| `expanded` | `Signal<boolean>` | Развернуто ли подменю                |
| `hasPopup` | `Signal<boolean>` | Имеет ли пункт связанное подменю     |

ПРИМЕЧАНИЕ: MenuItem не предоставляет публичных методов. Используйте input `submenu` для связывания подменю с пунктами
меню.

### MenuTrigger

Кнопка или элемент, открывающий меню.

#### Inputs

| Свойство       | Тип       | По умолчанию | Описание                                              |
| -------------- | --------- | ------------ | ----------------------------------------------------- |
| `menu`         | `Menu`    | —            | **Обязательно.** Меню для вызова                      |
| `disabled`     | `boolean` | `false`      | Отключает триггер                                     |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключенный триггер может получать фокус |

#### Сигналы

| Свойство   | Тип               | Описание                        |
| ---------- | ----------------- | ------------------------------- |
| `expanded` | `Signal<boolean>` | Открыто ли меню в данный момент |
| `hasPopup` | `Signal<boolean>` | Имеет ли триггер связанное меню |

#### Методы

| Метод    | Параметры | Описание                                     |
| -------- | --------- | -------------------------------------------- |
| `open`   | нет       | Открывает меню                               |
| `close`  | нет       | Закрывает меню                               |
| `toggle` | нет       | Переключает состояние меню (открыто/закрыто) |
