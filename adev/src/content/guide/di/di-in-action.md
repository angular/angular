# DI на практике

Это руководство рассматривает дополнительные возможности внедрения зависимостей (DI) в Angular.

NOTE: Полное описание InjectionToken и пользовательских провайдеров см. в [руководстве по определению провайдеров зависимостей](guide/di/defining-dependency-providers#injection-tokens).

## Внедрение DOM-элемента компонента {#inject-the-components-dom-element}

Хотя разработчики обычно этого избегают, некоторые визуальные эффекты и сторонние инструменты требуют прямого доступа к DOM.
В таких случаях может понадобиться DOM-элемент компонента.

Angular предоставляет доступ к DOM-элементу `@Component` или `@Directive` через внедрение с токеном `ElementRef`:

```ts {highlight:[7]}
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private element = inject(ElementRef);

  update() {
    this.element.nativeElement.style.color = 'red';
  }
}
```

## Внедрение имени тега host-элемента {#inject-the-host-elements-tag-name}

Чтобы получить имя тега host-элемента, внедрите его с токеном `HOST_TAG_NAME`.

```ts
import {Directive, HOST_TAG_NAME, inject} from '@angular/core';

@Directive({
  selector: '[roleButton]',
})
export class RoleButtonDirective {
  private tagName = inject(HOST_TAG_NAME);

  onAction() {
    switch (this.tagName) {
      case 'button':
        // Handle button action
        break;
      case 'a':
        // Handle anchor action
        break;
      default:
        // Handle other elements
        break;
    }
  }
}
```

NOTE: Если у host-элемента может не быть имени тега (например, `ng-container` или `ng-template`), сделайте внедрение опциональным.

## Разрешение циклических зависимостей через forward reference {#resolve-circular-dependencies-with-a-forward-reference}

В TypeScript важен порядок объявления классов.
Нельзя ссылаться на класс напрямую, пока он не определён.

Обычно это не проблема, особенно если следовать правилу _один класс на файл_.
Но иногда циклические ссылки неизбежны.
Например, если класс «A» ссылается на «B», а «B» — на «A», один из них должен быть определён первым.

Функция Angular `forwardRef()` создаёт _косвенную_ ссылку, которую Angular разрешит позже.

Похожая проблема возникает, когда класс делает _ссылку на себя_.
Например, в массиве `providers`.
Массив `providers` — свойство функции-декоратора `@Component()`, которая должна идти до определения класса.
Такие циклические ссылки можно разрешить с помощью `forwardRef`.

```typescript {header: 'app.component.ts', highlight: [4]}
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
```
