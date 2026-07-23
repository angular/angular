import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[hostStyling]',
  host: {
    '[class]': 'cssClass',
    '[style]': 'cssStyle',
    '[style.width.px]': 'width',
    '[class.active]': 'isActive',
  },
})
export class HostStylingDirective {
  @Input() cssClass = '';
  @Input() cssStyle = '';
  @Input() width = 0;
  @Input() isActive = false;
}
