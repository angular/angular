library angular2.transform.common.code.parameter_code;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/parameter_model.dart';

import 'constify.dart';

/// Visitor responsible for parsing [FormalParameter]s into
/// [ParameterModel]s.
class ParameterVisitor extends Object with SimpleAstVisitor<ParameterModel> {
  /// Maps field names to their declared types. See `_populateFieldMap`
  final Map<String, TypeName> _fieldNameToType = {};
  final Set<AstNode> _seen = new Set();

  void _populateFieldMap(AstNode node) {
    ClassDeclaration clazz =
        node.getAncestor((node) => node is ClassDeclaration);
    if (_seen.contains(clazz)) return;
    _seen.add(clazz);

    clazz.members
        .where((member) => member is FieldDeclaration)
        .forEach((FieldDeclaration field) {
      var type = field.fields.type;
      if (type != null) {
        field.fields.variables.forEach((VariableDeclaration decl) {
          var key = '${decl.name}';
          if (_fieldNameToType.containsKey(key)) {
            // Need to clear our `seen` list as the type for a var name has
            // changed and could be incorrect.
            _seen.clear();
          }
          _fieldNameToType[key] = type;
        });
      }
    });
  }

  ParameterModel _visitNormalFormalParameter(
      NodeList<Annotation> metadata, TypeName type, SimpleIdentifier name) {
    var sMetadata = metadata.map(constify).toList(growable: false);

    var sTypeName = null, sTypeArgs = null;
    if (type != null) {
      sTypeName = '${type.name}';
      if (type.typeArguments != null) {
        sTypeArgs = '${type.typeArguments}';
      }
    }
    return new ParameterModel(
        typeName: sTypeName,
        typeArgs: sTypeArgs,
        metadata: sMetadata,
        paramName: '${name}');
  }

  @override
  ParameterModel visitSimpleFormalParameter(SimpleFormalParameter node) {
    return _visitNormalFormalParameter(
        node.metadata, node.type, node.identifier);
  }

  @override
  ParameterModel visitFieldFormalParameter(FieldFormalParameter node) {
    if (node.parameters != null) {
      logger.error('Parameters in ctor not supported '
          '(${node.toSource()})');
    }
    var type = node.type;
    if (type == null) {
      _populateFieldMap(node);
      type = _fieldNameToType[node.identifier.toString()];
    }
    return _visitNormalFormalParameter(node.metadata, type, node.identifier);
  }

  @override
  ParameterModel visitFunctionTypedFormalParameter(
      FunctionTypedFormalParameter node) {
    logger.error('Function typed formal parameters not supported '
        '(${node.toSource()})');
    return _visitNormalFormalParameter(node.metadata, null, node.identifier);
  }

  @override
  ParameterModel visitDefaultFormalParameter(DefaultFormalParameter node) {
    // Ignore the declared default value.
    return node.parameter != null ? node.parameter.accept(this) : null;
  }
}

class ParameterWriterMixin {
  StringBuffer buffer;

  void writeParameterModelForList(ParameterModel model) {
    buffer.write('const [');
    if (model.typeName != null) {
      buffer.write('${model.typeName},');
    }
    for (var meta in model.metadata) {
      buffer.write('$meta,');
    }
    buffer.write(']');
  }

  void writeParameterModelForDeclaration(ParameterModel model) {
    if (model.typeName != null) {
      buffer.write(model.typeName);
      if (model.typeArgs != null) {
        buffer.write(model.typeArgs);
      }
      buffer.write(' ');
    }
    if (model.paramName != null) {
      buffer.write(model.paramName);
    }
  }

  void writeParameterModelForImpl(ParameterModel model) {
    buffer.write(model.paramName);
  }
}
