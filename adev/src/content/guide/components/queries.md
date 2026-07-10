# Ссылки на дочерние элементы компонента через queries

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Прочитайте его сначала, если вы новичок в Angular.

Компонент может определять **queries**, которые находят дочерние элементы и читают значения из их injectors.

Разработчики чаще всего используют queries для получения ссылок на дочерние компоненты, директивы, DOM-элементы и многое другое.

Все функции query возвращают сигналы, отражающие самые актуальные результаты. Можно прочитать
результат, вызвав функцию сигнала, в том числе в [реактивных контекстах](guide/signals#reactive-contexts) вроде `computed` и `effect`.

Есть две категории query: **view queries** и **content queries.**

## View queries {#view-queries}

View queries получают результаты из элементов в _view_ компонента — элементов, определённых в собственном шаблоне компонента. Можно сделать query на один результат с помощью функции `viewChild`.

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

В этом примере компонент `CustomCard` делает query на дочерний `CustomCardHeader` и использует результат в `computed`.

Если query не находит результат, его значение — `undefined`. Это может произойти, если целевой элемент скрыт `@if`. Angular поддерживает результат `viewChild` актуальным по мере изменения состояния приложения.

Также можно сделать query на несколько результатов с помощью функции `viewChildren`.

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

`viewChildren` создаёт сигнал с `Array` результатов query.

**Queries никогда не проходят сквозь границы компонентов.** View queries могут получать результаты только из шаблона компонента.

## Content queries {#content-queries}

Content queries получают результаты из элементов в _content_ компонента — элементов, вложенных внутрь компонента в шаблоне, где он используется. Можно сделать query на один результат с помощью функции `contentChild`.

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

Если query не находит результат, его значение — `undefined`. Это может произойти, если целевой элемент отсутствует или скрыт `@if`. Angular поддерживает результат `contentChild` актуальным по мере изменения состояния приложения.

По умолчанию content queries находят только _прямых_ детей компонента и не обходят descendants.

Также можно сделать query на несколько результатов с помощью функции `contentChildren`.

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

`contentChildren` создаёт сигнал с `Array` результатов query.

**Queries никогда не проходят сквозь границы компонентов.** Content queries могут получать результаты только из того же шаблона, что и сам компонент.

## Обязательные queries {#required-queries}

Если child query (`viewChild` или `contentChild`) не находит результат, его значение — `undefined`. Это может произойти, если целевой элемент скрыт оператором control flow вроде `@if` или `@for`. Из-за этого child queries возвращают сигнал, включающий `undefined` в тип значения.

В некоторых случаях, особенно с `viewChild`, вы с уверенностью знаете, что конкретный ребёнок всегда доступен. В других случаях можете захотеть строго обеспечить присутствие конкретного ребёнка. Для этих случаев можно использовать _required query_.

```ts
@Component(/* ... */)
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

Если required query не находит совпадающий результат, Angular сообщает об ошибке. Поскольку это гарантирует доступность результата, required queries не включают автоматически `undefined` в тип значения сигнала.

## Query locators {#query-locators}

Первый параметр каждого query decorator — его **locator**.

Чаще всего вы хотите использовать компонент или директиву как locator.

Альтернативно можно указать строковый locator, соответствующий
[template reference variable](guide/templates/variables#template-reference-variables).

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

Если более одного элемента определяют одну и ту же template reference variable, query получает первый совпадающий элемент.

Angular не поддерживает CSS-селекторы как query locators.

### Queries и дерево injectors {#queries-and-the-injector-tree}

TIP: См. [Dependency Injection](guide/di) для фона о providers и дереве injection Angular.

Для более продвинутых случаев можно использовать любой `ProviderToken` как locator. Это позволяет находить элементы на основе providers компонентов и директив.

```angular-ts
const SUB_ITEM = new InjectionToken<string>('sub-item');

@Component({
  /*...*/
  providers: [{provide: SUB_ITEM, useValue: 'special-item'}],
})
export class SpecialItem {}

@Component(/* ... */)
export class CustomList {
  subItemType = contentChild(SUB_ITEM);
}
```

Пример выше использует `InjectionToken` как locator, но можно использовать любой `ProviderToken` для поиска конкретных элементов.

## Опции query {#query-options}

Все функции query принимают объект опций как второй параметр. Эти опции контролируют, как query находит свои результаты.

### Чтение конкретных значений из injector элемента {#reading-specific-values-from-an-elements-injector}

По умолчанию query locator указывает и элемент, который вы ищете, и получаемое значение. Альтернативно можно указать опцию `read`, чтобы получить другое значение из элемента, совпавшего с locator.

```ts
@Component(/* ... */)
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

Пример выше находит элемент с директивой `ExpandoContent` и получает
`TemplateRef`, ассоциированный с этим элементом.

Разработчики чаще всего используют `read` для получения `ElementRef` и `TemplateRef`.

### Content descendants {#content-descendants}

По умолчанию queries `contentChildren` находят только _прямых_ детей компонента и не обходят descendants.
Queries `contentChild` по умолчанию обходят descendants.

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

В примере выше `CustomExpando` не может найти `<custom-toggle>` с `contentChildren`, потому что это не прямой ребёнок `<custom-expando>`. Задав `descendants: true`, вы настраиваете query на обход всех descendants в том же шаблоне. Queries, однако, _никогда_ не проходят внутрь компонентов для обхода элементов в других шаблонах.

У view queries нет этой опции, потому что они _всегда_ обходят descendants.

## Decorator-based queries {#decorator-based-queries}

TIP: Хотя команда Angular рекомендует использовать signal-based функцию query для новых проектов,
оригинальные decorator-based query API остаются полностью поддерживаемыми.

Альтернативно можно объявить queries, добавив соответствующий декоратор к свойству. Decorator-based queries ведут себя так же, как signal-based queries, за исключением описанного ниже.

### View queries {#decorator-view-queries}

Можно сделать query на один результат с помощью декоратора `@ViewChild`.

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

В этом примере компонент `CustomCard` делает query на дочерний `CustomCardHeader` и получает доступ к результату в `ngAfterViewInit`.

Angular поддерживает результат `@ViewChild` актуальным по мере изменения состояния приложения.

**Результаты view query становятся доступны в lifecycle-методе `ngAfterViewInit`**. До этой точки значение — `undefined`. См. раздел [Lifecycle](guide/components/lifecycle) для деталей о жизненном цикле компонента.

Также можно сделать query на несколько результатов с помощью декоратора `@ViewChildren`.

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

`@ViewChildren` создаёт объект `QueryList`, содержащий результаты query. Можно подписаться на изменения результатов query со временем через свойство `changes`.

### Content queries {#decorator-content-queries}

Можно сделать query на один результат с помощью декоратора `@ContentChild`.

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

В этом примере компонент `CustomExpando` делает query на дочерний `CustomToggle` и получает доступ к результату в `ngAfterContentInit`.

Angular поддерживает результат `@ContentChild` актуальным по мере изменения состояния приложения.

**Результаты content query становятся доступны в lifecycle-методе `ngAfterContentInit`**. До этой точки значение — `undefined`. См. раздел [Lifecycle](guide/components/lifecycle) для деталей о жизненном цикле компонента.

Также можно сделать query на несколько результатов с помощью декоратора `@ContentChildren`.

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

`@ContentChildren` создаёт объект `QueryList`, содержащий результаты query. Можно подписаться на изменения результатов query со временем через свойство `changes`.

### Опции decorator-based query {#decorator-based-query-options}

Все query-декораторы принимают объект опций как второй параметр. Эти опции работают так же, как signal-based queries, за исключением описанного ниже.

### Static queries {#static-queries}

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

Задав `static: true`, вы гарантируете Angular, что цель этого query _всегда_ присутствует и не отрисовывается условно. Это делает результат доступным раньше — в lifecycle-методе `ngOnInit`.

Результаты static query не обновляются после инициализации.

Опция `static` недоступна для queries `@ViewChildren` и `@ContentChildren`.

### Использование QueryList {#using-querylist}

И `@ViewChildren`, и `@ContentChildren` предоставляют объект `QueryList`, содержащий список результатов.

`QueryList` предлагает ряд удобных API для работы с результатами в array-like манере, таких как `map`, `reduce` и `forEach`. Можно получить массив текущих результатов, вызвав `toArray`.

Можно подписаться на свойство `changes`, чтобы делать что-то каждый раз, когда результаты меняются.

## Распространённые ловушки queries {#common-query-pitfalls}

При использовании queries распространённые ловушки могут сделать код сложнее для понимания и поддержки.

Всегда поддерживайте единый источник истины для состояния, разделяемого между несколькими компонентами. Это избегает сценариев, когда повторяющееся состояние в разных компонентах рассинхронизируется.

Избегайте прямой записи состояния в дочерние компоненты. Этот паттерн может привести к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).

Никогда не записывайте состояние напрямую в родительские или ancestor-компоненты. Этот паттерн может привести к хрупкому коду, который сложно понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).
