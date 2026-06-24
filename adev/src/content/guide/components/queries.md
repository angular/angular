# Получение ссылок на дочерние элементы с помощью запросов

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Основами](essentials). Если вы новичок в Angular,
сначала прочитайте их.

Компонент может определять **запросы** (queries), которые находят дочерние элементы и считывают значения из их
инжекторов.

Разработчики чаще всего используют запросы для получения ссылок на дочерние компоненты, директивы, DOM-элементы и многое
другое.

Все функции запросов возвращают сигналы, отражающие наиболее актуальные результаты. Вы можете прочитать результат,
вызвав функцию сигнала, в том числе в реактивных контекстах, таких как `computed` и `effect`.

Существует две категории запросов: **view-запросы** (запросы к представлению) и **content-запросы** (запросы к
контенту).

## View-запросы

View-запросы извлекают результаты из элементов _представления_ (view) компонента — элементов, определенных в собственном
шаблоне компонента. Вы можете запросить одиночный результат с помощью функции `viewChild`.

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

В этом примере компонент `CustomCard` запрашивает дочерний элемент `CustomCardHeader` и использует результат в
`computed`.

Если запрос не находит результат, его значением будет `undefined`. Это может произойти, если целевой элемент скрыт с
помощью `@if`. Angular поддерживает результат `viewChild` в актуальном состоянии по мере изменения состояния вашего
приложения.

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
  actionsTexts = computed(() => this.actions().map(action => action.text));
}
```

`viewChildren` создает сигнал с массивом (`Array`) результатов запроса.

**Запросы никогда не проникают сквозь границы компонентов.** View-запросы могут извлекать результаты только из шаблона
самого компонента.

## Content-запросы

Content-запросы извлекают результаты из элементов _контента_ компонента — элементов, вложенных внутрь компонента в
шаблоне, где он используется. Вы можете запросить одиночный результат с помощью функции `contentChild`.

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
  `
})

export class UserProfile { }
```

Если запрос не находит результат, его значением будет `undefined`. Это может произойти, если целевой элемент отсутствует
или скрыт с помощью `@if`. Angular поддерживает результат `contentChild` в актуальном состоянии по мере изменения
состояния вашего приложения.

По умолчанию content-запросы находят только _прямых_ потомков компонента и не углубляются в дерево потомков.

Вы также можете запросить несколько результатов с помощью функции `contentChildren`.

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

export class CustomMenu {
  items = contentChildren(CustomMenuItem);
  itemTexts = computed(() => this.items().map(item => item.text));
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-menu>
      <custom-menu-item>Cheese</custom-menu-item>
      <custom-menu-item>Tomato</custom-menu-item>
    </custom-menu>
  `
})
export class UserProfile { }
```

`contentChildren` создает сигнал с массивом (`Array`) результатов запроса.

**Запросы никогда не проникают сквозь границы компонентов.** Content-запросы могут извлекать результаты только из того
же шаблона, в котором объявлен сам компонент.

## Обязательные запросы

Если дочерний запрос (`viewChild` или `contentChild`) не находит результат, его значением является `undefined`. Это
может произойти, если целевой элемент скрыт управляющей конструкцией, такой как `@if` или `@for`. Из-за этого дочерние
запросы возвращают сигнал, тип значения которого включает `undefined`.

В некоторых случаях, особенно с `viewChild`, вы точно знаете, что конкретный дочерний элемент всегда доступен. В других
случаях вы можете захотеть строго потребовать наличие конкретного дочернего элемента. Для таких случаев можно
использовать _обязательный запрос_ (required query).

```ts
@Component({/* ... */})
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

Если обязательный запрос не находит соответствующего результата, Angular сообщает об ошибке. Поскольку это гарантирует
наличие результата, обязательные запросы не включают автоматически `undefined` в тип значения сигнала.

## Локаторы запросов

Первым параметром для каждого запроса является его **локатор**.

