# Создание фрагментов шаблона с ng-template

Под вдохновением от [нативного элемента `<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), элемент `<ng-template>` позволяет объявить **фрагмент шаблона** — секцию контента, которую можно динамически или программно отрендерить.

## Создание фрагмента шаблона {#creating-a-template-fragment}

Фрагмент шаблона можно создать внутри шаблона любого компонента с помощью элемента `<ng-template>`:

```angular-html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

При рендеринге вышеприведённого кода содержимое элемента `<ng-template>` не отображается на странице. Вместо этого можно получить ссылку на фрагмент шаблона и написать код для его динамического рендеринга.

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

Выражения или операторы в фрагменте шаблона вычисляются относительно компонента, в котором объявлен фрагмент, независимо от того, где он рендерится.

## Получение ссылки на фрагмент шаблона {#getting-a-reference-to-a-template-fragment}

Ссылку на фрагмент шаблона можно получить одним из трёх способов:

- Объявив [переменную ссылки на шаблон](guide/templates/variables#template-reference-variables) на элементе `<ng-template>`
- Запросив фрагмент с помощью [запроса компонента или директивы](guide/components/queries)
- Внедрив фрагмент в директиву, применённую непосредственно к элементу `<ng-template>`.

Во всех трёх случаях фрагмент представлен объектом [TemplateRef](api/core/TemplateRef).

### Ссылка на фрагмент шаблона через переменную ссылки на шаблон {#referencing-a-template-fragment-with-a-template-reference-variable}

Можно добавить переменную ссылки на шаблон к элементу `<ng-template>` для ссылки на этот фрагмент в других частях того же файла шаблона:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

Затем можно ссылаться на этот фрагмент в любом другом месте шаблона через переменную `myFragment`.

### Ссылка на фрагмент шаблона через запросы {#referencing-a-template-fragment-with-queries}

Ссылку на фрагмент шаблона можно получить с помощью любого [API запросов компонента или директивы](guide/components/queries).

Объект `TemplateRef` можно запросить напрямую с помощью запроса `viewChild`.

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

Затем можно ссылаться на этот фрагмент в коде компонента или его шаблоне, как на любой другой член класса.

Если шаблон содержит несколько фрагментов, можно присвоить имя каждому, добавив переменную ссылки на шаблон к каждому элементу `<ng-template>` и запрашивать фрагменты по этому имени:

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

Аналогично, можно ссылаться на эти фрагменты в коде компонента или его шаблоне, как на любые другие члены класса.

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

Затем можно ссылаться на этот фрагмент в коде директивы, как на любой другой член класса.

## Рендеринг фрагмента шаблона {#rendering-a-template-fragment}

Получив ссылку на объект `TemplateRef` фрагмента шаблона, можно отрендерить фрагмент одним из двух способов: в шаблоне с помощью директивы `NgTemplateOutlet` или в TypeScript-коде с помощью `ViewContainerRef`.

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet}

Директива `NgTemplateOutlet` из `@angular/common` принимает `TemplateRef` и рендерит фрагмент как **соседний элемент** к элементу с outlet. Как правило, `NgTemplateOutlet` следует использовать на [элементе `<ng-container>`](guide/templates/ng-container).

Сначала импортируйте `NgTemplateOutlet`:

```typescript
import {NgTemplateOutlet} from '@angular/common';
```

Следующий пример объявляет фрагмент шаблона и рендерит его в элемент `<ng-container>` с помощью `NgTemplateOutlet`:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

Этот пример производит следующий DOM:

```angular-html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

### Использование `ViewContainerRef` {#using-viewcontainerref}

**Контейнер представлений** — это узел в дереве компонентов Angular, который может содержать контент. Любой компонент или директива может внедрить `ViewContainerRef` для получения ссылки на контейнер представлений, соответствующий расположению этого компонента или директивы в DOM.

Можно использовать метод `createEmbeddedView` на `ViewContainerRef` для динамического рендеринга фрагмента шаблона. При рендеринге фрагмента с помощью `ViewContainerRef` Angular добавляет его в DOM как следующего соседа компонента или директивы, внедрившей `ViewContainerRef`.

Следующий пример показывает компонент, принимающий ссылку на фрагмент шаблона в качестве входного параметра и рендерящий этот фрагмент в DOM по нажатию кнопки.

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

В примере выше нажатие кнопки "Show" даёт следующий результат:

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

При объявлении фрагмента шаблона с помощью `<ng-template>` можно дополнительно объявить параметры, принимаемые фрагментом. При рендеринге фрагмента можно опционально передать объект `context`, соответствующий этим параметрам. Данные из этого объекта контекста можно использовать в выражениях привязок и операторах наряду со ссылками на данные компонента, в котором объявлен фрагмент.

Каждый параметр записывается как атрибут с префиксом `let-`, значение которого соответствует имени свойства в объекте контекста:

```angular-html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>
```

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet-with-parameters}

Объект контекста можно привязать к входному параметру `ngTemplateOutletContext`:

```angular-html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>

<ng-container [ngTemplateOutlet]="myFragment" [ngTemplateOutletContext]="{topping: 'onion'}" />
```

### Использование `ViewContainerRef` {#using-viewcontainerref-with-parameters}

Объект контекста можно передать как второй аргумент в `createEmbeddedView`:

```ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

## Предоставление инжекторов фрагментам шаблона {#providing-injectors-to-template-fragments}

При рендеринге фрагмента шаблона его контекст инжектора берётся из **места объявления шаблона**, а не из места его рендеринга. Это поведение можно переопределить, предоставив пользовательский инжектор.

### Использование `NgTemplateOutlet` {#using-ngtemplateoutlet-with-injectors}

Пользовательский `Injector` можно передать во входной параметр `ngTemplateOutletInjector`:

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

#### Наследование инжектора outlet {#inheriting-the-outlets-injector}

Можно установить `ngTemplateOutletInjector` в строку `'outlet'`, чтобы встроенное представление наследовало инжектор из места расположения outlet в DOM, а не из места объявления шаблона.

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

Каждый рекурсивный рендеринг шаблона `node` наследует инжектор от окружающего `<item-component>`, позволяя каждому вложенному уровню получать доступ к провайдерам, ограниченным его родительским компонентом.

NOTE: Это полезно для построения рекурсивных структур или в любой ситуации, когда рендерящемуся шаблону нужен доступ к провайдерам из дерева компонентов в месте outlet.

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
- Внедряет `ViewContainerRef` и программно рендерит внедрённый `TemplateRef`

Angular поддерживает специальный удобный синтаксис для структурных директив. Если применить директиву к элементу и предварить её селектор символом звёздочки (`*`), Angular интерпретирует весь элемент вместе с его содержимым как фрагмент шаблона:

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

Разработчики обычно используют структурные директивы для условного рендеринга фрагментов или рендеринга фрагментов несколько раз.

Подробнее см. в разделе [Структурные директивы](guide/directives/structural-directives).

## Дополнительные ресурсы {#additional-resources}

Примеры использования `ng-template` в других библиотеках:

- [Вкладки Angular Material](https://material.angular.dev/components/tabs/overview) — ничего не рендерится в DOM до активации вкладки
- [Таблица Angular Material](https://material.angular.dev/components/table/overview) — позволяет разработчикам определять различные способы рендеринга данных
