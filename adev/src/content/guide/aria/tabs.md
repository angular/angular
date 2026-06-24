<docs-decorative-header title="Вкладки">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" title="ARIA-паттерн вкладок"/>
  <docs-pill href="/api/aria/tabs/Tabs" title="Справочник API вкладок"/>
</docs-pill-row>

## Обзор

Вкладки отображают многослойные разделы контента, где одновременно видна только одна панель. Пользователи переключаются
между панелями, нажимая на кнопки вкладок или используя клавиши со стрелками для навигации по списку вкладок.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Использование

Вкладки хорошо подходят для организации связанного контента в отдельные разделы, где пользователи переключаются между
различными видами или категориями.

**Используйте вкладки при:**

- Организации связанного контента в отдельные разделы
- Создании панелей настроек с несколькими категориями
- Создании документации с несколькими темами
- Реализации дашбордов с различными видами
- Отображении контента, где пользователям нужно переключать контекст

**Избегайте вкладок при:**

- Создании последовательных форм или мастеров (используйте паттерн stepper)
- Навигации между страницами (используйте навигацию роутера)
- Отображении одиночных разделов контента (вкладки не нужны)
- Использовании более 7-8 вкладок (рассмотрите другой макет)

## Возможности

- **Режимы выбора** - Вкладки активируются автоматически при фокусе или требуют ручной активации
- **Клавиатурная навигация** - Клавиши со стрелками, Home и End для эффективной навигации по вкладкам
- **Ориентация** - Горизонтальное или вертикальное расположение списка вкладок
- **Ленивый контент** - Панели вкладок рендерятся только при первой активации
- **Отключенные вкладки** - Отключение отдельных вкладок с управлением фокусом
- **Режимы фокуса** - Стратегии фокуса Roving tabindex или activedescendant
- **Поддержка RTL** - Навигация для языков с письмом справа налево

## Примеры

### Выбор следует за фокусом

Когда выбор следует за фокусом, вкладки активируются сразу же при навигации клавишами со стрелками. Это обеспечивает
мгновенную обратную связь и хорошо подходит для легковесного контента.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Установите `[selectionMode]="'follow'"` в списке вкладок, чтобы включить это поведение.

### Ручная активация

При ручной активации клавиши со стрелками перемещают фокус между вкладками без изменения выбранной вкладки. Пользователи
нажимают Space или Enter для активации сфокусированной вкладки.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Используйте `[selectionMode]="'explicit'"` для панелей с тяжелым контентом, чтобы избежать ненужного рендеринга.

### Вертикальные вкладки

Располагайте вкладки вертикально для таких интерфейсов, как панели настроек или боковые панели навигации.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/vertical/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/vertical/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/vertical/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/vertical/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/vertical/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/vertical/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/vertical/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/vertical/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Установите `[orientation]="'vertical'"` в списке вкладок. Навигация меняется на клавиши со стрелками Вверх/Вниз.

### Ленивый рендеринг контента

Используйте директиву `ngTabContent` на `ng-template`, чтобы отложить рендеринг панелей вкладок до момента их первого
показа.

```angular-html
<div ngTabs>
  <ul ngTabList [(selectedTab)]="selectedTab">
    <li ngTab value="tab1">Tab 1</li>
    <li ngTab value="tab2">Tab 2</li>
  </ul>

  <div ngTabPanel value="tab1">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 1 is first shown -->
      <app-heavy-component />
    </ng-template>
  </div>

  <div ngTabPanel value="tab2">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 2 is first shown -->
      <app-another-component />
    </ng-template>
  </div>
</div>
```

По умолчанию контент остается в DOM после скрытия панели. Установите `[preserveContent]="false"`, чтобы удалять контент
при деактивации панели.

### Отключенные вкладки

Отключайте определенные вкладки, чтобы предотвратить взаимодействие с пользователем. Управляйте тем, могут ли
отключенные вкладки получать фокус клавиатуры.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Когда `[softDisabled]="true"` в списке вкладок, отключенные вкладки могут получать фокус, но не могут быть активированы.
Когда `[softDisabled]="false"`, отключенные вкладки пропускаются при навигации с клавиатуры.

## API

### Tabs

Директива-контейнер, координирующая списки вкладок и панели.

У этой директивы нет входных или выходных свойств. Она служит корневым контейнером для директив `ngTabList`, `ngTab` и
`ngTabPanel`.

### TabList

Контейнер для кнопок вкладок, управляющий выбором и навигацией с клавиатуры.

#### Inputs

| Свойство        | Тип                          | По умолчанию   | Описание                                                                |
| --------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------- |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Направление макета списка вкладок                                       |
| `wrap`          | `boolean`                    | `false`        | Зацикливается ли навигация с клавиатуры с последней на первую вкладку   |
| `softDisabled`  | `boolean`                    | `true`         | При `true` отключенные вкладки фокусируемые, но не активируемые         |
| `selectionMode` | `'follow' \| 'explicit'`     | `'follow'`     | Активируются ли вкладки при фокусе или требуют явной активации          |
| `selectedTab`   | `any`                        | —              | Значение текущей выбранной вкладки (поддерживает двустороннюю привязку) |

### Tab

Отдельная кнопка вкладки.

#### Inputs

| Свойство   | Тип       | По умолчанию | Описание                                              |
| ---------- | --------- | ------------ | ----------------------------------------------------- |
| `value`    | `any`     | —            | **Обязательно.** Уникальное значение для этой вкладки |
| `disabled` | `boolean` | `false`      | Отключает эту вкладку                                 |

#### Signals

| Свойство   | Тип               | Описание                           |
| ---------- | ----------------- | ---------------------------------- |
| `selected` | `Signal<boolean>` | Выбрана ли вкладка в данный момент |
| `active`   | `Signal<boolean>` | Находится ли вкладка в фокусе      |

### TabPanel

Панель контента, связанная с вкладкой.

#### Inputs

| Свойство          | Тип       | По умолчанию | Описание                                                      |
| ----------------- | --------- | ------------ | ------------------------------------------------------------- |
| `value`           | `any`     | —            | **Обязательно.** Должно совпадать с `value` связанной вкладки |
| `preserveContent` | `boolean` | `true`       | Сохранять ли контент панели в DOM после деактивации           |

#### Signals

| Свойство  | Тип               | Описание                         |
| --------- | ----------------- | -------------------------------- |
| `visible` | `Signal<boolean>` | Видима ли панель в данный момент |

### TabContent

Структурная директива для ленивого рендеринга контента панели вкладки.

У этой директивы нет входных свойств, выходных свойств или методов. Примените её к элементу `ng-template` внутри панели
вкладки:

```angular-html
<div ngTabPanel value="tab1">
  <ng-template ngTabContent>
    <!-- Content here is lazily rendered -->
  </ng-template>
</div>
```
