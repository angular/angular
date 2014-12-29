import {Parser} from 'change_detection/change_detection';
import {List} from 'facade/collection';

import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {ElementBindingMarker} from './element_binding_marker';
import {ProtoViewBuilder} from './proto_view_builder';
import {ProtoElementInjectorBuilder} from './proto_element_injector_builder';
import {ElementBinderBuilder} from './element_binder_builder';
import {DirectiveMetadata} from 'core/compiler/directive_metadata';
import {stringify} from 'facade/lang';

/**
 * Default steps used for compiling a template.
 * Takes in an HTMLElement and produces the ProtoViews,
 * ProtoElementInjectors and ElementBinders in the end.
 */
export function createDefaultSteps(parser:Parser, compiledComponent: DirectiveMetadata,
    directives: List<DirectiveMetadata>) {
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