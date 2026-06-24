# Создание harness-ов для ваших компонентов

## Перед началом работы

СОВЕТ: Это руководство предполагает, что вы уже ознакомились
с [обзором component harnesses](guide/testing/component-harnesses-overview). Сначала прочитайте его, если вы новичок в
использовании component harnesses.

### Когда имеет смысл создавать тестовый harness?

Команда Angular рекомендует создавать тестовые harness-ы для общих компонентов, которые используются во многих местах и
имеют некоторую интерактивность с пользователем. Чаще всего это относится к библиотекам виджетов и подобным
переиспользуемым компонентам. Harness-ы ценны в этих случаях, так как они предоставляют потребителям этих общих
компонентов хорошо поддерживаемый API для взаимодействия с компонентом. Тесты, использующие harness-ы, могут избежать
зависимости от ненадежных деталей реализации этих общих компонентов, таких как структура DOM и конкретные слушатели
событий.

Для компонентов, которые появляются только в одном месте, например, на странице приложения, harness-ы не приносят такой
большой пользы. В таких ситуациях тесты компонента могут обоснованно зависеть от деталей реализации этого компонента,
так как тесты и компоненты обновляются одновременно. Однако harness-ы все же приносят определенную пользу, если вы
планируете использовать harness как в модульных (unit), так и в сквозных (e2e) тестах.

### Установка CDK

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор примитивов поведения для построения
компонентов. Чтобы использовать component harnesses, сначала установите `@angular/cdk` из npm. Вы можете сделать это
через терминал с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Расширение `ComponentHarness`

Абстрактный класс `ComponentHarness` является базовым классом для всех component harnesses. Чтобы создать
пользовательский harness компонента, расширьте `ComponentHarness` и реализуйте статическое свойство `hostSelector`.

Свойство `hostSelector` идентифицирует элементы в DOM, которые соответствуют этому подклассу harness-а. В большинстве
случаев `hostSelector` должен совпадать с селектором соответствующего `Component` или `Directive`. Например, рассмотрим
простой компонент всплывающего окна:

