library angular2.transform;

import 'package:barback/barback.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:code_transformers/resolver.dart';

Resolvers createResolvers() {
  return new Resolvers.fromMock({
    // The list of types below is derived from:
    //   * types that are used internally by the resolver (see
    //   _initializeFrom in resolver.dart).
    // TODO(jakemac): Move this into code_transformers so it can be shared.
    'dart:core': '''
            library dart.core;
            class Object {}
            class Function {}
            class StackTrace {}
            class Symbol {}
            class Type {}

            class String extends Object {}
            class bool extends Object {}
            class num extends Object {}
            class int extends num {}
            class double extends num {}
            class DateTime extends Object {}
            class Null extends Object {}

            class Deprecated extends Object {
              final String expires;
              const Deprecated(this.expires);
            }
            const Object deprecated = const Deprecated("next release");
            class _Override { const _Override(); }
            const Object override = const _Override();
            class _Proxy { const _Proxy(); }
            const Object proxy = const _Proxy();

            class List<V> extends Object {}
            class Map<K, V> extends Object {}
            ''',
    'dart:html': '''
            library dart.html;
            class HtmlElement {}
            ''',
  });
}

const bootstrapMethodName = 'bootstrap';
const reflectionCapabilitiesTypeName = 'ReflectionCapabilities';

/// Provides resolved [Elements] for well-known Angular2 symbols.
class Angular2Types {
  static Map<Resolver, Angular2Types> _cache = {};
  static final _annotationsLibAssetId =
      new AssetId('angular2', 'lib/src/core/annotations/annotations.dart');
  static final _applicationLibAssetId =
      new AssetId('angular2', 'lib/src/core/application.dart');
  static final _templateLibAssetId =
      new AssetId('angular2', 'lib/src/core/annotations/view.dart');
  static final _reflectionCapabilitiesLibAssetId = new AssetId(
      'angular2', 'lib/src/reflection/reflection_capabilities.dart');

  final Resolver _resolver;
  FunctionElement _bootstrapMethod;

  Angular2Types._internal(this._resolver);

  factory Angular2Types(Resolver resolver) {
    return _cache.putIfAbsent(
        resolver, () => new Angular2Types._internal(resolver));
  }

  LibraryElement get annotationsLib =>
      _resolver.getLibrary(_annotationsLibAssetId);

  ClassElement get directiveAnnotation =>
      _getTypeSafe(annotationsLib, 'Directive');

  ClassElement get componentAnnotation =>
      _getTypeSafe(annotationsLib, 'Component');

  ClassElement get decoratorAnnotation =>
      _getTypeSafe(annotationsLib, 'Decorator');

  LibraryElement get templateLib => _resolver.getLibrary(_templateLibAssetId);

  ClassElement get templateAnnotation => _getTypeSafe(templateLib, 'View');

  LibraryElement get reflectionCapabilitiesLib =>
      _resolver.getLibrary(_reflectionCapabilitiesLibAssetId);

  ClassElement get reflectionCapabilities =>
      _getTypeSafe(reflectionCapabilitiesLib, reflectionCapabilitiesTypeName);

  LibraryElement get applicationLib =>
      _resolver.getLibrary(_applicationLibAssetId);

  FunctionElement get bootstrapMethod {
    if (_bootstrapMethod == null) {
      _bootstrapMethod = applicationLib.definingCompilationUnit.functions
          .firstWhere((FunctionElement el) => el.name == bootstrapMethodName,
              orElse: () => null);
    }
    return _bootstrapMethod;
  }

  /// Gets the type named [name] in library [lib]. Returns `null` if [lib] is
  /// `null` or [name] cannot be found in [lib].
  ClassElement _getTypeSafe(LibraryElement lib, String name) {
    if (lib == null) return null;
    return lib.getType(name);
  }

  /// Whether [clazz] is annotated as a [Component].
  bool isComponent(ClassElement clazz) =>
      hasAnnotation(clazz, componentAnnotation);
}

/// Whether [type], its superclass, or one of its interfaces matches [target].
bool isAnnotationMatch(InterfaceType type, ClassElement target) {
  if (type == null || type.element == null) return false;
  if (type.element.type == target.type) return true;
  if (isAnnotationMatch(type.superclass, target)) return true;
  for (var interface in type.interfaces) {
    if (isAnnotationMatch(interface, target)) return true;
  }
  return false;
}

/// Determines whether [clazz] has at least one annotation that `is` a
/// [metaClazz].
bool hasAnnotation(ClassElement clazz, ClassElement metaClazz) {
  if (clazz == null || metaClazz == null) return false;
  return clazz.metadata.firstWhere((ElementAnnotation meta) {
// TODO(kegluneq): Make this recognize non-ConstructorElement annotations.
    return meta.element is ConstructorElement &&
        isAnnotationMatch(meta.element.returnType, metaClazz);
  }, orElse: () => null) != null;
}
