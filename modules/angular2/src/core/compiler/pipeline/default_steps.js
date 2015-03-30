import {ChangeDetection, Parser} from 'angular2/change_detection';
import {List, ListWrapper} from 'angular2/src/facade/collection';

import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {ElementBindingMarker} from './element_binding_marker';
import {ProtoViewBuilder} from './proto_view_builder';
import {ProtoElementInjectorBuilder} from './proto_element_injector_builder';
import {ElementBinderBuilder} from './element_binder_builder';

import {CssProcessor} from 'angular2/src/core/compiler/css_processor';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy, EmulatedScopedShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

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
    shadowDomStrategy: ShadowDomStrategy,
    templateUrl: string,
    cssProcessor: CssProcessor) {

  var steps = [
    new ViewSplitter(parser),
    cssProcessor.getCompileStep(compiledComponent, shadowDomStrategy, templateUrl),
    shadowDomStrategy.getTemplateCompileStep(compiledComponent),
    new PropertyBindingParser(parser),
    new DirectiveParser(directives),
    new TextInterpolationParser(parser),
    new ElementBindingMarker(),
    new ProtoViewBuilder(compiledComponent, changeDetection, shadowDomStrategy),
    new ProtoElementInjectorBuilder(),
    new ElementBinderBuilder(parser)
  ];

  return steps;
}
