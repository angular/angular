/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  jit: true,
  template: '{{test}}',
})
class JitTrueComponent {
  @Input() test = true;
}

@Component({
  jit: true,
  templateUrl: './jit_true_component_external_tmpl.html',
})
class JitTrueComponentExternalTmpl {
  @Input() test = true;
}
