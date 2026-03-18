# DI в действии {#di-in-action}

Это руководство рассматривает дополнительные возможности внедрения зависимостей в Angular.

NOTE: Для подробного рассмотрения InjectionToken и пользовательских провайдеров см. [руководство по определению провайдеров зависимостей](guide/di/defining-dependency-providers#injection-tokens).

## Внедрение DOM-элемента компонента {#inject-the-components-dom-element}

Хотя разработчики стараются этого избегать, некоторые визуальные эффекты и сторонние инструменты требуют прямого доступа к DOM.
В результате может потребоваться доступ к DOM-элементу компонента.

Angular предоставляет доступ к базовому элементу `@Component` или `@Directive` через внедрение с использованием токена внедрения `ElementRef`:

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

Когда нужно имя тега хост-элемента, внедрите его с помощью токена `HOST_TAG_NAME`.

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
        // Обработка действия кнопки
        break;
      case 'a':
        // Обработка действия ссылки
        break;
      default:
        // Обработка других элементов
        break;
    }
  }
}
```

NOTE: Если хост-элемент может не иметь имени тега (например, `ng-container` или `ng-template`), сделайте внедрение необязательным.

## Разрешение циклических зависимостей с помощью прямой ссылки {#resolve-circular-dependencies-with-a-forward-reference}

Порядок объявления классов имеет значение в TypeScript.
Нельзя напрямую ссылаться на класс до того, как он определён.

Обычно это не проблема, особенно если придерживаться рекомендуемого правила _один класс на файл_.
Но иногда циклические ссылки неизбежны.
Например, когда класс 'A' ссылается на класс 'B', а 'B' ссылается на 'A' — один из них должен быть определён первым.

Функция Angular `forwardRef()` создаёт _косвенную_ ссылку, которую Angular может разрешить позднее.

Схожая проблема возникает, когда класс _ссылается на самого себя_.
Например, в массиве `providers`.
Массив `providers` — это свойство функции-декоратора `@Component()`, которое должно появляться до определения класса.
Такие циклические ссылки можно разорвать с помощью `forwardRef`.

```typescript {header: 'app.component.ts', highlight: [4]}
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
```
