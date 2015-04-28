import {Type, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Reflector} from './reflector';
export {Reflector} from './reflector';
import {ReflectionCapabilities} from './reflection_capabilities';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

export var reflector = new Reflector(new ReflectionCapabilities());
