# Создание фрагментов шаблона с помощью ng-template {#create-template-fragments-with-ng-template}

По аналогии с [нативным элементом `<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), элемент `<ng-template>` позволяет объявить **фрагмент шаблона** — секцию контента, которую можно динамически или программно рендерить.

## Создание фрагмента шаблона {#creating-a-template-fragment}

Фрагмент шаблона можно создать внутри любого шаблона компонента с помощью элемента `<ng-template>`:

```angular-html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

При рендеринге приведенного выше кода содержимое элемента `<ng-template>` не отображается на странице. Вместо этого можно получить ссылку на фрагмент шаблона и написать код для его динамического рендеринга.

### Контекст привязки для фрагментов {#binding-context-for-fragments}

Фрагменты шаблона могут содержать привязки с динамическими выражениями:

```angular-ts
@Component({
  /* ... */,
  template: `<ng-template>You've selected {{count}} items.</ng-template>`,
})
export class ItemCounter {
  count: number = 0;
}
```

Выражения или инструкции во фрагменте шаблона вычисляются относительно компонента, в котором объявлен фрагмент, независимо от того, где фрагмент рендерится.

## Получение ссылки на фрагмент шаблона {#getting-a-reference-to-a-template-fragment}

Получить ссылку на фрагмент шаблона можно одним из трех способов:

- Объявив [ссылочную переменную шаблона](/guide/templates/variables#template-reference-variables) на элементе `<ng-template>`
- Запросив фрагмент с помощью [запроса компонента или директивы](/guide/components/queries)
- Внедрив фрагмент в директиву, которая применена непосредственно к элементу `<ng-template>`.

Во всех трех случаях фрагмент представлен объектом [TemplateRef](/api/core/TemplateRef).

### Ссылка на фрагмент шаблона через ссылочную переменную шаблона {#referencing-a-template-fragment-with-a-template-reference-variable}

Вы можете добавить ссылочную переменную шаблона к элементу `<ng-template>`, чтобы ссылаться на этот фрагмент шаблона в других частях того же файла шаблона:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

После этого можно ссылаться на этот фрагмент в любом месте шаблона через переменную `myFragment`.

### Ссылка на фрагмент шаблона через запросы {#referencing-a-template-fragment-with-queries}

Получить ссылку на фрагмент шаблона можно с помощью любого [API запросов компонентов или директив](/guide/components/queries).

Вы можете запросить объект `TemplateRef` непосредственно с помощью запроса `viewChild`.

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template>
      <p>This is a template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  templateRef = viewChild<TemplateRef<unknown>>(TemplateRef);
}
```

После этого можно ссылаться на этот фрагмент в коде компонента или шаблоне компонента, как на любой другой член класса.

Если шаблон содержит несколько фрагментов, можно присвоить имя каждому фрагменту, добавив ссылочную переменную шаблона к каждому элементу `<ng-template>` и запросив фрагменты по этому имени:

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template #fragmentOne>
      <p>This is one template fragment</p>
    </ng-template>

    <ng-template #fragmentTwo>
      <p>This is another template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
    fragmentOne = viewChild<TemplateRef<unknown>>('fragmentOne');
    fragmentTwo = viewChild<TemplateRef<unknown>>('fragmentTwo');
}
```

Аналогично, затем можно ссылаться на эти фрагменты в коде компонента или шаблоне компонента, как на любые другие члены класса.

### Внедрение фрагмента шаблона {#injecting-a-template-fragment}

Директива может внедрить `TemplateRef`, если она применена непосредственно к элементу `<ng-template>`:

```angular-ts
@Directive({
  selector: '[myDirective]',
})
export class MyDirective {
  private fragment = inject(TemplateRef);
}
```

```angular-html
<ng-template myDirective>
  <p>This is one template fragment</p>
</ng-template>
```

После этого можно ссылаться на этот фрагмент в коде директивы, как на любой другой член класса.

## Рендеринг фрагмента шаблона {#rendering-a-template-fragment}

Получив ссылку на объект `TemplateRef` фрагмента шаблона, можно рендерить фрагмент одним из двух способов: в шаблоне с помощью директивы `NgTemplateOutlet` или в TypeScript-коде с помощью `ViewContainerRef`.

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet}

Директива `NgTemplateOutlet` из `@angular/common` принимает `TemplateRef` и рендерит фрагмент как **соседний** элемент относительно элемента с outlet. Как правило, `NgTemplateOutlet` следует использовать на элементе [`<ng-container>`](/guide/templates/ng-container).

Сначала импортируйте `NgTemplateOutlet`:

```typescript
import {NgTemplateOutlet} from '@angular/common';
```

Следующий пример объявляет фрагмент шаблона и рендерит этот фрагмент в элемент `<ng-container>` с помощью `NgTemplateOutlet`:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

Этот пример создает следующий отрендеренный DOM:

```angular-html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

### Использование `ViewContainerRef` {#using-viewcontainerref}

**Контейнер представлений** — это узел в дереве компонентов Angular, который может содержать контент. Любой компонент или директива может внедрить `ViewContainerRef` для получения ссылки на контейнер представлений, соответствующий расположению этого компонента или директивы в DOM.

Метод `createEmbeddedView` объекта `ViewContainerRef` можно использовать для динамического рендеринга фрагмента шаблона. При рендеринге фрагмента с помощью `ViewContainerRef` Angular добавляет его в DOM как следующий соседний элемент относительно компонента или директивы, внедривших `ViewContainerRef`.

Следующий пример показывает компонент, который принимает ссылку на фрагмент шаблона как input и рендерит этот фрагмент в DOM по нажатию кнопки.

