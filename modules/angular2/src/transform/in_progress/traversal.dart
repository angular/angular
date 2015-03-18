library angular2.src.transform;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';

import 'annotation_processor.dart';
import 'common/logging.dart';
import 'resolvers.dart';

/// Walks through an Angular2 application, finding all classes matching the
/// provided [annotationMatcher].
class AngularVisibleTraversal {
  final Angular2Types _types;
  final _ComponentParsingAstVisitor _visitor;

  AngularVisibleTraversal(this._types, AnnotationMatcher annotationMatcher)
      : _visitor = new _ComponentParsingAstVisitor(annotationMatcher);

  /// Walks an Angular2 application, starting with the class represented by
  /// [entryPoint], which must be annotated as an Angular2 [Component].
  ///
  /// We recursively check the entryPoint's annotations and constructor
  /// arguments for types which match the provided [annotationMatcher].
  void traverse(ClassElement entryPoint) {
    if (!_types.isComponent(entryPoint)) {
      throw new ArgumentError.value(entryPoint, 'entryPoint',
          'Provided entryPoint must be annotated as a Component');
    }
    entryPoint.node.accept(_visitor);
  }
}

class _ComponentParsingAstVisitor extends Object
    with RecursiveAstVisitor<Object> {
  final Set<ClassElement> _seen = new Set();
  final AnnotationMatcher _matcher;

  _ComponentParsingAstVisitor(this._matcher);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    if (node.element != null) {
      if (_seen.contains(node.element)) return null;
      _seen.add(node.element);
    }

    // Process the class itself.
    node.name.accept(this);

    // Process metadata information, ignoring [FieldDeclaration]s and
    // [MethodDeclaration]s (see below).
    node.metadata.forEach((Annotation meta) => meta.accept(this));

    // Process constructor parameters, fields & methods are ignored below.
    node.members.forEach((m) => m.accept(this));

    return null;
  }

  @override
  Object visitFieldDeclaration(FieldDeclaration node) => null;

  @override
  Object visitMethodDeclaration(MethodDeclaration node) => null;

  @override
  Object visitAnnotation(Annotation node) {
    // TODO(kegluneq): Visit only Angular2 annotations & subtypes.
    return super.visitAnnotation(node);
  }

  @override
  Object visitSimpleIdentifier(SimpleIdentifier node) {
    if (node.bestElement != null) {
      if (node.bestElement is ClassElement) {
        var matches = _matcher.processAnnotations(node.bestElement);
        // If any of these types are matches, recurse on them.
        matches.forEach((match) => match.node.accept(this));
      }
    }
    return super.visitSimpleIdentifier(node);
  }
}
