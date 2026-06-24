# NgModules

ВАЖНО: Команда Angular рекомендует
использовать [standalone-компоненты](guide/components/anatomy-of-components#-imports-in-the-component-decorator) вместо
`NgModule` для всего нового кода. Используйте это руководство для понимания существующего кода, созданного с помощью
`@NgModule`.

NgModule — это класс, помеченный декоратором `@NgModule`. Этот декоратор принимает _метаданные_, которые сообщают
Angular, как компилировать шаблоны компонентов и настраивать внедрение зависимостей (DI).

```typescript
import {NgModule} from '@angular/core';

@NgModule({
  // Metadata goes here
})
export class CustomMenuModule { }
```

У NgModule есть две основные обязанности:

- Объявление компонентов, директив и pipe'ов, принадлежащих этому NgModule.
- Добавление провайдеров в инжектор для компонентов, директив и pipe'ов, которые импортируют этот NgModule.

## Declarations

Свойство `declarations` метаданных `@NgModule` объявляет компоненты, директивы и pipe'ы, принадлежащие этому NgModule.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem are components.
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

В примере выше компоненты `CustomMenu` и `CustomMenuItem` принадлежат `CustomMenuModule`.

Свойство `declarations` дополнительно принимает _массивы_ компонентов, директив и pipe'ов. Эти массивы, в свою очередь,
также могут содержать другие массивы.

```typescript
const MENU_COMPONENTS = [CustomMenu, CustomMenuItem];
const WIDGETS = [MENU_COMPONENTS, CustomSlider];

@NgModule({
  /* ... */
  // This NgModule declares all of CustomMenu, CustomMenuItem,
  // CustomSlider, and CustomCheckbox.
  declarations: [WIDGETS, CustomCheckbox],
})
export class CustomMenuModule { }
```

Если Angular обнаружит какие-либо компоненты, директивы или pipe'ы, объявленные более чем в одном NgModule, он сообщит
об ошибке.

Любые компоненты, директивы или pipe'ы должны быть явно помечены как `standalone: false`, чтобы их можно было объявить в
NgModule.

```typescript
@Component({
  // Mark this component as `standalone: false` so that it can be declared in an NgModule.
  standalone: false,
  /* ... */
})
export class CustomMenu { /* ... */ }
```

### imports

Компоненты, объявленные в NgModule, могут зависеть от других компонентов, директив и pipe'ов. Добавьте эти зависимости в
свойство `imports` метаданных `@NgModule`.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem depend on the PopupTrigger and SelectorIndicator components.
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

Массив `imports` принимает другие NgModule, а также standalone-компоненты, директивы и pipe'ы.

### exports

NgModule может _экспортировать_ свои объявленные компоненты, директивы и pipe'ы так, чтобы они были доступны другим
компонентам и NgModule.

```typescript
@NgModule({
 imports: [PopupTrigger, SelectionIndicator],
 declarations: [CustomMenu, CustomMenuItem],

 // Make CustomMenu and CustomMenuItem available to
 // components and NgModules that import CustomMenuModule.
 exports: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

Однако свойство `exports` не ограничивается объявлениями. NgModule также может экспортировать любые другие компоненты,
директивы, pipe'ы и NgModule, которые он импортирует.

```typescript
@NgModule({
 imports: [PopupTrigger, SelectionIndicator],
 declarations: [CustomMenu, CustomMenuItem],

 // Also make PopupTrigger available to any component or NgModule that imports CustomMenuModule.
 exports: [CustomMenu, CustomMenuItem, PopupTrigger],
})
export class CustomMenuModule { }
```

## Провайдеры NgModule

СОВЕТ: См. руководство по [Внедрению зависимостей (DI)](guide/di) для получения информации о внедрении зависимостей и
провайдерах.

`NgModule` может указывать `providers` (провайдеров) для внедряемых зависимостей. Эти провайдеры доступны для:

- Любого standalone-компонента, директивы или pipe'а, который импортирует этот NgModule, и
- `declarations` и `providers` любого _другого_ NgModule, который импортирует этот NgModule.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Provide the OverlayManager service
  providers: [OverlayManager],
  /* ... */
})
export class CustomMenuModule { }

@NgModule({
  imports: [CustomMenuModule],
  declarations: [UserProfile],
  providers: [UserDataClient],
})
export class UserProfileModule { }
```

В примере выше:

- `CustomMenuModule` предоставляет `OverlayManager`.
- Компоненты `CustomMenu` и `CustomMenuItem` могут внедрить `OverlayManager`, так как они объявлены в
  `CustomMenuModule`.
- `UserProfile` может внедрить `OverlayManager`, так как его NgModule импортирует `CustomMenuModule`.
- `UserDataClient` может внедрить `OverlayManager`, так как его NgModule импортирует `CustomMenuModule`.

### Паттерн `forRoot` и `forChild`

Некоторые NgModule определяют статический метод `forRoot`, который принимает некоторую конфигурацию и возвращает массив
провайдеров. Имя «`forRoot`» — это соглашение, указывающее на то, что эти провайдеры предназначены для добавления
исключительно в _корень_ (root) вашего приложения во время начальной загрузки (bootstrap).

Любые провайдеры, включенные таким образом, загружаются немедленно (eagerly loaded), увеличивая размер JavaScript-бандла
начальной загрузки страницы.

```typescript
bootstrapApplication(MyApplicationRoot, {
  providers: [
    CustomMenuModule.forRoot(/* some config */),
  ],
});
```

Аналогично, некоторые NgModule могут определять статический метод `forChild`, указывающий, что провайдеры предназначены
для добавления в компоненты внутри иерархии вашего приложения.

```typescript
@Component({
  /* ... */
  providers: [
    CustomMenuModule.forChild(/* some config */),
  ],
})
export class UserProfile { /* ... */ }
```

## Запуск (Bootstrapping) приложения

ВАЖНО: Команда Angular рекомендует использовать [bootstrapApplication](api/platform-browser/bootstrapApplication) вместо
`bootstrapModule` для всего нового кода. Используйте это руководство для понимания существующих приложений, запускаемых
с помощью `@NgModule`.

Декоратор `@NgModule` принимает необязательный массив `bootstrap`, который может содержать один или несколько
компонентов.

Вы можете использовать метод [`bootstrapModule`](https://angular.dev/api/core/PlatformRef#bootstrapModule) из [
`platformBrowser`](api/platform-browser/platformBrowser) или [`platformServer`](api/platform-server/platformServer) для
запуска приложения Angular. При запуске эта функция находит на странице любые элементы с CSS-селектором, соответствующим
перечисленным компонентам, и рендерит эти компоненты на странице.

```typescript
import {platformBrowser} from '@angular/platform-browser';

@NgModule({
  bootstrap: [MyApplication],
})
export class MyApplicationModule { }

platformBrowser().bootstrapModule(MyApplicationModule);
```

Компоненты, перечисленные в `bootstrap`, автоматически включаются в `declarations` этого NgModule.

Когда вы запускаете приложение из NgModule, собранные `providers` этого модуля и все `providers` его `imports`
загружаются немедленно и доступны для внедрения во всем приложении.
