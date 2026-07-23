import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div i18n>
    {count, plural,
      =0 {zero}
      other {{gender, select, male {he} female {she} other {they}} has {{count}}}
    }
  </div>`,
})
export class AppComponent {
  count = 0;
  gender = 'other';
}
