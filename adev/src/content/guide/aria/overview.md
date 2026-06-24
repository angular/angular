<docs-decorative-header title="Angular Aria">
</docs-decorative-header>

## Что такое Angular Aria?

Создание доступных компонентов кажется простой задачей, но их реализация в соответствии с рекомендациями W3C по
доступности (W3C Accessibility Guidelines) требует значительных усилий и экспертизы.

Angular Aria — это коллекция headless-директив (без визуального оформления), обеспечивающих доступность и реализующих
распространенные паттерны WAI-ARIA. Директивы берут на себя взаимодействие с клавиатурой, ARIA-атрибуты, управление
фокусом и поддержку скринридеров. Вам остается только предоставить HTML-структуру, CSS-стили и бизнес-логику!

## Установка

```shell
npm install @angular/aria
```

## Демонстрация

Для примера возьмем меню панели инструментов (toolbar menu). Хотя оно может показаться «простым» рядом кнопок, связанных
определенной логикой, клавиатурная навигация и скринридеры добавляют множество неожиданных сложностей для тех, кто не
знаком с доступностью.

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

В этом единственном сценарии разработчикам необходимо учитывать:

- **Клавиатурная навигация**. Пользователи должны открывать меню клавишами Enter или Пробел, перемещаться по опциям
  стрелками, выбирать клавишей Enter и закрывать клавишей Escape.
- **Скринридеры** должны объявлять состояние меню, количество опций и то, какая опция находится в фокусе.
- **Управление фокусом** должно логично перемещаться между триггером и элементами меню.
- **Языки с письмом справа налево (RTL)** требуют возможности навигации в обратном порядке.

## Что включено? {#whats-included}

Angular Aria включает директивы с исчерпывающей документацией, рабочими примерами и справочниками API для
распространенных интерактивных паттернов:

### Поиск и выбор

| Компонент                               | Описание                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| [Autocomplete](guide/aria/autocomplete) | Текстовое поле с фильтруемыми предложениями, появляющимися по мере ввода           |
| [Listbox](guide/aria/listbox)           | Списки опций с одиночным или множественным выбором и клавиатурной навигацией       |
| [Select](guide/aria/select)             | Паттерн выпадающего списка с одиночным выбором и клавиатурной навигацией           |
| [Multiselect](guide/aria/multiselect)   | Паттерн выпадающего списка с множественным выбором и компактным отображением       |
| [Combobox](guide/aria/combobox)         | Примитивная директива, координирующая текстовое поле с всплывающим окном (попапом) |

### Навигация и призывы к действию

| Компонент                     | Описание                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------- |
| [Menu](guide/aria/menu)       | Выпадающие меню с вложенными подменю и горячими клавишами                        |
| [Menubar](guide/aria/menubar) | Горизонтальная навигационная панель для постоянных меню приложения               |
| [Toolbar](guide/aria/toolbar) | Сгруппированные наборы элементов управления с логической клавиатурной навигацией |

### Организация контента

| Компонент                         | Описание                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| [Accordion](guide/aria/accordion) | Сворачиваемые панели контента, которые могут раскрываться по отдельности или эксклюзивно |
| [Tabs](guide/aria/tabs)           | Интерфейсы с вкладками с автоматическим или ручным режимом активации                     |
| [Tree](guide/aria/tree)           | Иерархические списки с функцией развертывания/свертывания                                |
| [Grid](guide/aria/grid)           | Двумерное отображение данных с клавиатурной навигацией по ячейкам                        |

## Когда использовать Angular Aria

Angular Aria отлично подходит, когда вам нужны доступные интерактивные компоненты, соответствующие WCAG, с кастомной
стилизацией. Примеры включают:

- **Создание дизайн-системы** — Ваша команда поддерживает библиотеку компонентов со специфическими визуальными
  стандартами, требующими доступной реализации.
- **Корпоративные библиотеки компонентов** — Вы создаете переиспользуемые компоненты для множества приложений внутри
  организации.
- **Уникальные требования бренда** — Интерфейс должен соответствовать точным спецификациям дизайна, которые сложно
  реализовать с помощью готовых стилизованных библиотек.

## Когда не стоит использовать Angular Aria

Angular Aria может подойти не для каждого сценария:

- **Готовые стилизованные компоненты** — Если вам нужны компоненты, которые выглядят законченными без кастомной
  стилизации, используйте Angular Material.
- **Простые формы** — Нативные элементы управления HTML-форм, такие как `<button>` и `<input type="radio">`,
  обеспечивают встроенную доступность для простых случаев использования.
- **Быстрое прототипирование** — При быстрой проверке концепций библиотеки готовых компонентов сокращают начальное время
  разработки.

## Дальнейшие шаги

Ознакомьтесь с компонентом из боковой навигации или [списка выше](#whats-included), или начните
с [Toolbar](guide/aria/toolbar), чтобы увидеть полный пример того, как работают директивы Angular Aria!
