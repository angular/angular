# Основы тестирования компонентов

Компонент, в отличие от всех остальных частей приложения Angular, объединяет HTML-шаблон и TypeScript-класс.
Компонент — это действительно шаблон и класс, _работающие вместе_.
Чтобы адекватно протестировать компонент, вы должны проверить, что они работают вместе так, как задумано.

Такие тесты требуют создания хост-элемента компонента в DOM браузера (как это делает Angular) и исследования
взаимодействия класса компонента с DOM, описанного в его шаблоне.

Angular `TestBed` облегчает этот вид тестирования, как вы увидите в следующих разделах.
Но во многих случаях _тестирование только класса компонента_, без участия DOM, может подтвердить большую часть поведения
компонента более простым и очевидным способом.

## Тестирование DOM компонента

Компонент — это больше, чем просто его класс.
Компонент взаимодействует с DOM и другими компонентами.
Одни лишь классы не могут сказать вам, будет ли компонент правильно рендериться, реагировать на ввод пользователя и
жесты, или интегрироваться с родительскими и дочерними компонентами.

- Привязан ли метод `Lightswitch.clicked()` к чему-либо так, чтобы пользователь мог его вызвать?
- Отображается ли `Lightswitch.message`?
- Может ли пользователь действительно выбрать героя, отображаемого в `DashboardHeroComponent`?
- Отображается ли имя героя так, как ожидается (например, в верхнем регистре)?
- Отображается ли приветственное сообщение в шаблоне `WelcomeComponent`?

Эти вопросы могут не вызывать затруднений для простых компонентов, проиллюстрированных выше.
Но многие компоненты имеют сложные взаимодействия с элементами DOM, описанными в их шаблонах, заставляя HTML появляться
и исчезать при изменении состояния компонента.

Чтобы ответить на подобные вопросы, вам необходимо создать элементы DOM, связанные с компонентами, изучить DOM, чтобы
подтвердить, что состояние компонента отображается правильно в нужное время, и имитировать взаимодействие пользователя с
экраном, чтобы определить, вызывают ли эти взаимодействия ожидаемое поведение компонента.

Для написания таких тестов вы будете использовать дополнительные возможности `TestBed`, а также другие вспомогательные
средства тестирования.

### Тесты, созданные через CLI

CLI создает начальный файл теста по умолчанию, когда вы просите его сгенерировать новый компонент.

Например, следующая команда CLI генерирует `BannerComponent` в папке `app/banner` (со встроенным шаблоном и стилями):

```shell
ng generate component banner --inline-template --inline-style --module app
```

Она также генерирует начальный файл теста для компонента, `banner-external.component.spec.ts`, который выглядит
следующим образом:

<docs-code header="banner-external.component.spec.ts (initial)" path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v1"/>

HELPFUL: Поскольку `compileComponents` является асинхронным, он использует утилиту [
`waitForAsync`](api/core/testing/waitForAsync), импортируемую из `@angular/core/testing`.

