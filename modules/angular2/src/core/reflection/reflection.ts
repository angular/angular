import {Type, isPresent} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Reflector} from './reflector';
export {Reflector, ReflectionInfo} from './reflector';
import {ReflectionCapabilities} from './reflection_capabilities';

export var reflector = new Reflector(new ReflectionCapabilities());
