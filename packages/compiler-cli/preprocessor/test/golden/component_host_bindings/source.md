# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["button.component.ts"]
}
```

# /button.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    'role': 'button',
    'tabindex': '0',
    '[class.pressed]': 'isPressed',
    '[style.opacity]': 'disabled ? 0.5 : 1',
    '[attr.aria-disabled]': 'disabled',
    '(focus)': 'onFocus()',
  },
})
export class ButtonComponent {
  isPressed = false;
  disabled = false;
  isFocused = false;

  @HostBinding('class.focused')
  get focusedClass() {
    return this.isFocused;
  }

  @HostBinding('style.cursor')
  get cursor() {
    return this.disabled ? 'not-allowed' : 'pointer';
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  onActivate() {
    if (!this.disabled) {
      this.isPressed = true;
    }
  }

  @HostListener('keyup.enter')
  @HostListener('keyup.space')
  onDeactivate() {
    this.isPressed = false;
  }

  onFocus() {
    this.isFocused = true;
  }

  @HostListener('blur')
  onBlur() {
    this.isFocused = false;
  }
}
```
