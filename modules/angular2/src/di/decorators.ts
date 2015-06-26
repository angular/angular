import {
  InjectAnnotation,
  OptionalAnnotation,
  InjectableAnnotation,
  VisibilityAnnotation,
  SelfAnnotation,
  ParentAnnotation,
  AncestorAnnotation,
  UnboundedAnnotation
} from './annotations';
import {makeDecorator, makeParamDecorator} from '../util/decorators';

export var Inject = makeParamDecorator(InjectAnnotation);
export var Optional = makeParamDecorator(OptionalAnnotation);
export var Injectable = makeDecorator(InjectableAnnotation);
export var Visibility = makeParamDecorator(VisibilityAnnotation);
export var Self = makeParamDecorator(SelfAnnotation);
export var Parent = makeParamDecorator(ParentAnnotation);
export var Ancestor = makeParamDecorator(AncestorAnnotation);
export var Unbounded = makeParamDecorator(UnboundedAnnotation);