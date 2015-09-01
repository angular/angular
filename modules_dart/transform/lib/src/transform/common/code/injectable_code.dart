library angular2.transform.common.code.injectable_code;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/injectable_model.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart' show AssetId;

import 'annotation_code.dart';
import 'parameter_code.dart';

/// Visitor responsible for parsing [ClassDeclaration]s into [InjectableModel]s.
class InjectableVisitor extends Object
    with RecursiveAstVisitor<InjectableModel> {
  /// The file we are processing.
  final AssetId assetId;

  final AnnotationVisitor _annotationVisitor;
  final ParameterVisitor _parameterVisitor = new ParameterVisitor();

  /// Whether an Angular 2 `Injectable` has been found.
  bool _foundNgInjectable = false;

  /// Responsible for testing whether [Annotation]s are those recognized by
  /// Angular 2, for example `@Component`.
  final AnnotationMatcher _annotationMatcher;

  InjectableVisitor(AssetId assetId, AnnotationMatcher annotationMatcher)
      : this.assetId = assetId,
        _annotationMatcher = annotationMatcher,
        _annotationVisitor = new AnnotationVisitor(assetId, annotationMatcher);

  bool get shouldCreateNgDeps => _foundNgInjectable;

  ConstructorDeclaration _getCtor(ClassDeclaration node) {
    int numCtorsFound = 0;
    var ctor = null;

    for (ClassMember classMember in node.members) {
      if (classMember is ConstructorDeclaration) {
        numCtorsFound++;
        ConstructorDeclaration constructor = classMember;

        // Use the unnnamed constructor if it is present.
        // Otherwise, use the first encountered.
        if (ctor == null) {
          ctor = constructor;
        } else if (constructor.name == null) {
          ctor = constructor;
        }
      }
    }
    if (numCtorsFound > 1) {
      var ctorName = ctor.name;
      ctorName = ctorName == null
          ? 'the unnamed constructor'
          : 'constructor "${ctorName}"';
      logger.warning('Found ${numCtorsFound} ctors for class ${node.name},'
          'Using ${ctorName}.');
    }
    return ctor;
  }

  @override
  InjectableModel visitClassDeclaration(ClassDeclaration node) {
    if (!node.metadata
        .any((a) => _annotationMatcher.hasMatch(a.name, assetId))) {
      return null;
    }

    var ctor = _getCtor(node);
    var ctorName = ctor != null && ctor.name != null ? '${ctor.name}' : null;
    var model = new InjectableModel('${node.name}', ctorName: ctorName);

    if (node.metadata != null) {
      node.metadata.forEach((node) {
        model.annotations.add(_annotationVisitor.visitAnnotation(node));
      });
    }
    if (ctor != null &&
        ctor.parameters != null &&
        ctor.parameters.parameters != null) {
      ctor.parameters.parameters.forEach((node) {
        model.parameters.add(node.accept(_parameterVisitor));
      });
    }
    if (node.implementsClause != null &&
        node.implementsClause.interfaces != null &&
        node.implementsClause.interfaces.isNotEmpty) {
      model.interfaces.addAll(node.implementsClause.interfaces
          .map((interface) => '${interface.name}'));
    }
    return model;
  }

  @override
  InjectableModel visitFunctionDeclaration(FunctionDeclaration node) {
    if (!node.metadata
        .any((a) => _annotationMatcher.hasMatch(a.name, assetId))) {
      return null;
    }

    var model = new InjectableModel('${node.name}', isFunction: true);
    if (node.metadata != null) {
      node.metadata.forEach((node) {
        model.annotations.add(_annotationVisitor.visitAnnotation(node));
      });
    }
    if (node.functionExpression.parameters != null &&
        node.functionExpression.parameters.parameters != null) {
      node.functionExpression.parameters.parameters.forEach((node) {
        model.parameters.add(node.accept(_parameterVisitor));
      });
    }
    return model;
  }
}

class InjectableWriterMixin {
  StringBuffer buffer;
  AnnotationWriterMixin annotationWriter;
  ParameterWriterMixin parameterWriter;

  void _writeListWithSeparator(List l, Function writeFn,
      {String prefix, String suffix, String separator: ', '}) {
    buffer.write(prefix);
    for (var i = 0, iLen = l.length; i < iLen; ++i) {
      if (i != 0) {
        buffer.write(', ');
      }
      writeFn(l[i]);
    }
    buffer.write(suffix);
  }

  void writeInjectableModelRegistration(InjectableModel model) {
    buffer.write('..register');
    if (model.isFunction) {
      buffer.write('Function');
    } else {
      buffer.write('Type');
    }
    buffer.writeln('(${model.typeName}, new $REFLECTOR_PREFIX.ReflectionInfo(');

    // Annotations
    _writeListWithSeparator(
        model.annotations, annotationWriter.writeAnnotationModel,
        prefix: 'const [', suffix: ']');
    // Parameters
    _writeListWithSeparator(
        model.parameters, parameterWriter.writeParameterModelForList,
        prefix: ',\nconst [', suffix: ']');
    if (!model.isFunction) {
      // Factory
      _writeListWithSeparator(
          model.parameters, parameterWriter.writeParameterModelForDeclaration,
          prefix: ',\n(', suffix: ')');
      buffer.write(' => new ${model.typeName}');
      if (model.ctorName != null && model.ctorName.isNotEmpty) {
        buffer.write('.${model.ctorName}');
      }
      _writeListWithSeparator(
          model.parameters, parameterWriter.writeParameterModelForImpl,
          prefix: '(', suffix: ')');
      // Interfaces
      if (model.interfaces != null && model.interfaces.isNotEmpty) {
        _writeListWithSeparator(model.interfaces, buffer.write,
            prefix: ',\nconst [', suffix: ']');
      }
    }
    buffer.writeln(')\n)');
  }
}
