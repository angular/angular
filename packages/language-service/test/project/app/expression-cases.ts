/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export interface Person {
  name: string;
  age: number;
}

@Component({
  template: '{{~{foo}foo~{foo-end}}}',
})
export class WrongFieldReference {
  bar = 'bar';
}

@Component({
  template: '{{~{nam}person.nam~{nam-end}}}',
})
export class WrongSubFieldReference {
  person: Person = {name: 'Bob', age: 23};
}

@Component({
  template: '{{~{myField}myField~{myField-end}}}',
})
export class PrivateReference {
  private myField = 'My Field';
}

@Component({
  template: '{{~{mod}"a" ~{mod-end}% 2}}',
})
export class ExpectNumericType {
}

@Component({
  template: '{{ (name | lowercase).~{string-pipe}substring }}',
})
export class LowercasePipe {
  name: string;
}
