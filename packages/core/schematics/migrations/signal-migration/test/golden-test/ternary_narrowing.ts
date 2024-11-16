// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    {{ narrowed ? narrowed.substring(0, 1) : 'Empty' }}
    {{ justChecked ? 'true' : 'false' }}

    {{ other?.safeRead ? other.safeRead : 'Empty' }}
    {{ other?.safeRead2 ? other?.safeRead2 : 'Empty' }}
  `,
})
export class TernaryNarrowing {
  @Input() narrowed: string | undefined = undefined;
  @Input() justChecked = true;

  other?: OtherComponent;
}

@Component({template: ''})
export class OtherComponent {
  @Input() safeRead: string = '';
  @Input() safeRead2: string = '';
}
