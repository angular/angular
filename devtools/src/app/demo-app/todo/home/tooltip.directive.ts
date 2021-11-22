import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  visible = false;
  nested = {
    child: {
      grandchild: {
        prop: 1,
      },
    },
  };

  constructor() {
    // setInterval(() => this.nested.child.grandchild.prop++, 500);
  }

  @HostListener('click')
  handleClick(): void {
    this.visible = !this.visible;
    if (this.visible) {
      (this as any).extraProp = true;
    } else {
      delete (this as any).extraProp;
    }
  }
}
