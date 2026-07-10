# Использование component harnesses в тестах

## Перед началом {#before-you-start}

TIP: Это руководство предполагает, что вы уже прочитали [обзорное руководство по component harnesses](guide/testing/component-harnesses-overview). Прочитайте его сначала, если вы новичок в использовании component harnesses.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — набор примитивов поведения для создания компонентов. Чтобы использовать component harnesses, сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Окружения тестовых harnesses и loaders {#test-harness-environments-and-loaders}

Component test harnesses можно использовать в разных тестовых окружениях. Angular CDK поддерживает два встроенных окружения:

- Unit-тесты с Angular `TestBed`
- End-to-end тесты с [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)

Каждое окружение предоставляет <strong>harness loader</strong>. Loader создаёт экземпляры harnesses, которые вы используете в тестах. См. ниже более конкретные указания по поддерживаемым тестовым окружениям.

Дополнительные тестовые окружения требуют пользовательских привязок. См. [руководство по добавлению поддержки harnesses для дополнительных тестовых окружений](guide/testing/component-harnesses-testing-environments).

### Использование loader из `TestbedHarnessEnvironment` для unit-тестов {#using-the-loader-from-testbedharnessenvironment-for-unit-tests}

Для unit-тестов можно создать harness loader из [TestbedHarnessEnvironment](/api/cdk/testing/testbed/TestbedHarnessEnvironment). Это окружение использует [component fixture](api/core/testing/ComponentFixture), созданный Angular `TestBed`.

Чтобы создать harness loader, укоренённый в корневом элементе fixture, используйте метод `loader()`:

```ts
const fixture = TestBed.createComponent(MyComponent);

// Create a harness loader from the fixture
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// Use the loader to get harness instances
const myComponentHarness = await loader.getHarness(MyComponent);
```

Чтобы создать harness loader для harnesses элементов, выходящих за пределы fixture, используйте метод `documentRootLoader()`. Например, код, отображающий плавающий элемент или pop-up, часто прикрепляет DOM-элементы напрямую к document body, как сервис `Overlay` в Angular CDK.

Также можно создать harness loader напрямую с `harnessForFixture()` для harness в корневом элементе этого fixture.

### Использование loader из `SeleniumWebDriverHarnessEnvironment` для end-to-end тестов {#using-the-loader-from-seleniumwebdriverharnessenvironment-for-end-to-end-tests}

Для end-to-end тестов на основе WebDriver можно создать harness loader с `SeleniumWebDriverHarnessEnvironment`.

Используйте метод `loader()`, чтобы получить экземпляр harness loader для текущего HTML-документа, укоренённый в корневом элементе документа. Это окружение использует клиент WebDriver.

```ts
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
```

## Использование harness loader {#using-a-harness-loader}

Экземпляры harness loader соответствуют конкретному DOM-элементу и используются для создания экземпляров component harness для элементов под этим конкретным элементом.

Чтобы получить `ComponentHarness` для первого экземпляра элемента, используйте метод `getHarness()`. Чтобы получить все экземпляры `ComponentHarness`, используйте метод `getAllHarnesses()`.

```ts
// Get harness for first instance of the element
const myComponentHarness = await loader.getHarness(MyComponent);

// Get harnesses for all instances of the element
const myComponentHarnesses = await loader.getAllHarnesses(MyComponent);
```

Помимо `getHarness` и `getAllHarnesses`, у `HarnessLoader` есть несколько других полезных методов для запроса harnesses:

- `getHarnessAtIndex(...)`: получает harness для компонента, соответствующего заданным критериям, по конкретному индексу.
- `countHarnesses(...)`: считает количество экземпляров компонента, соответствующих заданным критериям.
- `hasHarness(...)`: проверяет, есть ли хотя бы один экземпляр компонента, соответствующий заданным критериям.

Как пример, рассмотрим переиспользуемый компонент dialog-button, который открывает диалог по клику. Он содержит следующие компоненты, у каждого со своим harness:

- `MyDialogButton` (компонует `MyButton` и `MyDialog` с удобным API)
- `MyButton` (стандартный компонент кнопки)
- `MyDialog` (диалог, добавляемый к `document.body` через `MyDialogButton` по клику)

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

### Поведение harnesses в разных окружениях {#harness-behavior-in-different-environments}

Harnesses могут вести себя не совсем одинаково во всех окружениях. Некоторые различия неизбежны между реальным взаимодействием пользователя и симулированными событиями, генерируемыми в unit-тестах. Angular CDK прилагает максимальные усилия для нормализации поведения в возможной степени.

### Взаимодействие с дочерними элементами {#interacting-with-child-elements}

Чтобы взаимодействовать с элементами ниже корневого элемента этого harness loader, используйте экземпляр `HarnessLoader` дочернего элемента. Для первого экземпляра дочернего элемента используйте метод `getChildLoader()`. Для всех экземпляров дочернего элемента используйте метод `getAllChildLoaders()`.

```ts
const myComponentHarness = await loader.getHarness(MyComponent);

// Get loader for first instance of child element with '.child' selector
const childLoader = await myComponentHarness.getLoader('.child');

// Get loaders for all instances of child elements with '.child' selector
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
```

### Фильтрация harnesses {#filtering-harnesses}

Когда страница содержит несколько экземпляров конкретного компонента, может понадобиться фильтровать по некоторому свойству компонента, чтобы получить конкретный экземпляр. Можно использовать <strong>harness predicate</strong> — класс, используемый для ассоциации класса `ComponentHarness` с функциями-предикатами, которые можно использовать для фильтрации экземпляров компонента.

Когда вы запрашиваете harness у `HarnessLoader`, вы фактически предоставляете HarnessQuery. Запрос может быть одним из двух:

- Конструктор harness. Это просто получает этот harness
- `HarnessPredicate`, который получает harnesses, отфильтрованные на основе одного или нескольких условий

`HarnessPredicate` поддерживает некоторые базовые фильтры (selector, ancestor), которые работают на всём, что расширяет `ComponentHarness`.

```ts
// Example of loading a MyButtonComponentHarness with a harness predicate
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {
  selector: '[disabled]',
});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
```

Однако обычно harnesses реализуют статический метод `with()`, который принимает опции фильтрации, специфичные для компонента, и возвращает `HarnessPredicate`.

```ts
// Example of loading a MyButtonComponentHarness with a specific selector
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}));
```

Подробнее см. документацию конкретного harness, поскольку дополнительные опции фильтрации специфичны для каждой реализации harness.

## Использование API тестовых harnesses {#using-test-harness-apis}

Хотя каждый harness определяет API, специфичный для соответствующего компонента, все они разделяют общий базовый класс [ComponentHarness](/api/cdk/testing/ComponentHarness). Этот базовый класс определяет статическое свойство `hostSelector`, которое сопоставляет класс harness с экземплярами компонента в DOM.

Помимо этого, API любого данного harness специфичен для соответствующего компонента; обратитесь к документации компонента, чтобы узнать, как использовать конкретный harness.

Как пример, следующий тест для компонента, использующего [harness компонента slider Angular Material](https://material.angular.dev/components/slider/api#MatSliderHarness):

```ts
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
```

## Совместимость с обнаружением изменений Angular {#interop-with-angular-change-detection}

По умолчанию тестовые harnesses запускают [обнаружение изменений](/best-practices/runtime-performance) Angular перед чтением состояния DOM-элемента и после взаимодействия с DOM-элементом.

Могут быть случаи, когда нужен более тонкий контроль над обнаружением изменений в тестах — например, проверка состояния компонента, пока async-операция ожидается. В этих случаях используйте функцию `manualChangeDetection`, чтобы отключить автоматическую обработку обнаружения изменений для блока кода.

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

Почти все методы harness асинхронны и возвращают `Promise` для поддержки следующего:

- Поддержка unit-тестов
- Поддержка end-to-end тестов
- Изоляция тестов от изменений в асинхронном поведении

Команда Angular рекомендует использовать [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) для улучшения читаемости теста. Вызов `await` блокирует выполнение теста, пока связанный `Promise` не разрешится.

Иногда может понадобиться выполнить несколько действий одновременно и дождаться их завершения, а не выполнять каждое действие последовательно. Например, прочитать несколько свойств одного компонента. В этих ситуациях используйте функцию `parallel` для параллелизации операций. Функция parallel работает аналогично `Promise.all`, одновременно оптимизируя проверки обнаружения изменений.

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
