# Использование компонентных harnesses в тестах {#using-component-harnesses-in-tests}

## Прежде чем начать {#before-you-start}

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [обзорным руководством по компонентным harnesses](guide/testing/component-harnesses-overview). Прочитайте его в первую очередь, если вы новичок в использовании компонентных harnesses.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор поведенческих примитивов для создания компонентов. Для использования компонентных harnesses сначала установите `@angular/cdk` из npm. Вы можете сделать это через терминал, используя Angular CLI:

```shell
ng add @angular/cdk
```

## Среды тестирования harness и загрузчики {#test-harness-environments-and-loaders}

Компонентные тестовые harnesses можно использовать в различных тестовых средах. Angular CDK поддерживает две встроенные среды:

- Модульные тесты с `TestBed` Angular
- Сквозные тесты с [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)

Каждая среда предоставляет <strong>загрузчик harness</strong>. Загрузчик создаёт экземпляры harness, используемые в тестах. Подробнее о поддерживаемых средах тестирования см. ниже.

Для дополнительных сред тестирования требуются пользовательские привязки. Подробнее см. в [руководстве по добавлению поддержки harness для дополнительных сред тестирования](guide/testing/component-harnesses-testing-environments).

### Использование загрузчика из `TestbedHarnessEnvironment` для модульных тестов {#using-the-loader-from-testbedharnessEnvironment-for-unit-tests}

Для модульных тестов можно создать загрузчик harness из [TestbedHarnessEnvironment](/api/cdk/testing/TestbedHarnessEnvironment). Эта среда использует [fixture компонента](api/core/testing/ComponentFixture), созданный `TestBed` Angular.

Для создания загрузчика harness с корнем в корневом элементе fixture используйте метод `loader()`:

```ts
const fixture = TestBed.createComponent(MyComponent);

// Create a harness loader from the fixture
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// Use the loader to get harness instances
const myComponentHarness = await loader.getHarness(MyComponent);
```

Для создания загрузчика harness для элементов за пределами fixture используйте метод `documentRootLoader()`. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет DOM-элементы непосредственно к телу документа, как сервис `Overlay` в Angular CDK.

Также можно создать загрузчик harness непосредственно с помощью `harnessForFixture()` для harness в корневом элементе fixture.

### Использование загрузчика из `SeleniumWebDriverHarnessEnvironment` для сквозных тестов {#using-the-loader-from-seleniumwebdriverharnessEnvironment-for-end-to-end-tests}

Для сквозных тестов на основе WebDriver можно создать загрузчик harness с помощью `SeleniumWebDriverHarnessEnvironment`.

Используйте метод `loader()` для получения экземпляра загрузчика harness для текущего HTML-документа с корнем в корневом элементе документа. Эта среда использует WebDriver-клиент.

```ts
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
```

## Использование загрузчика harness {#using-a-harness-loader}

Экземпляры загрузчика harness соответствуют конкретному DOM-элементу и используются для создания экземпляров компонентных harnesses для элементов под этим конкретным элементом.

Для получения `ComponentHarness` первого экземпляра элемента используйте метод `getHarness()`. Для получения всех экземпляров `ComponentHarness` используйте метод `getAllHarnesses()`.

```ts
// Get harness for first instance of the element
const myComponentHarness = await loader.getHarness(MyComponent);

// Get harnesses for all instances of the element
const myComponentHarnesses = await loader.getHarnesses(MyComponent);
```

Помимо `getHarness` и `getAllHarnesses`, `HarnessLoader` имеет несколько других полезных методов для запроса harnesses:

- `getHarnessAtIndex(...)`: Получает harness для компонента, соответствующего заданным критериям, по конкретному индексу.
- `countHarnesses(...)`: Подсчитывает количество экземпляров компонентов, соответствующих заданным критериям.
- `hasHarness(...)`: Проверяет, соответствует ли хотя бы один экземпляр компонента заданным критериям.

В качестве примера рассмотрим переиспользуемый компонент кнопки-диалога, открывающий диалоговое окно по клику. Он содержит следующие компоненты, каждый с соответствующим harness:

- `MyDialogButton` (компонует `MyButton` и `MyDialog` с удобным API)
- `MyButton` (стандартный компонент кнопки)
- `MyDialog` (диалоговое окно, добавляемое к `document.body` компонентом `MyDialogButton` по клику)

Следующий тест загружает harnesses для каждого из этих компонентов:

```ts
let fixture: ComponentFixture<MyDialogButton>;
let loader: HarnessLoader;
let rootLoader: HarnessLoader;

beforeEach(() => {
  fixture = TestBed.createComponent(MyDialogButton);
  loader = TestbedHarnessEnvironment.loader(fixture);
  rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
});

it('loads harnesses', async () => {
  // Load a harness for the bootstrapped component with `harnessForFixture`
  dialogButtonHarness = await TestbedHarnessEnvironment.harnessForFixture(
    fixture,
    MyDialogButtonHarness,
  );

  // The button element is inside the fixture's root element, so we use `loader`.
  const buttonHarness = await loader.getHarness(MyButtonHarness);

  // Click the button to open the dialog
  await buttonHarness.click();

  // The dialog is appended to `document.body`, outside of the fixture's root element,
  // so we use `rootLoader` in this case.
  const dialogHarness = await rootLoader.getHarness(MyDialogHarness);

  // ... make some assertions
});
```

