import {Type, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Reflector} from './reflector';
export {Reflector, ReflectionInfo} from './reflector';
import {ReflectionCapabilities} from './reflection_capabilities';

/**
 * The {@link Reflector} used internally in Angular to access metadata
 * about symbols.
 */
export var reflector = new Reflector(new ReflectionCapabilities());
