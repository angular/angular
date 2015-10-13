library angular2.transform.deferred_rewriter.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';
import 'package:quiver/iterables.dart' as it;

class Rewriter {
  final AssetId _entryPoint;
  final AssetReader _reader;

  Rewriter(this._entryPoint, this._reader);

  /// Rewrites the provided code by finding all the deferred library imports
  /// and loadLibrary invocations. Then it removes any libraries that don't
  /// require angular codegen. For the remaining libraries it rewrites the
  /// import to the corresponding ng_dep file, and chains a future which
  /// first initializes the library.
  ///
  /// To the extent possible, this method does not change line numbers or
  /// offsets in the provided code to facilitate debugging via source maps.
  Future<String> rewrite() async {
    var code = await _reader.readAsString(_entryPoint);
    var node = parseCompilationUnit(code);
    if (node == null) return null;

    return logElapsedAsync(() async {
      var visitor = new _FindDeferredLibraries(_reader, _entryPoint);
      node.accept(visitor);
      // Look to see if we found any deferred libraries
      if (!visitor.hasDeferredLibrariesToRewrite()) return null;
      // Remove any libraries that don't need angular codegen.
      await visitor.cull();
      // Check again if there are any deferred libraries.
      if (!visitor.hasDeferredLibrariesToRewrite()) return null;

      var compare = (AstNode a, AstNode b) => a.offset - b.offset;
      visitor.deferredImports.sort(compare);
      visitor.loadLibraryInvocations.sort(compare);

      var buf = new StringBuffer();
      var idx =
          visitor.deferredImports.fold(0, (int lastIdx, ImportDirective node) {
        buf.write(code.substring(lastIdx, node.offset));

        var import = code.substring(node.offset, node.end);
        buf.write(import.replaceFirst('.dart', DEPS_EXTENSION));
        return node.end;
      });

      idx = visitor.loadLibraryInvocations.fold(idx,
          (int lastIdx, MethodInvocation node) {
        buf.write(code.substring(lastIdx, node.offset));
        var value = node.realTarget as SimpleIdentifier;
        var prefix = value.name;
        // Chain a future that initializes the reflector.
        buf.write('$prefix.loadLibrary().then((_) {$prefix.initReflector();})');
        return node.end;
      });
      if (idx < code.length) buf.write(code.substring(idx));
      return '$buf';
    }, operationName: 'rewriteDeferredLibraries', assetId: _entryPoint);
  }
}

/// Visitor responsible for finding the deferred libraries that need angular
/// codegen. Those are the libraries that are loaded deferred and have a
/// corresponding ng_deps file.
class _FindDeferredLibraries extends Object with RecursiveAstVisitor<Object> {
  var deferredImports = new List<ImportDirective>();
  var loadLibraryInvocations = new List<MethodInvocation>();
  final AssetReader _reader;
  final AssetId _entryPoint;
  final _urlResolver = const TransformerUrlResolver();

  _FindDeferredLibraries(this._reader, this._entryPoint);

  @override
  Object visitImportDirective(ImportDirective node) {
    if (node.deferredKeyword != null) {
      deferredImports.add(node);
    }
    return null;
  }

  @override
  Object visitMethodInvocation(MethodInvocation node) {
    if (node.methodName.name == 'loadLibrary') {
      loadLibraryInvocations.add(node);
    }
    return super.visitMethodInvocation(node);
  }

  bool hasDeferredLibrariesToRewrite() {
    if (deferredImports.isEmpty) {
      logger.fine('There are no deferred library imports.');
      return false;
    }
    if (loadLibraryInvocations.isEmpty) {
      logger.fine(
          'There are no loadLibrary invocations that need to be rewritten.');
      return false;
    }
    return true;
  }

  // Remove all deferredImports that do not have an associated ng_meta file
  // then remove all loadLibrary invocations that are not in the set of
  // prefixes that are left.
  Future cull() async {
    var baseUri = toAssetUri(_entryPoint);

    // Determine whether a deferred import has ng_deps.
    var hasInputs = await Future.wait(deferredImports
        .map((import) => stringLiteralToString(import.uri))
        .map((uri) => toMetaExtension(uri))
        .map((metaUri) => fromUri(_urlResolver.resolve(baseUri, metaUri)))
        .map((asset) => _reader.hasInput(asset)));

    // Filter out any deferred imports that do not have ng_deps.
    deferredImports = it.zip([deferredImports, hasInputs])
        .where((importHasInput) => importHasInput[1])
        .map((importHasInput) => importHasInput[0])
        .toList();

    // Find the set of prefixes which have ng_deps.
    var prefixes =
        new Set.from(deferredImports.map((import) => import.prefix.name));

    // Filters out any load library invocations where the prefix is not a known
    // library with ng_deps.
    loadLibraryInvocations = loadLibraryInvocations.where((library) {
      var value = library.realTarget as SimpleIdentifier;
      return prefixes.contains(value.name);
    }).toList();

    return;
  }
}
