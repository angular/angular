library angular2.transform.common.annotation_matcher;

import 'package:analyzer/src/generated/ast.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:code_transformers/assets.dart';
import 'package:path/path.dart' as path;
import 'logging.dart' show logger;

/// [AnnotationDescriptor]s for the default angular annotations that can appear
/// on a class. These classes are re-exported in many places so this covers all
/// the possible libraries which could provide them.
const INJECTABLES = const [
  const AnnotationDescriptor(
      'Injectable', 'package:angular2/src/di/decorators.dart', null),
  const AnnotationDescriptor('Injectable', 'package:angular2/di.dart', null),
  const AnnotationDescriptor(
      'Injectable', 'package:angular2/angular2.dart', null),
];

const DIRECTIVES = const [
  const AnnotationDescriptor('Directive',
      'package:angular2/src/core/annotations/annotations.dart', 'Injectable'),
  const AnnotationDescriptor('Directive',
      'package:angular2/src/core/annotations/decorators.dart', 'Injectable'),
  const AnnotationDescriptor('Directive',
      'package:angular2/src/core/annotations_impl/annotations.dart',
      'Injectable'),
  const AnnotationDescriptor(
      'Directive', 'package:angular2/annotations.dart', 'Injectable'),
  const AnnotationDescriptor(
      'Directive', 'package:angular2/angular2.dart', 'Injectable'),
  const AnnotationDescriptor(
      'Directive', 'package:angular2/core.dart', 'Injectable'),
];

const COMPONENTS = const [
  const AnnotationDescriptor('Component',
      'package:angular2/src/core/annotations/annotations.dart', 'Directive'),
  const AnnotationDescriptor('Component',
      'package:angular2/src/core/annotations/decorators.dart', 'Directive'),
  const AnnotationDescriptor('Component',
      'package:angular2/src/core/annotations_impl/annotations.dart',
      'Directive'),
  const AnnotationDescriptor(
      'Component', 'package:angular2/annotations.dart', 'Directive'),
  const AnnotationDescriptor(
      'Component', 'package:angular2/angular2.dart', 'Directive'),
  const AnnotationDescriptor(
      'Component', 'package:angular2/core.dart', 'Directive'),
];

const VIEWS = const [
  const AnnotationDescriptor('View', 'package:angular2/view.dart', null),
  const AnnotationDescriptor('View', 'package:angular2/angular2.dart', null),
  const AnnotationDescriptor('View', 'package:angular2/core.dart', null),
  const AnnotationDescriptor(
      'View', 'package:angular2/src/core/annotations/view.dart', null),
  const AnnotationDescriptor(
      'View', 'package:angular2/src/core/annotations_impl/view.dart', null),
];

/// Checks if a given [Annotation] matches any of the given
/// [AnnotationDescriptors].
class AnnotationMatcher {
  /// Always start out with the default angular [AnnotationDescriptor]s.
  final List<AnnotationDescriptor> _annotations = []
    ..addAll(VIEWS)
    ..addAll(COMPONENTS)
    ..addAll(INJECTABLES)
    ..addAll(DIRECTIVES);

  AnnotationMatcher();

  /// Adds a new [AnnotationDescriptor].
  void add(AnnotationDescriptor annotation) => _annotations.add(annotation);

  /// Adds a number of [AnnotationDescriptor]s.
  void addAll(Iterable<AnnotationDescriptor> annotations) =>
      _annotations.addAll(annotations);

  /// Returns the first [AnnotationDescriptor] that matches the given
  /// [Annotation] node which appears in `assetId`.
  AnnotationDescriptor firstMatch(Annotation annotation, AssetId assetId) =>
      _annotations.firstWhere((a) => _matchAnnotation(annotation, a, assetId),
          orElse: () => null);

  /// Checks whether an [Annotation] node matches any [AnnotationDescriptor].
  bool hasMatch(Annotation annotation, AssetId assetId) =>
      _annotations.any((a) => _matchAnnotation(annotation, a, assetId));

  /// Checks if an [Annotation] node implements [Injectable].
  bool isInjectable(Annotation annotation, AssetId assetId) =>
      _implements(firstMatch(annotation, assetId), INJECTABLES);

  /// Checks if an [Annotation] node implements [Directive].
  bool isDirective(Annotation annotation, AssetId assetId) =>
      _implements(firstMatch(annotation, assetId), DIRECTIVES);

  /// Checks if an [Annotation] node implements [Component].
  bool isComponent(Annotation annotation, AssetId assetId) =>
      _implements(firstMatch(annotation, assetId), COMPONENTS);

  /// Checks if an [Annotation] node implements [View].
  bool isView(Annotation annotation, AssetId assetId) =>
      _implements(firstMatch(annotation, assetId), VIEWS);

  /// Checks if `descriptor` extends or is any of the supplied `interfaces`.
  bool _implements(
      AnnotationDescriptor descriptor, List<AnnotationDescriptor> interfaces) {
    if (descriptor == null) return false;
    if (interfaces.contains(descriptor)) return true;
    if (descriptor.superClass == null) return false;
    var superClass = _annotations.firstWhere(
        (a) => a.name == descriptor.superClass, orElse: () => null);
    if (superClass == null) {
      logger.warning(
          'Missing `custom_annotation` entry for `${descriptor.superClass}`.');
      return false;
    }
    return _implements(superClass, interfaces);
  }

  // Checks if an [Annotation] matches an [AnnotationDescriptor].
  static bool _matchAnnotation(
      Annotation annotation, AnnotationDescriptor descriptor, AssetId assetId) {
    String name;
    Identifier prefix;
    if (annotation.name is PrefixedIdentifier) {
      // TODO(jakemac): Shouldn't really need a cast here, remove once
      // https://github.com/dart-lang/sdk/issues/23798 is fixed.
      var prefixedName = annotation.name as PrefixedIdentifier;
      name = prefixedName.identifier.name;
      prefix = prefixedName.prefix;
    } else {
      name = annotation.name.name;
    }
    if (name != descriptor.name) return false;
    return (annotation.root as CompilationUnit).directives
        .where((d) => d is ImportDirective)
        .any((ImportDirective i) {
      var importMatch = false;
      var uriString = i.uri.stringValue;
      if (uriString == descriptor.import) {
        importMatch = true;
      } else if (uriString.startsWith('package:') ||
          uriString.startsWith('dart:')) {
        return false;
      } else {
        importMatch = descriptor.assetId ==
            uriToAssetId(assetId, uriString, logger, null);
      }

      if (!importMatch) return false;
      if (prefix == null) return i.prefix == null;
      if (i.prefix == null) return false;
      return prefix.name == i.prefix.name;
    });
  }
}

/// String based description of an annotation class and its location.
class AnnotationDescriptor {
  /// The name of the class.
  final String name;
  /// A `package:` style import path to the file where the class is defined.
  final String import;
  /// The class that this class extends or implements. This is the only optional
  /// field.
  final String superClass;

  AssetId get assetId => new AssetId(package, packagePath);
  String get package => path.split(import.replaceFirst('package:', '')).first;
  String get packagePath => path.joinAll(['lib']
    ..addAll(path.split(import.replaceFirst('package:', ''))..removeAt(0)));

  const AnnotationDescriptor(this.name, this.import, this.superClass);
}
