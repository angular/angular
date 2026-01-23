// tslint:disable

import {input, Input} from '@angular/core';

class BothInputImported {
  @Input() decoratorInput = true;
  signalInput = input<boolean>();

  @Input() thisCanBeMigrated = true;

  __makeDecoratorInputNonMigratable() {
    this.decoratorInput = false;
  }
}
