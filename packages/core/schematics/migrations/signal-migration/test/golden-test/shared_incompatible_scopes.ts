// tslint:disable

import {Input, Directive, Component} from '@angular/core';

@Directive()
class SomeDir {
  @Input({required: true}) bla!: RegExp;
}

@Component({
  template: ``,
})
export class ScopeMismatchTest {
  eachScopeRedeclared() {
    const regexs: RegExp[] = [];

    if (global.console) {
      const dir: SomeDir = null!;
      regexs.push(dir.bla);
    }

    const dir: SomeDir = null!;
    regexs.push(dir.bla);
  }

  nestedButSharedLocal() {
    const regexs: RegExp[] = [];
    const dir: SomeDir = null!;

    if (global.console) {
      regexs.push(dir.bla);
    }

    regexs.push(dir.bla);
  }

  dir: SomeDir = null!;
  nestedButSharedInClassInstance() {
    const regexs: RegExp[] = [];

    if (global.console) {
      regexs.push(this.dir.bla);
    }

    regexs.push(this.dir.bla);
  }
}
