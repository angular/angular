# Создание harnesses для ваших компонентов

## Прежде чем начать {#before-you-start}

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [обзорным руководством по компонентным harnesses](guide/testing/component-harnesses-overview). Прочитайте его в первую очередь, если вы новичок в использовании компонентных harnesses.

### Когда создание тестового harness имеет смысл? {#when-does-creating-a-test-harness-make-sense}

Команда Angular рекомендует создавать компонентные тестовые harnesses для общих компонентов, которые используются во многих местах и предполагают некоторое взаимодействие с пользователем. Чаще всего это относится к библиотекам виджетов и подобным переиспользуемым компонентам. Harnesses ценны в этих случаях, поскольку предоставляют потребителям общих компонентов поддерживаемый API для взаимодействия с компонентом. Тесты, использующие harnesses, могут избежать зависимости от ненадёжных деталей реализации общих компонентов, таких как структура DOM и конкретные обработчики событий.

Для компонентов, появляющихся только в одном месте, например на странице приложения, harnesses не дают такого большого преимущества. В таких ситуациях тесты компонента могут разумно зависеть от деталей реализации этого компонента, поскольку тесты и компоненты обновляются одновременно. Однако harnesses всё равно имеют смысл, если вы будете использовать harness как в модульных, так и в сквозных тестах.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор поведенческих примитивов для создания компонентов. Для использования компонентных harnesses сначала установите `@angular/cdk` из npm. Вы можете сделать это через терминал, используя Angular CLI:

```shell
ng add @angular/cdk
```

## Расширение `ComponentHarness` {#extending-componentharness}

Абстрактный класс `ComponentHarness` является базовым классом для всех компонентных harnesses. Чтобы создать пользовательский компонентный harness, расширьте `ComponentHarness` и реализуйте статическое свойство `hostSelector`.

Свойство `hostSelector` идентифицирует элементы в DOM, соответствующие данному подклассу harness. В большинстве случаев `hostSelector` должен совпадать с селектором соответствующего `Component` или `Directive`. Например, рассмотрим простой всплывающий компонент:

```ts
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{ triggerText() }}</button>
    @if (isOpen()) {
      <div class="my-popup-content"><ng-content></ng-content></div>
    }
  `,
})
class MyPopup {
  triggerText = input('');

  isOpen = signal(false);

  toggle() {
    this.isOpen.update((value) => !value);
  }
}
```

В этом случае минимальный harness для компонента выглядит следующим образом:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

Хотя подклассы `ComponentHarness` требуют только свойства `hostSelector`, большинство harnesses также должны реализовывать статический метод `with` для генерации экземпляров `HarnessPredicate`. Более подробно это рассматривается в разделе [фильтрация harnesses](guide/testing/using-component-harnesses#filtering-harnesses).

## Поиск элементов в DOM компонента {#finding-elements-in-the-components-dom}

Каждый экземпляр подкласса `ComponentHarness` представляет конкретный экземпляр соответствующего компонента. Доступ к хост-элементу компонента осуществляется через метод `host()` из базового класса `ComponentHarness`.

`ComponentHarness` также предлагает несколько методов для поиска элементов в DOM компонента: `locatorFor()`, `locatorForOptional()` и `locatorForAll()`. Эти методы создают функции для поиска элементов, а не находят элементы напрямую. Такой подход защищает от кэширования ссылок на устаревшие элементы. Например, когда блок `@if` скрывает, а затем показывает элемент, результатом является новый DOM-элемент; использование функций гарантирует, что тесты всегда обращаются к актуальному состоянию DOM.

Полный список методов `locatorFor` см. на [странице справочника API ComponentHarness](/api/cdk/testing/ComponentHarness).

Например, рассмотренный ранее `MyPopupHarness` может предоставлять методы для получения элементов триггера и содержимого следующим образом:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  // Gets the trigger element
  getTriggerElement = this.locatorFor('button');

  // Gets the content element.
  getContentElement = this.locatorForOptional('.my-popup-content');
}
```

## Работа с экземплярами `TestElement` {#working-with-testelement-instances}

`TestElement` — это абстракция, предназначенная для работы в различных тестовых средах (модульные тесты, WebDriver и т.д.). При использовании harnesses все взаимодействия с DOM следует выполнять через этот интерфейс. Другие способы доступа к DOM-элементам, например `document.querySelector()`, не работают во всех тестовых средах.

