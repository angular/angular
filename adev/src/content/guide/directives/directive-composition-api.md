# API композиции директив

Директивы Angular — удобный способ инкапсулировать переиспользуемое поведение: директивы могут применять
атрибуты, CSS-классы и слушатели событий к элементу.

_API композиции директив_ позволяет применять директивы к host-элементу компонента
_изнутри_ TypeScript-класса компонента.

## Добавление директив к компоненту {#adding-directives-to-a-component}

Директивы применяются к компоненту через свойство `hostDirectives` в декораторе
компонента. Такие директивы называют _host-директивами_.

В этом примере директива `MenuBehavior` применяется к host-элементу `AdminMenu`. Это
работает аналогично применению `MenuBehavior` к элементу `<admin-menu>` в шаблоне.

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu {}
```

Когда фреймворк рендерит компонент, Angular также создаёт экземпляр каждой host-директивы.
Host-привязки директив применяются к host-элементу компонента. По умолчанию inputs и outputs
host-директив не входят в публичный API компонента. См.
[Включение inputs и outputs](#including-inputs-and-outputs) ниже.

**Angular применяет host-директивы статически на этапе компиляции.** Нельзя динамически добавлять
директивы в runtime.

**Директивы в `hostDirectives` не должны указывать `standalone: false`.**

**Angular игнорирует `selector` директив, применённых в свойстве `hostDirectives`.**

## Включение inputs и outputs {#including-inputs-and-outputs}

Когда вы применяете `hostDirectives` к компоненту, inputs и outputs host-директив
по умолчанию не включаются в API компонента. Их можно явно включить в API компонента,
расширив запись в `hostDirectives`:

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [
    {
      directive: MenuBehavior,
      inputs: ['menuId'],
      outputs: ['menuClosed'],
    },
  ],
})
export class AdminMenu {}
```

Явно указав inputs и outputs, потребители компонента с `hostDirective` могут
привязывать их в шаблоне:

```angular-html
<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()"></admin-menu>
```

Кроме того, inputs и outputs из `hostDirective` можно алиасить, чтобы настроить API
компонента:

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [
    {
      directive: MenuBehavior,
      inputs: ['menuId: id'],
      outputs: ['menuClosed: closed'],
    },
  ],
})
export class AdminMenu {}
```

```angular-html
<admin-menu id="top-menu" (closed)="logMenuClosed()"></admin-menu>
```

## Добавление директив к другой директиве {#adding-directives-to-another-directive}

`hostDirectives` можно добавлять и к другим директивам, не только к компонентам. Это позволяет
транзитивно агрегировать несколько поведений.

В следующем примере определены две директивы — `Menu` и `Tooltip`. Затем поведение
этих двух директив композируется в `MenuWithTooltip`. Наконец, `MenuWithTooltip`
применяется к `SpecializedMenuWithTooltip`.

Когда `SpecializedMenuWithTooltip` используется в шаблоне, создаются экземпляры всех
`Menu`, `Tooltip` и `MenuWithTooltip`. Host-привязки каждой из этих директив применяются к host-
элементу `SpecializedMenuWithTooltip`.

```ts
@Directive({
  /* ... */
})
export class Menu {}

@Directive({
  /* ... */
})
export class Tooltip {}

// MenuWithTooltip can compose behaviors from multiple other directives
@Directive({
  hostDirectives: [Tooltip, Menu],
})
export class MenuWithTooltip {}

// CustomWidget can apply the already-composed behaviors from MenuWithTooltip
@Directive({
  hostDirectives: [MenuWithTooltip],
})
export class SpecializedMenuWithTooltip {}
```

## Семантика host-директив {#host-directive-semantics}

### Порядок выполнения директив {#directive-execution-order}

Host-директивы проходят тот же жизненный цикл, что и компоненты и директивы, используемые напрямую в
шаблоне. Однако host-директивы всегда выполняют конструктор, хуки жизненного цикла и привязки _до_ компонента или директивы, к которым они применены.

Следующий пример показывает минимальное использование host-директивы:

```typescript
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu {}
```

Порядок выполнения здесь:

1. Создаётся экземпляр `MenuBehavior`
2. Создаётся экземпляр `AdminMenu`
3. `MenuBehavior` получает inputs (`ngOnInit`)
4. `AdminMenu` получает inputs (`ngOnInit`)
5. `MenuBehavior` применяет host-привязки
6. `AdminMenu` применяет host-привязки

Такой порядок операций означает, что компоненты с `hostDirectives` могут переопределять любые host-привязки,
заданные host-директивой.

Этот порядок операций распространяется и на вложенные цепочки host-директив, как в следующем
примере.

```typescript
@Directive({...})
export class Tooltip { }

@Directive({
  hostDirectives: [Tooltip],
})
export class CustomTooltip { }