<docs-code language="typescript">
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{triggerText()}}</button>
    @if (isOpen()) {
      <div class="my-popup-content"><ng-content></ng-content></div>
    }
  `
})
class MyPopup {
  triggerText = input('');

isOpen = signal(false);

toggle() {
this.isOpen.update((value) => !value);
}
}
</docs-code>

В данном случае минимальный harness для компонента будет выглядеть следующим образом:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
</docs-code>

Хотя подклассы `ComponentHarness` требуют только свойства `hostSelector`, большинство harness-ов также должны
реализовывать статический метод `with` для генерации экземпляров `HarnessPredicate`.
Раздел [фильтрация harness-ов](guide/testing/using-component-harnesses#filtering-harnesses) рассматривает это более
подробно.

## Поиск элементов в DOM компонента

Каждый экземпляр подкласса `ComponentHarness` представляет конкретный экземпляр соответствующего компонента. Вы можете
получить доступ к хост-элементу компонента через метод `host()` из базового класса `ComponentHarness`.

`ComponentHarness` также предлагает несколько методов для поиска элементов внутри DOM компонента. Это методы
`locatorFor()`, `locatorForOptional()` и `locatorForAll()`. Эти методы создают функции, которые находят элементы; они не
находят элементы напрямую. Такой подход защищает от кэширования ссылок на устаревшие элементы. Например, когда блок
`@if` скрывает, а затем показывает элемент, результатом является новый DOM-элемент; использование функций гарантирует,
что тесты всегда ссылаются на текущее состояние DOM.

См. [страницу справочника API ComponentHarness](/api/cdk/testing/ComponentHarness) для получения полного списка деталей
различных методов `locatorFor`.

Например, пример `MyPopupHarness`, обсуждаемый выше, может предоставлять методы для получения элементов триггера и
контента следующим образом:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

// Gets the trigger element
getTriggerElement = this.locatorFor('button');

// Gets the content element.
getContentElement = this.locatorForOptional('.my-popup-content');
}
</docs-code>

## Работа с экземплярами `TestElement`

`TestElement` — это абстракция, разработанная для работы в различных тестовых средах (Unit-тесты, WebDriver и т.д.). При
использовании harness-ов следует выполнять все взаимодействия с DOM через этот интерфейс. Другие способы доступа к
DOM-элементам, такие как `document.querySelector()`, работают не во всех тестовых средах.

`TestElement` имеет ряд методов для взаимодействия с базовым DOM, таких как `blur()`, `click()`, `getAttribute()` и
другие. См. [страницу справочника API TestElement](/api/cdk/testing/TestElement) для полного списка методов.

Не предоставляйте экземпляры `TestElement` пользователям harness-а, если только это не элемент, который потребитель
компонента определяет напрямую (например, хост-элемент компонента). Предоставление экземпляров `TestElement` для
внутренних элементов приводит к тому, что пользователи начинают зависеть от внутренней структуры DOM компонента.

Вместо этого предоставляйте более узконаправленные методы для конкретных действий, которые может предпринять конечный
пользователь, или конкретного состояния, которое он может наблюдать. Например, `MyPopupHarness` из предыдущих разделов
может предоставлять методы, такие как `toggle` и `isOpen`:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

protected getTriggerElement = this.locatorFor('button');
protected getContentElement = this.locatorForOptional('.my-popup-content');

/\*_ Toggles the open state of the popup. _/
async toggle() {
const trigger = await this.getTriggerElement();
return trigger.click();
}

/\*_ Checks if the popup us open. _/
async isOpen() {
const content = await this.getContentElement();
return !!content;
}
}
</docs-code>

## Загрузка harness-ов для подкомпонентов

Более крупные компоненты часто состоят из подкомпонентов. Вы можете отразить эту структуру и в harness-е компонента.
Каждый из методов `locatorFor` в `ComponentHarness` имеет альтернативную сигнатуру, которую можно использовать для
поиска под-harness-ов вместо элементов.

См. [страницу справочника API ComponentHarness](/api/cdk/testing/ComponentHarness) для полного списка различных методов
locatorFor.

Например, рассмотрим меню, построенное с использованием всплывающего окна из примера выше:

<docs-code language="typescript">
@Directive({
  selector: 'my-menu-item'
})
class MyMenuItem {}

@Component({
selector: 'my-menu',
template: `     <my-popup>
      <ng-content></ng-content>
    </my-popup>
  `
})
class MyMenu {
triggerText = input('');

@ContentChildren(MyMenuItem) items: QueryList<MyMenuItem>;
}
</docs-code>

Harness для `MyMenu` может затем использовать преимущества других harness-ов для `MyPopup` и `MyMenuItem`:

<docs-code language="typescript">
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

protected getPopupHarness = this.locatorFor(MyPopupHarness);

/\*_ Gets the currently shown menu items (empty list if menu is closed). _/
getItems = this.locatorForAll(MyMenuItemHarness);

/\*_ Toggles open state of the menu. _/
async toggle() {
const popupHarness = await this.getPopupHarness();
return popupHarness.toggle();
}
}

class MyMenuItemHarness extends ComponentHarness {
static hostSelector = 'my-menu-item';
}
</docs-code>

## Фильтрация экземпляров harness с помощью `HarnessPredicate`

Когда страница содержит несколько экземпляров определенного компонента, может потребоваться фильтрация на основе
какого-либо свойства компонента для получения конкретного экземпляра. Например, вам может понадобиться кнопка с
определенным текстом или меню с определенным ID. Класс `HarnessPredicate` может фиксировать подобные критерии для
подкласса `ComponentHarness`. Хотя автор теста может создавать экземпляры `HarnessPredicate` вручную, проще, когда
подкласс `ComponentHarness` предоставляет вспомогательный метод для создания предикатов для общих фильтров.

Вам следует создать статический метод `with()` в каждом подклассе `ComponentHarness`, который возвращает
`HarnessPredicate` для этого класса. Это позволяет авторам тестов писать легко понятный код, например
`loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. В дополнение к стандартным опциям селектора и предка,
метод `with` должен добавлять любые другие опции, которые имеют смысл для конкретного подкласса.

Harness-ы, которым необходимо добавить дополнительные опции, должны расширять интерфейс `BaseHarnessFilters` и добавлять
дополнительные необязательные свойства по мере необходимости. `HarnessPredicate` предоставляет несколько удобных методов
для добавления опций: `stringMatches()`, `addOption()` и `add()`.
См. [страницу API HarnessPredicate](/api/cdk/testing/HarnessPredicate) для полного описания.

Например, при работе с меню полезно фильтровать на основе текста триггера и фильтровать пункты меню на основе их текста:

<docs-code language="typescript">
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the trigger text for the menu. */
  triggerText?: string | RegExp;
}

