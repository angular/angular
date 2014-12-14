import {Parser} from 'change_detection/parser/parser';
import {List} from 'facade/collection';

import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {ElementBindingMarker} from './element_binding_marker';
import {ProtoViewBuilder} from './proto_view_builder';
import {ProtoElementInjectorBuilder} from './proto_element_injector_builder';
import {ElementBinderBuilder} from './element_binder_builder';
import {AnnotatedType} from 'core/compiler/annotated_type';
import {stringify} from 'facade/lang';

/**
 * Default steps used for compiling a template.
 * Takes in an HTMLElement and produces the ProtoViews,
 * ProtoElementInjectors and ElementBinders in the end.
 */
export function createDefaultSteps(parser:Parser, compiledComponent: AnnotatedType,
    directives: List<AnnotatedType>) {
  var compilationUnit = stringify(compiledComponent.type);

  return [
    new ViewSplitter(parser, compilationUnit),
    new TextInterpolationParser(parser, compilationUnit),
    new PropertyBindingParser(parser, compilationUnit),
    new DirectiveParser(directives),
    new ElementBindingMarker(),
    new ProtoViewBuilder(),
    new ProtoElementInjectorBuilder(),
    new ElementBinderBuilder()
  ];
}