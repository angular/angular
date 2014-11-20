import {Type, isPresent} from 'facade/lang';
import {List, ListWrapper} from 'facade/collection';
import {Reflector} from './reflector';
export {Reflector} from './reflector';;
import {ReflectionCapabilities} from './reflection_capabilities';;

export var reflector = new Reflector(new ReflectionCapabilities());