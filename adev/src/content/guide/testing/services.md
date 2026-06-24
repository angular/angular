# Тестирование сервисов

NOTE: Хотя это руководство обновляется для Vitest, некоторые примеры кода в настоящее время используют синтаксис и API
Karma/Jasmine. Мы активно работаем над предоставлением эквивалентов для Vitest там, где это применимо.

Чтобы убедиться, что ваши сервисы работают так, как задумано, вы можете написать для них специальные тесты.

Сервисы часто проще всего покрыть юнит-тестами.
Вот несколько синхронных и асинхронных юнит-тестов `ValueService`, написанных без помощи утилит тестирования Angular.

<docs-code header="demo.spec.ts" path="adev/src/content/examples/testing/src/app/demo/demo.spec.ts" region="ValueService"/>

## Тестирование сервисов с помощью `TestBed`

Ваше приложение полагается на [внедрение зависимостей (DI)](guide/di) Angular для создания сервисов.
Когда у сервиса есть зависимый сервис, DI находит или создает этот зависимый сервис.
А если у этого зависимого сервиса есть свои собственные зависимости, DI находит или создает и их.

Как _потребитель_ сервиса, вы не беспокоитесь об этом.
Вы не беспокоитесь о порядке аргументов конструктора или о том, как они создаются.

Как _тестировщик_ сервиса, вы должны думать по крайней мере о первом уровне зависимостей сервиса, но вы _можете_
позволить Angular DI заниматься созданием сервиса и порядком аргументов конструктора, используя утилиту тестирования
`TestBed` для предоставления и создания сервисов.

## Angular `TestBed`

`TestBed` — самая важная из утилит тестирования Angular.
`TestBed` создает динамически сконструированный _тестовый_ модуль Angular, который эмулирует
Angular [@NgModule](guide/ngmodules).

Метод `TestBed.configureTestingModule()` принимает объект метаданных, который может содержать большинство
свойств [@NgModule](guide/ngmodules).

Чтобы протестировать сервис, вы устанавливаете свойство метаданных `providers` с массивом сервисов, которые вы будете
тестировать или мокать (mock).

<docs-code header="demo.testbed.spec.ts (provide ValueService in beforeEach)" path="adev/src/content/examples/testing/src/app/demo/demo.testbed.spec.ts" region="value-service-before-each"/>

Затем внедрите его внутри теста, вызвав `TestBed.inject()` с классом сервиса в качестве аргумента.

HELPFUL: `TestBed.get()` устарел, начиная с Angular версии 9.
Чтобы минимизировать критические изменения, Angular вводит новую функцию под названием `TestBed.inject()`, которую
следует использовать вместо него.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-it"/>

Или внутри `beforeEach()`, если вы предпочитаете внедрять сервис как часть вашей настройки.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-before-each"> </docs-code>

При тестировании сервиса с зависимостью, предоставьте мок (mock) в массиве `providers`.

В следующем примере мок — это spy-объект.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.testbed.spec.ts" region="master-service-before-each"/>

Тест использует этот spy так же, как и раньше.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.testbed.spec.ts" region="master-service-it"/>

## Тестирование без `beforeEach()`

Большинство наборов тестов в этом руководстве вызывают `beforeEach()` для установки предусловий для каждого теста `it()`
и полагаются на `TestBed` для создания классов и внедрения сервисов.

Существует другая школа тестирования, которая никогда не вызывает `beforeEach()` и предпочитает создавать классы явно, а
не использовать `TestBed`.

Вот как можно переписать один из тестов `MasterService` в этом стиле.

Начните с размещения повторно используемого подготовительного кода в функции _setup_ вместо `beforeEach()`.

<docs-code header="demo.spec.ts (setup)" path="adev/src/content/examples/testing/src/app/demo/demo.spec.ts" region="no-before-each-setup"/>

Функция `setup()` возвращает литерал объекта с переменными, такими как `masterService`, на которые может ссылаться тест.
Вы не определяете _полуглобальные_ переменные (например, `let masterService: MasterService`) в теле `describe()`.

Затем каждый тест вызывает `setup()` в своей первой строке, прежде чем продолжить шаги, которые манипулируют объектом
тестирования и проверяют ожидания.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.spec.ts" region="no-before-each-test"/>

Обратите внимание, как тест
использует [деструктурирующее присваивание](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
для извлечения необходимых переменных настройки.

<docs-code path="adev/src/content/examples/testing/src/app/demo/demo.spec.ts" region="no-before-each-setup-call"/>

Многие разработчики считают этот подход более чистым и явным, чем традиционный стиль с `beforeEach()`.

Хотя это руководство по тестированию следует традиционному стилю, и [схемы CLI](https://github.com/angular/angular-cli)
по умолчанию генерируют файлы тестов с `beforeEach()` и `TestBed`, не стесняйтесь применять _этот альтернативный подход_
в своих проектах.

## Тестирование HTTP-сервисов

Сервисы данных, которые выполняют HTTP-вызовы к удаленным серверам, обычно внедряют сервис Angular [
`HttpClient`](guide/http/testing) и делегируют ему XHR-вызовы.

Вы можете протестировать сервис данных с внедренным шпионом (spy) `HttpClient` так же, как вы тестируете любой сервис с
зависимостью.

<docs-code header="hero.service.spec.ts (tests with spies)" path="adev/src/content/examples/testing/src/app/model/hero.service.spec.ts" region="test-with-spies"/>

IMPORTANT: Методы `HeroService` возвращают `Observable`.
Вы должны _подписаться_ на Observable, чтобы (а) заставить его выполниться и (б) утверждать, что метод завершился
успешно или с ошибкой.

Метод `subscribe()` принимает колбэки успеха (`next`) и неудачи (`error`).
Убедитесь, что вы предоставили _оба_ колбэка, чтобы перехватить ошибки.
Пренебрежение этим приводит к асинхронной неперехваченной ошибке Observable, которую раннер тестов, скорее всего,
припишет совершенно другому тесту.

## `HttpClientTestingModule`

Расширенные взаимодействия между сервисом данных и `HttpClient` могут быть сложными и трудными для имитации с помощью
шпионов (spies).

`HttpClientTestingModule` может сделать эти сценарии тестирования более управляемыми.

Хотя _пример кода_, сопровождающий это руководство, демонстрирует `HttpClientTestingModule`, эта страница отсылает
к [руководству по Http](guide/http/testing), которое подробно описывает тестирование с помощью
`HttpClientTestingModule`.
