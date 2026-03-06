# Создание Harness для компонентов {#creating-harnesses-for-your-components}

## Перед началом {#before-you-start}

TIP: Это руководство предполагает, что вы уже ознакомились с [обзорным руководством по Harness компонентов](guide/testing/component-harnesses-overview). Если вы новичок в использовании Harness компонентов, сначала прочитайте его.

### Когда имеет смысл создавать тестовый Harness? {#when-does-creating-a-test-harness-make-sense}

Команда Angular рекомендует создавать тестовые Harness для общих компонентов, используемых во многих местах и имеющих некоторую интерактивность. Чаще всего это применимо к библиотекам виджетов и аналогичным переиспользуемым компонентам. Harness ценны в этих случаях, поскольку предоставляют потребителям общих компонентов хорошо поддерживаемый API для взаимодействия с компонентом. Тесты, использующие Harness, могут избежать зависимости от ненадёжных деталей реализации этих общих компонентов, таких как структура DOM и конкретные обработчики событий.

Для компонентов, встречающихся только в одном месте, например страницы приложения, Harness не приносят такой же пользы. В таких ситуациях тесты компонента могут разумно зависеть от деталей его реализации, поскольку тесты и компоненты обновляются одновременно. Тем не менее Harness всё равно могут быть полезны, если вы будете использовать Harness как в юнит-тестах, так и в end-to-end тестах.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор примитивов поведения для создания компонентов. Для использования Harness компонентов сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Расширение `ComponentHarness` {#extending-componentharness}

Абстрактный класс `ComponentHarness` является базовым классом для всех Harness компонентов. Для создания пользовательского Harness компонента расширьте `ComponentHarness` и реализуйте статическое свойство `hostSelector`.

Свойство `hostSelector` идентифицирует элементы в DOM, соответствующие данному подклассу Harness. В большинстве случаев `hostSelector` должен совпадать с селектором соответствующего `Component` или `Directive`. Например, рассмотрим простой компонент-всплывающее окно:

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

В этом случае минимальный Harness для компонента выглядит следующим образом:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

Хотя подклассам `ComponentHarness` требуется только свойство `hostSelector`, большинство Harness также должны реализовывать статический метод `with` для генерации экземпляров `HarnessPredicate`. Раздел [Фильтрация экземпляров Harness](guide/testing/using-component-harnesses#filtering-harnesses) рассматривает это подробнее.

## Поиск элементов в DOM компонента {#finding-elements-in-the-components-dom}

Каждый экземпляр подкласса `ComponentHarness` представляет конкретный экземпляр соответствующего компонента. Доступ к хост-элементу компонента осуществляется через метод `host()` базового класса `ComponentHarness`.

`ComponentHarness` также предлагает несколько методов для поиска элементов в DOM компонента: `locatorFor()`, `locatorForOptional()` и `locatorForAll()`. Эти методы создают функции для поиска элементов, а не ищут их напрямую. Такой подход защищает от кэширования ссылок на устаревшие элементы. Например, когда блок `@if` скрывает, а затем показывает элемент, результатом является новый DOM-элемент; использование функций гарантирует, что тесты всегда ссылаются на текущее состояние DOM.

Полный список деталей различных методов `locatorFor` смотрите на [странице справочника API ComponentHarness](/api/cdk/testing/ComponentHarness).

Например, в примере `MyPopupHarness` можно предоставить методы для получения элементов триггера и контента следующим образом:

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

`TestElement` — абстракция, предназначенная для работы в различных тестовых средах (юнит-тесты, WebDriver и т.д.). При использовании Harness все взаимодействия с DOM следует выполнять через этот интерфейс. Другие способы доступа к DOM-элементам, такие как `document.querySelector()`, работают не во всех тестовых средах.

`TestElement` имеет ряд методов для взаимодействия с базовым DOM, таких как `blur()`, `click()`, `getAttribute()` и другие. Полный список методов смотрите на [странице справочника API TestElement](/api/cdk/testing/TestElement).

Не раскрывайте экземпляры `TestElement` пользователям Harness, если только это не элемент, напрямую определённый потребителем компонента, например хост-элемент компонента. Раскрытие экземпляров `TestElement` для внутренних элементов заставляет пользователей зависеть от внутренней структуры DOM компонента.

Вместо этого предоставляйте более специализированные методы для конкретных действий конечного пользователя или конкретного состояния, которое он может наблюдать. Например, `MyPopupHarness` из предыдущих разделов мог бы предоставлять такие методы, как `toggle` и `isOpen`:

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

## Загрузка Harness для дочерних компонентов {#loading-harnesses-for-subcomponents}

Крупные компоненты часто составляются из дочерних компонентов. Эту структуру можно отразить и в Harness компонента. Каждый из методов `locatorFor` в `ComponentHarness` имеет альтернативную сигнатуру, используемую для поиска дочерних Harness вместо элементов.

Полный список различных методов `locatorFor` смотрите на [странице справочника API ComponentHarness](/api/cdk/testing/ComponentHarness).

Например, рассмотрим меню, построенное на основе всплывающего окна из примера выше:

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

Harness для `MyMenu` может использовать другие Harness для `MyPopup` и `MyMenuItem`:

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

## Фильтрация экземпляров Harness с помощью `HarnessPredicate` {#filtering-harness-instances-with-harnesspredicate}

Когда страница содержит несколько экземпляров конкретного компонента, может потребоваться фильтрация по некоторому свойству компонента для получения конкретного экземпляра. Например, может потребоваться кнопка с определённым текстом или меню с определённым ID. Класс `HarnessPredicate` может фиксировать такие критерии для подкласса `ComponentHarness`. Хотя автор теста может создавать экземпляры `HarnessPredicate` вручную, это проще, когда подкласс `ComponentHarness` предоставляет вспомогательный метод для создания предикатов для типичных фильтров.

Следует создавать статический метод `with()` для каждого подкласса `ComponentHarness`, возвращающий `HarnessPredicate` для этого класса. Это позволяет авторам тестов писать легко понятный код, например `loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. Помимо стандартных параметров selector и ancestor, метод `with` должен добавлять любые другие параметры, которые имеют смысл для конкретного подкласса.

Harness, которым нужно добавить дополнительные параметры, должны расширять интерфейс `BaseHarnessFilters` и добавлять необязательные свойства по мере необходимости. `HarnessPredicate` предоставляет несколько удобных методов для добавления параметров: `stringMatches()`, `addOption()` и `add()`. Полное описание смотрите на [странице API HarnessPredicate](/api/cdk/testing/HarnessPredicate).

Например, при работе с меню полезно фильтровать по тексту триггера и элементам меню по их тексту:

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

Можно передавать `HarnessPredicate` вместо класса `ComponentHarness` в любые API `HarnessLoader`, `LocatorFactory` или `ComponentHarness`. Это позволяет авторам тестов легко выбирать конкретный экземпляр компонента при создании экземпляра Harness. Также это позволяет автору Harness использовать тот же `HarnessPredicate` для создания более мощных API в своём классе Harness. Например, рассмотрим метод `getItems` в `MyMenuHarness` выше. Добавление API фильтрации позволяет пользователям Harness искать конкретные элементы меню:

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

## Создание `HarnessLoader` для элементов с проекцией контента {#creating-harnessloader-for-elements-that-use-content-projection}

Некоторые компоненты проецируют дополнительный контент в шаблон компонента. Подробнее смотрите в [руководстве по проекции контента](guide/components/content-projection).

При создании Harness для компонента, использующего проекцию контента, добавьте экземпляр `HarnessLoader` с областью видимости, ограниченной элементом, содержащим `<ng-content>`. Это позволяет пользователю Harness загружать дополнительные Harness для любых компонентов, переданных в качестве контента. У `ComponentHarness` есть несколько методов для создания экземпляров `HarnessLoader` в таких случаях: `harnessLoaderFor()`, `harnessLoaderForOptional()`, `harnessLoaderForAll()`. Подробнее смотрите на [странице справочника API интерфейса HarnessLoader](/api/cdk/testing/HarnessLoader).

Например, `MyPopupHarness` из примера выше может расширить `ContentContainerComponentHarness` для добавления поддержки загрузки Harness внутри `<ng-content>` компонента.

```ts
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
```

## Доступ к элементам за пределами хост-элемента компонента {#accessing-elements-outside-of-the-components-host-element}

Бывают случаи, когда Harness компонента может потребоваться доступ к элементам за пределами хост-элемента соответствующего компонента. Например, код, отображающий плавающий элемент или всплывающее окно, часто прикрепляет DOM-элементы непосредственно к телу документа, как сервис `Overlay` в Angular CDK.

В этом случае `ComponentHarness` предоставляет метод для получения `LocatorFactory` для корневого элемента документа. `LocatorFactory` поддерживает большинство тех же API, что и базовый класс `ComponentHarness`, и может использоваться для запросов относительно корневого элемента документа.

Допустим, компонент `MyPopup` из примера выше использовал overlay CDK для контента всплывающего окна, а не элемент в своём шаблоне. В этом случае `MyPopupHarness` должен был бы обращаться к элементу контента через метод `documentRootLocatorFactory()`, возвращающий фабрику локаторов с корнем в корне документа.

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

Методы `TestElement` автоматически запускают обнаружение изменений Angular и ожидают задач внутри `NgZone`. В большинстве случаев от авторов Harness не требуется специальных усилий для ожидания асинхронных задач. Однако есть пограничные случаи, когда этого может быть недостаточно.

При некоторых обстоятельствах Angular-анимациям может потребоваться второй цикл обнаружения изменений и последующая стабилизация `NgZone` перед полным завершением событий анимации. В таких случаях `ComponentHarness` предлагает метод `forceStabilize()`, который можно вызвать для выполнения второго раунда.

Можно использовать `NgZone.runOutsideAngular()` для планирования задач вне NgZone. Вызовите метод `waitForTasksOutsideAngular()` на соответствующем Harness, если нужно явно дождаться задач вне `NgZone`, поскольку это не происходит автоматически.
