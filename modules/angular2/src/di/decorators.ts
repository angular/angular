import {
  InjectAnnotation,
  InjectPromiseAnnotation,
  InjectLazyAnnotation,
  OptionalAnnotation,
  InjectableAnnotation
} from './annotations';
import {makeDecorator, makeParamDecorator} from '../util/decorators';

export var Inject = makeParamDecorator(InjectAnnotation);
export var InjectPromise = makeParamDecorator(InjectPromiseAnnotation);
export var InjectLazy = makeParamDecorator(InjectLazyAnnotation);
export var Optional = makeParamDecorator(OptionalAnnotation);
export var Injectable = makeDecorator(InjectableAnnotation);
