import {Component, forwardRef} from '@angular/core';

import {HostDir, OtherHostDir as AliasedHostDir} from './directives';
import * as directives from './directives';

@Component({
  selector: 'host-cmp',
  template: '',
  hostDirectives: [HostDir, AliasedHostDir],
})
export class HostCmp {}

@Component({
  selector: 'namespace-host-cmp',
  template: '',
  hostDirectives: [
    {directive: directives.HostDir, inputs: ['label']},
    forwardRef(() => directives.OtherHostDir),
  ],
})
export class NamespaceHostCmp {}