`TestElement` имеет ряд методов для взаимодействия с базовым DOM, таких как `blur()`, `click()`, `getAttribute()` и другие. Полный список методов см. на [странице справочника API TestElement](/api/cdk/testing/TestElement).

Не открывайте экземпляры `TestElement` пользователям harness, если только это не элемент, который потребитель компонента определяет напрямую, например хост-элемент компонента. Открытие экземпляров `TestElement` для внутренних элементов заставляет пользователей зависеть от внутренней структуры DOM компонента.

Вместо этого предоставляйте более узкоспециализированные методы для конкретных действий, которые может выполнять конечный пользователь, или конкретных состояний, которые он может наблюдать. Например, `MyPopupHarness` из предыдущих разделов мог бы предоставлять методы `toggle` и `isOpen`:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  protected getTriggerElement = this.locatorFor('button');
  protected getContentElement = this.locatorForOptional('.my-popup-content');

  /** Toggles the open state of the popup. */
  async toggle() {
    const trigger = await this.getTriggerElement();
    return trigger.click();
  }

  /** Checks if the popup us open. */
  async isOpen() {
    const content = await this.getContentElement();
    return !!content;
  }
}
```

## Загрузка harnesses для дочерних компонентов {#loading-harnesses-for-subcomponents}

Более крупные компоненты часто включают дочерние компоненты. Эту структуру можно отразить и в harness компонента. Каждый из методов `locatorFor` в `ComponentHarness` имеет альтернативную сигнатуру, которую можно использовать для поиска дочерних harnesses вместо элементов.

Полный список методов `locatorFor` см. на [странице справочника API ComponentHarness](/api/cdk/testing/ComponentHarness).

Например, рассмотрим меню, созданное с использованием всплывающего окна из примера выше:

```ts
@Directive({
  selector: 'my-menu-item',
})
class MyMenuItem {}

@Component({
  selector: 'my-menu',
  template: `
    <my-popup>
      <ng-content />
    </my-popup>
  `,
})
class MyMenu {
  triggerText = input('');

  @ContentChildren(MyMenuItem) items: QueryList<MyMenuItem>;
}
```

Harness для `MyMenu` может воспользоваться другими harnesses для `MyPopup` и `MyMenuItem`:

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** Gets the currently shown menu items (empty list if menu is closed). */
  getItems = this.locatorForAll(MyMenuItemHarness);

  /** Toggles open state of the menu. */
  async toggle() {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.toggle();
  }
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';
}
```

## Фильтрация экземпляров harness с помощью `HarnessPredicate` {#filtering-harness-instances-with-harnesspredicate}

Когда страница содержит несколько экземпляров одного компонента, может потребоваться фильтрация по какому-либо свойству компонента для получения конкретного экземпляра. Например, может понадобиться кнопка с определённым текстом или меню с определённым ID. Класс `HarnessPredicate` может задавать такие критерии для подкласса `ComponentHarness`. Хотя автор тестов может создавать экземпляры `HarnessPredicate` вручную, это проще делать, когда подкласс `ComponentHarness` предоставляет вспомогательный метод для построения предикатов для распространённых фильтров.

Следует создавать статический метод `with()` в каждом подклассе `ComponentHarness`, возвращающий `HarnessPredicate` для этого класса. Это позволяет авторам тестов писать понятный код, например: `loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. Помимо стандартных параметров selector и ancestor, метод `with` должен добавлять любые другие параметры, имеющие смысл для конкретного подкласса.

Harnesses, которым нужно добавить дополнительные параметры, должны расширять интерфейс `BaseHarnessFilters` и добавлять дополнительные необязательные свойства по необходимости. `HarnessPredicate` предоставляет несколько удобных методов для добавления параметров: `stringMatches()`, `addOption()` и `add()`. Полное описание см. на [странице API HarnessPredicate](/api/cdk/testing/HarnessPredicate).

Например, при работе с меню полезно фильтровать по тексту триггера и фильтровать элементы меню по их тексту:

```ts
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the trigger text for the menu. */
  triggerText?: string | RegExp;
}

