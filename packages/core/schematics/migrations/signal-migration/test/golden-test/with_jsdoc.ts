// tslint:disable

import {Input} from '@angular/core';

class WithJsdoc {
  /**
   * Works
   */
  @Input() simpleInput!: string;

  @Input() withCommentInside?: /* intended */ boolean;
}
