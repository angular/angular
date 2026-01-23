import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[@expand]': 'expandedState', '[@fadeOut]': 'true', '[@shrink]': 'isSmall' },
    standalone: false
})
export class MyDirective {
  expandedState = 'collapsed';
  isSmall = true;
}
