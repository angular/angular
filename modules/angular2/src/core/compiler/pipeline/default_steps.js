import {ChangeDetection, Parser} from 'angular2/change_detection';
import {List} from 'angular2/src/facade/collection';

import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {ElementBindingMarker} from './element_binding_marker';
import {ProtoViewBuilder} from './proto_view_builder';
import {ProtoElementInjectorBuilder} from './proto_element_injector_builder';
import {ElementBinderBuilder} from './element_binder_builder';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {stringify} from 'angular2/src/facade/lang';

/**
 * Default steps used for compiling a template.
 * Takes in an HTMLElement and produces the ProtoViews,
 * ProtoElementInjectors and ElementBinders in the end.
 */
export function createDefaultSteps(
    changeDetection:ChangeDetection,
    parser:Parser,
    compiledComponent: DirectiveMetadata,
    directives: List<DirectiveMetadata>,
    shadowDomStrategy: ShadowDomStrategy) {

  var compilationUnit = stringify(compiledComponent.type);

  return [
    new ViewSplitter(parser, compilationUnit),
    new PropertyBindingParser(parser, compilationUnit),
    new DirectiveParser(directives),
    new TextInterpolationParser(parser, compilationUnit),
    new ElementBindingMarker(),
    new ProtoViewBuilder(changeDetection, shadowDomStrategy),
    new ProtoElementInjectorBuilder(),
    new ElementBinderBuilder()
  ];
}
