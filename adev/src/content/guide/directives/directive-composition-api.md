# API композиции директив

Директивы Angular предлагают отличный способ инкапсуляции повторно используемого поведения — директивы могут применять
атрибуты, CSS-классы и слушатели событий к элементу.

_API композиции директив_ позволяет применять директивы к хост-элементу компонента _изнутри_ TypeScript-класса
компонента.

## Добавление директив к компоненту

Вы применяете директивы к компоненту, добавляя свойство `hostDirectives` в декоратор компонента. Мы называем такие
директивы _хост-директивами_.

В этом примере мы применяем директиву `MenuBehavior` к хост-элементу `AdminMenu`. Это работает аналогично применению
`MenuBehavior` к элементу `<admin-menu>` в шаблоне.

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu { }
```

Когда фреймворк рендерит компонент, Angular также создает экземпляр каждой хост-директивы. Хост-привязки директив
применяются к хост-элементу компонента. По умолчанию Input-ы и Output-ы хост-директивы не доступны как часть публичного
API компонента. См. раздел [Включение Input-ов и Output-ов](#including-inputs-and-outputs) ниже для получения
дополнительной информации.

**Angular применяет хост-директивы статически во время компиляции.** Вы не можете динамически добавлять директивы во
время выполнения.

**Директивы, используемые в `hostDirectives`, не могут указывать `standalone: false`.**

**Angular игнорирует `selector` директив, применяемых в свойстве `hostDirectives`.**

## Включение Input-ов и Output-ов {#including-inputs-and-outputs}

Когда вы применяете `hostDirectives` к вашему компоненту, Input-ы и Output-ы хост-директив не включаются в API вашего
компонента по умолчанию. Вы можете явно включить Input-ы и Output-ы в API вашего компонента, расширив запись в
`hostDirectives`:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId'],
    outputs: ['menuClosed'],
  }],
})
export class AdminMenu { }
```

Явно указав Input-ы и Output-ы, потребители компонента с `hostDirective` могут привязывать их в шаблоне:

```angular-html

<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()">
```

Кроме того, вы можете создавать псевдонимы для Input-ов и Output-ов из `hostDirective`, чтобы настроить API вашего
компонента:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId: id'],
    outputs: ['menuClosed: closed'],
  }],
})
export class AdminMenu { }
```

```angular-html

<admin-menu id="top-menu" (closed)="logMenuClosed()">
```

## Добавление директив к другой директиве

Вы также можете добавлять `hostDirectives` к другим директивам, помимо компонентов. Это позволяет транзитивно
агрегировать несколько поведений.

В следующем примере мы определяем две директивы: `Menu` и `Tooltip`. Затем мы компонуем поведение этих двух директив в
`MenuWithTooltip`. Наконец, мы применяем `MenuWithTooltip` к `SpecializedMenuWithTooltip`.

Когда `SpecializedMenuWithTooltip` используется в шаблоне, создаются экземпляры всех директив: `Menu`, `Tooltip` и
`MenuWithTooltip`. Хост-привязки каждой из этих директив применяются к хост-элементу `SpecializedMenuWithTooltip`.

```typescript
@Directive({...})
export class Menu { }

@Directive({...})
export class Tooltip { }

// MenuWithTooltip can compose behaviors from multiple other directives
@Directive({
  hostDirectives: [Tooltip, Menu],
})
export class MenuWithTooltip { }

// CustomWidget can apply the already-composed behaviors from MenuWithTooltip
@Directive({
  hostDirectives: [MenuWithTooltip],
})
export class SpecializedMenuWithTooltip { }
```

## Семантика хост-директив

### Порядок выполнения директив

Хост-директивы проходят тот же жизненный цикл, что и компоненты или директивы, используемые непосредственно в шаблоне.
Однако хост-директивы всегда выполняют свой конструктор, хуки жизненного цикла и привязки _до_ компонента или директивы,
к которым они применены.

Следующий пример показывает минимальное использование хост-директивы:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu { }
```

Порядок выполнения здесь следующий:

1. Создается экземпляр `MenuBehavior`
2. Создается экземпляр `AdminMenu`
3. `MenuBehavior` получает Input-ы (`ngOnInit`)
4. `AdminMenu` получает Input-ы (`ngOnInit`)
5. `MenuBehavior` применяет хост-привязки
6. `AdminMenu` применяет хост-привязки

Этот порядок операций означает, что компоненты с `hostDirectives` могут переопределять любые хост-привязки, указанные
хост-директивой.

Этот порядок операций распространяется на вложенные цепочки хост-директив, как показано в следующем примере.

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

В примере выше порядок выполнения следующий:

1. Создается экземпляр `Tooltip`
2. Создается экземпляр `CustomTooltip`
3. Создается экземпляр `EvenMoreCustomTooltip`
4. `Tooltip` получает Input-ы (`ngOnInit`)
5. `CustomTooltip` получает Input-ы (`ngOnInit`)
6. `EvenMoreCustomTooltip` получает Input-ы (`ngOnInit`)
7. `Tooltip` применяет хост-привязки
8. `CustomTooltip` применяет хост-привязки
9. `EvenMoreCustomTooltip` применяет хост-привязки

### Внедрение зависимостей

Компонент или директива, указывающие `hostDirectives`, могут внедрять экземпляры этих хост-директив, и наоборот.

При применении хост-директив к компоненту, как компонент, так и хост-директивы могут определять провайдеры.

Если компонент или директива с `hostDirectives` и эти хост-директивы предоставляют один и тот же токен внедрения,
провайдеры, определенные классом с `hostDirectives`, имеют приоритет над провайдерами, определенными хост-директивами.
