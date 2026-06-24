# Сценарии тестирования компонентов

В этом руководстве рассматриваются распространенные сценарии использования тестирования компонентов.

## Привязка компонента

В примере приложения `BannerComponent` отображает статический текст заголовка в HTML-шаблоне.

После нескольких изменений `BannerComponent` отображает динамический заголовок, привязываясь к свойству компонента `title` следующим образом.

<docs-code header="banner.component.ts" path="adev/src/content/examples/testing/src/app/banner/banner.component.ts" region="component"/>

Несмотря на простоту, вы решаете добавить тест, чтобы подтвердить, что компонент действительно отображает правильный контент там, где это ожидается.

### Запрос элемента `<h1>`

Вы напишете последовательность тестов, которые проверяют значение элемента `<h1>`, содержащего интерполяционную привязку свойства _title_.

Вы обновляете `beforeEach`, чтобы найти этот элемент с помощью стандартного HTML `querySelector` и присвоить его переменной `h1`.

<docs-code header="banner.component.spec.ts (setup)" path="adev/src/content/examples/testing/src/app/banner/banner.component.spec.ts" region="setup"/>

### `createComponent()` не выполняет привязку данных

Для первого теста вы хотите убедиться, что на экране отображается `title` по умолчанию.
Интуиция подсказывает написать тест, который сразу проверяет `<h1>`, например так:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner.component.spec.ts" region="expect-h1-default-v1"/>

_Этот тест не проходит_ с сообщением:

<docs-code language="javascript">

expected '' to contain 'Test Tour of Heroes'.

</docs-code>

Привязка происходит, когда Angular выполняет **обнаружение изменений** (change detection).

В продакшене обнаружение изменений запускается автоматически, например, когда Angular создает компонент или пользователь нажимает клавишу.

`TestBed.createComponent` не запускает обнаружение изменений по умолчанию; этот факт подтверждается в исправленном тесте:

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner.component.spec.ts" region="test-w-o-detect-changes"/>

### `detectChanges()`

Вы можете указать `TestBed` выполнить привязку данных, вызвав `fixture.detectChanges()`.
Только после этого `<h1>` будет содержать ожидаемый заголовок.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner.component.spec.ts" region="expect-h1-default"/>

Отложенное обнаружение изменений сделано намеренно и является полезным.
Это дает тестировщику возможность проверить и изменить состояние компонента _до того, как Angular инициирует привязку данных и вызовет [хуки жизненного цикла](guide/components/lifecycle)_.

Вот еще один тест, который изменяет свойство `title` компонента _перед_ вызовом `fixture.detectChanges()`.

<docs-code path="adev/src/content/examples/testing/src/app/banner/banner.component.spec.ts" region="after-change"/>

### Автоматическое обнаружение изменений

Тесты `BannerComponent` часто вызывают `detectChanges`.
Многие тестировщики предпочитают, чтобы среда тестирования Angular запускала обнаружение изменений автоматически, как это происходит в продакшене.

Это возможно путем настройки `TestBed` с провайдером `ComponentFixtureAutoDetect`.
Сначала импортируйте его из библиотеки утилит тестирования:

<docs-code header="banner.component.detect-changes.spec.ts (import)" path="adev/src/content/examples/testing/src/app/banner/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect"/>

Затем добавьте его в массив `providers` конфигурации модуля тестирования:

<docs-code header="banner.component.detect-changes.spec.ts (AutoDetect)" path="adev/src/content/examples/testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect"/>

ПОЛЕЗНО: Вы также можете использовать функцию `fixture.autoDetectChanges()`, если хотите включить автоматическое обнаружение изменений только после обновления состояния компонента фикстуры. Кроме того, автоматическое обнаружение изменений включено по умолчанию при использовании `provideZonelessChangeDetection`, и отключать его не рекомендуется.

Вот три теста, иллюстрирующие работу автоматического обнаружения изменений.

<docs-code header="banner.component.detect-changes.spec.ts (AutoDetect Tests)" path="adev/src/content/examples/testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect-tests"/>

Первый тест показывает преимущество автоматического обнаружения изменений.

Второй и третий тесты выявляют важное ограничение.
Среда тестирования Angular не запускает обнаружение изменений синхронно, когда обновления происходят внутри тест-кейса, изменившего `title` компонента.
Тест должен вызвать `await fixture.whenStable`, чтобы дождаться следующего цикла обнаружения изменений.

ПОЛЕЗНО: Angular не знает о прямых обновлениях значений, которые не являются сигналами. Самый простой способ гарантировать планирование обнаружения изменений — использовать сигналы для значений, считываемых в шаблоне.

### Изменение значения input с помощью `dispatchEvent()`

Чтобы имитировать ввод пользователя, найдите элемент input и установите его свойство `value`.

Но есть важный промежуточный шаг.

Angular не знает, что вы установили свойство `value` элемента input.
Он не прочитает это свойство, пока вы не вызовете событие `input` элемента с помощью `dispatchEvent()`.

Следующий пример демонстрирует правильную последовательность действий.

<docs-code header="hero-detail.component.spec.ts (pipe test)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe"/>

## Компонент с внешними файлами

Предыдущий `BannerComponent` определен со _встроенным (inline) шаблоном_ и _встроенным CSS_, указанными в свойствах `@Component.template` и `@Component.styles` соответственно.

