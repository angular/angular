/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Attribute, Component, Directive} from '@angular/core';

// #docregion attributeFactory
@Component({
  selector: 'page',
  template: 'Title: {{title}}',
})
class Page {
  title: string;
  constructor(@Attribute('title') title: string) {
    this.title = title;
  }
}
// #enddocregion

// #docregion attributeMetadata
@Directive({
  selector: 'input',
})
class InputAttrDirective {
  constructor(@Attribute('type') type: string) {
    // type would be 'text' in this example
  }
}
// #enddocregion
