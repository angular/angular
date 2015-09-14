library angular2.src.core.metadata;

import 'package:angular2/src/core/facade/collection.dart' show List;
import 'package:angular2/src/core/change_detection/change_detection.dart';
import './metadata/di.dart';
import './metadata/directives.dart';
import './metadata/view.dart';

export './metadata/di.dart';
export './metadata/directives.dart';
export './metadata/view.dart';

/**
 * See: [DirectiveMetadata] for docs.
 */
class Directive extends DirectiveMetadata {
  const Directive({String selector, List<String> properties,
  List<String> events, Map<String, String> host,
  List bindings, String exportAs, String moduleId,
  bool compileChildren: true})
    : super(
    selector: selector,
    properties: properties,
    events: events,
    host: host,
    bindings: bindings,
    exportAs: exportAs,
    moduleId: moduleId,
    compileChildren: compileChildren);
}

/**
 * See: [ComponentMetadata] for docs.
 */
class Component extends ComponentMetadata {
  const Component({String selector, List<String> properties,
  List<String> events, Map<String, String> host, bool dynamicLoadable,
  List bindings, String exportAs, String moduleId,
  bool compileChildren, List viewBindings, ChangeDetectionStrategy changeDetection})
    : super(
    selector: selector,
    properties: properties,
    events: events,
    host: host,
    dynamicLoadable: dynamicLoadable,
    bindings: bindings,
    exportAs: exportAs,
    moduleId: moduleId,
    compileChildren: compileChildren,
    viewBindings: viewBindings,
    changeDetection: changeDetection);
}

/**
 * See: [ViewMetadata] for docs.
 */
class View extends ViewMetadata {
  const View({String templateUrl, String template, dynamic directives,
  dynamic pipes, ViewEncapsulation encapsulation, List<String> styles,
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
class Query extends QueryMetadata {
  const Query(dynamic /*Type | string*/ selector, {bool descendants: false})
    : super(selector, descendants: descendants);
}

/**
 * See: [ViewQueryMetadata] for docs.
 */
class ViewQuery extends ViewQueryMetadata {
  const ViewQuery(dynamic /*Type | string*/ selector)
    : super(selector, descendants: true);
}

/**
 * See: [PropertyMetadata] for docs.
 */
class Property extends PropertyMetadata {
  const Property([String bindingPropertyName])
    : super(bindingPropertyName);
}

/**
 * See: [EventMetadata] for docs.
 */
class Event extends EventMetadata {
  const Event([String bindingPropertyName])
    : super(bindingPropertyName);
}

/**
 * See: [HostBindingMetadata] for docs.
 */
class HostBinding extends HostBindingMetadata {
  const HostBinding([String hostPropertyName])
    : super(hostPropertyName);
}

/**
 * See: [HostListenerMetadata] for docs.
 */
class HostListener extends HostListenerMetadata {
  const HostListener(String eventName, [List<String> args])
    : super(eventName, args);
}