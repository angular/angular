# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.component.ts"]
}
```

# /test.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
  selector: 'test-cmp',
  standalone: true,
  template: '<div>Hello</div>',
})
export class TestComponent {
  @HostBinding('class')
  static readonly className = 'themeable';

  @HostBinding('attr.aria-hidden')
  static get isHidden(): boolean {
    return true;
  }

  @HostListener('click')
  static onStaticClick(): void {}

  @HostBinding('class.active')
  isActive = true;

  @HostListener('keydown')
  onKeyDown(): void {}
}
```