@Directive({
  hostDirectives: [CustomTooltip],
})
export class EvenMoreCustomTooltip { }
```

В примере выше порядок выполнения:

1. Создаётся экземпляр `Tooltip`
2. Создаётся экземпляр `CustomTooltip`
3. Создаётся экземпляр `EvenMoreCustomTooltip`
4. `Tooltip` получает inputs (`ngOnInit`)
5. `CustomTooltip` получает inputs (`ngOnInit`)
6. `EvenMoreCustomTooltip` получает inputs (`ngOnInit`)
7. `Tooltip` применяет host-привязки
8. `CustomTooltip` применяет host-привязки
9. `EvenMoreCustomTooltip` применяет host-привязки

### Внедрение зависимостей {#dependency-injection}

Компонент или директива, указывающие `hostDirectives`, могут внедрять экземпляры этих host-
директив и наоборот.

При применении host-директив к компоненту и компонент, и host-директивы могут определять
провайдеры.

Если компонент или директива с `hostDirectives` и эти host-директивы предоставляют один и тот же
injection token, провайдеры, определённые классом с `hostDirectives`, имеют приоритет над провайдерами,
определёнными host-директивами.

### Дедупликация host-директив {#host-directive-de-duplication}

Когда одна и та же директива появляется более одного раза в разрешённом дереве host-директив, она автоматически дедуплицируется, а не вызывает ошибку. Для выбора выжившего совпадения используются два детерминированных правила.

#### Совпадение по шаблону имеет приоритет {#template-match-takes-precedence}

Если директива совпадает с элементом один раз через **селектор шаблона** и также появляется как
**host-директива**, Angular сохраняет только совпадение по шаблону и отбрасывает все совпадения host-директив.

Ментальная модель: совпадение host-директивы представляет `Partial<YourDirective>` — частичное
применение, где открыты только inputs и outputs, явно перечисленные в `hostDirectives`,
тогда как совпадение по шаблону представляет полную директиву с полным публичным API.

```ts
@Directive({selector: '[hoverable]'})
export class Hoverable {}

@Component({
  selector: 'app-button',
  hostDirectives: [Hoverable],
})
export class Button {}
```

```angular-html
<!-- Hoverable is matched by selector AND as a host directive of Button. -->
<!-- Angular keeps only the selector match, which has the full public API. -->
<app-button hoverable></app-button>
```

#### Несколько совпадений host-директив объединяются {#multiple-host-directive-matches-are-merged}

Если одна и та же директива появляется **более одного раза как host-директива** — например, когда две
директивы объявляют общую зависимость в своих `hostDirectives` — Angular объединяет все
экземпляры в один экземпляр директивы. Отображения inputs и outputs из всех экземпляров
комбинируются.

Это решает классическую [проблему ромба](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem) в композиции host-директив:

```ts
// A shared behavior that both triggers need
@Directive({
  host: {
    '[attr.data-trigger-id]': 'triggerId',
  },
})
export class TriggerRef {
  readonly triggerId = `trigger-${crypto.randomUUID()}`;
}

// Two separate triggers, each declaring TriggerRef as a host directive
@Directive({
  selector: '[popoverTrigger]',
  hostDirectives: [TriggerRef],
})
export class PopoverTrigger {
  readonly triggerRef = inject(TriggerRef);
}

@Directive({
  selector: '[dropdownTrigger]',
  hostDirectives: [TriggerRef],
})
export class DropdownTrigger {
  readonly triggerRef = inject(TriggerRef);
}
```

```angular-html
<!-- Angular keeps one TriggerRef instance, shared by both triggers. -->
<button popoverTrigger dropdownTrigger>Actions</button>
```

HELPFUL: Поскольку Angular создаёт только один экземпляр общей директивы, и `PopoverTrigger`,
и `DropdownTrigger` получают один и тот же экземпляр `TriggerRef` при внедрении.

#### Конфликтующие алиасы {#conflicting-aliases}

Когда Angular объединяет дублирующиеся совпадения host-директив, он также объединяет их отображения inputs и outputs.
Если два экземпляра одной host-директивы открывают **один и тот же input или output под разными
алиасами**, Angular выбрасывает ошибку на этапе компиляции ([NG8024](errors/NG8024))

```ts
@Directive({
  selector: '[popoverTrigger]',
  hostDirectives: [{directive: TriggerRef, inputs: ['triggerId: popoverTriggerId']}],
})
export class PopoverTrigger {}

@Directive({
  selector: '[dropdownTrigger]',
  hostDirectives: [
    {directive: TriggerRef, inputs: ['triggerId: dropdownTriggerId']}, // different alias!
  ],
})
export class DropdownTrigger {}
```

```angular-html
<!-- Error: triggerId is exposed as both "popoverTriggerId" and "dropdownTriggerId". -->
<button popoverTrigger dropdownTrigger></button>
```

Чтобы разрешить это, убедитесь, что оба пути открывают общий input или output под одним алиасом, либо
не открывайте его вовсе.
