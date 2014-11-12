import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {List} from 'facade/collection';

import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {ElementBindingMarker} from './element_binding_marker';
import {ProtoViewBuilder} from './proto_view_builder';
import {ProtoElementInjectorBuilder} from './proto_element_injector_builder';
import {ElementBinderBuilder} from './element_binder_builder';

/**
 * Default steps used for compiling a template.
 * Takes in an HTMLElement and produces the ProtoViews,
 * ProtoElementInjectors and ElementBinders in the end.
 */
export function createDefaultSteps(
    parser:Parser, closureMap:ClosureMap,
    directives: List<AnnotatedType>
  ) {
  return [
    new PropertyBindingParser(),
    new TextInterpolationParser(),
    new DirectiveParser(directives),
    new ViewSplitter(),
    new ElementBindingMarker(),
    new ProtoViewBuilder(),
    new ProtoElementInjectorBuilder(),
    new ElementBinderBuilder(parser, closureMap)
  ];
}