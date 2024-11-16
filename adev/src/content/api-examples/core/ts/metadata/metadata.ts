/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Attribute, Component, Directive, Pipe} from '@angular/core';

class CustomDirective {}

@Component({
  selector: 'greet',
  template: 'Hello {{name}}!',
  standalone: false,
})
class Greet {
  name: string = 'World';
}

// #docregion attributeFactory
@Component({
  selector: 'page',
  template: 'Title: {{title}}',
  standalone: false,
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
  standalone: false,
})
class InputAttrDirective {
  constructor(@Attribute('type') type: string) {
    // type would be 'text' in this example
  }
}
// #enddocregion

@Directive({
  selector: 'input',
  standalone: false,
})
class InputDirective {
  constructor() {
    // Add some logic.
  }
}

@Pipe({
  name: 'lowercase',
  standalone: false,
})
class Lowercase {
  transform(v: string, args: any[]) {
    return v.toLowerCase();
  }
}
