// tslint:disable

import {Directive, Input} from '@angular/core';

class BaseNonAngular {
  disabled: string = '';
}

@Directive()
class Sub implements BaseNonAngular {
  // should not be migrated because of the interface.
  @Input() disabled = '';
}

class BaseWithAngular {
  @Input() disabled: string = '';
}

@Directive()
class Sub2 extends BaseWithAngular {
  @Input() disabled = '';
}

interface BaseNonAngularInterface {
  disabled: string;
}

@Directive()
class Sub3 implements BaseNonAngularInterface {
  // should not be migrated because of the interface.
  @Input() disabled = '';
}
