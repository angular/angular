// tslint:disable

import {input, Input} from '@angular/core';

class ExistingSignalImport {
  signalInput = input<boolean>();
  @Input() thisCanBeMigrated = true;
}
