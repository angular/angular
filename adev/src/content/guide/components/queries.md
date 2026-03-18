# Обращение к дочерним элементам компонента через запросы {#referencing-component-children-with-queries}

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Компонент может определять **запросы**, которые находят дочерние элементы и читают значения из их инжекторов.

Разработчики чаще всего используют запросы для получения ссылок на дочерние компоненты, директивы, DOM-элементы и т.д.

Все функции запросов возвращают сигналы, отражающие актуальные результаты. Значение можно прочитать, вызвав функцию сигнала, в том числе в [реактивных контекстах](guide/signals#reactive-contexts), таких как `computed` и `effect`.

Существует два вида запросов: **запросы представления** и **запросы контента**.

## Запросы представления {#view-queries}

Запросы представления извлекают результаты из элементов _представления_ компонента — элементов, определённых в его собственном шаблоне. Для получения одного результата используется функция `viewChild`.

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

Если запрос не находит результата, его значение равно `undefined`. Это может происходить, если целевой элемент скрыт с помощью `@if`. Angular поддерживает результат `viewChild` в актуальном состоянии при изменении состояния приложения.

Для получения нескольких результатов используется функция `viewChildren`.

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

**Запросы никогда не проникают сквозь границы компонентов.** Запросы представления могут получать результаты только из шаблона компонента.

## Запросы контента {#content-queries}

Запросы контента извлекают результаты из элементов _контента_ компонента — элементов, вложенных в компонент в шаблоне, где он используется. Для получения одного результата используется функция `contentChild`.

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

Если запрос не находит результата, его значение равно `undefined`. Это может происходить, если целевой элемент отсутствует или скрыт с помощью `@if`. Angular поддерживает результат `contentChild` в актуальном состоянии при изменении состояния приложения.

По умолчанию запросы контента находят только _прямых_ дочерних элементов компонента и не обходят вложенных потомков.

Для получения нескольких результатов используется функция `contentChildren`.

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

**Запросы никогда не проникают сквозь границы компонентов.** Запросы контента могут получать результаты только из того же шаблона, что и сам компонент.

## Обязательные запросы {#required-queries}

Если дочерний запрос (`viewChild` или `contentChild`) не находит результата, его значение равно `undefined`. Это может происходить, если целевой элемент скрыт оператором управления потоком вроде `@if` или `@for`. По этой причине дочерние запросы возвращают сигнал, тип значения которого включает `undefined`.

В ряде случаев, особенно для `viewChild`, вы точно знаете, что конкретный дочерний элемент всегда присутствует. В других случаях может потребоваться строго обеспечить наличие конкретного дочернего элемента. Для таких случаев можно использовать _обязательный запрос_.

```ts
@Component({
  /*...*/
})
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

Если обязательный запрос не находит совпадающего результата, Angular сообщает об ошибке. Поскольку это гарантирует наличие результата, обязательные запросы не включают `undefined` в тип значения сигнала автоматически.

## Локаторы запросов {#query-locators}

Первый параметр каждого декоратора запроса является его **локатором**.

В большинстве случаев в качестве локатора используется компонент или директива.

Можно также указать строковый локатор, соответствующий
[переменной шаблонной ссылки](guide/templates/variables#template-reference-variables).

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

Если несколько элементов определяют одну и ту же переменную шаблонной ссылки, запрос возвращает первый совпадающий элемент.

Angular не поддерживает CSS-селекторы в качестве локаторов запросов.

### Запросы и дерево инжектора {#queries-and-the-injector-tree}

СОВЕТ: Справочную информацию о провайдерах и дереве внедрения Angular см. в разделе [Внедрение зависимостей](guide/di).

Для более сложных случаев можно использовать любой `ProviderToken` в качестве локатора. Это позволяет находить элементы на основе провайдеров компонентов и директив.

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

В примере выше в качестве локатора используется `InjectionToken`, но можно использовать любой `ProviderToken` для нахождения конкретных элементов.

## Опции запросов {#query-options}

Все функции запросов принимают объект опций в качестве второго параметра. Эти опции управляют тем, как запрос находит результаты.

### Чтение конкретных значений из инжектора элемента {#reading-specific-values-from-an-elements-injector}

По умолчанию локатор запроса определяет как искомый элемент, так и извлекаемое значение. Можно дополнительно указать опцию `read` для получения другого значения из элемента, найденного по локатору.

```ts
@Component({
  /*...*/
})
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

В примере выше находится элемент с директивой `ExpandoContent` и извлекается
`TemplateRef`, связанный с этим элементом.

Разработчики чаще всего используют `read` для получения `ElementRef` и `TemplateRef`.

### Потомки контента {#content-descendants}

По умолчанию запросы `contentChildren` находят только _прямых_ дочерних элементов компонента и не обходят вложенных потомков.
Запросы `contentChild` по умолчанию обходят потомков.

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

В примере выше `CustomExpando` не может найти `<custom-toggle>` через `contentChildren`, потому что он не является прямым дочерним элементом `<custom-expando>`. Установив `descendants: true`, можно настроить запрос на обход всех потомков в том же шаблоне. Однако запросы _никогда_ не проникают внутрь компонентов для обхода элементов других шаблонов.

Запросы представления не имеют этой опции, потому что они _всегда_ обходят потомков.

## Запросы на основе декораторов {#decorator-based-queries}

СОВЕТ: Хотя команда Angular рекомендует использовать функции запросов на основе сигналов для новых проектов, оригинальные API запросов на основе декораторов по-прежнему полностью поддерживаются.

Запросы можно также объявлять, добавляя соответствующий декоратор к свойству. Запросы на основе декораторов ведут себя так же, как и запросы на основе сигналов, за исключением описанного ниже.

### Запросы представления {#decorator-view-queries}

Для получения одного результата используется декоратор `@ViewChild`.

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

В этом примере компонент `CustomCard` запрашивает дочерний `CustomCardHeader` и получает доступ к результату в `ngAfterViewInit`.

Angular поддерживает результат `@ViewChild` в актуальном состоянии при изменении состояния приложения.

**Результаты запросов представления становятся доступны в методе жизненного цикла `ngAfterViewInit`**. До этого момента значение равно `undefined`. Подробнее о жизненном цикле компонента см. в разделе [Жизненный цикл](guide/components/lifecycle).

Для получения нескольких результатов используется декоратор `@ViewChildren`.

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

`@ViewChildren` создаёт объект `QueryList`, содержащий результаты запроса. Можно подписаться на изменения результатов со временем через свойство `changes`.

### Запросы контента {#decorator-content-queries}

Для получения одного результата используется декоратор `@ContentChild`.

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

В этом примере компонент `CustomExpando` запрашивает дочерний `CustomToggle` и получает доступ к результату в `ngAfterContentInit`.

Angular поддерживает результат `@ContentChild` в актуальном состоянии при изменении состояния приложения.

**Результаты запросов контента становятся доступны в методе жизненного цикла `ngAfterContentInit`**. До этого момента значение равно `undefined`. Подробнее о жизненном цикле компонента см. в разделе [Жизненный цикл](guide/components/lifecycle).

Для получения нескольких результатов используется декоратор `@ContentChildren`.

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

`@ContentChildren` создаёт объект `QueryList`, содержащий результаты запроса. Можно подписаться на изменения результатов со временем через свойство `changes`.

### Опции запросов на основе декораторов {#decorator-based-query-options}

Все декораторы запросов принимают объект опций в качестве второго параметра. Эти опции работают так же, как и для запросов на основе сигналов, за исключением описанного ниже.

### Статические запросы {#static-queries}

Декораторы `@ViewChild` и `@ContentChild` принимают опцию `static`.

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

Устанавливая `static: true`, вы гарантируете Angular, что цель этого запроса _всегда_ присутствует и не рендерится условно. Это делает результат доступным раньше — в методе жизненного цикла `ngOnInit`.

Результаты статических запросов не обновляются после инициализации.

Опция `static` недоступна для запросов `@ViewChildren` и `@ContentChildren`.

### Использование QueryList {#using-querylist}

`@ViewChildren` и `@ContentChildren` оба предоставляют объект `QueryList`, содержащий список результатов.

`QueryList` предлагает ряд удобных API для работы с результатами в стиле массива, таких как `map`, `reduce` и `forEach`. Текущий массив результатов можно получить, вызвав `toArray`.

Можно подписаться на свойство `changes` для выполнения действий при каждом изменении результатов.

## Распространённые ошибки при использовании запросов {#common-query-pitfalls}

При использовании запросов распространённые ошибки могут усложнить понимание и сопровождение кода.

Всегда поддерживайте единый источник истины для состояния, разделяемого между несколькими компонентами. Это позволяет избежать ситуаций, когда дублированное состояние в разных компонентах расходится.

Избегайте прямой записи состояния в дочерние компоненты. Такой паттерн может приводить к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).

Никогда не записывайте состояние напрямую в родительские или предковые компоненты. Такой паттерн может приводить к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).
