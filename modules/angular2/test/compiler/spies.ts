import {XHR} from 'angular2/src/compiler/xhr';
import {TemplateCompiler} from 'angular2/src/compiler/template_compiler';

import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyXHR extends SpyObject {
  constructor() { super(XHR); }
}

export class SpyTemplateCompiler extends SpyObject {
  constructor() { super(TemplateCompiler); }
}