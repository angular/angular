import {Component} from '@angular/core';

@Component({
  selector: 'legacy-menu-e2e',
  templateUrl: 'legacy-menu-e2e.html',
  styles: [
    `
    #before-t, #above-t, #combined-t {
      width: 60px;
      height: 20px;
    }

    .bottom-row {
      margin-top: 5px;
    }
  `,
  ],
})
export class LegacyMenuE2e {
  selected: string = '';
}
