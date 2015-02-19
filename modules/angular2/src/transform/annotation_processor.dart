library angular2.src.transform;

import 'dart:collection' show Queue;
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';

import 'resolvers.dart';

/// Provides a mechanism for checking an element for the provided
/// [_annotationClass] and reporting the resulting (element, annotation) pairs.
class AnnotationMatcher {
  /// Queue for annotations.
  final matchQueue = new Queue<AnnotationMatch>();
  /// All the annotations we have seen for each element
  final _seenAnnotations = new Map<Element, Set<ElementAnnotation>>();

  /// The classes we are searching for to populate [matchQueue].
  final Set<ClassElement> _annotationClasses;

  AnnotationMatcher(this._annotationClasses);

  /// Records all [_annotationClass] annotations and the [element]s they apply to.
  /// Returns
  List<AnnotationMatch> processAnnotations(ClassElement element) {
    // Finding the node corresponding to [element] can be very expensive.
    ClassDeclaration cachedNode = null;

    var result = <AnnotationMatch>[];
    element.metadata.where((ElementAnnotation meta) {
      // TODO(tjblasi): Make this recognize non-ConstructorElement annotations.
      return meta.element is ConstructorElement &&
          _isAnnotationMatch(meta.element.returnType);
    }).where((ElementAnnotation meta) {
      // Only process ([element], [meta]) combinations we haven't seen previously.
      return !_seenAnnotations
          .putIfAbsent(element, () => new Set<ElementAnnotation>())
          .contains(meta);
    }).forEach((ElementAnnotation meta) {
      if (cachedNode == null) {
        cachedNode = element.node;
      }

      var match = new AnnotationMatch(cachedNode, meta);
      _seenAnnotations[element].add(meta);
      matchQueue.addLast(match);
      result.add(match);
    });
    return result;
  }

  /// Whether [type], its superclass, or one of its interfaces matches [_annotationClass].
  bool _isAnnotationMatch(InterfaceType type) {
    return _annotationClasses.any((el) => isAnnotationMatch(type, el));
  }
}

/// [ConstructorElement] / [ElementAnnotation] pair, where the Constructor
class AnnotationMatch {
  /// The resolved element corresponding to [node].
  final ClassElement element;

  /// The Ast node corresponding to the class definition.
  final ClassDeclaration node;

  /// The resolved element for the matched annotation.
  final ElementAnnotation annotation;

  AnnotationMatch(ClassDeclaration node, this.annotation)
      : node = node,
        element = node.element;
}
