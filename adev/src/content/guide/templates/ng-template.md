# Создание фрагментов шаблона с помощью ng-template

Вдохновленный [нативным элементом `<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template),
элемент `<ng-template>` позволяет объявлять **фрагмент шаблона** — секцию контента, которую можно рендерить динамически
или программно.

## Создание фрагмента шаблона

Вы можете создать фрагмент шаблона внутри шаблона любого компонента с помощью элемента `<ng-template>`:

```angular-html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

При рендеринге приведенного выше кода содержимое элемента `<ng-template>` не отображается на странице. Вместо этого вы
можете получить ссылку на фрагмент шаблона и написать код для его динамического рендеринга.

### Привязка контекста для фрагментов

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

Выражения или инструкции во фрагменте шаблона вычисляются в контексте компонента, в котором объявлен фрагмент,
независимо от того, где этот фрагмент рендерится.

## Получение ссылки на фрагмент шаблона

Вы можете получить ссылку на фрагмент шаблона одним из трех способов:

- Объявив [переменную ссылки на шаблон](/guide/templates/variables#template-reference-variables) на элементе
  `<ng-template>`
- Запросив фрагмент с помощью [запроса компонента или директивы](/guide/components/queries)
- Внедрив фрагмент в директиву, которая применяется непосредственно к элементу `<ng-template>`.

Во всех трех случаях фрагмент представлен объектом [TemplateRef](/api/core/TemplateRef).

### Ссылка на фрагмент шаблона с помощью переменной

Вы можете добавить переменную ссылки на шаблон к элементу `<ng-template>`, чтобы ссылаться на этот фрагмент в других
частях того же файла шаблона:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

Затем вы можете ссылаться на этот фрагмент в любом другом месте шаблона через переменную `myFragment`.

### Ссылка на фрагмент шаблона с помощью запросов

Вы можете получить ссылку на фрагмент шаблона, используя
любой [API запросов компонентов или директив](/guide/components/queries).

Вы можете запросить объект `TemplateRef` напрямую, используя запрос `viewChild`.

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

Затем вы можете ссылаться на этот фрагмент в коде вашего компонента или в шаблоне компонента, как на любой другой член
класса.

Если шаблон содержит несколько фрагментов, вы можете присвоить имя каждому фрагменту, добавив переменную ссылки на
шаблон к каждому элементу `<ng-template>` и запрашивая фрагменты по этому имени:

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

Опять же, вы можете ссылаться на эти фрагменты в коде компонента или в шаблоне компонента, как на любые другие члены
класса.

### Внедрение фрагмента шаблона

Директива может внедрить `TemplateRef`, если эта директива применена непосредственно к элементу `<ng-template>`:

```angular-ts
@Directive({
  selector: '[myDirective]'
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

Затем вы можете ссылаться на этот фрагмент в коде директивы, как на любой другой член класса.

## Рендеринг фрагмента шаблона

Как только у вас есть ссылка на объект `TemplateRef` фрагмента шаблона, вы можете отрендерить фрагмент одним из двух
способов: в вашем шаблоне с помощью директивы `NgTemplateOutlet` или в вашем TypeScript-коде с помощью
`ViewContainerRef`.

### Использование `NgTemplateOutlet`

Директива `NgTemplateOutlet` из `@angular/common` принимает `TemplateRef` и рендерит фрагмент как **соседний элемент**
для элемента с аутлетом. Обычно следует использовать `NgTemplateOutlet` на элементе [
`<ng-container>`](/guide/templates/ng-container).

Сначала импортируйте `NgTemplateOutlet`:

```typescript
import { NgTemplateOutlet } from '@angular/common';
```

Следующий пример объявляет фрагмент шаблона и рендерит этот фрагмент в элемент `<ng-container>` с помощью
`NgTemplateOutlet`:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

Этот пример создает следующий DOM:

```angular-html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

### Использование `ViewContainerRef`

**Контейнер представления** (view container) — это узел в дереве компонентов Angular, который может содержать контент.
Любой компонент или директива могут внедрить `ViewContainerRef`, чтобы получить ссылку на контейнер представления,
соответствующий местоположению этого компонента или директивы в DOM.

Вы можете использовать метод `createEmbeddedView` в `ViewContainerRef` для динамического рендеринга фрагмента шаблона.
Когда вы рендерите фрагмент с помощью `ViewContainerRef`, Angular добавляет его в DOM как следующий соседний элемент
компонента или директивы, внедрившей `ViewContainerRef`.

Следующий пример показывает компонент, который принимает ссылку на фрагмент шаблона в качестве входного параметра (
input) и рендерит этот фрагмент в DOM при нажатии кнопки.

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

В примере выше нажатие кнопки "Show" приводит к следующему выводу:

```angular-html
<component-with-fragment>
  <h2>Component with a fragment>
  <my-outlet>
    <button>Show</button>
  </my-outlet>
  <p>This is the fragment</p>
</component-with-fragment>
```

## Передача параметров при рендеринге фрагмента шаблона

При объявлении фрагмента шаблона с помощью `<ng-template>` вы можете дополнительно объявить параметры, принимаемые
фрагментом. При рендеринге фрагмента вы можете опционально передать объект `context`, соответствующий этим параметрам.
Вы можете использовать данные из этого объекта контекста в выражениях привязки и инструкциях, в дополнение к ссылкам на
данные из компонента, в котором объявлен фрагмент.

Каждый параметр записывается как атрибут с префиксом `let-`, значение которого соответствует имени свойства в объекте
контекста:

```angular-html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>
```

### Использование `NgTemplateOutlet`

Вы можете привязать объект контекста к входному свойству `ngTemplateOutletContext`:

```angular-html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>

<ng-container
  [ngTemplateOutlet]="myFragment"
  [ngTemplateOutletContext]="{topping: 'onion'}"
/>
```

### Использование `ViewContainerRef`

Вы можете передать объект контекста в качестве второго аргумента в `createEmbeddedView`:

```angular-ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

## Структурные директивы

**Структурная директива** — это любая директива, которая:

- Внедряет `TemplateRef`
- Внедряет `ViewContainerRef` и программно рендерит внедренный `TemplateRef`

Angular поддерживает специальный удобный синтаксис для структурных директив. Если вы применяете директиву к элементу и
добавляете префикс звездочки (`*`) к селектору директивы, Angular интерпретирует весь элемент и все его содержимое как
фрагмент шаблона:

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

Разработчики обычно используют структурные директивы для условного рендеринга фрагментов или рендеринга фрагментов
несколько раз.

Для получения более подробной информации см. [Структурные директивы](/guide/directives/structural-directives).

## Дополнительные ресурсы

Примеры использования `ng-template` в других библиотеках можно найти здесь:

- [Вкладки из Angular Material](https://material.angular.dev/components/tabs/overview) — ничего не рендерится в DOM,
  пока вкладка не будет активирована
- [Таблица из Angular Material](https://material.angular.dev/components/table/overview) — позволяет разработчикам
  определять различные способы отображения данных
