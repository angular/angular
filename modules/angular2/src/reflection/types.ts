import {Type} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

export {Function as GetterFn};
export {Function as SetterFn};
export {Function as MethodFn};

import {global} from 'angular2/src/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;
