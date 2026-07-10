<docs-decorative-header title="Angular Aria">
</docs-decorative-header>

## Что такое Angular Aria? {#what-is-angular-aria}

Создание доступных компонентов кажется простым, но реализация по [W3C Accessibility Guidelines](https://www.w3.org/TR/wcag/) требует значительных усилий и экспертизы в accessibility.

Angular Aria — набор headless, доступных директив, реализующих распространённые [паттерны WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/). Директивы обрабатывают клавиатурные взаимодействия, ARIA-атрибуты, управление фокусом и поддержку screen reader. Вам остаётся предоставить HTML-структуру, CSS-стили и бизнес-логику!

## Установка {#installation}

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install @angular/aria
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add @angular/aria
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add @angular/aria
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add @angular/aria
  </docs-code>
</docs-code-multifile>

## Showcase {#showcase}

Например, возьмём toolbar menu. На вид это «простой» ряд кнопок со связанной логикой, но клавиатурная навигация и screen reader добавляют много неожиданной сложности для тех, кто мало знаком с accessibility.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

В этом сценарии разработчикам нужно учесть:

- **Клавиатурную навигацию**. Пользователи должны открывать меню Enter или Space, перемещаться по опциям стрелками, выбирать Enter и закрывать Escape.
- **Screen readers** должны объявлять состояние меню, число опций и какая опция в фокусе.
- **Управление фокусом** должно логично перемещаться между trigger и пунктами меню.
- **Языки справа налево** требуют возможности навигации в обратном направлении.

## Что входит в комплект? {#whats-included}

Angular Aria включает директивы с подробной документацией, рабочими примерами и API reference для распространённых интерактивных паттернов:

### Поиск и выбор {#search-and-selection}

| Компонент                               | Описание                                                         |
| --------------------------------------- | ---------------------------------------------------------------- |
| [Autocomplete](guide/aria/autocomplete) | Текстовый ввод с отфильтрованными подсказками по мере ввода      |
| [Listbox](guide/aria/listbox)           | Списки опций с одиночным или множественным выбором и клавиатурой |
| [Select](guide/aria/select)             | Паттерн dropdown с одиночным выбором и клавиатурной навигацией   |
| [Multiselect](guide/aria/multiselect)   | Паттерн dropdown с множественным выбором и компактным отображением |
| [Combobox](guide/aria/combobox)         | Примитивная директива, координирующая текстовый ввод с popup     |

### Навигация и действия {#navigation-and-call-to-actions}

| Компонент                     | Описание                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| [Menu](guide/aria/menu)       | Выпадающие меню со вложенными подменю и горячими клавишами |
| [Menubar](guide/aria/menubar) | Горизонтальная панель навигации для постоянных меню приложения |
| [Toolbar](guide/aria/toolbar) | Группы элементов управления с логичной клавиатурной навигацией |

### Организация контента {#content-organization}

| Компонент                         | Описание                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| [Accordion](guide/aria/accordion) | Сворачиваемые панели контента — по одной или взаимоисключающе            |
| [Tabs](guide/aria/tabs)           | Вкладки с режимами автоматической или ручной активации                   |
| [Tree](guide/aria/tree)           | Иерархические списки с раскрытием/сворачиванием                          |
| [Grid](guide/aria/grid)           | Двумерное отображение данных с клавиатурной навигацией по ячейкам        |

## Когда использовать Angular Aria {#when-to-use-angular-aria}

Angular Aria хорошо подходит, когда нужны доступные интерактивные компоненты, соответствующие WCAG, с кастомными стилями. Примеры:

- **Создание дизайн-системы** — команда поддерживает библиотеку компонентов с конкретными визуальными стандартами и нуждается в доступных реализациях
- **Корпоративные библиотеки компонентов** — вы создаёте переиспользуемые компоненты для нескольких приложений в организации
- **Требования бренда** — интерфейс должен точно соответствовать дизайн-спецификациям, которые готовые стилизованные библиотеки плохо покрывают

## Когда не использовать Angular Aria {#when-not-to-use-angular-aria}

Angular Aria подходит не для каждого сценария:

- **Готовые стилизованные компоненты** — если нужны компоненты, которые выглядят завершённо без кастомных стилей, используйте Angular Material
- **Простые формы** — нативные HTML-контролы вроде `<button>` и `<input type="radio">` дают встроенную доступность для простых случаев
- **Быстрое прототипирование** — при быстрой проверке идей готовые стилизованные библиотеки сокращают начальное время разработки

## Следующие шаги {#next-steps}

Выберите компонент в боковой навигации или [в списке выше](#whats-included), либо начните с [Toolbar](guide/aria/toolbar), чтобы увидеть полный пример работы директив Angular Aria!
