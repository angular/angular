<docs-decorative-header title="Аккордеон">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/accordion/" title="ARIA-паттерн Аккордеон"/>
  <docs-pill href="/api?query=accordion#angular_aria_accordion" title="Справочник API Аккордеона"/>
</docs-pill-row>

## Обзор

Аккордеон организует связанный контент в разворачиваемые и сворачиваемые секции, уменьшая прокрутку страницы и помогая
пользователям сосредоточиться на важной информации. Каждая секция имеет кнопку-триггер и панель контента. Нажатие на
триггер переключает видимость связанной с ним панели.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css"/>
</docs-code-multifile>

## Использование

Аккордеоны хорошо подходят для организации контента в логические группы, где пользователям обычно нужно просматривать
одну секцию за раз.

**Используйте аккордеоны, когда:**

- Отображаете FAQ с множеством вопросов и ответов
- Организуете длинные формы в управляемые секции
- Уменьшаете прокрутку на страницах с большим количеством контента
- Реализуете постепенное раскрытие связанной информации

**Избегайте использования аккордеонов, когда:**

- Создаете навигационные меню (используйте компонент [Menu](guide/aria/menu))
- Создаете интерфейсы с вкладками (используйте компонент [Tabs](guide/aria/tabs))
- Показываете одну сворачиваемую секцию (используйте паттерн раскрытия)
- Пользователям нужно видеть несколько секций одновременно (рассмотрите другой макет)

## Особенности

- **Режимы раскрытия** — Управление тем, может ли быть открыта одна или несколько панелей одновременно.
- **Клавиатурная навигация** — Перемещение между триггерами с помощью клавиш со стрелками, Home и End.
- **Ленивый рендеринг** — Контент создается только при первом раскрытии панели, что улучшает производительность
  начальной загрузки.
- **Отключенные состояния** — Отключение всей группы или отдельных триггеров.
- **Управление фокусом** — Управление тем, могут ли отключенные элементы получать фокус клавиатуры.
- **Программное управление** — Раскрытие, сворачивание или переключение панелей из кода вашего компонента.
- **Поддержка RTL** — Автоматическая поддержка языков с письмом справа налево.

## Примеры

### Режим одиночного раскрытия

Установите `[multiExpandable]="false"`, чтобы разрешить открытие только одной панели за раз. Открытие новой панели
автоматически закрывает любую ранее открытую панель.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Этот режим хорошо подходит для FAQ или ситуаций, когда вы хотите, чтобы пользователи сосредоточились на одном ответе за
раз.

### Режим множественного раскрытия

Установите `[multiExpandable]="true"`, чтобы разрешить одновременное открытие нескольких панелей. Пользователи могут
разворачивать столько панелей, сколько необходимо, не закрывая другие.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Этот режим полезен для разделов форм или когда пользователям нужно сравнить контент в нескольких панелях.

ПРИМЕЧАНИЕ: Input-свойство `multiExpandable` по умолчанию имеет значение `true`. Установите его в `false` явно, если вам
требуется поведение одиночного раскрытия.

### Отключенные элементы аккордеона

Отключайте конкретные триггеры с помощью Input-свойства `disabled`. Управляйте поведением отключенных элементов во время
навигации с клавиатуры с помощью Input-свойства `softDisabled` в группе аккордеона.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Когда `[softDisabled]="true"` (по умолчанию), отключенные элементы могут получать фокус, но не могут быть активированы.
Когда `[softDisabled]="false"`, отключенные элементы полностью пропускаются при навигации с клавиатуры.

### Ленивый рендеринг контента

Используйте директиву `ngAccordionContent` на `ng-template`, чтобы отложить рендеринг контента до первого раскрытия
панели. Это улучшает производительность для аккордеонов с "тяжелым" контентом, таким как изображения, графики или
сложные компоненты.

```angular-html
<div ngAccordionGroup>
  <div>
    <button ngAccordionTrigger panelId="item-1">
      Trigger Text
    </button>
    <div ngAccordionPanel panelId="item-1">
      <ng-template ngAccordionContent>
        <!-- This content only renders when the panel first opens -->
        <img src="large-image.jpg" alt="Description">
        <app-expensive-component />
      </ng-template>
    </div>
  </div>
</div>
```

