import {Directive} from '@angular/core';

import {BaseDirective} from './cross_file_inheritance_base';

@Directive({
  selector: '[child]',
  standalone: false,
})
export class ChildDirective extends BaseDirective {}
