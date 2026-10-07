# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "typeCheckHostBindings": false
  },
  "files": ["tooltip.directive.ts", "test.component.ts"]
}
```

# /tooltip.directive.ts
```ts
import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    'role': 'tooltip',
    '[attr.aria-hidden]': 'isHidden',
  },
})
export class TooltipDirective {
  isHidden = true;
  isActive = false;

  @HostBinding('class.active')
  get activeClass() {
    return this.isActive;
  }

  @HostBinding('id')
  tooltipId = 'tooltip-1';

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    this.isActive = !this.isActive;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.isHidden = false;
  }

  @HostListener('input', ['$event.target.value', '"test"'])
  onInput(val: string, staticStr: string) {}
}
```

# /test.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
  selector: 'test-comp',
  template: '<span>hello</span>',
  standalone: true,
  host: {
    'role': 'button',
    '[id]': 'myId',
  },
})
export class TestComponent {
  myId = '1';

  @HostBinding('class.active')
  isActive = true;

  @HostListener('click')
  onClick() {}
}
```