Обратитесь к разделу [waitForAsync](guide/testing/components-scenarios#waitForAsync) для получения более подробной
информации.

### Упрощение настройки

Только последние три строки этого файла фактически тестируют компонент, и все, что они делают, — это утверждают, что
Angular может создать компонент.

Остальная часть файла — это шаблонный код настройки, предусматривающий более сложные тесты, которые _могут_
понадобиться, если компонент превратится во что-то существенное.

Вы узнаете об этих продвинутых возможностях тестирования в следующих разделах.
А пока вы можете радикально сократить этот файл теста до более управляемого размера:

<docs-code header="banner-initial.component.spec.ts (minimal)" path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v2"/>

В этом примере объект метаданных, передаваемый в `TestBed.configureTestingModule`, просто объявляет `BannerComponent` —
компонент для тестирования.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="configureTestingModule"/>

HELPFUL: Нет необходимости объявлять или импортировать что-либо еще.
Модуль тестирования по умолчанию предварительно настроен с чем-то вроде `BrowserModule` из `@angular/platform-browser`.

Позже вы будете вызывать `TestBed.configureTestingModule()` с импортами, провайдерами и другими объявлениями,
соответствующими вашим потребностям в тестировании.
Необязательные методы `override` могут дополнительно точно настроить аспекты конфигурации.

### `createComponent()`

После настройки `TestBed` вы вызываете его метод `createComponent()`.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="createComponent"/>

`TestBed.createComponent()` создает экземпляр `BannerComponent`, добавляет соответствующий элемент в DOM тест-раннера и
возвращает [`ComponentFixture`](#componentfixture).

IMPORTANT: Не перенастраивайте `TestBed` после вызова `createComponent`.

Метод `createComponent` замораживает текущее определение `TestBed`, закрывая его для дальнейшей настройки.

Вы не можете вызывать никакие методы конфигурации `TestBed`: ни `configureTestingModule()`, ни `get()`, ни какие-либо
методы `override...`.
Если вы попытаетесь, `TestBed` выдаст ошибку.

### `ComponentFixture`

[ComponentFixture](api/core/testing/ComponentFixture) — это тестовая обвязка для взаимодействия с созданным компонентом
и его соответствующим элементом.

Получите доступ к экземпляру компонента через фикстуру и подтвердите его существование с помощью ожидания Jasmine:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="componentInstance"/>

### `beforeEach()`

Вы будете добавлять больше тестов по мере развития этого компонента.
Вместо того чтобы дублировать конфигурацию `TestBed` для каждого теста, выполните рефакторинг, чтобы вынести настройку в
`beforeEach()` Jasmine и некоторые вспомогательные переменные:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v3"/>

Теперь добавьте тест, который получает элемент компонента из `fixture.nativeElement` и ищет ожидаемый текст.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-2"/>

### `nativeElement`

Значение `ComponentFixture.nativeElement` имеет тип `any`.
Позже вы столкнетесь с `DebugElement.nativeElement`, и он тоже имеет тип `any`.

Angular не может знать во время компиляции, каким HTML-элементом является `nativeElement`, и является ли он вообще
HTML-элементом.
Приложение может работать на _небраузерной платформе_, такой как сервер
или [Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API), где элемент может иметь урезанный API или
не существовать вовсе.

Тесты в этом руководстве предназначены для запуска в браузере, поэтому значение `nativeElement` всегда будет
`HTMLElement` или одним из его производных классов.

Зная, что это какой-то `HTMLElement`, используйте стандартный HTML `querySelector`, чтобы углубиться в дерево элементов.

Вот еще один тест, который вызывает `HTMLElement.querySelector`, чтобы получить элемент абзаца и найти текст баннера:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-3"/>

### `DebugElement`

_Фикстура_ Angular предоставляет элемент компонента напрямую через `fixture.nativeElement`.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="nativeElement"/>

На самом деле это вспомогательный метод, реализованный как `fixture.debugElement.nativeElement`.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="debugElement-nativeElement"/>

Для такого окольного пути к элементу есть веская причина.

Свойства `nativeElement` зависят от среды выполнения.
Вы можете запускать эти тесты на _небраузерной_ платформе, которая не имеет DOM или чья эмуляция DOM не поддерживает
полный API `HTMLElement`.

Angular полагается на абстракцию `DebugElement` для безопасной работы на _всех поддерживаемых платформах_.
Вместо создания дерева HTML-элементов, Angular создает дерево `DebugElement`, которое оборачивает _нативные элементы_
для платформы выполнения.
Свойство `nativeElement` разворачивает `DebugElement` и возвращает специфичный для платформы объект элемента.

Поскольку примеры тестов для этого руководства предназначены для запуска только в браузере, `nativeElement` в этих
тестах всегда является `HTMLElement`, знакомые методы и свойства которого вы можете исследовать в рамках теста.

Вот предыдущий тест, реализованный заново с использованием `fixture.debugElement.nativeElement`:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-4"/>

У `DebugElement` есть и другие методы и свойства, полезные в тестах, как вы увидите в других частях этого руководства.

Вы импортируете символ `DebugElement` из основной библиотеки Angular.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="import-debug-element"/>

### `By.css()`

Хотя все тесты в этом руководстве выполняются в браузере, некоторые приложения могут работать на другой платформе, по
крайней мере, часть времени.

Например, компонент может сначала рендериться на сервере как часть стратегии по ускорению запуска приложения на
устройствах с плохим соединением.
Рендеринг на стороне сервера может не поддерживать полный API HTML-элементов.
Если он не поддерживает `querySelector`, предыдущий тест может упасть.

`DebugElement` предлагает методы запросов, которые работают для всех поддерживаемых платформ.
Эти методы запросов принимают функцию-_предикат_, которая возвращает `true`, когда узел в дереве `DebugElement`
соответствует критериям выборки.

Вы создаете _предикат_ с помощью класса `By`, импортируемого из библиотеки для платформы выполнения.
Вот импорт `By` для браузерной платформы:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="import-by"/>

Следующий пример заново реализует предыдущий тест с использованием `DebugElement.query()` и браузерного метода `By.css`.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-5"/>

Некоторые примечательные наблюдения:

- Статический метод `By.css()` выбирает узлы `DebugElement` с
  помощью [стандартного CSS-селектора](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors 'CSS selectors').
- Запрос возвращает `DebugElement` для абзаца.
- Вы должны развернуть этот результат, чтобы получить элемент абзаца.

Когда вы фильтруете по CSS-селектору и тестируете только свойства _нативного элемента_ браузера, подход с `By.css` может
быть излишним.

Часто проще и понятнее фильтровать с помощью стандартного метода `HTMLElement`, такого как `querySelector()` или
`querySelectorAll()`.
