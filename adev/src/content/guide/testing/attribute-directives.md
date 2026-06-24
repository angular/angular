# Тестирование атрибутивных директив

_Атрибутивная директива_ изменяет поведение элемента, компонента или другой директивы.
Ее название отражает способ применения: как атрибут хост-элемента.

## Тестирование `HighlightDirective`

`HighlightDirective` из примера приложения устанавливает цвет фона элемента на основе привязанного цвета или цвета по
умолчанию (светло-серый).
Она также устанавливает пользовательское свойство элемента (`customProperty`) в `true` просто для того, чтобы показать,
что это возможно.

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/testing/src/app/shared/highlight.directive.ts"/>

Она используется во всем приложении, возможно, проще всего в `AboutComponent`:

<docs-code header="about.component.ts" path="adev/src/content/examples/testing/src/app/about/about.component.ts"/>

Тестирование конкретного использования `HighlightDirective` внутри `AboutComponent` требует только техник, рассмотренных
в разделе ["Тестирование вложенных компонентов"](guide/testing/components-scenarios#nested-component-tests)
руководства [Сценарии тестирования компонентов](guide/testing/components-scenarios).

<docs-code header="about.component.spec.ts" path="adev/src/content/examples/testing/src/app/about/about.component.spec.ts" region="tests"/>

Однако тестирование одного варианта использования вряд ли раскроет весь спектр возможностей директивы.
Поиск и тестирование всех компонентов, использующих директиву, утомительны, ненадежны и вряд ли обеспечат полное
покрытие.

_Тесты только класса_ (class-only tests) могут быть полезны, но атрибутивные директивы, подобные этой, как правило,
манипулируют DOM.
Изолированные модульные тесты не затрагивают DOM и, следовательно, не внушают уверенности в эффективности директивы.

Лучшее решение — создать искусственный тестовый компонент, демонстрирующий все способы применения директивы.

<docs-code header="highlight.directive.spec.ts (TestComponent)" path="adev/src/content/examples/testing/src/app/shared/highlight.directive.spec.ts" region="test-component"/>

<img alt="HighlightDirective spec in action" src="assets/images/guide/testing/highlight-directive-spec.png">

ПОЛЕЗНО: В случае с `<input>`, `HighlightDirective` привязывается к названию цвета в поле ввода.
Начальное значение — слово "cyan" (голубой), которое должно стать цветом фона поля ввода.

Вот несколько тестов этого компонента:

<docs-code header="highlight.directive.spec.ts (selected tests)" path="adev/src/content/examples/testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests"/>

Стоит отметить несколько техник:

- Предикат `By.directive` — отличный способ получить элементы, имеющие эту директиву, _когда типы их элементов
  неизвестны_.
- [Псевдокласс `:not`](https://developer.mozilla.org/docs/Web/CSS/:not) в `By.css('h2:not([highlight])')` помогает найти
  элементы `<h2>`, у которых _нет_ директивы.
  `By.css('*:not([highlight])')` находит _любой_ элемент, у которого нет директивы.

- `DebugElement.styles` предоставляет доступ к стилям элементов даже при отсутствии реального браузера, благодаря
  абстракции `DebugElement`.
  Но не стесняйтесь использовать `nativeElement`, когда это кажется проще или понятнее, чем абстракция.

- Angular добавляет директиву в инжектор элемента, к которому она применяется.
  Тест для цвета по умолчанию использует инжектор второго `<h2>` для получения экземпляра его `HighlightDirective` и
  значения `defaultColor`.

- `DebugElement.properties` предоставляет доступ к искусственному пользовательскому свойству, которое устанавливается
  директивой.
