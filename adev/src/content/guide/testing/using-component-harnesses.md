# Использование component harnesses в тестах

## Перед началом работы

СОВЕТ: Это руководство предполагает, что вы уже ознакомились
с [обзором component harnesses](guide/testing/component-harnesses-overview). Сначала прочитайте его, если вы новичок в
использовании component harnesses.

### Установка CDK

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор поведенческих примитивов для создания
компонентов. Чтобы использовать component harnesses, сначала установите `@angular/cdk` из npm. Вы можете сделать это
через терминал с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Среды выполнения и загрузчики harness

Вы можете использовать тестовые component harnesses в различных средах тестирования. Angular CDK поддерживает две
встроенные среды:

- Модульные тесты с использованием `TestBed` Angular
- End-to-end тесты с использованием [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)

Каждая среда предоставляет <strong>загрузчик harness</strong> (harness loader). Загрузчик создает экземпляры harness,
которые вы используете в своих тестах. Ниже приведены более конкретные рекомендации по поддерживаемым средам
тестирования.

Дополнительные среды тестирования требуют пользовательских привязок.
См. [руководство по добавлению поддержки harness для дополнительных сред тестирования](guide/testing/component-harnesses-testing-environments)
для получения дополнительной информации.

### Использование загрузчика из `TestbedHarnessEnvironment` для модульных тестов

Для модульных тестов вы можете создать загрузчик harness
из [TestbedHarnessEnvironment](/api/cdk/testing/TestbedHarnessEnvironment). Эта среда
использует [фикстуру компонента](api/core/testing/ComponentFixture), созданную `TestBed` Angular.

Чтобы создать загрузчик harness, корнем которого является корневой элемент фикстуры, используйте метод `loader()`:

<docs-code language="typescript">
const fixture = TestBed.createComponent(MyComponent);

// Create a harness loader from the fixture
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// Use the loader to get harness instances
const myComponentHarness = await loader.getHarness(MyComponent);
</docs-code>

Чтобы создать загрузчик harness для harness-ов элементов, находящихся за пределами фикстуры, используйте метод
`documentRootLoader()`. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет
DOM-элементы непосредственно к телу документа (body), как, например, сервис `Overlay` в Angular CDK.

Вы также можете создать загрузчик harness напрямую с помощью `harnessForFixture()` для harness, привязанного
непосредственно к корневому элементу этой фикстуры.

### Использование загрузчика из `SeleniumWebDriverHarnessEnvironment` для end-to-end тестов

Для end-to-end тестов на основе WebDriver вы можете создать загрузчик harness с помощью
`SeleniumWebDriverHarnessEnvironment`.

Используйте метод `loader()`, чтобы получить экземпляр загрузчика harness для текущего HTML-документа, корнем которого
является корневой элемент документа. Эта среда использует клиент WebDriver.

<docs-code language="typescript">
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
</docs-code>

## Использование загрузчика harness

Экземпляры загрузчика harness соответствуют определенному DOM-элементу и используются для создания экземпляров component
harness для элементов внутри этого конкретного элемента.

Чтобы получить `ComponentHarness` для первого экземпляра элемента, используйте метод `getHarness()`. Чтобы получить все
экземпляры `ComponentHarness`, используйте метод `getAllHarnesses()`.

<docs-code language="typescript">
// Get harness for first instance of the element
const myComponentHarness = await loader.getHarness(MyComponent);

// Get harnesses for all instances of the element
const myComponentHarnesses = await loader.getHarnesses(MyComponent);
</docs-code>

В дополнение к `getHarness` и `getAllHarnesses`, у `HarnessLoader` есть несколько других полезных методов для запроса
harness:

- `getHarnessAtIndex(...)`: Получает harness для компонента, соответствующего заданным критериям, по определенному
  индексу.
- `countHarnesses(...)`: Подсчитывает количество экземпляров компонента, соответствующих заданным критериям.
- `hasHarness(...)`: Проверяет, соответствует ли хотя бы один экземпляр компонента заданным критериям.

В качестве примера рассмотрим переиспользуемый компонент кнопки диалога, который открывает диалог при клике. Он содержит
следующие компоненты, каждый с соответствующим harness:

- `MyDialogButton` (компонует `MyButton` и `MyDialog` с удобным API)
- `MyButton` (стандартный компонент кнопки)
- `MyDialog` (диалог, добавляемый в `document.body` компонентом `MyDialogButton` при клике)

Следующий тест загружает harness для каждого из этих компонентов:

<docs-code language="typescript">
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
dialogButtonHarness =
await TestbedHarnessEnvironment.harnessForFixture(fixture, MyDialogButtonHarness);

// The button element is inside the fixture's root element, so we use `loader`.
const buttonHarness = await loader.getHarness(MyButtonHarness);

// Click the button to open the dialog
await buttonHarness.click();

