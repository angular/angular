# Создание harnesses для ваших компонентов

## Перед началом {#before-you-start}

TIP: Это руководство предполагает, что вы уже прочитали [обзорное руководство по component harnesses](guide/testing/component-harnesses-overview). Прочитайте его сначала, если вы новичок в использовании component harnesses.

### Когда имеет смысл создавать test harness? {#when-does-creating-a-test-harness-make-sense}

Команда Angular рекомендует создавать component test harnesses для shared-компонентов, которые используются во многих местах и имеют некоторую пользовательскую интерактивность. Чаще всего это относится к библиотекам виджетов и похожим переиспользуемым компонентам. Harnesses ценны в этих случаях, потому что они предоставляют потребителям этих shared-компонентов хорошо поддерживаемый API для взаимодействия с компонентом. Тесты, использующие harnesses, могут избежать зависимости от ненадёжных деталей реализации этих shared-компонентов, таких как структура DOM и конкретные event listeners.

Для компонентов, которые появляются только в одном месте, например страницы в приложении, harnesses не дают столько пользы. В этих ситуациях тесты компонента могут разумно зависеть от деталей реализации этого компонента, поскольку тесты и компоненты обновляются одновременно. Однако harnesses всё ещё дают некоторую ценность, если вы будете использовать harness и в unit-, и в end-to-end тестах.

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор примитивов поведения для построения компонентов. Чтобы использовать component harnesses, сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

## Расширение `ComponentHarness` {#extending-componentharness}

Абстрактный класс `ComponentHarness` — базовый класс для всех component harnesses. Чтобы создать пользовательский component harness, расширьте `ComponentHarness` и реализуйте статическое свойство `hostSelector`.

Свойство `hostSelector` идентифицирует элементы в DOM, которые соответствуют этому подклассу harness. В большинстве случаев `hostSelector` должен совпадать с селектором соответствующего `Component` или `Directive`. Например, рассмотрим простой popup-компонент:

```ts
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{ triggerText() }}</button>
    @if (isOpen()) {
      <div class="my-popup-content"><ng-content /></div>
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

В этом случае минимальный harness для компонента выглядел бы так:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

Хотя подклассам `ComponentHarness` требуется только свойство `hostSelector`, большинство harnesses также должны реализовывать статический метод `with` для генерации экземпляров `HarnessPredicate`. Раздел [фильтрация harnesses](guide/testing/using-component-harnesses#filtering-harnesses) охватывает это подробнее.

## Поиск элементов в DOM компонента {#finding-elements-in-the-components-dom}

Каждый экземпляр подкласса `ComponentHarness` представляет конкретный экземпляр соответствующего компонента. Вы можете получить доступ к host-элементу компонента через метод `host()` базового класса `ComponentHarness`.

`ComponentHarness` также предлагает несколько методов для поиска элементов внутри DOM компонента. Эти методы — `locatorFor()`, `locatorForOptional()` и `locatorForAll()`. Эти методы создают функции, которые находят элементы; они не находят элементы напрямую. Такой подход защищает от кэширования ссылок на устаревшие элементы. Например, когда блок `@if` скрывает, а затем показывает элемент, результатом является новый DOM-элемент; использование функций гарантирует, что тесты всегда ссылаются на текущее состояние DOM.

См. [страницу API reference ComponentHarness](/api/cdk/testing/ComponentHarness) для полного списка деталей различных методов `locatorFor`.

Например, `MyPopupHarness` из примера выше мог бы предоставить методы для получения элементов trigger и content следующим образом:

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

`TestElement` — это абстракция, разработанная для работы в разных тестовых окружениях (unit-тесты, WebDriver и т.д.). При использовании harnesses все взаимодействие с DOM следует выполнять через этот интерфейс. Другие способы доступа к DOM-элементам, такие как `document.querySelector()`, работают не во всех тестовых окружениях.

У `TestElement` есть ряд методов для взаимодействия с нижележащим DOM, таких как `blur()`, `click()`, `getAttribute()` и другие. См. [страницу API reference TestElement](/api/cdk/testing/TestElement) для полного списка методов.

Не раскрывайте экземпляры `TestElement` пользователям harness, если это не элемент, который потребитель компонента определяет напрямую, например host-элемент компонента. Раскрытие экземпляров `TestElement` для внутренних элементов приводит к тому, что пользователи зависят от внутренней структуры DOM компонента.

Вместо этого предоставляйте более узкоспециализированные методы для конкретных действий, которые может выполнить конечный пользователь, или конкретного состояния, которое он может наблюдать. Например, `MyPopupHarness` из предыдущих разделов мог бы предоставить методы вроде `toggle` и `isOpen`:

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

## Загрузка harnesses для подкомпонентов {#loading-harnesses-for-subcomponents}

Крупные компоненты часто композируют подкомпоненты. Эту структуру можно отразить и в harness компонента. У каждого из методов `locatorFor` на `ComponentHarness` есть альтернативная сигнатура, которую можно использовать для поиска sub-harnesses вместо элементов.

См. [страницу API reference ComponentHarness](/api/cdk/testing/ComponentHarness) для полного списка различных методов locatorFor.

Например, рассмотрим меню, построенное с использованием popup из выше:

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

  items = contentChildren(MyMenuItem);
}
```

