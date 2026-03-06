# Использование Harness компонентов в тестах {#using-component-harnesses-in-tests}

## Перед началом {#before-you-start}

TIP: Это руководство предполагает, что вы уже ознакомились с [обзорным руководством по Harness компонентов](guide/testing/component-harnesses-overview). Если вы новичок в использовании Harness компонентов, сначала прочитайте его.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор примитивов поведения для создания компонентов. Для использования Harness компонентов сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Среды тестирования и загрузчики Harness {#test-harness-environments-and-loaders}

Harness компонентов можно использовать в различных тестовых средах. Angular CDK поддерживает две встроенные среды:

- Юнит-тесты с Angular `TestBed`
- End-to-end тесты с [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)

Каждая среда предоставляет <strong>загрузчик Harness</strong>. Загрузчик создаёт экземпляры Harness, используемые в тестах. Подробнее о поддерживаемых тестовых средах смотрите ниже.

Дополнительные тестовые среды требуют пользовательских привязок. Смотрите [руководство по добавлению поддержки Harness для дополнительных тестовых сред](guide/testing/component-harnesses-testing-environments) для получения дополнительной информации.

### Использование загрузчика из `TestbedHarnessEnvironment` для юнит-тестов {#using-the-loader-from-testbedharnessEnvironment-for-unit-tests}

Для юнит-тестов можно создать загрузчик Harness из [TestbedHarnessEnvironment](/api/cdk/testing/TestbedHarnessEnvironment). Эта среда использует [Fixture компонента](api/core/testing/ComponentFixture), создаваемый Angular `TestBed`.

Для создания загрузчика Harness с корнем в корневом элементе fixture используйте метод `loader()`:

```ts
const fixture = TestBed.createComponent(MyComponent);

// Create a harness loader from the fixture
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// Use the loader to get harness instances
const myComponentHarness = await loader.getHarness(MyComponent);
```

Для создания загрузчика Harness для элементов вне fixture используйте метод `documentRootLoader()`. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет DOM-элементы непосредственно к телу документа, как сервис `Overlay` в Angular CDK.

Также можно создать загрузчик Harness непосредственно с помощью `harnessForFixture()` для Harness в корневом элементе fixture.

### Использование загрузчика из `SeleniumWebDriverHarnessEnvironment` для end-to-end тестов {#using-the-loader-from-seleniumwebdriverharnessEnvironment-for-end-to-end-tests}

Для end-to-end тестов на основе WebDriver можно создать загрузчик Harness с помощью `SeleniumWebDriverHarnessEnvironment`.

Используйте метод `loader()` для получения экземпляра загрузчика Harness для текущего HTML-документа с корнем в корневом элементе документа. Эта среда использует клиент WebDriver.

```ts
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
```

## Использование загрузчика Harness {#using-a-harness-loader}

Экземпляры загрузчика Harness соответствуют конкретному DOM-элементу и используются для создания экземпляров Harness компонентов для элементов, находящихся под этим элементом.

Для получения `ComponentHarness` для первого экземпляра элемента используйте метод `getHarness()`. Для получения всех экземпляров `ComponentHarness` используйте метод `getAllHarnesses()`.

```ts
// Get harness for first instance of the element
const myComponentHarness = await loader.getHarness(MyComponent);

// Get harnesses for all instances of the element
const myComponentHarnesses = await loader.getHarnesses(MyComponent);
```

Помимо `getHarness` и `getAllHarnesses`, `HarnessLoader` имеет несколько других полезных методов для запроса Harness:

- `getHarnessAtIndex(...)`: получает Harness для компонента, соответствующего заданным критериям, по указанному индексу.
- `countHarnesses(...)`: подсчитывает количество экземпляров компонентов, соответствующих заданным критериям.
- `hasHarness(...)`: проверяет, соответствует ли хотя бы один экземпляр компонента заданным критериям.

В качестве примера рассмотрим переиспользуемый компонент dialog-button, который открывает диалоговое окно по нажатию. Он содержит следующие компоненты, каждый с соответствующим Harness:

- `MyDialogButton` (объединяет `MyButton` и `MyDialog` в удобный API)
- `MyButton` (стандартный компонент кнопки)
- `MyDialog` (диалоговое окно, добавляемое в `document.body` компонентом `MyDialogButton` при нажатии)

Следующий тест загружает Harness для каждого из этих компонентов:

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

### Поведение Harness в разных средах {#harness-behavior-in-different-environments}

Harness могут вести себя не совсем одинаково во всех средах. Некоторые различия между реальным взаимодействием пользователя и имитируемыми событиями в юнит-тестах неизбежны. Angular CDK делает всё возможное для нормализации поведения.

### Взаимодействие с дочерними элементами {#interacting-with-child-elements}

Для взаимодействия с элементами ниже корневого элемента данного загрузчика Harness используйте экземпляр `HarnessLoader` дочернего элемента. Для первого экземпляра дочернего элемента используйте метод `getChildLoader()`. Для всех экземпляров дочернего элемента — метод `getAllChildLoaders()`.

```ts
const myComponentHarness = await loader.getHarness(MyComponent);

// Get loader for first instance of child element with '.child' selector
const childLoader = await myComponentHarness.getLoader('.child');

// Get loaders for all instances of child elements with '.child' selector
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
```

### Фильтрация Harness {#filtering-harnesses}

Когда страница содержит несколько экземпляров конкретного компонента, можно фильтровать по некоторому свойству компонента, чтобы получить конкретный экземпляр. Для этого используйте <strong>предикат Harness</strong> — класс, связывающий класс `ComponentHarness` с функциями-предикатами, которые могут использоваться для фильтрации экземпляров компонентов.

Когда вы запрашиваете `HarnessLoader` о Harness, вы фактически передаёте `HarnessQuery`. Запрос может быть одним из двух:

- Конструктор Harness — просто получает этот Harness
- `HarnessPredicate` — получает Harness, отфильтрованные по одному или нескольким условиям

`HarnessPredicate` поддерживает базовые фильтры (selector, ancestor), работающие с любым расширением `ComponentHarness`.

```ts
// Example of loading a MyButtonComponentHarness with a harness predicate
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {
  selector: '[disabled]',
});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
```

Однако для Harness часто реализуется статический метод `with()`, принимающий специфичные для компонента параметры фильтрации и возвращающий `HarnessPredicate`.

```ts
// Example of loading a MyButtonComponentHarness with a specific selector
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}));
```

Подробности смотрите в документации конкретного Harness, поскольку дополнительные параметры фильтрации специфичны для каждой реализации Harness.

## Использование API тестовых Harness {#using-test-harness-apis}

Хотя каждый Harness определяет API, специфичный для его компонента, все они разделяют общий базовый класс [ComponentHarness](/api/cdk/testing/ComponentHarness). Этот базовый класс определяет статическое свойство `hostSelector`, сопоставляющее класс Harness с экземплярами компонента в DOM.

Помимо этого, API конкретного Harness специфичен для его компонента; обратитесь к документации компонента, чтобы узнать, как использовать конкретный Harness.

В качестве примера приведён тест для компонента, использующего [Harness компонента Angular Material slider](https://material.angular.dev/components/slider/api#MatSliderHarness):

```ts
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
```

## Взаимодействие с обнаружением изменений Angular {#interop-with-angular-change-detection}

По умолчанию Harness тестов запускает [обнаружение изменений](/best-practices/runtime-performance) Angular перед чтением состояния DOM-элемента и после взаимодействия с ним.

Иногда может потребоваться более точный контроль над обнаружением изменений в тестах, например, для проверки состояния компонента во время ожидания асинхронной операции. В таких случаях используйте функцию `manualChangeDetection` для отключения автоматической обработки обнаружения изменений для блока кода.

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

Почти все методы Harness являются асинхронными и возвращают `Promise` для поддержки следующего:

- Поддержки юнит-тестов
- Поддержки end-to-end тестов
- Изоляции тестов от изменений в асинхронном поведении

Команда Angular рекомендует использовать [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) для повышения читаемости тестов. Вызов `await` блокирует выполнение теста до разрешения связанного `Promise`.

Иногда может потребоваться выполнить несколько действий одновременно и дождаться их завершения, а не выполнять каждое действие последовательно. Например, прочитать несколько свойств одного компонента. В таких ситуациях используйте функцию `parallel` для параллелизации операций. Функция `parallel` работает аналогично `Promise.all`, при этом оптимизируя проверки обнаружения изменений.

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
