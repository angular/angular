/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, Input} from '@angular/core';

@Component({
  selector: 'material-example',
  template: '',
})
export class Example {
  /** ID of the material example to display. */
  @Input() id: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    const element = document.createElement(this.id);
    this.elementRef.nativeElement.appendChild(element);
  }
}
