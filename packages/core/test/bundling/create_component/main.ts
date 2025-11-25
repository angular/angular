/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  inject,
  input,
  inputBinding,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-host',
  template: '',
})
class HostComponent {}

@Component({
  selector: 'app-field',
  template: '{{field()}}',
})
class FieldComponent {
  field = input('');
}

@Directive({selector: '[field]'})
class FieldDirective {
  field = input('');
}

@Component({
  selector: 'app-root',
  template: '',
})
class Root {
  readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    // Create a component with an input binding.
    this.viewContainerRef.createComponent(FieldComponent, {
      bindings: [inputBinding('field', () => 'Input from dynamic component')],
    });

    // Create a component with a directive with an input binding.
    this.viewContainerRef.createComponent(HostComponent, {
      directives: [
        {
          type: FieldDirective,
          bindings: [inputBinding('field', () => 'Input from dynamic directive')],
        },
      ],
    });
  }
}

bootstrapApplication(Root);