Многие компоненты указывают _внешние шаблоны_ и _внешний CSS_ с помощью свойств `@Component.templateUrl` и `@Component.styleUrls` соответственно, как это делает следующий вариант `BannerComponent`.

<docs-code header="banner-external.component.ts (metadata)" path="adev/src/content/examples/testing/src/app/banner/banner-external.component.ts" region="metadata"/>

Этот синтаксис указывает компилятору Angular читать внешние файлы во время компиляции компонента.

Это не проблема, когда вы запускаете команду CLI `ng test`, потому что она _компилирует приложение перед запуском тестов_.

Однако, если вы запускаете тесты в **среде без CLI**, тесты этого компонента могут не пройти.
Например, если вы запустите тесты `BannerComponent` в среде веб-кодинга, такой как [plunker](https://plnkr.co), вы увидите сообщение, подобное этому:

<docs-code hideCopy language="shell">

Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.

</docs-code>

Вы получаете это сообщение об ошибке теста, когда среда выполнения компилирует исходный код _во время самих тестов_.

Чтобы исправить проблему, вызовите `compileComponents()`.

## Компонент с зависимостью

Компоненты часто имеют зависимости от сервисов.

`WelcomeComponent` отображает приветственное сообщение для вошедшего в систему пользователя.
Он узнает, кто является пользователем, основываясь на свойстве внедренного `UserService`:

<docs-code header="welcome.component.ts" path="adev/src/content/examples/testing/src/app/welcome/welcome.component.ts"/>

`WelcomeComponent` имеет логику принятия решений, которая взаимодействует с сервисом, что делает этот компонент достойным тестирования.

### Предоставление тестовых двойников сервиса

_Тестируемому компоненту_ не обязательно предоставлять реальные сервисы.

Внедрение реального `UserService` может быть затруднительным.
Реальный сервис может запрашивать у пользователя учетные данные для входа и пытаться связаться с сервером аутентификации.
Такое поведение может быть трудно перехватить. Имейте в виду, что использование тестовых двойников заставляет тест вести себя иначе, чем в продакшене, поэтому используйте их умеренно.

### Получение внедренных сервисов

Тестам нужен доступ к `UserService`, внедренному в `WelcomeComponent`.

Angular имеет иерархическую систему внедрения.
Инжекторы могут находиться на нескольких уровнях: от корневого инжектора, созданного `TestBed`, до дерева компонентов.

Самый безопасный способ получить внедренный сервис, который **_работает всегда_**, — это **получить его из инжектора _тестируемого компонента_**.
Инжектор компонента является свойством `DebugElement` фикстуры.

<docs-code header="WelcomeComponent's injector" path="adev/src/content/examples/testing/src/app/welcome/welcome.component.spec.ts" region="injected-service"/>

ПОЛЕЗНО: Это _обычно_ не требуется. Сервисы часто предоставляются в корне или переопределениях TestBed и могут быть получены проще с помощью `TestBed.inject()` (см. ниже).

### `TestBed.inject()`

Это легче запомнить и менее многословно, чем получение сервиса с помощью `DebugElement` фикстуры.

В этом наборе тестов _единственным_ провайдером `UserService` является корневой модуль тестирования, поэтому безопасно вызывать `TestBed.inject()` следующим образом:

<docs-code header="TestBed injector" path="adev/src/content/examples/testing/src/app/welcome/welcome.component.spec.ts" region="inject-from-testbed" />

ПОЛЕЗНО: Для случая использования, когда `TestBed.inject()` не работает, см. раздел [_Переопределение провайдеров компонентов_](#override-component-providers), который объясняет, когда и почему вы должны получать сервис из инжектора компонента.

### Финальная настройка и тесты

Вот полный `beforeEach()`, использующий `TestBed.inject()`:

<docs-code header="welcome.component.spec.ts" path="adev/src/content/examples/testing/src/app/welcome/welcome.component.spec.ts" region="setup"/>

А вот несколько тестов:

<docs-code header="welcome.component.spec.ts" path="adev/src/content/examples/testing/src/app/welcome/welcome.component.spec.ts" region="tests"/>

Первый — это проверка работоспособности; он подтверждает, что `UserService` вызывается и работает.

ПОЛЕЗНО: Функция withContext (например, `'expected name'`) — это необязательная метка сбоя.
Если ожидание не выполняется, Jasmine добавляет эту метку к сообщению о сбое ожидания.
В спецификации с несколькими ожиданиями это может помочь прояснить, что пошло не так и какое именно ожидание не выполнилось.

Остальные тесты подтверждают логику компонента, когда сервис возвращает разные значения.
Второй тест проверяет эффект изменения имени пользователя.
Третий тест проверяет, что компонент отображает правильное сообщение, когда пользователь не вошел в систему.

## Компонент с асинхронным сервисом

В этом примере шаблон `AboutComponent` содержит `TwainComponent`.
`TwainComponent` отображает цитаты Марка Твена.

<docs-code header="twain.component.ts (template)" path="adev/src/content/examples/testing/src/app/twain/twain.component.ts" region="template" />

ПОЛЕЗНО: Значение свойства `quote` компонента проходит через `AsyncPipe`.
Это означает, что свойство возвращает либо `Promise`, либо `Observable`.

В этом примере метод `TwainComponent.getQuote()` говорит вам, что свойство `quote` возвращает `Observable`.

<docs-code header="twain.component.ts (getQuote)" path="adev/src/content/examples/testing/src/app/twain/twain.component.ts" region="get-quote"/>

`TwainComponent` получает цитаты из внедренного `TwainService`.
Компонент начинает возвращаемый `Observable` со значения-заполнителя (`'...'`), прежде чем сервис сможет вернуть свою первую цитату.

`catchError` перехватывает ошибки сервиса, подготавливает сообщение об ошибке и возвращает значение-заполнитель в канал успеха.

Все эти функции вы захотите протестировать.

### Тестирование со шпионом (spy)

При тестировании компонента важен только публичный API сервиса.
В общем случае сами тесты не должны делать вызовы к удаленным серверам.
Они должны эмулировать такие вызовы.
Настройка в этом `app/twain/twain.component.spec.ts` показывает один из способов сделать это:

<docs-code header="twain.component.spec.ts (setup)" path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="setup"/>

Обратите внимание на шпиона (spy).

<docs-code path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="spy"/>

Шпион спроектирован так, что любой вызов `getQuote` получает Observable с тестовой цитатой.
В отличие от реального метода `getQuote()`, этот шпион обходит сервер и возвращает синхронный Observable, значение которого доступно немедленно.

Вы можете написать много полезных тестов с этим шпионом, даже если его `Observable` является синхронным.

ПОЛЕЗНО: Лучше ограничить использование шпионов только тем, что необходимо для теста. Создание моков или шпионов для большего, чем необходимо, может сделать тесты хрупкими. По мере развития компонента и инъекций, несвязанные тесты могут падать, потому что они больше не имитируют достаточное количество поведений, которые в противном случае не повлияли бы на тест.

### Асинхронный тест с `fakeAsync()`

Чтобы использовать функциональность `fakeAsync()`, вы должны импортировать `zone.js/testing` в вашем файле настройки тестов.
Если вы создали свой проект с помощью Angular CLI, `zone-testing` уже импортирован в `src/test.ts`.

Следующий тест подтверждает ожидаемое поведение, когда сервис возвращает `ErrorObservable`.

<docs-code path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="error-test"/>

ПОЛЕЗНО: Функция `it()` принимает аргумент следующего вида.

<docs-code language="javascript">

fakeAsync(() => { /_test body_/ })

</docs-code>

Функция `fakeAsync()` позволяет использовать линейный стиль кодирования, запуская тело теста в специальной `тестовой зоне fakeAsync`.
Тело теста выглядит синхронным.
Нет вложенного синтаксиса (как `Promise.then()`), нарушающего поток управления.

ПОЛЕЗНО: Ограничение: Функция `fakeAsync()` не будет работать, если тело теста делает вызов `XMLHttpRequest` (XHR).
Вызовы XHR внутри теста редки, но если вам нужно вызвать XHR, используйте `waitForAsync()`.

ВАЖНО: Имейте в виду, что асинхронные задачи, происходящие внутри зоны `fakeAsync`, нужно выполнять вручную с помощью `flush` или `tick`. Если вы попытаетесь дождаться их завершения (т.е. используя `fixture.whenStable`) без использования помощников тестирования `fakeAsync` для продвижения времени, ваш тест, скорее всего, упадет. См. ниже для получения дополнительной информации.

### Функция `tick()`

Вам нужно вызвать [tick()](api/core/testing/tick), чтобы продвинуть виртуальные часы.

Вызов [tick()](api/core/testing/tick) имитирует течение времени до завершения всех ожидающих асинхронных действий.
В данном случае он ждет `setTimeout()` Observable-потока.

Функция [tick()](api/core/testing/tick) принимает параметры `millis` и `tickOptions`. Параметр `millis` указывает, насколько продвигаются виртуальные часы, и по умолчанию равен `0`, если не указан.
Например, если у вас есть `setTimeout(fn, 100)` в тесте `fakeAsync()`, вам нужно использовать `tick(100)`, чтобы вызвать колбэк fn.
Необязательный параметр `tickOptions` имеет свойство с именем `processNewMacroTasksSynchronously`. Свойство `processNewMacroTasksSynchronously` указывает, следует ли вызывать новые сгенерированные макрозадачи при тике, и по умолчанию равно `true`.

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick"/>

Функция [tick()](api/core/testing/tick) — это одна из утилит тестирования Angular, которую вы импортируете с помощью `TestBed`.
Это компаньон для `fakeAsync()`, и вы можете вызывать ее только внутри тела `fakeAsync()`.

### tickOptions

В этом примере у вас есть новая макрозадача — вложенная функция `setTimeout`. По умолчанию, когда `tick` равен setTimeout, будут вызваны и `outside`, и `nested`.

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick-new-macro-task-sync"/>

В некоторых случаях вы не хотите вызывать новую макрозадачу при тике. Вы можете использовать `tick(millis, {processNewMacroTasksSynchronously: false})`, чтобы не вызывать новую макрозадачу.

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick-new-macro-task-async"/>

### Сравнение дат внутри fakeAsync()

`fakeAsync()` имитирует течение времени, что позволяет вычислять разницу между датами внутри `fakeAsync()`.

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-date"/>

### jasmine.clock с fakeAsync()

Jasmine также предоставляет функцию `clock` для имитации дат.
Angular автоматически запускает тесты, которые выполняются после вызова `jasmine.clock().install()` внутри метода `fakeAsync()`, пока не будет вызван `jasmine.clock().uninstall()`.
`fakeAsync()` не нужен и вызывает ошибку, если он вложен.

По умолчанию эта функция отключена.
Чтобы включить ее, установите глобальный флаг перед импортом `zone-testing`.

Если вы используете Angular CLI, настройте этот флаг в `src/test.ts`.

```ts
[window as any]('__zone_symbol__fakeAsyncPatchLock') = true;
import 'zone.js/testing';
```

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-clock"/>

### Использование планировщика RxJS внутри fakeAsync()

Вы также можете использовать планировщик RxJS в `fakeAsync()` так же, как `setTimeout()` или `setInterval()`, но вам нужно импортировать `zone.js/plugins/zone-patch-rxjs-fake-async`, чтобы пропатчить планировщик RxJS.

<docs-code path="adev/src/content/examples/testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-rxjs"/>

### Поддержка большего количества макрозадач (macroTasks)

По умолчанию `fakeAsync()` поддерживает следующие макрозадачи:

- `setTimeout`
- `setInterval`
- `requestAnimationFrame`
- `webkitRequestAnimationFrame`
- `mozRequestAnimationFrame`

Если вы запустите другие макрозадачи, такие как `HTMLCanvasElement.toBlob()`, будет выброшена ошибка _"Unknown macroTask scheduled in fake async test"_.

<docs-code-multifile>
    <docs-code header="canvas.component.spec.ts (failing)" path="adev/src/content/examples/testing/src/app/shared/canvas.component.spec.ts" region="without-toBlob-macrotask"/>
    <docs-code header="canvas.component.ts" path="adev/src/content/examples/testing/src/app/shared/canvas.component.ts" region="main"/>
</docs-code-multifile>

Если вы хотите поддерживать такой случай, вам нужно определить макрозадачу, которую вы хотите поддерживать, в `beforeEach()`.
Например:

<docs-code header="canvas.component.spec.ts (excerpt)" path="adev/src/content/examples/testing/src/app/shared/canvas.component.spec.ts" region="enable-toBlob-macrotask"/>

ПОЛЕЗНО: Чтобы сделать элемент `<canvas>` совместимым с Zone.js в вашем приложении, вам нужно импортировать патч `zone-patch-canvas` (либо в `polyfills.ts`, либо в конкретном файле, который использует `<canvas>`):

<docs-code header="src/polyfills.ts or src/app/shared/canvas.component.ts" path="adev/src/content/examples/testing/src/app/shared/canvas.component.ts" region="import-canvas-patch"/>

### Асинхронные Observable

Вы можете быть удовлетворены покрытием тестами.

Однако вас может беспокоить тот факт, что реальный сервис ведет себя не совсем так.
Реальный сервис отправляет запросы на удаленный сервер.
Серверу требуется время для ответа, и ответ, безусловно, не будет доступен немедленно, как в предыдущих двух тестах.

Ваши тесты будут более точно отражать реальный мир, если вы вернете _асинхронный_ Observable из шпиона `getQuote()` следующим образом.

<docs-code path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="async-setup"/>

### Помощники асинхронных Observable

Асинхронный Observable был создан с помощью помощника `asyncData`.
Помощник `asyncData` — это служебная функция, которую вам придется написать самостоятельно или скопировать из примера кода.

<docs-code header="testing/async-observable-helpers.ts" path="adev/src/content/examples/testing/src/testing/async-observable-helpers.ts" region="async-data"/>

Observable этого помощника выдает значение `data` на следующем витке движка JavaScript.

[Оператор RxJS `defer()`](http://reactivex.io/documentation/operators/defer.html) возвращает Observable.
Он принимает фабричную функцию, которая возвращает либо промис, либо Observable.
Когда кто-то подписывается на Observable _defer_, он добавляет подписчика к новому Observable, созданному с помощью этой фабрики.

Оператор `defer()` преобразует `Promise.resolve()` в новый Observable, который, подобно `HttpClient`, выдает значение один раз и завершается.
Подписчики отписываются после получения значения данных.

Существует аналогичный помощник для создания асинхронной ошибки.

<docs-code path="adev/src/content/examples/testing/src/testing/async-observable-helpers.ts" region="async-error"/>

### Больше асинхронных тестов

Теперь, когда шпион `getQuote()` возвращает асинхронные Observable, большинство ваших тестов также должны быть асинхронными.

Вот тест `fakeAsync()`, который демонстрирует поток данных, ожидаемый в реальном мире.

<docs-code path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="fake-async-test"/>

Обратите внимание, что элемент цитаты отображает значение-заполнитель (`'...'`) после `ngOnInit()`.
Первая цитата еще не пришла.

Чтобы сбросить (flush) первую цитату из Observable, вы вызываете [tick()](api/core/testing/tick).
Затем вызовите `detectChanges()`, чтобы указать Angular обновить экран.

Затем вы можете утверждать, что элемент цитаты отображает ожидаемый текст.

### Асинхронный тест без `fakeAsync()`

Вот предыдущий тест `fakeAsync()`, переписанный с использованием `async` (waitForAsync).

<docs-code path="adev/src/content/examples/testing/src/app/twain/twain.component.spec.ts" region="async-test"/>

### `whenStable`

Тест должен ждать, пока Observable `getQuote()` выдаст следующую цитату.
Вместо вызова [tick()](api/core/testing/tick), он вызывает `fixture.whenStable()`.

`fixture.whenStable()` возвращает промис, который разрешается, когда очередь задач движка JavaScript становится пустой.
В этом примере очередь задач становится пустой, когда Observable выдает первую цитату.

## Компонент с Input и Output

Компонент с входными (input) и выходными (output) свойствами обычно появляется внутри шаблона представления хост-компонента (родительского компонента).
Хост использует привязку свойств для установки входного свойства и привязку событий для прослушивания событий, вызываемых выходным свойством.

Цель тестирования — проверить, что такие привязки работают так, как ожидается.
Тесты должны устанавливать входные значения и слушать выходные события.

`DashboardHeroComponent` — это крошечный пример компонента в этой роли.
Он отображает отдельного героя, предоставленного `DashboardComponent`.
Клик по этому герою сообщает `DashboardComponent`, что пользователь выбрал героя.

`DashboardHeroComponent` встроен в шаблон `DashboardComponent` следующим образом:

<docs-code header="dashboard.component.html (excerpt)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard.component.html" region="dashboard-hero"/>

`DashboardHeroComponent` появляется в блоке `@for`, который устанавливает входное свойство `hero` каждого компонента в значение цикла и слушает событие `selected` компонента.

Вот полное определение компонента:

<docs-code header="dashboard-hero.component.ts (component)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.ts" region="component"/>

Хотя тестирование такого простого компонента имеет небольшую внутреннюю ценность, стоит знать, как это делается.
Используйте один из следующих подходов:

- Тестировать его так, как он используется в `DashboardComponent`
- Тестировать его как автономный компонент
- Тестировать его так, как он используется заместителем `DashboardComponent`

Непосредственная цель — протестировать `DashboardHeroComponent`, а не `DashboardComponent`, поэтому попробуйте второй и третий варианты.

### Тестирование `DashboardHeroComponent` автономно

Вот основная часть настройки файла спецификации.

<docs-code header="dashboard-hero.component.spec.ts (setup)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="setup"/>

Обратите внимание, как код настройки присваивает тестового героя (`expectedHero`) свойству `hero` компонента, эмулируя способ, которым `DashboardComponent` устанавливал бы его, используя привязку свойств в своем повторителе.

Следующий тест проверяет, что имя героя передается в шаблон с помощью привязки.

<docs-code path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="name-test"/>

Поскольку шаблон пропускает имя героя через Angular `UpperCasePipe`, тест должен сравнивать значение элемента с именем в верхнем регистре.

### Клик

Клик по герою должен вызвать событие `selected`, которое может услышать хост-компонент (предположительно `DashboardComponent`):

<docs-code path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test"/>

Свойство `selected` компонента возвращает `EventEmitter`, который выглядит для потребителей как синхронный RxJS `Observable`.
Тест подписывается на него _явно_, так же как хост-компонент делает это _неявно_.

Если компонент ведет себя так, как ожидается, клик по элементу героя должен заставить свойство `selected` компонента выдать объект `hero`.

Тест обнаруживает это событие через свою подписку на `selected`.

### `triggerEventHandler`

`heroDe` в предыдущем тесте — это `DebugElement`, который представляет `<div>` героя.

Он имеет свойства и методы Angular, которые абстрагируют взаимодействие с нативным элементом.
Этот тест вызывает `DebugElement.triggerEventHandler` с именем события "click".
Привязка события "click" реагирует вызовом `DashboardHeroComponent.click()`.

Angular `DebugElement.triggerEventHandler` может вызвать _любое событие, привязанное к данным_, по его _имени события_.
Второй параметр — это объект события, передаваемый обработчику.

Тест вызвал событие "click".

<docs-code path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="trigger-event-handler"/>

В данном случае тест правильно предполагает, что обработчик события времени выполнения, метод `click()` компонента, не заботится об объекте события.

ПОЛЕЗНО: Другие обработчики менее снисходительны.
Например, директива `RouterLink` ожидает объект со свойством `button`, которое идентифицирует, какая кнопка мыши, если таковая имеется, была нажата во время клика.
Директива `RouterLink` выдает ошибку, если объект события отсутствует.

### Клик по элементу

Следующая альтернатива теста вызывает собственный метод `click()` нативного элемента, что вполне нормально для _этого компонента_.

<docs-code path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test-2"/>

### Помощник `click()`

Клик по кнопке, якорю или произвольному HTML-элементу — распространенная задача тестирования.

Сделайте это последовательным и простым, инкапсулируя процесс _вызова клика_ в помощнике, таком как следующая функция `click()`:

<docs-code header="testing/index.ts (click helper)" path="adev/src/content/examples/testing/src/testing/index.ts" region="click-event"/>

Первый параметр — это _элемент для клика_.
Если хотите, передайте пользовательский объект события в качестве второго параметра.
По умолчанию это частичный [объект события мыши левой кнопки](https://developer.mozilla.org/docs/Web/API/MouseEvent/button), принимаемый многими обработчиками, включая директиву `RouterLink`.

ВАЖНО: Помощник `click()` **не** является одной из утилит тестирования Angular.
Это функция, определенная в _примере кода этого руководства_.
Все примеры тестов используют ее.
Если она вам нравится, добавьте ее в свою коллекцию помощников.

Вот предыдущий тест, переписанный с использованием помощника клика.

<docs-code header="dashboard-hero.component.spec.ts (test with click helper)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test-3"/>

## Компонент внутри тестового хоста

Предыдущие тесты сами играли роль хоста `DashboardComponent`.
Но работает ли `DashboardHeroComponent` правильно, когда он должным образом привязан к данным хост-компонента?

<docs-code header="dashboard-hero.component.spec.ts (test host)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host"/>

Тестовый хост устанавливает входное свойство `hero` компонента с помощью своего тестового героя.
Он связывает событие `selected` компонента со своим обработчиком `onSelected`, который записывает выданного героя в свое свойство `selectedHero`.

Позже тесты смогут проверить `selectedHero`, чтобы убедиться, что событие `DashboardHeroComponent.selected` выдало ожидаемого героя.

Настройка для тестов `test-host` аналогична настройке для автономных тестов:

<docs-code header="dashboard-hero.component.spec.ts (test host setup)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup"/>

Эта конфигурация модуля тестирования показывает два важных отличия:

- Она _создает_ `TestHostComponent` вместо `DashboardHeroComponent`
- `TestHostComponent` устанавливает `DashboardHeroComponent.hero` с помощью привязки

`createComponent` возвращает `fixture`, которая содержит экземпляр `TestHostComponent` вместо экземпляра `DashboardHeroComponent`.

Создание `TestHostComponent` имеет побочный эффект создания `DashboardHeroComponent`, потому что последний появляется внутри шаблона первого.
Запрос элемента героя (`heroEl`) по-прежнему находит его в тестовом DOM, хотя и на большей глубине в дереве элементов, чем раньше.

Сами тесты почти идентичны автономной версии:

<docs-code header="dashboard-hero.component.spec.ts (test-host)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-tests"/>

Отличается только тест события selected.
Он подтверждает, что выбранный герой `DashboardHeroComponent` действительно попадает через привязку событий в хост-компонент.

## Компонент маршрутизации

_Компонент маршрутизации_ — это компонент, который указывает `Router` перейти к другому компоненту.
`DashboardComponent` является _компонентом маршрутизации_, потому что пользователь может перейти к `HeroDetailComponent`, нажав на одну из _кнопок героев_ на дашборде.

Angular предоставляет помощники тестирования для уменьшения шаблонного кода и более эффективного тестирования кода, который зависит от `HttpClient`. Функция `provideRouter` также может использоваться непосредственно в модуле тестирования.

<docs-code header="dashboard.component.spec.ts" path="adev/src/content/examples/testing/src/app/dashboard/dashboard.component.spec.ts" region="router-harness"/>

Следующий тест кликает по отображаемому герою и подтверждает, что мы переходим по ожидаемому URL.

<docs-code header="dashboard.component.spec.ts (navigate test)" path="adev/src/content/examples/testing/src/app/dashboard/dashboard.component.spec.ts" region="navigate-test"/>

## Маршрутизируемые компоненты

_Маршрутизируемый компонент_ — это пункт назначения навигации `Router`.
Его может быть сложнее тестировать, особенно когда маршрут к компоненту _включает параметры_.
`HeroDetailComponent` — это _маршрутизируемый компонент_, который является пунктом назначения такого маршрута.

Когда пользователь нажимает на героя _Dashboard_, `DashboardComponent` указывает `Router` перейти к `heroes/:id`.
`:id` — это параметр маршрута, значением которого является `id` героя для редактирования.

`Router` сопоставляет этот URL с маршрутом к `HeroDetailComponent`.
Он создает объект `ActivatedRoute` с информацией о маршрутизации и внедряет его в новый экземпляр `HeroDetailComponent`.

Вот сервисы, внедренные в `HeroDetailComponent`:

<docs-code header="hero-detail.component.ts (inject)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.ts" region="inject"/>

Компоненту `HeroDetail` нужен параметр `id`, чтобы он мог получить соответствующего героя с помощью `HeroDetailService`.
Компонент должен получить `id` из свойства `ActivatedRoute.paramMap`, которое является `Observable`.

Он не может просто сослаться на свойство `id` из `ActivatedRoute.paramMap`.
Компонент должен _подписаться_ на Observable `ActivatedRoute.paramMap` и быть готовым к тому, что `id` изменится в течение его жизни.

<docs-code header="hero-detail.component.ts (constructor)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.ts" region="ctor"/>

Тесты могут исследовать, как `HeroDetailComponent` реагирует на различные значения параметра `id`, переходя по разным маршрутам.

## Тесты вложенных компонентов

Шаблоны компонентов часто имеют вложенные компоненты, шаблоны которых могут содержать еще больше компонентов.

Дерево компонентов может быть очень глубоким, и иногда вложенные компоненты не играют никакой роли в тестировании компонента на вершине дерева.

`AppComponent`, например, отображает навигационную панель с якорями и их директивами `RouterLink`.

<docs-code header="app.component.html" path="adev/src/content/examples/testing/src/app/app.component.html"/>

Чтобы проверить ссылки, но не навигацию, вам не нужен `Router` для навигации, и вам не нужен `<router-outlet>`, чтобы отметить, где `Router` вставляет _маршрутизируемые компоненты_.

`BannerComponent` и `WelcomeComponent` (обозначенные `<app-banner>` и `<app-welcome>`) также не имеют значения.

Тем не менее, любой тест, который создает `AppComponent` в DOM, также создает экземпляры этих трех компонентов, и, если вы позволите этому случиться, вам придется настроить `TestBed` для их создания.

Если вы забудете объявить их, компилятор Angular не распознает теги `<app-banner>`, `<app-welcome>` и `<router-outlet>` в шаблоне `AppComponent` и выдаст ошибку.

Если вы объявите реальные компоненты, вам также придется объявить _их_ вложенные компоненты и предоставить _все_ сервисы, внедренные в _любой_ компонент в дереве.

В этом разделе описываются два метода минимизации настройки.
Используйте их по отдельности или в комбинации, чтобы сосредоточиться на тестировании основного компонента.

### Создание заглушек для ненужных компонентов

В первом методе вы создаете и объявляете версии-заглушки компонентов и директив, которые играют незначительную роль или вообще не играют роли в тестах.

<docs-code header="app.component.spec.ts (stub declaration)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="component-stubs"/>

Селекторы заглушек соответствуют селекторам соответствующих реальных компонентов.
Но их шаблоны и классы пусты.

Затем объявите их, переопределив `imports` вашего компонента с помощью `TestBed.overrideComponent`.

<docs-code header="app.component.spec.ts (TestBed stubs)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="testbed-stubs"/>

ПОЛЕЗНО: Ключ `set` в этом примере заменяет все существующие импорты вашего компонента, убедитесь, что импортируете все зависимости, а не только заглушки. В качестве альтернативы вы можете использовать ключи `remove`/`add` для выборочного удаления и добавления импортов.

### `NO_ERRORS_SCHEMA`

Во втором подходе добавьте `NO_ERRORS_SCHEMA` в переопределения метаданных вашего компонента.

<docs-code header="app.component.spec.ts (NO_ERRORS_SCHEMA)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="no-errors-schema"/>

`NO_ERRORS_SCHEMA` указывает компилятору Angular игнорировать нераспознанные элементы и атрибуты.

Компилятор распознает элемент `<app-root>` и атрибут `routerLink`, потому что вы объявили соответствующие `AppComponent` и `RouterLink` в конфигурации `TestBed`.

Но компилятор не выдаст ошибку, когда встретит `<app-banner>`, `<app-welcome>` или `<router-outlet>`.
Он просто отрендерит их как пустые теги, и браузер проигнорирует их.

Вам больше не нужны компоненты-заглушки.

### Используйте оба метода вместе

Это методы _поверхностного тестирования компонентов_ (Shallow Component Testing), названные так потому, что они уменьшают визуальную поверхность компонента только до тех элементов в шаблоне компонента, которые важны для тестов.

Подход `NO_ERRORS_SCHEMA` проще из двух, но не злоупотребляйте им.

`NO_ERRORS_SCHEMA` также не позволяет компилятору сообщать вам об отсутствующих компонентах и атрибутах, которые вы пропустили непреднамеренно или написали с ошибкой.
Вы можете потратить часы на погоню за фантомными багами, которые компилятор поймал бы мгновенно.

Подход с _компонентами-заглушками_ имеет еще одно преимущество.
Хотя заглушки в _этом_ примере были пустыми, вы могли бы дать им урезанные шаблоны и классы, если вашим тестам нужно как-то взаимодействовать с ними.

На практике вы будете комбинировать эти два метода в одной настройке, как показано в этом примере.

<docs-code header="app.component.spec.ts (mixed setup)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="mixed-setup"/>

Компилятор Angular создает `BannerStubComponent` для элемента `<app-banner>` и применяет `RouterLink` к якорям с атрибутом `routerLink`, но игнорирует теги `<app-welcome>` и `<router-outlet>`.

### `By.directive` и внедренные директивы

Еще немного настройки запускает начальную привязку данных и получает ссылки на навигационные ссылки:

<docs-code header="app.component.spec.ts (test setup)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="test-setup"/>

Три момента, представляющих особый интерес:

- Поиск элементов якорей с прикрепленной директивой с помощью `By.directive`
- Запрос возвращает обертки `DebugElement` вокруг соответствующих элементов
- Каждый `DebugElement` предоставляет инжектор зависимостей с конкретным экземпляром директивы, прикрепленной к этому элементу

Ссылки `AppComponent` для проверки выглядят следующим образом:

<docs-code header="app.component.html (navigation links)" path="adev/src/content/examples/testing/src/app/app.component.html" region="links"/>

Вот несколько тестов, которые подтверждают, что эти ссылки связаны с директивами `routerLink` так, как ожидается:

<docs-code header="app.component.spec.ts (selected tests)" path="adev/src/content/examples/testing/src/app/app.component.spec.ts" region="tests"/>

## Использование объекта `page`

`HeroDetailComponent` — это простое представление с заголовком, двумя полями героя и двумя кнопками.

Но даже в этой простой форме в шаблоне достаточно сложности.

<docs-code
  path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.html" header="hero-detail.component.html"/>

Тесты, которые проверяют компонент, должны…

- Ждать, пока герой прибудет, прежде чем элементы появятся в DOM
- Иметь ссылку на текст заголовка
- Иметь ссылку на поле ввода имени для его проверки и установки
- Иметь ссылки на две кнопки, чтобы можно было нажать на них

Даже такая небольшая форма, как эта, может создать беспорядок из запутанной условной настройки и выбора элементов CSS.

Укротите сложность с помощью класса `Page`, который обрабатывает доступ к свойствам компонента и инкапсулирует логику, которая их устанавливает.

Вот такой класс `Page` для `hero-detail.component.spec.ts`

<docs-code header="hero-detail.component.spec.ts (Page)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="page"/>

Теперь важные хуки для манипулирования компонентом и проверки аккуратно организованы и доступны из экземпляра `Page`.

Метод `createComponent` создает объект `page` и заполняет пробелы, как только `hero` прибывает.

<docs-code header="hero-detail.component.spec.ts (createComponent)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="create-component"/>

Вот еще несколько тестов `HeroDetailComponent` для закрепления мысли.

<docs-code header="hero-detail.component.spec.ts (selected tests)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="selected-tests"/>

## Переопределение провайдеров компонентов {#override-component-providers}

`HeroDetailComponent` предоставляет свой собственный `HeroDetailService`.

<docs-code header="hero-detail.component.ts (prototype)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.ts" region="prototype"/>

Невозможно создать заглушку для `HeroDetailService` компонента в `providers` конфигурации `TestBed.configureTestingModule`.
Это провайдеры для _модуля тестирования_, а не для компонента.
Они подготавливают инжектор зависимостей на уровне _фикстуры_.

Angular создает компонент со своим _собственным_ инжектором, который является _дочерним_ по отношению к инжектору фикстуры.
Он регистрирует провайдеры компонента (в данном случае `HeroDetailService`) в дочернем инжекторе.

Тест не может добраться до сервисов дочернего инжектора из инжектора фикстуры.
И `TestBed.configureTestingModule` также не может их настроить.

Angular все это время создавал новые экземпляры реального `HeroDetailService`!

ПОЛЕЗНО: Эти тесты могли бы упасть или завершиться по таймауту, если бы `HeroDetailService` делал свои собственные вызовы XHR к удаленному серверу.
Удаленного сервера для вызова может не быть.

К счастью, `HeroDetailService` делегирует ответственность за удаленный доступ к данным внедренному `HeroService`.

<docs-code header="hero-detail.service.ts (prototype)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.service.ts" region="prototype"/>

Предыдущая конфигурация теста заменяет реальный `HeroService` на `TestHeroService`, который перехватывает запросы к серверу и подделывает их ответы.

Что, если вам не так повезло.
Что, если подделать `HeroService` сложно?
Что, если `HeroDetailService` делает свои собственные запросы к серверу?

Метод `TestBed.overrideComponent` может заменить массив `providers` компонента на легко управляемые _тестовые двойники_, как показано в следующем варианте настройки:

<docs-code header="hero-detail.component.spec.ts (Override setup)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override"/>

Обратите внимание, что `TestBed.configureTestingModule` больше не предоставляет фейковый `HeroService`, потому что он [не нужен](#provide-a-spy-stub-herodetailservicespy).

### Метод `overrideComponent`

Сосредоточьтесь на методе `overrideComponent`.

<docs-code header="hero-detail.component.spec.ts (overrideComponent)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method"/>

Он принимает два аргумента: тип компонента для переопределения (`HeroDetailComponent`) и объект переопределения метаданных.
[Объект переопределения метаданных](guide/testing/utility-apis#metadata-override-object) — это дженерик, определенный следующим образом:

<docs-code language="javascript">

type MetadataOverride<T> = {
add?: Partial<T>;
remove?: Partial<T>;
set?: Partial<T>;
};

</docs-code>

Объект переопределения метаданных может либо добавлять и удалять элементы в свойствах метаданных, либо полностью сбрасывать эти свойства.
Этот пример сбрасывает метаданные `providers` компонента.

Параметр типа, `T`, — это вид метаданных, которые вы передаете декоратору `@Component`:

<docs-code language="javascript">

selector?: string;
template?: string;
templateUrl?: string;
providers?: any[];
…

</docs-code>

### Предоставление _шпиона-заглушки_ (`HeroDetailServiceSpy`) {#provide-a-spy-stub-herodetailservicespy}

Этот пример полностью заменяет массив `providers` компонента новым массивом, содержащим `HeroDetailServiceSpy`.

`HeroDetailServiceSpy` — это версия-заглушка реального `HeroDetailService`, которая подделывает все необходимые функции этого сервиса.
Она не внедряет и не делегирует `HeroService` более низкого уровня, поэтому нет необходимости предоставлять тестовый двойник для него.

Связанные тесты `HeroDetailComponent` будут утверждать, что методы `HeroDetailService` были вызваны, шпионя за методами сервиса.
Соответственно, заглушка реализует свои методы как шпионы:

<docs-code header="hero-detail.component.spec.ts (HeroDetailServiceSpy)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy"/>

### Тесты с переопределением

Теперь тесты могут управлять героем компонента напрямую, манипулируя `testHero` шпиона-заглушки, и подтверждать, что методы сервиса были вызваны.

<docs-code header="hero-detail.component.spec.ts (override tests)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests"/>

### Больше переопределений

Метод `TestBed.overrideComponent` может быть вызван несколько раз для одних и тех же или разных компонентов.
`TestBed` предлагает аналогичные методы `overrideDirective`, `overrideModule` и `overridePipe` для проникновения в эти другие классы и замены их частей.

Изучите варианты и комбинации самостоятельно.