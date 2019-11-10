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
  template: '{{~{start-foo}foo~{end-foo}}}',
})
export class WrongFieldReference {
  bar = 'bar';
}

@Component({
  template: '{{~{start-nam}person.nam~{end-nam}}}',
})
export class WrongSubFieldReference {
  person: Person = {name: 'Bob', age: 23};
}

@Component({
  template: '{{~{start-myField}myField~{end-myField}}}',
})
export class PrivateReference {
  private myField = 'My Field';
}

@Component({
  template: '{{~{start-mod}"a" ~{end-mod}% 2}}',
})
export class ExpectNumericType {
}

@Component({
  template: '{{ (name | lowercase).~{string-pipe}substring }}',
})
export class LowercasePipe {
  name: string = 'name';
}