interface MyMenuItemHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the menu item. */
  text?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
    return new HarnessPredicate(MyMenuHarness, options).addOption(
      'trigger text',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** Gets the text of the menu trigger. */
  async getTriggerText(): Promise<string> {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.getTriggerText();
  }
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuItemHarness`. */
  static with(options: MyMenuItemHarnessFilters): HarnessPredicate<MyMenuItemHarness> {
    return new HarnessPredicate(MyMenuItemHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  /** Gets the text of the menu item. */
  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
```

Можно передавать `HarnessPredicate` вместо класса `ComponentHarness` в любые API `HarnessLoader`, `LocatorFactory` или `ComponentHarness`. Это позволяет авторам тестов легко указывать конкретный экземпляр компонента при создании экземпляра harness. Также это позволяет автору harness использовать тот же `HarnessPredicate` для создания более мощных API в своём классе harness. Например, рассмотрим метод `getItems` в `MyMenuHarness` выше. Добавление API фильтрации позволяет пользователям harness искать конкретные элементы меню:

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** Gets a list of items in the menu, optionally filtered based on the given criteria. */
  async getItems(filters: MyMenuItemHarnessFilters = {}): Promise<MyMenuItemHarness[]> {
    const getFilteredItems = this.locatorForAll(MyMenuItemHarness.with(filters));
    return getFilteredItems();
  }
  ...
}
```

## Создание `HarnessLoader` для элементов с проецированием содержимого {#creating-harnessloader-for-elements-that-use-content-projection}

Некоторые компоненты проецируют дополнительное содержимое в шаблон компонента. Подробнее см. в [руководстве по проецированию содержимого](guide/components/content-projection).

Добавьте экземпляр `HarnessLoader`, ограниченный элементом, содержащим `<ng-content>`, при создании harness для компонента, использующего проецирование содержимого. Это позволяет пользователю harness загружать дополнительные harnesses для любых компонентов, переданных в качестве содержимого. `ComponentHarness` имеет несколько методов для создания экземпляров `HarnessLoader` в подобных случаях: `harnessLoaderFor()`, `harnessLoaderForOptional()`, `harnessLoaderForAll()`. Подробнее см. на [странице справочника API интерфейса HarnessLoader](/api/cdk/testing/HarnessLoader).

Например, `MyPopupHarness` из примера выше может расширять `ContentContainerComponentHarness` для добавления поддержки загрузки harnesses внутри `<ng-content>` компонента.

```ts
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
```

## Доступ к элементам за пределами хост-элемента компонента {#accessing-elements-outside-of-the-components-host-element}

Иногда harness компонента может потребоваться доступ к элементам за пределами хост-элемента соответствующего компонента. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет DOM-элементы непосредственно к телу документа, как, например, сервис `Overlay` в Angular CDK.

В этом случае `ComponentHarness` предоставляет метод для получения `LocatorFactory` для корневого элемента документа. `LocatorFactory` поддерживает большинство тех же API, что и базовый класс `ComponentHarness`, и может использоваться для запросов относительно корневого элемента документа.

Рассмотрим ситуацию, когда компонент `MyPopup` использует CDK overlay для содержимого всплывающего окна, а не элемент в собственном шаблоне. В этом случае `MyPopupHarness` должен обращаться к элементу содержимого через метод `documentRootLocatorFactory()`, который возвращает фабрику локаторов с корнем в корне документа.

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  /** Gets a `HarnessLoader` whose root element is the popup's content element. */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    const rootLocator = this.documentRootLocatorFactory();
    return rootLocator.harnessLoaderFor('my-popup-content');
  }
}
```

## Ожидание асинхронных задач {#waiting-for-asynchronous-tasks}

Методы `TestElement` автоматически запускают обнаружение изменений Angular и ожидают задачи внутри `NgZone`. В большинстве случаев авторам harness не требуется специальных усилий для ожидания асинхронных задач. Однако существуют некоторые граничные случаи, когда этого может оказаться недостаточно.

При некоторых обстоятельствах Angular-анимации могут требовать второго цикла обнаружения изменений и последующей стабилизации `NgZone` перед полным завершением событий анимации. В случаях, когда это необходимо, `ComponentHarness` предлагает метод `forceStabilize()`, который можно вызвать для выполнения второго цикла.

Можно использовать `NgZone.runOutsideAngular()` для планирования задач вне NgZone. Вызовите метод `waitForTasksOutsideAngular()` для соответствующего harness, если нужно явно дождаться задач вне `NgZone`, поскольку это не происходит автоматически.
