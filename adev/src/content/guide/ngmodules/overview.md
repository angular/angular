# NgModules

IMPORTANT: Команда Angular рекомендует использовать [standalone-компоненты](guide/components) вместо `NgModule` для всего нового кода. Используйте это руководство для понимания существующего кода, написанного с `@NgModule`.

NgModule — это класс, отмеченный декоратором `@NgModule`. Этот декоратор принимает _метаданные_, которые сообщают Angular, как компилировать шаблоны компонентов и настраивать внедрение зависимостей.

```typescript
import {NgModule} from '@angular/core';

@NgModule({
  // Metadata goes here
})
export class CustomMenuModule {}
```

NgModule имеет две основные обязанности:

- Объявление компонентов, директив и пайпов, принадлежащих NgModule
- Добавление провайдеров в инжектор для компонентов, директив и пайпов, импортирующих NgModule

## Объявления {#declarations}

Свойство `declarations` метаданных `@NgModule` объявляет компоненты, директивы и пайпы, принадлежащие NgModule.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem are components.
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

В приведённом примере компоненты `CustomMenu` и `CustomMenuItem` принадлежат `CustomMenuModule`.

Свойство `declarations` также принимает _массивы_ компонентов, директив и пайпов. Эти массивы, в свою очередь, могут также содержать другие массивы.

```typescript
const MENU_COMPONENTS = [CustomMenu, CustomMenuItem];
const WIDGETS = [MENU_COMPONENTS, CustomSlider];

@NgModule({
  /* ... */
  // This NgModule declares all of CustomMenu, CustomMenuItem,
  // CustomSlider, and CustomCheckbox.
  declarations: [WIDGETS, CustomCheckbox],
})
export class CustomMenuModule {}
```

Если Angular обнаруживает компоненты, директивы или пайпы, объявленные более чем в одном NgModule, он сообщает об ошибке.

Любые компоненты, директивы или пайпы должны быть явно помечены как `standalone: false`, чтобы быть объявленными в NgModule.

```typescript
@Component({
  // Mark this component as `standalone: false` so that it can be declared in an NgModule.
  standalone: false,
  /* ... */
})
export class CustomMenu {
  /* ... */
}
```

### imports {#imports}

Компоненты, объявленные в NgModule, могут зависеть от других компонентов, директив и пайпов. Добавьте эти зависимости в свойство `imports` метаданных `@NgModule`.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem depend on the PopupTrigger and SelectorIndicator components.
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

Массив `imports` принимает другие NgModules, а также standalone-компоненты, директивы и пайпы.

### exports {#exports}

NgModule может _экспортировать_ объявленные компоненты, директивы и пайпы так, чтобы они были доступны другим компонентам и NgModules.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Make CustomMenu and CustomMenuItem available to
  // components and NgModules that import CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

Свойство `exports` не ограничивается объявлениями. NgModule также может экспортировать любые другие компоненты, директивы, пайпы и NgModules, которые он импортирует.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Also make PopupTrigger available to any component or NgModule that imports CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem, PopupTrigger],
})
export class CustomMenuModule {}
```

## Провайдеры `NgModule` {#ngmodule-providers}

TIP: Сведения о внедрении зависимостей и провайдерах см. в [руководстве по внедрению зависимостей](guide/di).

`NgModule` может указывать `providers` для внедряемых зависимостей. Эти провайдеры доступны для:

- Любого standalone-компонента, директивы или пайпа, импортирующего NgModule, и
- `declarations` и `providers` любого _другого_ NgModule, импортирующего NgModule.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Provide the OverlayManager service
  providers: [OverlayManager],
  /* ... */
})
export class CustomMenuModule {}

@NgModule({
  imports: [CustomMenuModule],
  declarations: [UserProfile],
  providers: [UserDataClient],
})
export class UserProfileModule {}
```

В приведённом примере:

- `CustomMenuModule` предоставляет `OverlayManager`.
- Компоненты `CustomMenu` и `CustomMenuItem` могут внедрять `OverlayManager`, поскольку они объявлены в `CustomMenuModule`.
- `UserProfile` может внедрять `OverlayManager`, поскольку его NgModule импортирует `CustomMenuModule`.
- `UserDataClient` может внедрять `OverlayManager`, поскольку его NgModule импортирует `CustomMenuModule`.

### Паттерн `forRoot` и `forChild` {#the-forroot-and-forchild-pattern}

Некоторые NgModules определяют статический метод `forRoot`, принимающий некоторую конфигурацию и возвращающий массив провайдеров. Название "`forRoot`" — это соглашение, указывающее, что эти провайдеры предназначены для добавления исключительно в _корень_ вашего приложения при загрузке.

Любые провайдеры, добавленные таким образом, загружаются eagerly, увеличивая размер JavaScript-бандла при начальной загрузке страницы.

```typescript
bootstrapApplication(MyApplicationRoot, {
  providers: [CustomMenuModule.forRoot(/* some config */)],
});
```

Аналогично, некоторые NgModules могут определять статический `forChild`, указывающий, что провайдеры предназначены для добавления к компонентам внутри иерархии вашего приложения.

```typescript
@Component({
  /* ... */
  providers: [CustomMenuModule.forChild(/* some config */)],
})
export class UserProfile {
  /* ... */
}
```

## Загрузка приложения {#bootstrapping-an-application}

IMPORTANT: Команда Angular рекомендует использовать [bootstrapApplication](api/platform-browser/bootstrapApplication) вместо `bootstrapModule` для всего нового кода. Используйте это руководство для понимания существующих приложений, загруженных с `@NgModule`.

Декоратор `@NgModule` принимает необязательный массив `bootstrap`, который может содержать один или несколько компонентов.

Вы можете использовать метод [`bootstrapModule`](/api/core/PlatformRef#bootstrapModule) из [`platformBrowser`](api/platform-browser/platformBrowser) или [`platformServer`](api/platform-server/platformServer) для запуска Angular-приложения. При выполнении эта функция находит любые элементы на странице с CSS-селектором, соответствующим указанному компоненту (компонентам), и рендерит эти компоненты на странице.

```typescript
import {platformBrowser} from '@angular/platform-browser';

@NgModule({
  bootstrap: [MyApplication],
})
export class MyApplicationModule {}

platformBrowser().bootstrapModule(MyApplicationModule);
```

Компоненты, перечисленные в `bootstrap`, автоматически включаются в объявления NgModule.

При загрузке приложения из NgModule собранные `providers` этого модуля и всех `providers` его `imports` загружаются eagerly и доступны для внедрения во всём приложении.
