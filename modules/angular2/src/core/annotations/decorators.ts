import {
  ComponentAnnotation,
  DirectiveAnnotation,
  ComponentArgs,
  DirectiveArgs
} from './annotations';
import {ViewAnnotation, ViewArgs} from './view';
import {AttributeAnnotation, QueryAnnotation} from './di';
import {
  makeDecorator,
  makeParamDecorator,
  TypeDecorator,
  ParamaterDecorator,
  Class
} from '../../util/decorators';
import {Type} from 'angular2/src/facade/lang';

export interface DirectiveDecorator extends TypeDecorator {}

export interface ComponentDecorator extends TypeDecorator { View(obj: ViewArgs): ViewDecorator; }

export interface ViewDecorator extends TypeDecorator { View(obj: ViewArgs): ViewDecorator }

export interface DirectiveFactory {
  (obj: DirectiveArgs): DirectiveDecorator;
  new (obj: DirectiveAnnotation): DirectiveAnnotation;
}

export interface ComponentFactory {
  (obj: ComponentArgs): ComponentDecorator;
  new (obj: ComponentAnnotation): ComponentAnnotation;
}

export interface ViewFactory {
  (obj: ViewArgs): ViewDecorator;
  new (obj: ViewArgs): ViewAnnotation;
}

export interface AttributeFactory {
  (name: string): TypeDecorator;
  new (name: string): AttributeAnnotation;
}

export interface QueryFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): ParameterDecorator;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): QueryAnnotation;
}


/* from annotations */
export var Component: ComponentFactory =
    <ComponentFactory>makeDecorator(ComponentAnnotation, (fn: any) => fn.View = View);
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveAnnotation);

/* from view */
export var View: ViewFactory =
    <ViewFactory>makeDecorator(ViewAnnotation, (fn: any) => fn.View = View);

/* from di */
export var Attribute: AttributeFactory = makeParamDecorator(AttributeAnnotation);
export var Query: QueryFactory = makeParamDecorator(QueryAnnotation);
