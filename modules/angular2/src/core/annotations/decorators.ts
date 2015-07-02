import {
  ComponentAnnotation,
  DirectiveAnnotation,
  ComponentArgs,
  DirectiveArgs
} from './annotations';
import {ViewAnnotation, ViewArgs} from './view';
import {AttributeAnnotation, QueryAnnotation} from './di';
import {makeDecorator, makeParamDecorator, Decorator, Class} from '../../util/decorators';
import {Type} from 'angular2/src/facade/lang';

export interface DirectiveDecorator extends Decorator {}

export interface ComponentDecorator extends Decorator {
  View(obj: ViewArgs): ViewDecorator;
}

export interface ViewDecorator extends Decorator { View(obj: ViewArgs): ViewDecorator }

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
  (name: string): AttributeAnnotation;
  new (name: string): AttributeAnnotation;
}

export interface QueryFactory {
  (private _selector: Type | string,
    {descendants = false}: {descendants?: boolean} = {}): QueryAnnotation;
  new (private _selector: Type | string,
    {descendants = false}: {descendants?: boolean} = {}): QueryAnnotation;
}


/* from annotations */
export var Component: ComponentFactory = <ComponentFactory>makeDecorator(ComponentAnnotation, (fn: any) => fn.View = View);
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveAnnotation);

/* from view */
export var View:ViewFactory = <ViewFactory>makeDecorator(ViewAnnotation, (fn: any) => fn.View = View);

/* from di */
export var Attribute: AttributeFactory = makeParamDecorator(AttributeAnnotation);
export var Query: QueryFactory = makeParamDecorator(QueryAnnotation);
