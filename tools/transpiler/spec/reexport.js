import {Baz} from './baz';
import {Bar1} from './bar';

var localVar = true;

export {Baz, localVar, Bar1};

// Will become:
// export {Baz} from './baz';
// export {Bar1} from './bar';
