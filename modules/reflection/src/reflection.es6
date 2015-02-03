import {Type, isPresent} from 'facade/src/lang';
import {List, ListWrapper} from 'facade/src/collection';
import {Reflector} from './reflector';
export {Reflector} from './reflector';
import {ReflectionCapabilities} from './reflection_capabilities';

export var reflector = new Reflector(new ReflectionCapabilities());
