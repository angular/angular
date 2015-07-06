import {
  ComponentAnnotation,
  DirectiveAnnotation,
  ComponentArgs,
  DirectiveArgs
} from './annotations';
import {ViewAnnotation, ViewArgs} from './view';
import {AttributeAnnotation, QueryAnnotation} from './di';
import {makeDecorator, makeParamDecorator, TypeDecorator, Class} from '../../util/decorators';
import {Type} from 'angular2/src/facade/lang';

export {ClassDefinition, TypeDecorator} from '../../util/decorators';

export interface DirectiveTypeDecorator extends TypeDecorator {}

export interface ComponentTypeDecorator extends TypeDecorator {
  View(obj: ViewArgs): ViewTypeDecorator;
}

export interface ViewTypeDecorator extends TypeDecorator { View(obj: ViewArgs): ViewTypeDecorator }

export interface IDirective {
  (obj: DirectiveArgs): DirectiveTypeDecorator;
  new (obj: DirectiveAnnotation): DirectiveAnnotation;
}

export interface IComponent {
  (obj: ComponentArgs): ComponentTypeDecorator;
  new (obj: ComponentAnnotation): ComponentAnnotation;
}

export interface IView {
  (obj: ViewArgs): ViewTypeDecorator;
  new (obj: ViewArgs): ViewAnnotation;
}


/* from annotations */
export var Component: IComponent = <IComponent>makeDecorator(ComponentAnnotation, (fn: any) => fn.View = View);
export var Directive: IDirective = <IDirective>makeDecorator(DirectiveAnnotation);

/* from view */
export var View: IView = <IView>makeDecorator(ViewAnnotation, (fn: any) => fn.View = View);

/* from di */
export var Attribute = makeParamDecorator(AttributeAnnotation);
export var Query = makeParamDecorator(QueryAnnotation);
