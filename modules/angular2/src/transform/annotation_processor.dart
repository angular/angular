library angular2.src.transform;

import 'dart:collection' show Queue;
import 'package:analyzer/src/generated/element.dart';

/// Provides a mechanism for checking an element for the provided
/// [_annotationClass] and reporting the resulting (element, annotation) pairs.
class AnnotationMatcher {
  /// Queue for annotations.
  final matchQueue = new Queue<AnnotationMatch>();
  /// All the annotations we have seen for each element
  final _seenAnnotations = new Map<Element, Set<ElementAnnotation>>();

  /// The class we are searching for to populate [initQueue].
  final ClassElement _annotationClass;

  AnnotationMatcher(this._annotationClass);

  /// Records all [_annotationClass] annotations and the [element]s they apply to.
  /// Returns [true] if 1) [element] is annotated with [_annotationClass] and
  /// 2) ([element], [_annotationClass]) has not been seen previously.
  bool processAnnotations(ClassElement element) {
    var found = false;
    element.metadata.where((ElementAnnotation meta) {
      // Only process [_annotationClass]s.
      // TODO(tjblasi): Make this recognize non-ConstructorElement annotations.
      return meta.element is ConstructorElement &&
          _isAnnotationMatch(meta.element.returnType);
    }).where((ElementAnnotation meta) {
      // Only process ([element], [meta]) combinations we haven't seen previously.
      return !_seenAnnotations
          .putIfAbsent(element, () => new Set<ElementAnnotation>())
          .contains(meta);
    }).forEach((ElementAnnotation meta) {
      _seenAnnotations[element].add(meta);
      matchQueue.addLast(new AnnotationMatch(element, meta));
      found = true;
    });
    return found;
  }

  /// Whether [type], its superclass, or one of its interfaces matches [_annotationClass].
  bool _isAnnotationMatch(InterfaceType type) {
    if (type == null || type.element == null) return false;
    if (type.element.type == _annotationClass.type) return true;
    if (_isAnnotationMatch(type.superclass)) return true;
    for (var interface in type.interfaces) {
      if (_isAnnotationMatch(interface)) return true;
    }
    return false;
  }
}

// Element/ElementAnnotation pair.
class AnnotationMatch {
  final Element element;
  final ElementAnnotation annotation;

  AnnotationMatch(this.element, this.annotation);
}
