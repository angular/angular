library angular2.src.core.metadata;

import "package:angular2/src/core/facade/collection.dart" show List;
import 'package:angular2/src/core/change_detection/change_detection.dart';
import "./metadata/di.dart";
import "./metadata/directives.dart";
import "./metadata/view.dart";

export "./metadata/di.dart";
export "./metadata/directives.dart";
export "./metadata/view.dart";

/**
 * See: [DirectiveMetadata] for docs.
 */
class Directive extends DirectiveMetadata {
  const Directive({String selector, List<String> properties,
  List<String> events, Map<String, String> host,
  List<LifecycleEvent> lifecycle, List bindings, String exportAs,
  bool compileChildren: true})
    : super(
    selector: selector,
    properties: properties,
    events: events,
    host: host,
    lifecycle: lifecycle,
    bindings: bindings,
    exportAs: exportAs,
    compileChildren: compileChildren);
}

/**
 * See: [ComponentMetadata] for docs.
 */
class Component extends ComponentMetadata {
  const Component({String selector, List<String> properties,
  List<String> events, Map<String, String> host,
  List<LifecycleEvent> lifecycle, List bindings, String exportAs,
  bool compileChildren, List viewBindings, ChangeDetectionStrategy changeDetection})
    : super(
    selector: selector,
    properties: properties,
    events: events,
    host: host,
    lifecycle: lifecycle,
    bindings: bindings,
    exportAs: exportAs,
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
  const Pipe({name}) : super(name: name);
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
  const ViewQuery(dynamic /*Type | string*/ selector, {bool descendants: false})
    : super(selector, descendants: descendants);
}
