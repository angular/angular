<docs-decorative-header title="Tree">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/treeview/" title="Паттерн Tree ARIA"/>
  <docs-pill href="/api/aria/tree/Tree" title="Справочник API Tree"/>
</docs-pill-row>

## Обзор

Дерево отображает иерархические данные, где элементы могут разворачиваться, чтобы показать дочерние элементы, или
сворачиваться, чтобы скрыть их. Пользователи перемещаются с помощью клавиш со стрелками, разворачивают и сворачивают
узлы, а также могут выбирать элементы для навигации или сценариев выбора данных.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css"/>
</docs-code-multifile>

## Использование

Деревья хорошо подходят для отображения иерархических данных, где пользователям необходимо перемещаться по вложенным
структурам.

**Используйте деревья, когда:**

- Создаете навигацию по файловой системе
- Показываете иерархию папок и документов
- Создаете вложенные структуры меню
- Отображаете организационные диаграммы
- Просматриваете иерархические данные
- Реализуете навигацию по сайту с вложенными разделами

**Избегайте использования деревьев, когда:**

- Отображаете плоские списки (вместо этого используйте [Listbox](guide/aria/listbox))
- Показываете таблицы данных (вместо этого используйте [Grid](guide/aria/grid))
- Создаете простые выпадающие списки (вместо этого используйте [Select](guide/aria/select))
- Создаете навигацию типа «хлебные крошки» (используйте паттерны breadcrumb)

## Возможности

- **Иерархическая навигация** - Вложенная структура дерева с функциональностью развертывания и свертывания
- **Режимы выбора** - Одиночный или множественный выбор с явным действием или следованием за фокусом
- **Выбор следует за фокусом** - Опциональный автоматический выбор при изменении фокуса
- **Клавиатурная навигация** - Клавиши со стрелками, Home, End и поиск при наборе (type-ahead)
- **Развертывание/свертывание** - Стрелки Вправо/Влево или Enter для переключения родительских узлов
- **Отключенные элементы** - Отключение определенных узлов с управлением фокусом
- **Режимы фокуса** - Стратегии фокуса Roving tabindex или activedescendant
- **Поддержка RTL** - Навигация для языков с письмом справа налево

## Примеры

### Дерево навигации

Используйте дерево для навигации, где нажатие на элементы вызывает действия, а не выбирает их.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Установите `[nav]="true"` для включения режима навигации. Это использует `aria-current` для указания текущей страницы
вместо выделения.

### Одиночный выбор

Включите одиночный выбор для сценариев, где пользователи выбирают один элемент из дерева.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Оставьте `[multi]="false"` (по умолчанию) для одиночного выбора. Пользователи нажимают Пробел, чтобы выбрать элемент в
фокусе.

### Множественный выбор

Позвольте пользователям выбирать несколько элементов из дерева.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Установите `[multi]="true"` для дерева. Пользователи выбирают элементы по отдельности с помощью Пробела или выбирают
диапазоны с помощью Shift+Стрелки.

### Выбор следует за фокусом

Когда выбор следует за фокусом, элемент, находящийся в фокусе, выбирается автоматически. Это упрощает взаимодействие в
сценариях навигации.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Установите `[selectionMode]="'follow'"` для дерева. Выбор автоматически обновляется по мере навигации пользователя с
помощью клавиш со стрелками.

### Отключенные элементы дерева

Отключайте определенные узлы дерева, чтобы предотвратить взаимодействие. Управляйте тем, могут ли отключенные элементы
получать фокус.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Когда `[softDisabled]="true"` в дереве, отключенные элементы могут получать фокус, но не могут быть активированы или
выбраны. Когда `[softDisabled]="false"`, отключенные элементы пропускаются при навигации с клавиатуры.

## API

### Tree

Контейнерная директива, управляющая иерархической навигацией и выбором.

#### Inputs

| Свойство        | Тип                              | По умолчанию | Описание                                                                   |
| --------------- | -------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `disabled`      | `boolean`                        | `false`      | Отключает все дерево                                                       |
| `softDisabled`  | `boolean`                        | `true`       | Если `true`, отключенные элементы могут получать фокус, но не интерактивны |
| `multi`         | `boolean`                        | `false`      | Можно ли выбирать несколько элементов                                      |
| `selectionMode` | `'explicit' \| 'follow'`         | `'explicit'` | Требует ли выбор явного действия или следует за фокусом                    |
| `nav`           | `boolean`                        | `false`      | Находится ли дерево в режиме навигации (использует `aria-current`)         |
| `wrap`          | `boolean`                        | `true`       | Зацикливается ли клавиатурная навигация с последнего на первый элемент     |
| `focusMode`     | `'roving' \| 'activedescendant'` | `'roving'`   | Стратегия фокуса, используемая деревом                                     |
| `values`        | `any[]`                          | `[]`         | Значения выбранных элементов (поддерживает двустороннюю привязку)          |

#### Методы

| Метод            | Параметры | Описание                                                      |
| ---------------- | --------- | ------------------------------------------------------------- |
| `expandAll`      | нет       | Разворачивает все узлы дерева                                 |
| `collapseAll`    | нет       | Сворачивает все узлы дерева                                   |
| `selectAll`      | нет       | Выбирает все элементы (только в режиме множественного выбора) |
| `clearSelection` | нет       | Очищает весь выбор                                            |

### TreeItem

Отдельный узел в дереве, который может содержать дочерние узлы.

#### Inputs

| Свойство   | Тип       | По умолчанию | Описание                                                       |
| ---------- | --------- | ------------ | -------------------------------------------------------------- |
| `value`    | `any`     | —            | **Обязательно.** Уникальное значение для этого элемента дерева |
| `disabled` | `boolean` | `false`      | Отключает этот элемент                                         |
| `expanded` | `boolean` | `false`      | Развернут ли узел (поддерживает двустороннюю привязку)         |

#### Сигналы (Signals)

| Свойство      | Тип               | Описание                                      |
| ------------- | ----------------- | --------------------------------------------- |
| `selected`    | `Signal<boolean>` | Выбран ли элемент                             |
| `active`      | `Signal<boolean>` | Находится ли элемент в данный момент в фокусе |
| `hasChildren` | `Signal<boolean>` | Имеет ли элемент дочерние узлы                |

#### Методы

| Метод      | Параметры | Описание                            |
| ---------- | --------- | ----------------------------------- |
| `expand`   | нет       | Разворачивает этот узел             |
| `collapse` | нет       | Сворачивает этот узел               |
| `toggle`   | нет       | Переключает состояние развертывания |

### TreeGroup

Контейнер для дочерних элементов дерева.

У этой директивы нет Input-ов, Output-ов или методов. Она служит контейнером для организации дочерних элементов
`ngTreeItem`:

```angular-html
<li ngTreeItem value="parent">
  Parent Item
  <ul ngTreeGroup>
    <li ngTreeItem value="child1">Child 1</li>
    <li ngTreeItem value="child2">Child 2</li>
  </ul>
</li>
```
