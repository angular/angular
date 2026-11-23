# DI in action

This guide explores additional features of dependency injection (DI) in Angular.

NOTE: For comprehensive coverage of InjectionToken and custom providers, see the [defining dependency providers guide](guide/di/defining-dependency-providers#injection-tokens).

## Inject the component's DOM element

Although developers generally avoid it, some visual effects and third-party tools require you to access the DOM directly.
In such cases, you may need to access a component's DOM element.

Angular exposes the underlying DOM element of a `@Component` or `@Directive` through injection using the `ElementRef` token:

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

## Inject the host element's tag name

To get the tag name of a host element, inject it using the `HOST_TAG_NAME` token.

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

NOTE: If the host element might not have a tag name (e.g., `ng-container` or `ng-template`), make the injection optional.

## Resolve circular dependencies with a forward reference

In TypeScript, the order of class declarations matters.
You cannot reference a class directly until you define it.

This isn't usually a problem, especially if you adhere to the recommended _one class per file_ rule.
However, in some cases, circular references are unavoidable.
For example, if class 'A' refers to class 'B' and class 'B' refers to class 'A', one of them must be defined first.

The Angular `forwardRef()` function creates an _indirect_ reference that Angular can resolve later.

You face a similar problem when a class makes _a reference to itself_.
For example, in its `providers` array.
The `providers` array is a property of the `@Component()` decorator function, which must appear before the class definition.
Such circular references can be resolved using `forwardRef`.

```typescript {header: 'app.component.ts', highlight: [4]}
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
```
