# Ссылки на дочерние элементы компонента с помощью запросов {#referencing-component-children-with-queries}

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Компонент может определять **запросы**, которые находят дочерние элементы и читают значения из их инжекторов.

Разработчики чаще всего используют запросы для получения ссылок на дочерние компоненты, директивы, DOM-элементы и другие объекты.

Все функции запросов возвращают сигналы, отражающие наиболее актуальные результаты. Вы можете прочитать результат, вызвав сигнальную функцию, в том числе в [реактивных контекстах](guide/signals#reactive-contexts), таких как `computed` и `effect`.

Существует две категории запросов: **запросы представления** и **запросы контента**.

## Запросы представления {#view-queries}

Запросы представления извлекают результаты из элементов _представления_ компонента — элементов, определённых в собственном шаблоне компонента. Вы можете запросить один результат с помощью функции `viewChild`.

```angular-ts {highlight: [14, 15]}
@Component({
  selector: 'custom-card-header',
  /*...*/
})
export class CustomCardHeader {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard {
  header = viewChild(CustomCardHeader);
  headerText = computed(() => this.header()?.text);
}
```

В этом примере компонент `CustomCard` запрашивает дочерний `CustomCardHeader` и использует результат в `computed`.

Если запрос не находит результат, его значение будет `undefined`. Это может произойти, если целевой элемент скрыт с помощью `@if`. Angular поддерживает результат `viewChild` в актуальном состоянии по мере изменения состояния приложения.

Вы также можете запросить несколько результатов с помощью функции `viewChildren`.

```angular-ts {highlight: [17]}
@Component({
  selector: 'custom-card-action',
  /*...*/
})
export class CustomCardAction {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: `
    <custom-card-action>Save</custom-card-action>
    <custom-card-action>Cancel</custom-card-action>
  `,
})
export class CustomCard {
  actions = viewChildren(CustomCardAction);
  actionsTexts = computed(() => this.actions().map((action) => action.text));
}
```

`viewChildren` создаёт сигнал с массивом (`Array`) результатов запроса.

**Запросы никогда не проникают через границы компонентов.** Запросы представления могут извлекать результаты только из шаблона компонента.

## Запросы контента {#content-queries}

Запросы контента извлекают результаты из элементов _контента_ компонента — элементов, вложенных в компонент в шаблоне, где он используется. Вы можете запросить один результат с помощью функции `contentChild`.

```angular-ts {highlight: [14, 15]}
@Component({
  selector: 'custom-toggle',
  /*...*/
})
export class CustomToggle {
  text: string;
}

@Component({
  selector: 'custom-expando',
  /* ... */
})
export class CustomExpando {
  toggle = contentChild(CustomToggle);
  toggleText = computed(() => this.toggle()?.text);
}

@Component({
  /* ... */
  // CustomToggle is used inside CustomExpando as content.
  template: `
    <custom-expando>
      <custom-toggle>Show</custom-toggle>
    </custom-expando>
  `,
})
export class UserProfile {}
```

Если запрос не находит результат, его значение будет `undefined`. Это может произойти, если целевой элемент отсутствует или скрыт с помощью `@if`. Angular поддерживает результат `contentChild` в актуальном состоянии по мере изменения состояния приложения.

По умолчанию запросы контента находят только _непосредственных_ потомков компонента и не обходят вложенные элементы.

Вы также можете запросить несколько результатов с помощью функции `contentChildren`.

```angular-ts {highlight: [14, 15]}
@Component({
  selector: 'custom-menu-item',
  /*...*/
})
export class CustomMenuItem {
  text: string;
}

@Component({
  selector: 'custom-menu',
  /*...*/
})
export class CustomMenu {
  items = contentChildren(CustomMenuItem);
  itemTexts = computed(() => this.items().map((item) => item.text));
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-menu>
      <custom-menu-item>Cheese</custom-menu-item>
      <custom-menu-item>Tomato</custom-menu-item>
    </custom-menu>
  `,
})
export class UserProfile {}
```

`contentChildren` создаёт сигнал с массивом (`Array`) результатов запроса.

**Запросы никогда не проникают через границы компонентов.** Запросы контента могут извлекать результаты только из того же шаблона, в котором находится сам компонент.

## Обязательные запросы {#required-queries}

Если дочерний запрос (`viewChild` или `contentChild`) не находит результат, его значение будет `undefined`. Это может произойти, если целевой элемент скрыт с помощью управляющей конструкции, такой как `@if` или `@for`. Из-за этого дочерние запросы возвращают сигнал, который включает `undefined` в свой тип значения.

В некоторых случаях, особенно с `viewChild`, вы точно знаете, что определённый дочерний элемент всегда присутствует. В других случаях вы можете захотеть строго обеспечить наличие определённого дочернего элемента. Для этих случаев используется _обязательный запрос_.

```ts
@Component({
  /*...*/
})
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