interface MyMenuItemHarnessFilters extends BaseHarnessFilters {
/\*_ Filters based on the text of the menu item. _/
text?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
static hostSelector = 'my-menu';

/\*_ Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. _/
static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
return new HarnessPredicate(MyMenuHarness, options)
.addOption('trigger text', options.triggerText,
(harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
}

protected getPopupHarness = this.locatorFor(MyPopupHarness);

/\*_ Gets the text of the menu trigger. _/
async getTriggerText(): Promise<string> {
const popupHarness = await this.getPopupHarness();
return popupHarness.getTriggerText();
}
...
}

class MyMenuItemHarness extends ComponentHarness {
static hostSelector = 'my-menu-item';

/\*_ Creates a `HarnessPredicate` used to locate a particular `MyMenuItemHarness`. _/
static with(options: MyMenuItemHarnessFilters): HarnessPredicate<MyMenuItemHarness> {
return new HarnessPredicate(MyMenuItemHarness, options)
.addOption('text', options.text,
(harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
}

/\*_ Gets the text of the menu item. _/
async getText(): Promise<string> {
const host = await this.host();
return host.text();
}
}
</docs-code>

Вы можете передать `HarnessPredicate` вместо класса `ComponentHarness` в любой из API `HarnessLoader`, `LocatorFactory`
или `ComponentHarness`. Это позволяет авторам тестов легко нацеливаться на конкретный экземпляр компонента при создании
экземпляра harness-а. Это также позволяет автору harness-а использовать тот же `HarnessPredicate` для включения более
мощных API в своем классе harness-а. Например, рассмотрим метод `getItems` в `MyMenuHarness`, показанном выше.
Добавление API фильтрации позволяет пользователям harness-а искать конкретные пункты меню:

<docs-code language="typescript">
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

/\*_ Gets a list of items in the menu, optionally filtered based on the given criteria. _/
async getItems(filters: MyMenuItemHarnessFilters = {}): Promise<MyMenuItemHarness[]> {
const getFilteredItems = this.locatorForAll(MyMenuItemHarness.with(filters));
return getFilteredItems();
}
...
}
</docs-code>

## Создание `HarnessLoader` для элементов, использующих проекцию контента

Некоторые компоненты проецируют дополнительный контент в шаблон компонента.
См. [руководство по проекции контента](guide/components/content-projection) для получения дополнительной информации.

Добавьте экземпляр `HarnessLoader`, ограниченный областью видимости элемента, содержащего `<ng-content>`, при создании
harness-а для компонента, использующего проекцию контента. Это позволяет пользователю harness-а загружать дополнительные
harness-ы для любых компонентов, переданных в качестве контента. `ComponentHarness` имеет несколько методов, которые
можно использовать для создания экземпляров HarnessLoader в таких случаях: `harnessLoaderFor()`,
`harnessLoaderForOptional()`, `harnessLoaderForAll()`.
См. [страницу справочника API интерфейса HarnessLoader](/api/cdk/testing/HarnessLoader) для получения более подробной
информации.

Например, пример `MyPopupHarness` сверху может расширять `ContentContainerComponentHarness` для добавления поддержки
загрузки harness-ов внутри `<ng-content>` компонента.

<docs-code language="typescript">
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
</docs-code>

## Доступ к элементам за пределами хост-элемента компонента

Бывают случаи, когда harness-у компонента может потребоваться доступ к элементам за пределами хост-элемента
соответствующего компонента. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет
DOM-элементы непосредственно к телу документа (body), как, например, сервис `Overlay` в Angular CDK.

В этом случае `ComponentHarness` предоставляет метод, который можно использовать для получения `LocatorFactory` для
корневого элемента документа. `LocatorFactory` поддерживает большинство тех же API, что и базовый класс
`ComponentHarness`, и затем может использоваться для запросов относительно корневого элемента документа.

Представьте, что компонент `MyPopup` выше использовал оверлей CDK для содержимого всплывающего окна, а не элемент в
собственном шаблоне. В этом случае `MyPopupHarness` должен был бы получить доступ к элементу содержимого через метод
`documentRootLocatorFactory()`, который получает фабрику локаторов с корнем в корне документа.

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

/\*_ Gets a `HarnessLoader` whose root element is the popup's content element. _/
async getHarnessLoaderForContent(): Promise<HarnessLoader> {
const rootLocator = this.documentRootLocatorFactory();
return rootLocator.harnessLoaderFor('my-popup-content');
}
}
</docs-code>

## Ожидание асинхронных задач

Методы `TestElement` автоматически запускают обнаружение изменений Angular и ожидают выполнения задач внутри `NgZone`. В
большинстве случаев авторам harness-ов не требуется прилагать особых усилий для ожидания асинхронных задач. Однако
существуют некоторые пограничные случаи, когда этого может быть недостаточно.

При определенных обстоятельствах анимации Angular могут потребовать второго цикла обнаружения изменений и последующей
стабилизации `NgZone` перед полной обработкой событий анимации. В случаях, когда это необходимо, `ComponentHarness`
предлагает метод `forceStabilize()`, который можно вызвать для выполнения второго раунда.

Вы можете использовать `NgZone.runOutsideAngular()` для планирования задач вне NgZone. Вызовите метод
`waitForTasksOutsideAngular()` соответствующего harness-а, если вам нужно явно ожидать выполнения задач вне `NgZone`,
так как это не происходит автоматически.
