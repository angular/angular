import {ComponentAnnotation, DirectiveAnnotation} from './annotations';
import {ViewAnnotation} from './view';
import {AncestorAnnotation, ParentAnnotation} from './visibility';
import {AttributeAnnotation, QueryAnnotation} from './di';
import {makeDecorator, makeParamDecorator} from '../../util/decorators';

/* from annotations */
export var Component = makeDecorator(ComponentAnnotation);
export var Directive = makeDecorator(DirectiveAnnotation);

/* from view */
export var View = makeDecorator(ViewAnnotation);

/* from visibility */
export var Ancestor = makeParamDecorator(AncestorAnnotation);
export var Parent = makeParamDecorator(ParentAnnotation);

/* from di */
export var Attribute = makeParamDecorator(AttributeAnnotation);
export var Query = makeParamDecorator(QueryAnnotation);