Если обязательный запрос не находит соответствующий результат, Angular сообщает об ошибке. Поскольку это гарантирует наличие результата, обязательные запросы автоматически не включают `undefined` в тип значения сигнала.

## Локаторы запросов {#query-locators}

Первый параметр каждого декоратора запроса — это его **локатор**.

В большинстве случаев в качестве локатора используется компонент или директива.

Вы также можете указать строковый локатор, соответствующий [переменной ссылки на шаблон](guide/templates/variables#template-reference-variables).

```angular-ts
@Component({
  /*...*/
  template: `
    <button #save>Save</button>
    <button #cancel>Cancel</button>
  `,
})
export class ActionBar {
  saveButton = viewChild<ElementRef<HTMLButtonElement>>('save');
}
```

Если несколько элементов определяют одну и ту же переменную ссылки на шаблон, запрос извлекает первый соответствующий элемент.

Angular не поддерживает CSS-селекторы в качестве локаторов запросов.

### Запросы и дерево инжекторов {#queries-and-the-injector-tree}

TIP: Для получения фоновой информации о провайдерах и дереве внедрения Angular см. [Внедрение зависимостей](guide/di).

Для более сложных случаев вы можете использовать любой `ProviderToken` в качестве локатора. Это позволяет находить элементы на основе провайдеров компонентов и директив.

```angular-ts
const SUB_ITEM = new InjectionToken<string>('sub-item');

@Component({
  /*...*/
  providers: [{provide: SUB_ITEM, useValue: 'special-item'}],
})
export class SpecialItem {}

@Component({
  /*...*/
})
export class CustomList {
  subItemType = contentChild(SUB_ITEM);
}
```

В примере выше используется `InjectionToken` в качестве локатора, но вы можете использовать любой `ProviderToken` для поиска конкретных элементов.

## Параметры запросов {#query-options}

Все функции запросов принимают объект параметров в качестве второго аргумента. Эти параметры определяют, как запрос находит результаты.

### Чтение конкретных значений из инжектора элемента {#reading-specific-values-from-an-elements-injector}

По умолчанию локатор запроса указывает как на искомый элемент, так и на извлекаемое значение. Вы можете дополнительно указать параметр `read`, чтобы получить другое значение из элемента, найденного по локатору.

```ts
@Component({
  /*...*/
})
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

В примере выше находится элемент с директивой `ExpandoContent` и извлекается `TemplateRef`, связанный с этим элементом.

Разработчики чаще всего используют `read` для получения `ElementRef` и `TemplateRef`.

### Обход вложенных элементов контента {#content-descendants}

По умолчанию `contentChildren` находит только _непосредственных_ потомков компонента и не обходит вложенные элементы. `contentChild` по умолчанию обходит вложенные элементы.

```angular-ts {highlight: [13, 14, 15, 16, 17]}
@Component({
  selector: 'custom-expando',
  /*...*/
})
export class CustomExpando {
  toggle = contentChildren(CustomToggle); // none found
  // toggle = contentChild(CustomToggle); // found
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-expando>
      <some-other-component>
        <custom-toggle>Show</custom-toggle>
      </some-other-component>
    </custom-expando>
  `,
})
export class UserProfile {}
```

В примере выше `CustomExpando` не может найти `<custom-toggle>` с помощью `contentChildren`, потому что он не является непосредственным потомком `<custom-expando>`. Установив `descendants: true`, вы настраиваете запрос на обход всех вложенных элементов в том же шаблоне. Однако запросы _никогда_ не проникают внутрь компонентов для обхода элементов в других шаблонах.

Запросы представления не имеют этого параметра, поскольку они _всегда_ обходят вложенные элементы.

## Запросы на основе декораторов {#decorator-based-queries}

TIP: Хотя команда Angular рекомендует использовать сигнальные функции запросов для новых проектов, оригинальные API запросов на основе декораторов по-прежнему полностью поддерживаются.

Вы также можете объявлять запросы, добавив соответствующий декоратор к свойству. Запросы на основе декораторов работают так же, как сигнальные запросы, за исключением описанных ниже особенностей.

### Запросы представления {#decorator-view-queries}

Вы можете запросить один результат с помощью декоратора `@ViewChild`.

```angular-ts {highlight: [14, 16, 17, 18]}
@Component({
  selector: 'custom-card-header',
  /*...*/
})
export class CustomCardHeader {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard implements AfterViewInit {
  @ViewChild(CustomCardHeader) header: CustomCardHeader;

  ngAfterViewInit() {
    console.log(this.header.text);
  }
}
```

В этом примере компонент `CustomCard` запрашивает дочерний `CustomCardHeader` и обращается к результату в `ngAfterViewInit`.

Angular поддерживает результат `@ViewChild` в актуальном состоянии по мере изменения состояния приложения.

**Результаты запроса представления становятся доступными в методе жизненного цикла `ngAfterViewInit`**. До этого момента значение будет `undefined`. Подробнее о жизненном цикле компонента см. в разделе [Жизненный цикл](guide/components/lifecycle).

Вы также можете запросить несколько результатов с помощью декоратора `@ViewChildren`.

```angular-ts {highlight: [17, 19, 20, 21, 22, 23]}
@Component({
  selector: 'custom-card-action',
  /*...*/
})
export class CustomCardAction {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: `
    <custom-card-action>Save</custom-card-action>
    <custom-card-action>Cancel</custom-card-action>
  `,
})
export class CustomCard implements AfterViewInit {
  @ViewChildren(CustomCardAction) actions: QueryList<CustomCardAction>;

  ngAfterViewInit() {
    this.actions.forEach((action) => {
      console.log(action.text);
    });
  }
}
```

`@ViewChildren` создаёт объект `QueryList`, содержащий результаты запроса. Вы можете подписаться на изменения результатов запроса через свойство `changes`.

### Запросы контента {#decorator-content-queries}

Вы можете запросить один результат с помощью декоратора `@ContentChild`.

```angular-ts {highlight: [14, 16, 17, 18]}
@Component({
  selector: 'custom-toggle',
  /*...*/
})
export class CustomToggle {
  text: string;
}

@Component({
  selector: 'custom-expando',
  /*...*/
})
export class CustomExpando implements AfterContentInit {
  @ContentChild(CustomToggle) toggle: CustomToggle;

  ngAfterContentInit() {
    console.log(this.toggle.text);
  }
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-expando>
      <custom-toggle>Show</custom-toggle>
    </custom-expando>
  `,
})
export class UserProfile {}
```

В этом примере компонент `CustomExpando` запрашивает дочерний `CustomToggle` и обращается к результату в `ngAfterContentInit`.

Angular поддерживает результат `@ContentChild` в актуальном состоянии по мере изменения состояния приложения.

**Результаты запроса контента становятся доступными в методе жизненного цикла `ngAfterContentInit`**. До этого момента значение будет `undefined`. Подробнее о жизненном цикле компонента см. в разделе [Жизненный цикл](guide/components/lifecycle).

Вы также можете запросить несколько результатов с помощью декоратора `@ContentChildren`.

```angular-ts {highlight: [14, 16, 17, 18, 19, 20]}
@Component({
  selector: 'custom-menu-item',
  /*...*/
})
export class CustomMenuItem {
  text: string;
}