Harness для `MyMenu` затем может использовать другие harnesses для `MyPopup` и `MyMenuItem`:

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

## Фильтрация экземпляров harness с `HarnessPredicate` {#filtering-harness-instances-with-harnesspredicate}

Когда на странице несколько экземпляров конкретного компонента, может понадобиться фильтровать по некоторому свойству компонента, чтобы получить конкретный экземпляр. Например, может понадобиться кнопка с определённым текстом или меню с определённым ID. Класс `HarnessPredicate` может зафиксировать такие критерии для подкласса `ComponentHarness`. Хотя автор теста может конструировать экземпляры `HarnessPredicate` вручную, проще, когда подкласс `ComponentHarness` предоставляет вспомогательный метод для построения предикатов для распространённых фильтров.

Следует создать статический метод `with()` на каждом подклассе `ComponentHarness`, который возвращает `HarnessPredicate` для этого класса. Это позволяет авторам тестов писать легко понятный код, например `loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. В дополнение к стандартным опциям selector и ancestor метод `with` должен добавлять любые другие опции, имеющие смысл для конкретного подкласса.

Harnesses, которым нужно добавить дополнительные опции, должны расширять интерфейс `BaseHarnessFilters` и дополнительные опциональные свойства по необходимости. `HarnessPredicate` предоставляет несколько удобных методов для добавления опций: `stringMatches()`, `addOption()` и `add()`. См. [страницу API HarnessPredicate](/api/cdk/testing/HarnessPredicate) для полного описания.

Например, при работе с меню полезно фильтровать по тексту trigger и фильтровать пункты меню по их тексту:

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

Можно передать `HarnessPredicate` вместо класса `ComponentHarness` в любой из API на `HarnessLoader`, `LocatorFactory` или `ComponentHarness`. Это позволяет авторам тестов легко нацеливаться на конкретный экземпляр компонента при создании экземпляра harness. Это также позволяет автору harness использовать тот же `HarnessPredicate` для включения более мощных API в своём классе harness. Например, рассмотрим метод `getItems` на `MyMenuHarness`, показанный выше. Добавление API фильтрации позволяет пользователям harness искать конкретные пункты меню:

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

## Создание `HarnessLoader` для элементов, использующих content projection {#creating-harnessloader-for-elements-that-use-content-projection}

Некоторые компоненты проецируют дополнительное содержимое в шаблон компонента. См. [руководство по content projection](guide/components/content-projection) для дополнительной информации.

Добавьте экземпляр `HarnessLoader`, ограниченный элементом, содержащим `<ng-content>`, когда создаёте harness для компонента, использующего content projection. Это позволяет пользователю harness загружать дополнительные harnesses для любых компонентов, переданных как содержимое. У `ComponentHarness` есть несколько методов, которые можно использовать для создания экземпляров HarnessLoader в таких случаях: `harnessLoaderFor()`, `harnessLoaderForOptional()`, `harnessLoaderForAll()`. См. [страницу API reference интерфейса HarnessLoader](/api/cdk/testing/HarnessLoader) для дополнительных деталей.

Например, `MyPopupHarness` из примера выше может расширить `ContentContainerComponentHarness`, чтобы добавить поддержку загрузки harnesses внутри `<ng-content>` компонента.

```ts
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
```

## Доступ к элементам вне host-элемента компонента {#accessing-elements-outside-of-the-components-host-element}

Бывают случаи, когда component harness может потребовать доступ к элементам вне host-элемента соответствующего компонента. Например, код, отображающий плавающий элемент или pop-up, часто прикрепляет DOM-элементы напрямую к document body, как сервис `Overlay` в Angular CDK.

В этом случае `ComponentHarness` предоставляет метод, который можно использовать для получения `LocatorFactory` для корневого элемента документа. `LocatorFactory` поддерживает большинство тех же API, что и базовый класс `ComponentHarness`, и затем может использоваться для запросов относительно корневого элемента документа.

Представьте, что компонент `MyPopup` выше использовал CDK overlay для содержимого popup, а не элемент в своём собственном шаблоне. В этом случае `MyPopupHarness` должен был бы получить доступ к элементу content через метод `documentRootLocatorFactory()`, который получает locator factory с корнем в корне документа.

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

Методы на `TestElement` автоматически запускают change detection Angular и ждут задач внутри `NgZone`. В большинстве случаев авторам harness не требуется специальных усилий для ожидания асинхронных задач. Однако есть некоторые крайние случаи, когда этого может быть недостаточно.

При некоторых обстоятельствах анимации Angular могут потребовать второго цикла change detection и последующей стабилизации `NgZone`, прежде чем события анимации будут полностью сброшены. В случаях, когда это нужно, `ComponentHarness` предлагает метод `forceStabilize()`, который можно вызвать для второго раунда.

Можно использовать `NgZone.runOutsideAngular()` для планирования задач вне NgZone. Вызовите метод `waitForTasksOutsideAngular()` на соответствующем harness, если нужно явно дождаться задач вне `NgZone`, поскольку это не происходит автоматически.
