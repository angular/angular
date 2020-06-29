/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

// #docregion TitleCasePipe
@Component({
  selector: 'titlecase-pipe',
  template: `<div>
    <p>{{'some string' | titlecase}}</p> <!-- output is expected to be "Some String" -->
    <p>{{'tHIs is mIXeD CaSe' | titlecase}}</p> <!-- output is expected to be "This Is Mixed Case" -->
    <p>{{'it\\'s non-trivial question' | titlecase}}</p> <!-- output is expected to be "It's Non-trivial Question" -->
    <p>{{'one,two,three' | titlecase}}</p> <!-- output is expected to be "One,two,three" -->
    <p>{{'true|false' | titlecase}}</p> <!-- output is expected to be "True|false" -->
    <p>{{'foo-vs-bar' | titlecase}}</p> <!-- output is expected to be "Foo-vs-bar" -->
  </div>`
})
export class TitleCasePipeComponent {
}
// #enddocregion
