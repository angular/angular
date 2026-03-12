// tslint:disable

import {Input} from '@angular/core';

export class TransformFunctions {
  @Input({transform: (v) => v * 10}) untypedTransform: number = 0;
}
