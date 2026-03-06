# NgModules {#ngmodules}

IMPORTANT: Команда Angular рекомендует использовать [автономные Компоненты](guide/components) вместо `NgModule` для всего нового кода. Используйте это руководство для понимания существующего кода, построенного с `@NgModule`.

NgModule — это класс, помеченный декоратором `@NgModule`. Этот декоратор принимает _метаданные_, сообщающие Angular, как компилировать Шаблоны Компонентов и настраивать внедрение зависимостей.

```typescript
import {NgModule} from '@angular/core';

@NgModule({
  // Метаданные здесь
})
export class CustomMenuModule {}
```

NgModule имеет две основные обязанности:

- Объявление Компонентов, Директив и пайпов, принадлежащих NgModule
- Добавление провайдеров в инжектор для Компонентов, Директив и пайпов, импортирующих NgModule

## Declarations (Объявления) {#declarations}

Свойство `declarations` метаданных `@NgModule` объявляет Компоненты, Директивы и пайпы, принадлежащие NgModule.

```typescript
@NgModule({
  /* ... */
  // CustomMenu и CustomMenuItem — это Компоненты.
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

В приведённом примере Компоненты `CustomMenu` и `CustomMenuItem` принадлежат `CustomMenuModule`.

Свойство `declarations` также принимает _массивы_ Компонентов, Директив и пайпов. Эти массивы, в свою очередь, также могут содержать другие массивы.

```typescript
const MENU_COMPONENTS = [CustomMenu, CustomMenuItem];
const WIDGETS = [MENU_COMPONENTS, CustomSlider];

@NgModule({
  /* ... */
  // Этот NgModule объявляет CustomMenu, CustomMenuItem,
  // CustomSlider и CustomCheckbox.
  declarations: [WIDGETS, CustomCheckbox],
})
export class CustomMenuModule {}
```

Если Angular обнаружит Компоненты, Директивы или пайпы, объявленные более чем в одном NgModule, он сообщит об ошибке.

Любые Компоненты, Директивы или пайпы должны быть явно помечены как `standalone: false`, чтобы быть объявленными в NgModule.

```typescript
@Component({
  // Пометить Компонент как `standalone: false`, чтобы он мог быть объявлен в NgModule.
  standalone: false,
  /* ... */
})
export class CustomMenu {
  /* ... */
}
```

### imports (Импорты) {#imports}

Компоненты, объявленные в NgModule, могут зависеть от других Компонентов, Директив и пайпов. Добавляйте эти зависимости в свойство `imports` метаданных `@NgModule`.

```typescript
@NgModule({
  /* ... */
  // CustomMenu и CustomMenuItem зависят от Компонентов PopupTrigger и SelectorIndicator.
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

Массив `imports` принимает другие NgModule, а также автономные Компоненты, Директивы и пайпы.

### exports (Экспорты) {#exports}

NgModule может _экспортировать_ объявленные им Компоненты, Директивы и пайпы, делая их доступными для других Компонентов и NgModule.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Сделать CustomMenu и CustomMenuItem доступными для
  // Компонентов и NgModule, импортирующих CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

Свойство `exports` не ограничивается только объявлениями. NgModule также может экспортировать любые другие Компоненты, Директивы, пайпы и NgModule, которые он импортирует.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Также сделать PopupTrigger доступным для любого Компонента или NgModule,
  // импортирующего CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem, PopupTrigger],
})
export class CustomMenuModule {}
```

## Провайдеры `NgModule` {#ngmodule-providers}

TIP: Информация о внедрении зависимостей и провайдерах: [руководство по внедрению зависимостей](guide/di).

`NgModule` может задавать `providers` для инъектируемых зависимостей. Эти провайдеры доступны:

- Любому автономному Компоненту, Директиве или пайпу, импортирующему NgModule, а также
- `declarations` и `providers` любого _другого_ NgModule, импортирующего данный NgModule.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Предоставить Сервис OverlayManager
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
- Компоненты `CustomMenu` и `CustomMenuItem` могут внедрять `OverlayManager`, поскольку объявлены в `CustomMenuModule`.
- `UserProfile` может внедрять `OverlayManager`, поскольку его NgModule импортирует `CustomMenuModule`.
- `UserDataClient` может внедрять `OverlayManager`, поскольку его NgModule импортирует `CustomMenuModule`.

### Паттерн `forRoot` и `forChild` {#the-forroot-and-forchild-pattern}

Некоторые NgModule определяют статический метод `forRoot`, принимающий конфигурацию и возвращающий массив провайдеров. Название «`forRoot`» — это соглашение, указывающее, что эти провайдеры предназначены для добавления исключительно в _корень_ приложения при загрузке.

Провайдеры, включённые таким образом, загружаются нетерпеливо, увеличивая размер JavaScript-бандла начальной загрузки.

```typescript
bootstrapApplication(MyApplicationRoot, {
  providers: [CustomMenuModule.forRoot(/* некая конфигурация */)],
});
```

Аналогично, некоторые NgModule могут определять статический метод `forChild`, указывающий, что провайдеры предназначены для добавления к Компонентам в иерархии приложения.

```typescript
@Component({
  /* ... */
  providers: [CustomMenuModule.forChild(/* некая конфигурация */)],
})
export class UserProfile {
  /* ... */
}
```

## Загрузка приложения {#bootstrapping-an-application}

IMPORTANT: Команда Angular рекомендует использовать [bootstrapApplication](api/platform-browser/bootstrapApplication) вместо `bootstrapModule` для всего нового кода. Используйте это руководство для понимания существующих приложений, загружаемых с `@NgModule`.

Декоратор `@NgModule` принимает необязательный массив `bootstrap`, который может содержать один или несколько Компонентов.

Для запуска Angular-приложения можно использовать метод [`bootstrapModule`](/api/core/PlatformRef#bootstrapModule) из [`platformBrowser`](api/platform-browser/platformBrowser) или [`platformServer`](api/platform-server/platformServer). При запуске функция находит элементы на странице с CSS-селектором, соответствующим перечисленным Компонентам, и рендерит их на странице.

```typescript
import {platformBrowser} from '@angular/platform-browser';

@NgModule({
  bootstrap: [MyApplication],
})
export class MyApplicationModule {}

platformBrowser().bootstrapModule(MyApplicationModule);
```

Компоненты, указанные в `bootstrap`, автоматически включаются в объявления NgModule.

При загрузке приложения из NgModule собранные `providers` этого модуля и все `providers` его `imports` загружаются нетерпеливо и доступны для внедрения во всём приложении.