По умолчанию контент остается в DOM после сворачивания панели. Установите `[preserveContent]="false"`, чтобы удалять
контент из DOM при закрытии панели.

## API

### AccordionGroup

Директива-контейнер, которая управляет навигацией с клавиатуры и поведением раскрытия для группы элементов аккордеона.

#### Input-свойства

| Свойство          | Тип       | По умолчанию | Описание                                                                        |
| ----------------- | --------- | ------------ | ------------------------------------------------------------------------------- |
| `disabled`        | `boolean` | `false`      | Отключает все триггеры в группе                                                 |
| `multiExpandable` | `boolean` | `true`       | Могут ли несколько панелей быть развернуты одновременно                         |
| `softDisabled`    | `boolean` | `true`       | Если `true`, отключенные элементы фокусируемы. Если `false`, они пропускаются   |
| `wrap`            | `boolean` | `false`      | Переходит ли навигация с клавиатуры от последнего элемента к первому и наоборот |

#### Методы

| Метод         | Параметры | Описание                                                                   |
| ------------- | --------- | -------------------------------------------------------------------------- |
| `expandAll`   | нет       | Разворачивает все панели (работает только если `multiExpandable` — `true`) |
| `collapseAll` | нет       | Сворачивает все панели                                                     |

### AccordionTrigger

Директива, применяемая к элементу кнопки, которая переключает видимость панели.

#### Input-свойства

| Свойство   | Тип       | По умолчанию | Описание                                                       |
| ---------- | --------- | ------------ | -------------------------------------------------------------- |
| `id`       | `string`  | авто         | Уникальный идентификатор для триггера                          |
| `panelId`  | `string`  | —            | **Обязательно.** Должен совпадать с `panelId` связанной панели |
| `disabled` | `boolean` | `false`      | Отключает этот триггер                                         |
| `expanded` | `boolean` | `false`      | Развернута ли панель (поддерживает двустороннюю привязку)      |

#### Сигналы

| Свойство | Тип               | Описание                               |
| -------- | ----------------- | -------------------------------------- |
| `active` | `Signal<boolean>` | Имеет ли триггер фокус в данный момент |

#### Методы

| Метод      | Параметры | Описание                               |
| ---------- | --------- | -------------------------------------- |
| `expand`   | нет       | Разворачивает связанную панель         |
| `collapse` | нет       | Сворачивает связанную панель           |
| `toggle`   | нет       | Переключает состояние раскрытия панели |

### AccordionPanel

Директива, применяемая к элементу, содержащему сворачиваемый контент.

#### Input-свойства

| Свойство          | Тип       | По умолчанию | Описание                                                          |
| ----------------- | --------- | ------------ | ----------------------------------------------------------------- |
| `id`              | `string`  | авто         | Уникальный идентификатор для панели                               |
| `panelId`         | `string`  | —            | **Обязательно.** Должен совпадать с `panelId` связанного триггера |
| `preserveContent` | `boolean` | `true`       | Сохранять ли контент в DOM после сворачивания панели              |

#### Сигналы

| Свойство  | Тип               | Описание                             |
| --------- | ----------------- | ------------------------------------ |
| `visible` | `Signal<boolean>` | Развернута ли панель в данный момент |

#### Методы

| Метод      | Параметры | Описание                        |
| ---------- | --------- | ------------------------------- |
| `expand`   | нет       | Разворачивает эту панель        |
| `collapse` | нет       | Сворачивает эту панель          |
| `toggle`   | нет       | Переключает состояние раскрытия |

### AccordionContent

Структурная директива, применяемая к `ng-template` внутри панели аккордеона для включения ленивого рендеринга.

У этой директивы нет Input/Output свойств или методов. Примените её к элементу `ng-template`:

```angular-html
<div ngAccordionPanel panelId="item-1">
  <ng-template ngAccordionContent>
    <!-- Content here is lazily rendered -->
  </ng-template>
</div>
```