// The dialog is appended to `document.body`, outside of the fixture's root element,
// so we use `rootLoader` in this case.
const dialogHarness = await rootLoader.getHarness(MyDialogHarness);

// ... make some assertions
});
</docs-code>

### Поведение harness в разных средах

Harness не всегда ведут себя одинаково во всех средах. Некоторые различия между реальным взаимодействием пользователя и
симулированными событиями в модульных тестах неизбежны. Angular CDK старается максимально нормализовать поведение.

### Взаимодействие с дочерними элементами

Для взаимодействия с элементами ниже корневого элемента этого загрузчика harness используйте экземпляр `HarnessLoader`
дочернего элемента. Для первого экземпляра дочернего элемента используйте метод `getChildLoader()`. Для всех экземпляров
дочернего элемента используйте метод `getAllChildLoaders()`.

<docs-code language="typescript">
const myComponentHarness = await loader.getHarness(MyComponent);

// Get loader for first instance of child element with '.child' selector
const childLoader = await myComponentHarness.getLoader('.child');

// Get loaders for all instances of child elements with '.child' selector
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
</docs-code>

### Фильтрация harness

Когда страница содержит несколько экземпляров определенного компонента, вам может потребоваться фильтрация на основе
какого-либо свойства компонента, чтобы получить конкретный экземпляр. Для этого вы можете использовать <strong>предикат
harness</strong> (harness predicate) — класс, используемый для связывания класса `ComponentHarness` с
функциями-предикатами, которые могут применяться для фильтрации экземпляров компонентов.

Когда вы запрашиваете harness у `HarnessLoader`, вы фактически предоставляете HarnessQuery. Запрос может быть одним из
двух:

- Конструктор harness. Это просто получает данный harness.
- `HarnessPredicate`, который получает harness, отфильтрованные на основе одного или нескольких условий.

`HarnessPredicate` поддерживает некоторые базовые фильтры (селектор, предок), которые работают с любым классом,
расширяющим `ComponentHarness`.

<docs-code language="typescript">
// Example of loading a MyButtonComponentHarness with a harness predicate
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {selector: '[disabled]'});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
</docs-code>

Однако для harness часто реализуют статический метод `with()`, который принимает специфичные для компонента параметры
фильтрации и возвращает `HarnessPredicate`.

<docs-code language="typescript">
// Example of loading a MyButtonComponentHarness with a specific selector
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}))
</docs-code>

Для получения более подробной информации обратитесь к документации конкретного harness, так как дополнительные параметры
фильтрации специфичны для каждой реализации harness.

## Использование API тестовых harness

Хотя каждый harness определяет API, специфичный для соответствующего компонента, все они имеют общий базовый
класс [ComponentHarness](/api/cdk/testing/ComponentHarness). Этот базовый класс определяет статическое свойство
`hostSelector`, которое сопоставляет класс harness с экземплярами компонента в DOM.

Помимо этого, API любого данного harness специфичен для соответствующего компонента; обратитесь к документации
компонента, чтобы узнать, как использовать конкретный harness.

В качестве примера ниже приведен тест для компонента,
использующего [harness компонента слайдера Angular Material](https://material.angular.dev/components/slider/api#MatSliderHarness):

<docs-code language="typescript">
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
</docs-code>

## Взаимодействие с обнаружением изменений Angular

По умолчанию тестовые harness запускают [обнаружение изменений](https://angular.dev/best-practices/runtime-performance)
Angular перед чтением состояния DOM-элемента и после взаимодействия с DOM-элементом.

Могут быть случаи, когда вам нужен более точный контроль над обнаружением изменений в тестах, например, проверка
состояния компонента во время выполнения асинхронной операции. В этих случаях используйте функцию
`manualChangeDetection`, чтобы отключить автоматическую обработку обнаружения изменений для блока кода.

<docs-code language="typescript">
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
</docs-code>

Почти все методы harness являются асинхронными и возвращают `Promise` для поддержки следующего:

- Поддержка модульных тестов
- Поддержка end-to-end тестов
- Изоляция тестов от изменений в асинхронном поведении

Команда Angular рекомендует
использовать [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) для
улучшения читаемости тестов. Вызов `await` блокирует выполнение вашего теста до тех пор, пока связанный `Promise` не
разрешится.

Иногда вам может потребоваться выполнить несколько действий одновременно и дождаться их завершения, вместо того чтобы
выполнять каждое действие последовательно. Например, прочитать несколько свойств одного компонента. В таких ситуациях
используйте функцию `parallel` для распараллеливания операций. Функция `parallel` работает аналогично `Promise.all`, при
этом также оптимизируя проверки обнаружения изменений.

<docs-code language="typescript">
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  // Read the checked and intermediate properties simultaneously.
  const [checked, indeterminate] = await parallel(() => [
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate()
  ]);
  expect(checked).toBe(false);
  expect(indeterminate).toBe(true);
});
</docs-code>