@Component({
  selector: 'custom-menu',
  /*...*/
})
export class CustomMenu implements AfterContentInit {
  @ContentChildren(CustomMenuItem) items: QueryList<CustomMenuItem>;

  ngAfterContentInit() {
    this.items.forEach((item) => {
      console.log(item.text);
    });
  }
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-menu>
      <custom-menu-item>Cheese</custom-menu-item>
      <custom-menu-item>Tomato</custom-menu-item>
    </custom-menu>
  `,
})
export class UserProfile {}
```

`@ContentChildren` создаёт объект `QueryList`, содержащий результаты запроса. Вы можете подписаться на изменения результатов запроса через свойство `changes`.

### Параметры запросов на основе декораторов {#decorator-based-query-options}

Все декораторы запросов принимают объект параметров в качестве второго аргумента. Эти параметры работают так же, как для сигнальных запросов, за исключением описанных ниже особенностей.

### Статические запросы {#static-queries}

Декораторы `@ViewChild` и `@ContentChild` принимают параметр `static`.

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard implements OnInit {
  @ViewChild(CustomCardHeader, {static: true}) header: CustomCardHeader;

  ngOnInit() {
    console.log(this.header.text);
  }
}
```

Установив `static: true`, вы гарантируете Angular, что цель этого запроса _всегда_ присутствует и не отображается условно. Это позволяет получить результат раньше, в методе жизненного цикла `ngOnInit`.

Результаты статических запросов не обновляются после инициализации.

Параметр `static` недоступен для запросов `@ViewChildren` и `@ContentChildren`.

### Использование QueryList {#using-querylist}

`@ViewChildren` и `@ContentChildren` возвращают объект `QueryList`, содержащий список результатов.

`QueryList` предоставляет множество удобных API для работы с результатами в стиле массива, таких как `map`, `reduce` и `forEach`. Вы можете получить массив текущих результатов, вызвав `toArray`.

Вы можете подписаться на свойство `changes`, чтобы выполнять действия при каждом изменении результатов.

## Типичные ошибки при использовании запросов {#common-query-pitfalls}

При использовании запросов распространённые ошибки могут сделать ваш код сложнее для понимания и поддержки.

Всегда поддерживайте единый источник истины для состояния, общего между несколькими компонентами. Это позволяет избежать ситуаций, когда дублированное состояние в разных компонентах становится рассинхронизированным.

Избегайте прямой записи состояния в дочерние компоненты. Такой паттерн может привести к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).

Никогда не записывайте состояние напрямую в родительские или предковые компоненты. Такой паттерн может привести к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).