### Поведение harness в различных средах {#harness-behavior-in-different-environments}

Harnesses могут вести себя не одинаково во всех средах. Некоторые различия между реальным взаимодействием пользователя и смоделированными событиями в модульных тестах неизбежны. Angular CDK делает всё возможное для нормализации поведения.

### Взаимодействие с дочерними элементами {#interacting-with-child-elements}

Для взаимодействия с элементами ниже корневого элемента данного загрузчика harness используйте экземпляр `HarnessLoader` дочернего элемента. Для первого экземпляра дочернего элемента используйте метод `getChildLoader()`. Для всех экземпляров дочерних элементов используйте метод `getAllChildLoaders()`.

```ts
const myComponentHarness = await loader.getHarness(MyComponent);

// Get loader for first instance of child element with '.child' selector
const childLoader = await myComponentHarness.getLoader('.child');

// Get loaders for all instances of child elements with '.child' selector
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
```

### Фильтрация harnesses {#filtering-harnesses}

Когда страница содержит несколько экземпляров одного компонента, может потребоваться фильтрация по какому-либо свойству компонента для получения конкретного экземпляра. Для этого можно использовать <strong>предикат harness</strong> — класс, связывающий класс `ComponentHarness` с функциями-предикатами для фильтрации экземпляров компонентов.

Когда вы запрашиваете у `HarnessLoader` harness, вы фактически предоставляете `HarnessQuery`. Запрос может быть одним из двух:

- Конструктор harness — просто получает этот harness.
- `HarnessPredicate` — получает harnesses, отфильтрованные по одному или нескольким условиям.

`HarnessPredicate` поддерживает базовые фильтры (selector, ancestor), работающие для всего, что расширяет `ComponentHarness`.

```ts
// Example of loading a MyButtonComponentHarness with a harness predicate
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {
  selector: '[disabled]',
});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
```

Однако часто harnesses реализуют статический метод `with()`, принимающий специфичные для компонента параметры фильтрации и возвращающий `HarnessPredicate`.

```ts
// Example of loading a MyButtonComponentHarness with a specific selector
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}));
```

Подробнее обратитесь к документации конкретного harness, поскольку дополнительные параметры фильтрации специфичны для каждой реализации harness.

## Использование API тестовых harnesses {#using-test-harness-apis}

Хотя каждый harness определяет API, специфичный для соответствующего компонента, все они разделяют общий базовый класс [ComponentHarness](/api/cdk/testing/ComponentHarness). Этот базовый класс определяет статическое свойство `hostSelector`, связывающее класс harness с экземплярами компонента в DOM.

Помимо этого, API любого конкретного harness специфичен для соответствующего компонента; обратитесь к документации компонента, чтобы узнать, как использовать конкретный harness.

В качестве примера вот тест компонента, использующего [harness компонента Angular Material slider](https://material.angular.dev/components/slider/api#MatSliderHarness):

```ts
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
```

## Взаимодействие с обнаружением изменений Angular {#interop-with-angular-change-detection}

По умолчанию тестовые harnesses запускают [обнаружение изменений](/best-practices/runtime-performance) Angular перед чтением состояния DOM-элемента и после взаимодействия с ним.

Иногда может потребоваться более детальный контроль над обнаружением изменений в тестах, например для проверки состояния компонента во время выполнения асинхронной операции. В таких случаях используйте функцию `manualChangeDetection` для отключения автоматической обработки обнаружения изменений для блока кода.

```ts
it('checks state while async action is in progress', async () => {
  const buttonHarness = loader.getHarness(MyButtonHarness);
  await manualChangeDetection(async () => {
    await buttonHarness.click();
    fixture.detectChanges();
    // Check expectations while async click operation is in progress.
    expect(isProgressSpinnerVisible()).toBe(true);
    await fixture.whenStable();
    // Check expectations after async click operation complete.
    expect(isProgressSpinnerVisible()).toBe(false);
  });
});
```

Почти все методы harness являются асинхронными и возвращают `Promise` для поддержки следующего:

- Поддержки модульных тестов
- Поддержки сквозных тестов
- Изоляции тестов от изменений в асинхронном поведении

Команда Angular рекомендует использовать [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) для улучшения читаемости тестов. Вызов `await` блокирует выполнение теста до разрешения связанного `Promise`.

Иногда может потребоваться выполнить несколько действий одновременно и дождаться завершения всех из них, а не выполнять каждое действие последовательно. Например, при чтении нескольких свойств одного компонента. В таких ситуациях используйте функцию `parallel` для параллельного выполнения операций. Функция `parallel` работает аналогично `Promise.all`, при этом оптимизируя проверки обнаружения изменений.

```ts
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  // Read the checked and intermediate properties simultaneously.
  const [checked, indeterminate] = await parallel(() => [
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate(),
  ]);
  expect(checked).toBe(false);
  expect(indeterminate).toBe(true);
});
```
