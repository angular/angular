## Renderer -> Renderer2 migration

Automatically migrates from `Renderer` to `Renderer2` by changing method calls, renaming imports
and renaming types. Tries to either map method calls directly from one renderer to the other, or
if that's not possible, inserts custom helper functions at the bottom of the file.

#### Before
```ts
import { Renderer, ElementRef } from '@angular/core';

@Component({})
export class MyComponent {
  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  changeColor() {
    this._renderer.setElementStyle(this._element.nativeElement, 'color', 'purple');
  }
}
```

#### After
```ts
import { Renderer2, ElementRef } from '@angular/core';

@Component({})
export class MyComponent {
  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  changeColor() {
    this._renderer.setStyle(this._element.nativeElement, 'color', 'purple');
  }
}
```
