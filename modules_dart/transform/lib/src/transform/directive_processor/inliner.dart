library angular2.transform.directive_processor.inliner;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:source_span/source_span.dart';
import 'package:path/path.dart' as path;

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/naive_eval.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';

/// Reads the code at `assetId`, inlining any `part` directives in that code.
///
/// Returns `null` if the code represented by `assetId` is a `part`.
///
/// Order of `part`s is preserved. That is, if in the main library we have
/// ```
/// library main;
///
/// part 'lib1.dart'
/// part 'lib2.dart'
/// ```
/// The output will first have the contents of lib1 followed by the contents of
/// lib2.dart, followed by the original code in the library.
Future<String> inlineParts(AssetReader reader, AssetId assetId) async {
  var code = await reader.readAsString(assetId);

  var directivesVisitor = new _NgDepsDirectivesVisitor();
  parseDirectives(code, name: assetId.path)
      .directives
      .accept(directivesVisitor);

  // If this is part of another library, its contents will be processed by its
  // parent, so it does not need its own `.ng_deps.dart` file.
  if (directivesVisitor.isPart) return null;

  return logElapsedAsync(() {
    return _getAllDeclarations(reader, assetId, code, directivesVisitor);
  }, operationName: 'inlineParts', assetId: assetId);
}

const _resolver = const TransformerUrlResolver();

/// Processes `visitor.parts`, reading and appending their contents to the
/// original `code`.
Future<String> _getAllDeclarations(AssetReader reader, AssetId assetId,
    String code, _NgDepsDirectivesVisitor visitor) {
  if (visitor.parts.isEmpty) return new Future<String>.value(code);

  final assetUri = toAssetUri(assetId);
  final tracker = new _UriTrackerImpl(assetId);

  var partsStart = visitor.parts.first.offset,
      partsEnd = visitor.parts.last.end;

  var asyncWriter = new AsyncStringWriter(code.substring(0, partsStart));
  visitor.parts.forEach((partDirective) {
    var uri = stringLiteralToString(partDirective.uri);
    var partAssetId = fromUri(_resolver.resolve(assetUri, uri));
    asyncWriter.println(tracker.getInlinerCurrentUriAssignment(partAssetId));
    asyncWriter.asyncPrint(reader.readAsString(partAssetId).then((partCode) {
      if (partCode == null || partCode.isEmpty) {
        log.warning('Empty part at "${partDirective.uri}. Ignoring.',
            asset: partAssetId);
        return '';
      }
      // Remove any directives -- we just want declarations.
      var parsedDirectives = parseDirectives(partCode, name: uri).directives;
      return partCode.substring(parsedDirectives.last.end);
    }).catchError((err, stackTrace) {
      log.warning(
          'Failed while reading part at ${partDirective.uri}. Ignoring.\n'
          'Error: $err\n'
          'Stack Trace: $stackTrace',
          asset: partAssetId,
          span: new SourceFile(code, url: path.basename(assetId.path))
              .span(partDirective.offset, partDirective.end));
    }));
  });
  asyncWriter.println(tracker.getInlinerCurrentUriAssignment(assetId));
  asyncWriter.print(code.substring(partsEnd));

  return asyncWriter.asyncToString();
}

const _uriVarTemplate = '_\$\$inlinerCurrentUri';

/// Stores the [AssetId] of the [CompilationUnit] containing following code.
///
/// This allows us to accurately resolve relative uris from parts, which may not
/// exist as siblings to the files they are parts of.
///
/// For example:
/// ```dart
/// library main;
///
/// import 'a.dart';
///
/// const __inlinerCurrentUri0 = 'asset:angular2/lib/maindir/subdir/foo.dart';
///
/// @Component(..., templateUrl: 'template.html')
/// class MyComponent {}
///
/// const __inlinerCurrentUri1 = 'asset:angular2/lib/maindir/main.dart';
///
/// // Contents of main.dart
abstract class UriTracker {
  factory UriTracker(AssetId initialAssetId) =>
      new _UriTrackerImpl(initialAssetId);

  AssetId get current;

  /// Updates `current` if necessary.
  ///
  /// Checks if `node` is one of our specially formatted
  /// [TopLevelVariableDeclaration] statements and, if so, updates the value
  /// of `current` with its value.
  void update(TopLevelVariableDeclaration node);
}

class _UriTrackerImpl implements UriTracker {
  final AssetId initialAssetId;
  AssetId _current;
  // Used to ensure unique names in variable declarations.
  int _counter = 0;

  _UriTrackerImpl(this.initialAssetId);

  AssetId get current => _current != null ? _current : initialAssetId;

  String getInlinerCurrentUriAssignment(AssetId id) =>
      '''const $_uriVarTemplate${_counter++} = '${toAssetUri(id)}';''';

  void update(TopLevelVariableDeclaration node) {
    if (node == null ||
        node.variables == null ||
        !node.variables.isConst ||
        node.variables.variables.length != 1) {
      return;
    }
    final variable = node.variables.variables.single;
    if (variable.name.name.startsWith(_uriVarTemplate)) {
      final val = naiveEval(variable.initializer);
      if (val is String) {
        _current = fromUri(val);
      }
    }
  }
}

/// Visitor responsible for reading the `part` files of the visited AST and
/// determining if it is a part of another library.
class _NgDepsDirectivesVisitor extends Object with SimpleAstVisitor<Object> {
  /// Whether the file we are processing is a part, that is, whether we have
  /// visited a `part of` directive.
  bool _isPart = false;

  final List<PartDirective> _parts = <PartDirective>[];
  bool get isPart => _isPart;

  /// In the order encountered in the source.
  Iterable<PartDirective> get parts => _parts;

  @override
  Object visitPartDirective(PartDirective node) {
    _parts.add(node);
    return null;
  }

  @override
  Object visitPartOfDirective(PartOfDirective node) {
    _isPart = true;
    return null;
  }
}