```angular-ts
@Component({
  /* ... */,
  selector: 'component-with-fragment',
  template: `
    <h2>Component with a fragment</h2>
    <ng-template #myFragment>
      <p>This is the fragment</p>
    </ng-template>
    <my-outlet [fragment]="myFragment" />
  `,
})
export class ComponentWithFragment { }

@Component({
  /* ... */,
  selector: 'my-outlet',
  template: `<button (click)="showFragment()">Show</button>`,
})
export class MyOutlet {
  private viewContainer = inject(ViewContainerRef);
  fragment = input<TemplateRef<unknown> | undefined>();

  showFragment() {
    if (this.fragment()) {
      this.viewContainer.createEmbeddedView(this.fragment());
    }
  }
}
```

В приведенном выше примере нажатие кнопки «Show» приводит к следующему результату:

```angular-html
<component-with-fragment>
  <h2>Component with a fragment>
  <my-outlet>
    <button>Show</button>
  </my-outlet>
  <p>This is the fragment</p>
</component-with-fragment>
```

## Передача параметров при рендеринге фрагмента шаблона {#passing-parameters-when-rendering-a-template-fragment}

При объявлении фрагмента шаблона с помощью `<ng-template>` можно дополнительно объявить параметры, принимаемые фрагментом. При рендеринге фрагмента можно передать объект `context`, соответствующий этим параметрам. Данные из этого объекта контекста можно использовать в выражениях привязки и инструкциях в дополнение к данным компонента, в котором объявлен фрагмент.

Каждый параметр записывается как атрибут с префиксом `let-`, значение которого соответствует имени свойства в объекте контекста:

```angular-html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>
```

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet-with-parameters}

Объект контекста можно привязать к input `ngTemplateOutletContext`:

```angular-html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>

<ng-container [ngTemplateOutlet]="myFragment" [ngTemplateOutletContext]="{topping: 'onion'}" />
```

### Использование `ViewContainerRef` {#using-viewcontainerref-with-parameters}

Объект контекста можно передать вторым аргументом в `createEmbeddedView`:

```ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

## Предоставление инжекторов для фрагментов шаблона {#providing-injectors-to-template-fragments}

При рендеринге фрагмента шаблона его контекст инжектора определяется **местом объявления шаблона**, а не местом рендеринга. Это поведение можно переопределить, предоставив пользовательский инжектор.

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet-with-injectors}

Пользовательский `Injector` можно передать в input `ngTemplateOutletInjector`:

```angular-ts
export const THEME_DATA = new InjectionToken<string>('THEME_DATA', {
  factory: () => 'light',
});

@Component({
  selector: 'themed-panel',
  template: `<div [class]="theme">...</div>`,
})
export class ThemedPanel {
  theme = inject(THEME_DATA);
}

@Component({
  selector: 'root',
  imports: [NgTemplateOutlet, ThemedPanel],
  template: `
    <ng-template #myFragment>
      <themed-panel />
    </ng-template>
    <ng-container *ngTemplateOutlet="myFragment; injector: customInjector" />
  `,
})
export class Root {
  customInjector = Injector.create({
    providers: [{provide: THEME_DATA, useValue: 'dark'}],
  });
}
```

#### Наследование инжектора от outlet {#inheriting-the-outlets-injector}

Вы можете установить `ngTemplateOutletInjector` в строку `'outlet'`, чтобы встроенное представление наследовало инжектор от расположения outlet в DOM, а не от места объявления шаблона.

```angular-html
<ng-template #node let-items>
  <item-component>
    @for (child of items; track $index) {
      <ng-container
        *ngTemplateOutlet="node; context: {$implicit: child.children}; injector: 'outlet'"
      />
    }
  </item-component>
</ng-template>

<ng-container *ngTemplateOutlet="node; context: {$implicit: topLevelItems}" />
```

Каждый рекурсивный рендеринг шаблона `node` наследует инжектор от окружающего `<item-component>`, что позволяет каждому вложенному уровню получить доступ к провайдерам, ограниченным его родительским компонентом.

NOTE: Это полезно для построения рекурсивных структур или любой ситуации, где рендерируемому шаблону необходим доступ к провайдерам из дерева компонентов в месте расположения outlet.

### Использование `ViewContainerRef` {#using-viewcontainerref-with-injectors}

Пользовательский инжектор можно передать как часть объекта параметров в `createEmbeddedView`:

```ts
this.viewContainer.createEmbeddedView(this.myFragment, context, {
  injector: myCustomInjector,
});
```

## Структурные директивы {#structural-directives}

**Структурная директива** — это любая директива, которая:

- Внедряет `TemplateRef`
- Внедряет `ViewContainerRef` и программно рендерит внедренный `TemplateRef`

Angular поддерживает специальный сокращенный синтаксис для структурных директив. Если вы применяете директиву к элементу и добавляете к селектору директивы символ звездочки (`*`), Angular интерпретирует весь элемент и все его содержимое как фрагмент шаблона:

```angular-html
<section *myDirective>
  <p>This is a fragment</p>
</section>
```

Это эквивалентно:

```angular-html
<ng-template myDirective>
  <section>
    <p>This is a fragment</p>
  </section>
</ng-template>
```

Разработчики обычно используют структурные директивы для условного рендеринга фрагментов или многократного рендеринга фрагментов.

Подробнее см. [Структурные директивы](/guide/directives/structural-directives).

## Дополнительные ресурсы {#additional-resources}

Примеры использования `ng-template` в других библиотеках:

- [Вкладки Angular Material](https://material.angular.dev/components/tabs/overview) — ничего не рендерится в DOM до активации вкладки
- [Таблица Angular Material](https://material.angular.dev/components/table/overview) — позволяет разработчикам определять различные способы рендеринга данных
