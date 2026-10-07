# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["tooltip.directive.ts"]
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
