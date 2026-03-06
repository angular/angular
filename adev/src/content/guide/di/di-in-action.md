# Внедрение зависимостей в действии {#di-in-action}

В этом руководстве рассматриваются дополнительные возможности внедрения зависимостей в Angular.

NOTE: Подробное описание `InjectionToken` и пользовательских провайдеров см. в [руководстве по настройке провайдеров зависимостей](guide/di/defining-dependency-providers#injection-tokens).

## Внедрение DOM-элемента компонента {#inject-the-components-dom-element}

Хотя разработчики стараются избегать прямого доступа к DOM, некоторые визуальные эффекты и сторонние инструменты его требуют.
В таких случаях может понадобиться доступ к DOM-элементу компонента.

Angular предоставляет базовый элемент `@Component` или `@Directive` через внедрение с помощью токена `ElementRef`:

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

## Внедрение имени тега хост-элемента {#inject-the-host-elements-tag-name}

Когда нужно получить имя тега хост-элемента, внедрите его с помощью токена `HOST_TAG_NAME`.

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

NOTE: Если у хост-элемента может не быть имени тега (например, `ng-container` или `ng-template`), сделайте внедрение опциональным.

## Разрешение циклических зависимостей с помощью прямой ссылки {#resolve-circular-dependencies-with-a-forward-reference}

Порядок объявления классов в TypeScript имеет значение.
Нельзя ссылаться на класс до его определения.

Обычно это не проблема, особенно если придерживаться рекомендуемого правила _один класс — один файл_.
Но иногда циклических ссылок не избежать.
Например, когда класс 'A' ссылается на класс 'B', а 'B' — на 'A': один из них должен быть определён первым.

Функция Angular `forwardRef()` создаёт _косвенную_ ссылку, которую Angular разрешит позже.

Аналогичная проблема возникает, когда класс ссылается _сам на себя_.
Например, в своём массиве `providers`.
Массив `providers` — это свойство функции декоратора `@Component()`, которое должно предшествовать определению класса.
Разорвать такие циклические ссылки можно с помощью `forwardRef`.

```typescript {header: 'app.component.ts', highlight: [4]}
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
```
