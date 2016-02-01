library angular2.src.core.metadata;

import 'package:angular2/src/facade/collection.dart' show List;
import 'package:angular2/src/core/change_detection/change_detection.dart';
import './metadata/di.dart';
import './metadata/directives.dart';
import './metadata/view.dart';

export './metadata/di.dart';
export './metadata/directives.dart';
export './metadata/view.dart' hide VIEW_ENCAPSULATION_VALUES;

/**
 * See: [DirectiveMetadata] for docs.
 */
class Directive extends DirectiveMetadata {
  const Directive(
      {String selector,
      List<String> inputs,
      List<String> outputs,
      @Deprecated('Use `inputs` or `@Input` instead')
      List<String> properties,
      @Deprecated('Use `outputs` or `@Output` instead')
      List<String> events,
      Map<String, String> host,
      @Deprecated('Use `providers` instead')
      List bindings,
      List providers,
      String exportAs,
      Map<String, dynamic> queries})
      : super(
            selector: selector,
            inputs: inputs,
            outputs: outputs,
            properties: properties,
            events: events,
            host: host,
            bindings: bindings,
            providers: providers,
            exportAs: exportAs,
            queries: queries);
}

/**
 * See: [ComponentMetadata] for docs.
 */
class Component extends ComponentMetadata {
  const Component(
      {String selector,
      List<String> inputs,
      List<String> outputs,
      @Deprecated('Use `inputs` or `@Input` instead')
      List<String> properties,
      @Deprecated('Use `outputs` or `@Output` instead')
      List<String> events,
      Map<String, String> host,
      @Deprecated('Use `providers` instead')
      List bindings,
      List providers,
      String exportAs,
      String moduleId,
      Map<String, dynamic> queries,
      @Deprecated('Use `viewProviders` instead')
      List viewBindings,
      List viewProviders,
      ChangeDetectionStrategy changeDetection,
      String templateUrl,
      String template,
      dynamic directives,
      dynamic pipes,
      ViewEncapsulation encapsulation,
      List<String> styles,
      List<String> styleUrls})
      : super(
            selector: selector,
            inputs: inputs,
            outputs: outputs,
            properties: properties,
            events: events,
            host: host,
            bindings: bindings,
            providers: providers,
            exportAs: exportAs,
            moduleId: moduleId,
            viewBindings: viewBindings,
            viewProviders: viewProviders,
            queries: queries,
            changeDetection: changeDetection,
            templateUrl: templateUrl,
            template: template,
            directives: directives,
            pipes: pipes,
            encapsulation: encapsulation,
            styles: styles,
            styleUrls: styleUrls);
}

/**
 * See: [ViewMetadata] for docs.
 */
class View extends ViewMetadata {
  const View(
      {String templateUrl,
      String template,
      dynamic directives,
      dynamic pipes,
      ViewEncapsulation encapsulation,
      List<String> styles,
      List<String> styleUrls})
      : super(
            templateUrl: templateUrl,
            template: template,
            directives: directives,
            pipes: pipes,
            encapsulation: encapsulation,
            styles: styles,
            styleUrls: styleUrls);
}

/**
 * See: [PipeMetadata] for docs.
 */
class Pipe extends PipeMetadata {
  const Pipe({name, pure}) : super(name: name, pure: pure);
}

/**
 * See: [AttributeMetadata] for docs.
 */
class Attribute extends AttributeMetadata {
  const Attribute(String attributeName) : super(attributeName);
}

/**
 * See: [QueryMetadata] for docs.
 */
@Deprecated("Use ContentChildren/ContentChild instead")
class Query extends QueryMetadata {
  const Query(dynamic /*Type | string*/ selector, {bool descendants: false})
      : super(selector, descendants: descendants);
}

/**
 * See: [ContentChildrenMetadata] for docs.
 */
class ContentChildren extends ContentChildrenMetadata {
  const ContentChildren(dynamic /*Type | string*/ selector,
      {bool descendants: false})
      : super(selector, descendants: descendants);
}

/**
 * See: [ContentChildMetadata] for docs.
 */
class ContentChild extends ContentChildMetadata {
  const ContentChild(dynamic /*Type | string*/ selector) : super(selector);
}

/**
 * See: [ViewQueryMetadata] for docs.
 */
@Deprecated("Use ViewChildren/ViewChild instead")
class ViewQuery extends ViewQueryMetadata {
  const ViewQuery(dynamic /*Type | string*/ selector)
      : super(selector, descendants: true);
}

/**
 * See: [ViewChildrenMetadata] for docs.
 */
class ViewChildren extends ViewChildrenMetadata {
  const ViewChildren(dynamic /*Type | string*/ selector) : super(selector);
}

/**
 * See: [ViewChildMetadata] for docs.
 */
class ViewChild extends ViewChildMetadata {
  const ViewChild(dynamic /*Type | string*/ selector) : super(selector);
}

/**
 * See: [InputMetadata] for docs.
 */
class Input extends InputMetadata {
  const Input([String bindingPropertyName]) : super(bindingPropertyName);
}

/**
 * See: [OutputMetadata] for docs.
 */
class Output extends OutputMetadata {
  const Output([String bindingPropertyName]) : super(bindingPropertyName);
}

/**
 * See: [HostBindingMetadata] for docs.
 */
class HostBinding extends HostBindingMetadata {
  const HostBinding([String hostPropertyName]) : super(hostPropertyName);
}

/**
 * See: [HostListenerMetadata] for docs.
 */
class HostListener extends HostListenerMetadata {
  const HostListener(String eventName, [List<String> args])
      : super(eventName, args);
}
