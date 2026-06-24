<docs-decorative-header title="Menubar">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="ARIA-паттерн строки меню"/>
  <docs-pill href="/api/aria/menu/MenuBar" title="Справочник API Menubar"/>
</docs-pill-row>

## Обзор

Строка меню (menubar) — это горизонтальная панель навигации, которая обеспечивает постоянный доступ к меню приложения.
Строки меню организуют команды в логические категории, такие как Файл, Правка и Вид, помогая пользователям находить и
выполнять функции приложения с помощью клавиатуры или мыши.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование

Строки меню хорошо подходят для организации команд приложения в постоянную и понятную навигацию.

**Используйте строку меню, когда:**

- Создаете панели команд приложения (такие как Файл, Правка, Вид, Вставка, Формат)
- Создаете постоянную навигацию, которая остается видимой во всем интерфейсе
- Организуете команды в логические категории верхнего уровня
- Необходима горизонтальная навигация по меню с поддержкой клавиатуры
- Создаете интерфейсы приложений в десктопном стиле

**Избегайте использования строки меню, когда:**

- Создаете выпадающие меню для отдельных действий (вместо этого используйте [Меню с триггером](guide/aria/menu))
- Создаете контекстные меню (используйте паттерн [Меню](guide/aria/menu))
- Создаете простые списки отдельных действий (вместо этого используйте [Меню](guide/aria/menu))
- Разрабатываете мобильные интерфейсы, где горизонтальное пространство ограничено
- Навигация должна располагаться в боковой панели или в шапке сайта

## Возможности

- **Горизонтальная навигация** — Клавиши со стрелками Влево/Вправо перемещают фокус между категориями верхнего уровня
- **Постоянная видимость** — Всегда видна, не является модальной или скрываемой
- **Открытие при наведении** — Подменю открываются при наведении курсора после первого взаимодействия с клавиатурой или
  клика
- **Вложенные подменю** — Поддержка нескольких уровней вложенности меню
- **Навигация с клавиатуры** — Клавиши со стрелками, Enter/Пробел, Escape и поиск при наборе (typeahead)
- **Отключенные состояния** — Отключение всей строки меню или отдельных элементов
- **Поддержка RTL** — Автоматическая навигация для языков с письмом справа налево

## Примеры

### Базовая строка меню

Строка меню обеспечивает постоянный доступ к командам приложения, организованным в категории верхнего уровня.
Пользователи перемещаются между категориями с помощью стрелок Влево/Вправо и открывают меню клавишами Enter или Стрелка
вниз.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Нажмите стрелку Вправо для перемещения между Файл, Правка и Вид. Нажмите Enter или стрелку Вниз, чтобы открыть меню и
перемещаться по элементам подменю с помощью стрелок Вверх/Вниз.

### Отключенные элементы строки меню

Отключите конкретные элементы меню или всю строку меню, чтобы предотвратить взаимодействие. Управляйте тем, могут ли
отключенные элементы получать фокус клавиатуры, с помощью Input-свойства `softDisabled`.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Когда `[softDisabled]="true"` установлено для строки меню, отключенные элементы могут получать фокус, но не могут быть
активированы. Когда `[softDisabled]="false"`, отключенные элементы пропускаются при навигации с клавиатуры.

### Поддержка RTL

Строки меню автоматически адаптируются к языкам с письмом справа налево (RTL). Направление навигации стрелками меняется
на противоположное, а подменю располагаются с левой стороны.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Атрибут `dir="rtl"` включает режим RTL. Стрелка Влево перемещает вправо, стрелка Вправо перемещает влево, сохраняя
естественную навигацию для пользователей RTL-языков.

## API

Паттерн строки меню использует директивы из библиотеки Angular Aria. Смотрите [руководство по Menu](guide/aria/menu) для
получения полной документации по API.

### MenuBar

Горизонтальный контейнер для элементов меню верхнего уровня.

#### Input-свойства

| Свойство       | Тип       | По умолчанию | Описание                                                                                      |
| -------------- | --------- | ------------ | --------------------------------------------------------------------------------------------- |
| `disabled`     | `boolean` | `false`      | Отключает всю строку меню                                                                     |
| `wrap`         | `boolean` | `true`       | Определяет, переходит ли навигация с клавиатуры от последнего элемента к первому (циклически) |
| `softDisabled` | `boolean` | `true`       | Если `true`, отключенные элементы могут получать фокус, но не интерактивны                    |

Смотрите [документацию API Menu](guide/aria/menu#apis) для получения полной информации обо всех доступных
Input-свойствах и Сигналах.

### MenuItem

Отдельные элементы внутри строки меню. Тот же API, что и у Menu — см. [MenuItem](guide/aria/menu#menuitem).

**Специфичное поведение для строки меню:**

- Стрелки Влево/Вправо перемещают между элементами строки меню (в отличие от Вверх/Вниз в вертикальных меню)
- Первое взаимодействие с клавиатурой или клик включает открытие подменю при наведении
- Enter или стрелка Вниз открывает подменю и фокусирует первый элемент
- `aria-haspopup="menu"` указывает на элементы с подменю

### MenuTrigger

Обычно не используется в строках меню — MenuItem обрабатывает поведение триггера напрямую, если у него есть связанное
подменю. Смотрите [MenuTrigger](guide/aria/menu#menutrigger) для паттернов автономных триггеров меню.
