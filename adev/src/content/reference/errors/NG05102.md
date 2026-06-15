# Unsupported event target

Angular only recognizes three string values as global event targets: `'window'`, `'document'`, and `'body'`. If you pass anything else as a string target when registering a global event listener, Angular can't resolve it and throws this error.

## Debugging the error

Check for a typo in the target name used with `@HostListener` or `Renderer2.listen()`. A small mistake like `'windw'` instead of `'window'` is enough to trigger this:

```angular-ts
@Component({
  selector: 'app-example',
  template: '<button>Click me</button>',
})
export class Example {
  @HostListener('windw:resize') // typo — should be 'window'
  onResize() {}
}
```

The same applies when calling `Renderer2.listen()` directly with a string that Angular doesn't know about:

```typescript
this.renderer.listen('global', 'click', handler); // 'global' is not supported
```

## Fixing the error

Correct the target to one of the three supported strings, or pass an actual DOM element instead of a string:

```angular-ts
@Component({
  selector: 'app-example',
  template: '<button>Click me</button>',
})
export class Example {
  @HostListener('window:resize')
  onResize() {}
}
```

```typescript
// Use an element reference when you need to target something more specific
this.renderer.listen(this.elementRef.nativeElement, 'click', handler);
```