Чаще всего в качестве локатора вы будете использовать компонент или директиву.

Вы также можете указать строковый локатор,
соответствующий [переменной ссылки на шаблон](guide/templates/variables#template-reference-variables).

```angular-ts
@Component({
  /*...*/
  template: `
    <button #save>Save</button>
    <button #cancel>Cancel</button>
  `
})
export class ActionBar {
  saveButton = viewChild<ElementRef<HTMLButtonElement>>('save');
}
```

Если несколько элементов определяют одну и ту же переменную ссылки на шаблон, запрос извлекает первый подходящий
элемент.

Angular не поддерживает CSS-селекторы в качестве локаторов запросов.

### Запросы и дерево инжекторов

TIP: См. раздел [Внедрение зависимостей](guide/di) для получения информации о провайдерах и дереве инъекций Angular.

Для более сложных случаев вы можете использовать любой `ProviderToken` в качестве локатора. Это позволяет находить
элементы на основе провайдеров компонентов и директив.

```angular-ts
const SUB_ITEM = new InjectionToken<string>('sub-item');

@Component({
  /*...*/
  providers: [{provide: SUB_ITEM, useValue: 'special-item'}],
})
export class SpecialItem { }

@Component({/*...*/})
export class CustomList {
  subItemType = contentChild(SUB_ITEM);
}
```

В приведенном выше примере в качестве локатора используется `InjectionToken`, но вы можете использовать любой
`ProviderToken` для поиска конкретных элементов.

## Опции запросов

Все функции запросов принимают объект опций в качестве второго параметра. Эти опции управляют тем, как запрос находит
свои результаты.

### Чтение конкретных значений из инжектора элемента

По умолчанию локатор запроса указывает как на элемент, который вы ищете, так и на извлекаемое значение. Вы можете
дополнительно указать опцию `read`, чтобы получить другое значение из элемента, соответствующего локатору.

```ts

@Component({/*...*/})
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

В приведенном выше примере находится элемент с директивой `ExpandoContent` и извлекается `TemplateRef`, связанный с этим
элементом.

Разработчики чаще всего используют `read` для получения `ElementRef` и `TemplateRef`.

### Потомки контента

По умолчанию запросы `contentChildren` находят только _прямых_ потомков компонента и не углубляются в дерево потомков.
Запросы `contentChild` по умолчанию просматривают потомков.

```angular-ts {highlight: [13, 14, 15, 16]}
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
  `
})
export class UserProfile { }
```

В примере выше `CustomExpando` не может найти `<custom-toggle>` с помощью `contentChildren`, так как он не является
прямым потомком `<custom-expando>`. Установив `descendants: true`, вы настраиваете запрос на обход всех потомков в том
же шаблоне. Однако запросы _никогда_ не проникают внутрь компонентов для обхода элементов в других шаблонах.

У view-запросов нет этой опции, так как они _всегда_ просматривают потомков.

## Запросы на основе декораторов

TIP: Хотя команда Angular рекомендует использовать функции запросов на основе сигналов для новых проектов, оригинальные
API запросов на основе декораторов остаются полностью поддерживаемыми.

Вы также можете объявлять запросы, добавляя соответствующий декоратор к свойству. Запросы на основе декораторов ведут
себя так же, как и запросы на основе сигналов, за исключением случаев, описанных ниже.

### View-запросы

Вы можете запросить одиночный результат с помощью декоратора `@ViewChild`.

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
export class CustomCard {
  @ViewChild(CustomCardHeader) header: CustomCardHeader;

  ngAfterViewInit() {
    console.log(this.header.text);
  }
}
```

В этом примере компонент `CustomCard` запрашивает дочерний элемент `CustomCardHeader` и получает доступ к результату в
`ngAfterViewInit`.

Angular поддерживает результат `@ViewChild` в актуальном состоянии по мере изменения состояния вашего приложения.

**Результаты view-запросов становятся доступными в методе жизненного цикла `ngAfterViewInit`**. До этого момента
значение равно `undefined`. Подробности о жизненном цикле компонента см. в
разделе [Жизненный цикл](guide/components/lifecycle).

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
export class CustomCard {
  @ViewChildren(CustomCardAction) actions: QueryList<CustomCardAction>;

  ngAfterViewInit() {
    this.actions.forEach(action => {
      console.log(action.text);
    });
  }
}
```

`@ViewChildren` создает объект `QueryList`, содержащий результаты запроса. Вы можете подписаться на изменения
результатов запроса с течением времени через свойство `changes`.

### Content-запросы

Вы можете запросить одиночный результат с помощью декоратора `@ContentChild`.

```angular-ts {highlight: [14, 16, 17, 18, 25]}
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

export class CustomExpando {
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
  `
})
export class UserProfile { }
```

В этом примере компонент `CustomExpando` запрашивает дочерний элемент `CustomToggle` и получает доступ к результату в
`ngAfterContentInit`.

Angular поддерживает результат `@ContentChild` в актуальном состоянии по мере изменения состояния вашего приложения.

**Результаты content-запросов становятся доступными в методе жизненного цикла `ngAfterContentInit`**. До этого момента
значение равно `undefined`. Подробности о жизненном цикле компонента см. в
разделе [Жизненный цикл](guide/components/lifecycle).

Вы также можете запросить несколько результатов с помощью декоратора `@ContentChildren`.

```angular-ts {highlight: [15, 17, 18, 19, 20, 21]}
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
  @ContentChildren(CustomMenuItem) items: QueryList<CustomMenuItem>;

  ngAfterContentInit() {
    this.items.forEach(item => {
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
  `
})
export class UserProfile { }
```

`@ContentChildren` создает объект `QueryList`, содержащий результаты запроса. Вы можете подписаться на изменения
результатов запроса с течением времени через свойство `changes`.

### Опции запросов на основе декораторов

Все декораторы запросов принимают объект опций в качестве второго параметра. Эти опции работают так же, как и в запросах
на основе сигналов, за исключением описанных ниже случаев.

### Статические запросы

Декораторы `@ViewChild` и `@ContentChild` принимают опцию `static`.

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard {
  @ViewChild(CustomCardHeader, {static: true}) header: CustomCardHeader;

  ngOnInit() {
    console.log(this.header.text);
  }
}
```

Устанавливая `static: true`, вы гарантируете Angular, что цель этого запроса _всегда_ присутствует и не рендерится
условно. Это делает результат доступным раньше, в методе жизненного цикла `ngOnInit`.

Результаты статических запросов не обновляются после инициализации.

Опция `static` недоступна для запросов `@ViewChildren` и `@ContentChildren`.

### Использование QueryList

`@ViewChildren` и `@ContentChildren` предоставляют объект `QueryList`, содержащий список результатов.

`QueryList` предлагает ряд удобных API для работы с результатами подобно массиву, таких как `map`, `reduce` и `forEach`.
Вы можете получить массив текущих результатов, вызвав `toArray`.

Вы можете подписаться на свойство `changes`, чтобы выполнять действия при каждом изменении результатов.

## Распространенные ошибки при использовании запросов

При использовании запросов распространенные ошибки могут затруднить понимание и поддержку вашего кода.

Всегда поддерживайте единый источник истины для состояния, общего для нескольких компонентов. Это позволяет избежать
сценариев, когда повторяющееся состояние в разных компонентах рассинхронизируется.

Избегайте прямой записи состояния в дочерние компоненты. Этот паттерн может привести к хрупкому коду, который трудно
понять и который подвержен ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).

Никогда не записывайте состояние напрямую в родительские или вышестоящие компоненты. Этот паттерн может привести к
хрупкому коду, который трудно понять и который подвержен
ошибкам [ExpressionChangedAfterItHasBeenChecked](errors/NG0100).
