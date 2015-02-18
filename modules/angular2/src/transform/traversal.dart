import 'package:analyzer/src/generated/element.dart';
import 'package:path/path.dart' as path;

import 'annotation_processor.dart';

class ImportTraversal {
  final AnnotationMatcher _annotationMatcher;

  ImportTraversal(this._annotationMatcher);

  /// Reads Initializer annotations on this library and all its dependencies in
  /// post-order.
  void traverse(LibraryElement library, [Set<LibraryElement> seen]) {
    if (seen == null) seen = new Set<LibraryElement>();
    seen.add(library);

    // Visit all our dependencies.
    for (var importedLibrary in _sortedLibraryImports(library)) {
      // Don't include anything from the sdk.
      if (importedLibrary.isInSdk) continue;
      if (seen.contains(importedLibrary)) continue;
      traverse(importedLibrary, seen);
    }

    for (var clazz in _classesOfLibrary(library, seen)) {
      var superClass = clazz.supertype;
      while (superClass != null) {
        if (_annotationMatcher.processAnnotations(superClass.element) &&
            superClass.element.library != clazz.library) {
          _logger.warning(
              'We have detected a cycle in your import graph when running '
              'initializers on ${clazz.name}. This means the super class '
              '${superClass.name} has a dependency on this library '
              '(possibly transitive).');
        }
        superClass = superClass.superclass;
      }
      _annotationMatcher.processAnnotations(clazz);
    }
  }

  /// Retrieves all classes that are visible if you were to import [lib]. This
  /// includes exported classes from other libraries.
  List<ClassElement> _classesOfLibrary(
      LibraryElement library, Set<LibraryElement> seen) {
    var result = [];
    result.addAll(library.units.expand((u) => u.types));
    for (var export in library.exports) {
      if (seen.contains(export.exportedLibrary)) continue;
      var exported = _classesOfLibrary(export.exportedLibrary, seen);
      _filter(exported, export.combinators);
      result.addAll(exported);
    }
    result.sort((a, b) => a.name.compareTo(b.name));
    return result;
  }

  /// Filters [elements] that come from an export, according to its show/hide
  /// combinators. This modifies [elements] in place.
  void _filter(List<Element> elements, List<NamespaceCombinator> combinators) {
    for (var c in combinators) {
      if (c is ShowElementCombinator) {
        var show = c.shownNames.toSet();
        elements.retainWhere((e) => show.contains(e.displayName));
      } else if (c is HideElementCombinator) {
        var hide = c.hiddenNames.toSet();
        elements.removeWhere((e) => hide.contains(e.displayName));
      }
    }
  }

  Iterable<LibraryElement> _sortedLibraryImports(LibraryElement library) =>
      (new List.from(library.imports)
    ..sort((ImportElement a, ImportElement b) {
      // dart: imports don't have a uri
      if (a.uri == null && b.uri != null) return -1;
      if (b.uri == null && a.uri != null) return 1;
      if (a.uri == null && b.uri == null) {
        return a.importedLibrary.name.compareTo(b.importedLibrary.name);
      }

      // package: imports next
      var aIsPackage = a.uri.startsWith('package:');
      var bIsPackage = b.uri.startsWith('package:');
      if (aIsPackage && !bIsPackage) {
        return -1;
      } else if (bIsPackage && !aIsPackage) {
        return 1;
      } else if (bIsPackage && aIsPackage) {
        return a.uri.compareTo(b.uri);
      }

      // And finally compare based on the relative uri if both are file paths.
      var aUri = path.relative(a.source.uri.path,
          from: path.dirname(library.source.uri.path));
      var bUri = path.relative(b.source.uri.path,
          from: path.dirname(library.source.uri.path));
      return aUri.compareTo(bUri);
    })).map((import) => import.importedLibrary);
}
