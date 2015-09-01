library angular2.transform.common.code.ng_deps_code;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.dart';
import 'package:angular2/src/transform/common/model/import_export_model.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:path/path.dart' as path;

import 'annotation_code.dart';
import 'import_export_code.dart';
import 'injectable_code.dart';
import 'parameter_code.dart';

/// Visitor responsible for parsing Dart files into [NgDepsModel] objects.
class NgDepsVisitor extends Object with RecursiveAstVisitor<Object> {
  final AssetId processedFile;
  final ImportVisitor _importVisitor = new ImportVisitor();
  final ExportVisitor _exportVisitor = new ExportVisitor();
  final InjectableVisitor _injectableVisitor;

  bool _isPart = false;
  NgDepsModel _model = null;

  NgDepsVisitor(AssetId processedFile, AnnotationMatcher annotationMatcher)
      : this.processedFile = processedFile,
        _injectableVisitor = new InjectableVisitor(processedFile, annotationMatcher);

  bool get isPart => _isPart;
  NgDepsModel get model {
    if (_model == null) {
      _createModel('');
    }
    return _model;
  }

  void _createModel(String libraryUri) {
    _model = new NgDepsModel(libraryUri: libraryUri);

    // We need to import & export the original file.
    var origDartFile = path.basename(processedFile.path);
    _model.imports.add(new ImportModel(origDartFile));
    _model.exports.add(new ExportModel(origDartFile));

    // Used to register reflective information.
    _model.imports.add(new ImportModel(REFLECTOR_IMPORT, prefix: REFLECTOR_PREFIX));
  }

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    var injectableModel = _injectableVisitor.visitClassDeclaration(node);
    if (injectableModel != null) {
      model.injectables.add(injectableModel);
    }
    return null;
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    model.exports.add(_exportVisitor.visitExportDirective(node));
    return null;
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    model.imports.add(_importVisitor.visitImportDirective(node));
    return null;
  }

  @override
  Object visitLibraryDirective(LibraryDirective node) {
    if (node != null) {
      assert(_model == null);
      _createModel('${node.name}');
    }
    return null;
  }

  @override
  Object visitPartDirective(PartDirective node) {
    model.partUris.add(stringLiteralToString(node.uri));
    return null;
  }

  @override
  Object visitPartOfDirective(PartOfDirective node) {
    _isPart = true;
    return null;
  }

  @override
  Object visitFunctionDeclaration(FunctionDeclaration node) {
    var injectableModel = _injectableVisitor.visitFunctionDeclaration(node);
    if (injectableModel != null) {
      model.injectables.add(injectableModel);
    }
    return null;
  }
}

class NgDepsWriter extends Object
    with
        AnnotationWriterMixin,
        ExportWriterMixin,
        ImportWriterMixin,
        InjectableWriterMixin,
        NgDepsWriterMixin,
        ParameterWriterMixin {
  final StringBuffer buffer;

  NgDepsWriter([StringBuffer buffer])
      : this.buffer = buffer != null ? buffer : new StringBuffer();

  AnnotationWriterMixin get annotationWriter => this;
  ExportWriterMixin get exportWriter => this;
  ImportWriterMixin get importWriter => this;
  InjectableWriterMixin get injectableWriter => this;
  ParameterWriterMixin get parameterWriter => this;
}

class NgDepsWriterMixin {
  StringBuffer buffer;
  AnnotationWriterMixin annotationWriter;
  ExportWriterMixin exportWriter;
  ImportWriterMixin importWriter;
  InjectableWriterMixin injectableWriter;
  ParameterWriterMixin parameterWriter;

  void writeNgDepsModel(NgDepsModel model) {
    if (model.libraryUri.isNotEmpty) {
      buffer.writeln('library ${model.libraryUri}${DEPS_EXTENSION};\n');
    }

    // We do not support `partUris`, so skip outputting them.
    model.imports.forEach((importModel) {
      // Ignore deferred imports here so as to not load the deferred libraries
      // code in the current library causing much of the code to not be
      // deferred. Instead `DeferredRewriter` will rewrite the code as to load
      // `ng_deps` in a deferred way.
      if (importModel.isDeferred) return;

      importWriter.writeImportModel(importModel);
    });
    model.exports.forEach(exportWriter.writeExportModel);

    buffer
      ..writeln('var _visited = false;')
      ..writeln('void ${SETUP_METHOD_NAME}() {')
      ..writeln('if (_visited) return; _visited = true;');

    if (model.injectables != null && model.injectables.isNotEmpty) {
      buffer.writeln('$REFLECTOR_PREFIX.$REFLECTOR_VAR_NAME');
      model.injectables
          .forEach(injectableWriter.writeInjectableModelRegistration);
      buffer.writeln(';');
    }

    buffer.writeln('}');
  }
}