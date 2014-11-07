import {CONSTRUCTOR, FROM} from 'traceur/src/syntax/PredefinedName';
import {
  AT,
  CLOSE_CURLY,
  CLOSE_PAREN,
  CLOSE_SQUARE,
  COLON,
  COMMA,
  EQUAL,
  EQUAL_EQUAL_EQUAL,
  IMPORT,
  OPEN_CURLY,
  OPEN_PAREN,
  OBJECT_PATTERN,
  OPEN_SQUARE,
  SEMI_COLON,
  STAR,
  STATIC
} from 'traceur/src/syntax/TokenType';

import {
  GET
} from 'traceur/src/syntax/PredefinedName';

import {ParseTreeWriter as JavaScriptParseTreeWriter, ObjectLiteralExpression} from 'traceur/src/outputgeneration/ParseTreeWriter';
import {ImportedBinding, BindingIdentifier} from 'traceur/src/syntax/trees/ParseTrees';
import {IdentifierToken} from 'traceur/src/syntax/IdentifierToken';

export class DartParseTreeWriter extends JavaScriptParseTreeWriter {
  constructor(moduleName, outputPath) {
    super(outputPath);
    this.libName = moduleName.replace(/\//g, '.').replace(/[^\w.\/]/g, '_');
  }

  // CLASS FIELDS
  visitPropertyVariableDeclaration(tree) {
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }

    this.writeType_(tree.typeAnnotation);
    this.writeSpace_();
    this.visitAny(tree.name);
    this.write_(SEMI_COLON);
  }

  // VARIABLES - types
  // ```
  // var foo:bool = true;
  // ==>
  // bool foo = true;
  // ```
  visitVariableDeclarationList(tree) {
    // Write `var`, only if no type declaration.
    if (!tree.declarations[0].typeAnnotation) {
      this.write_(tree.declarationType);
      this.writeSpace_();
    }

    this.writeList_(tree.declarations, COMMA, true, 2);
  }

  visitVariableDeclaration(tree) {
    this.writeType_(tree.typeAnnotation);
    this.visitAny(tree.lvalue);

    if (tree.initializer !== null) {
      this.writeSpace_();
      this.write_(EQUAL);
      this.writeSpace_();
      this.visitAny(tree.initializer);
    }
  }

  visitTemplateLiteralExpression(tree) {
    if (tree.operand) {
      this.visitAny(tree.operand);
      this.writeSpace_();
    }
    this.writeRaw_('"');
    this.visitList(tree.elements);
    this.writeRaw_('"');
  }

  visitTemplateLiteralPortion(tree) {
    this.writeRaw_(tree.value.toString().replace(/('|")/g, "\\$&"));
  }


  // FUNCTIONS
  // - remove the "function" keyword
  // - type annotation infront
  visitFunction_(tree) {
    this.writeAnnotations_(tree.annotations);
    if (tree.isAsyncFunction()) {
      this.write_(tree.functionKind);
    }

    if (tree.isGenerator()) {
      this.write_(tree.functionKind);
    }

    if (tree.name) {
      this.writeType_(tree.typeAnnotation);
      this.visitAny(tree.name);
    }

    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.visitAny(tree.body);
  };

  // Class methods.
  // - type annotation infront
  visitPropertyMethodAssignment(tree) {
    this.writeAnnotations_(tree.annotations);

    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }

    if (tree.isGenerator()) {
      this.write_(STAR);
    }

    if (tree.isAsyncFunction()) {
      this.write_(ASYNC);
    }

    this.writeType_(tree.typeAnnotation);
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.visitAny(tree.body);
  }

  visitFormalParameterList(tree) {
    var hasPosOptionalParams = false;
    var first = true;
    for (var i = 0; i < tree.parameters.length; i++) {
      var parameter = tree.parameters[i];
      if (first) {
        first = false;
      } else {
        this.write_(COMMA);
        this.writeSpace_();
      }

      if (!hasPosOptionalParams && this._isOptionalPositionParam(parameter.parameter)) {
        hasPosOptionalParams = true;
        this.write_(OPEN_SQUARE);
      }
      this.visitAny(parameter);
    }

    if (hasPosOptionalParams) {
      this.write_(CLOSE_SQUARE);
    }
  }

  _isOptionalPositionParam(parameter) {
    return parameter.initializer && parameter.binding.type !== OBJECT_PATTERN;
  }

  /**
   * @param {PropertyMethodAssignment} tree
   */
  visitPropertyConstructorAssignment(tree) {
    this.writeAnnotations_(tree.annotations);

    if (tree.isConst) {
      this.write_('const');
      this.writeSpace_();
    }

    this.writeType_(tree.typeAnnotation);
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    if (tree.initializerList.length > 0) {
      this.write_(COLON);
      this.writeSpace_();
      this.writeList_(tree.initializerList, ', ');
    }
    if (tree.isConst) {
      this.write_(SEMI_COLON);
    } else {
      this.writeSpace_();
      this.visitAny(tree.body);
    }
  }

  normalizeType_(typeName) {
    switch (typeName) {
      case 'number': return 'num';
      case 'boolean': return 'bool';
      case 'string': return 'String';
      case 'Promise': return 'Future';
      default: return typeName;
    }
  }

  // FUNCTION/METHOD ARGUMENTS
  // - type infront of the arg name
  visitBindingElement(tree) {
    this._visitBindingElement(tree, EQUAL);
  }

  visitObjectPatternBindingElement(tree) {
    this._visitBindingElement(tree, COLON);
  }

  _visitBindingElement(tree, initSeparator) {
    // TODO(vojta): This is awful, just copy/pasted from Traceur,
    // we should still clean it up.
    var typeAnnotation = this.currentParameterTypeAnnotation_;
    // resetting type annotation so it doesn't filter down recursively
    this.currentParameterTypeAnnotation_ = null;

    this.writeType_(typeAnnotation);
    this.visitAny(tree.binding);

    if (tree.initializer) {
      this.writeSpace_();
      this.write_(initSeparator);
      this.writeSpace_();
      this.visitAny(tree.initializer);
    }
  }

  visitClassFieldDeclaration(tree) {
    if (tree.isFinal) {
      // `final <type> name;` or `final name;` for untyped variable
      this.write_('final');
      this.writeSpace_();
      this.writeType_(tree.typeAnnotation);
    } else {
      // `<type> name;` or `var name;`
      if (tree.typeAnnotation) {
        this.writeType_(tree.typeAnnotation);
      } else {
        this.write_('var');
        this.writeSpace_();
      }
    }

    this.write_(tree.lvalue.getStringValue());
    this.write_(SEMI_COLON);
  }

  writeType_(typeAnnotation) {
    if (!typeAnnotation) {
      return;
    }

    // TODO(vojta): Figure out why `typeAnnotation` has different structure when used with a variable.
    // This should probably be fixed in Traceur.
    var typeName = typeAnnotation.typeToken && typeAnnotation.typeToken.value || (typeAnnotation.name && typeAnnotation.name.value) || null;

    if (!typeName) {
      return;
    }

    this.write_(this.normalizeType_(typeName));
    this.writeSpace_();
  }

  // EXPORTS
  visitExportDeclaration(tree) {
    if (tree.declaration.moduleSpecifier) {
      this.write_('export');
      this.writeSpace_();
      this.visitModuleSpecifier(tree.declaration.moduleSpecifier);
      this.write_(SEMI_COLON);
    } else {
      // remove "export"
      this.writeAnnotations_(tree.annotations);
      this.visitAny(tree.declaration);
    }
  }

  // visitExportDefault
  // visitNamedExport
  // visitExportSpecifier
  // visitExportSpecifierSet
  // visitExportStar


  // IMPORTS
  visitImportDeclaration(tree) {
    this.write_(IMPORT);
    this.writeSpace_();
    this.visitAny(tree.moduleSpecifier);

    if (tree.importClause.binding) {
      // Default import, not supported as dart does not distinguish
      // between explicit exports and default exports
      throw new Error('default imports/exports not supported');
    } else {
      // Regular - import list of members.
      // import {Foo, Bar} from './baz';
      this.visitAny(tree.importClause);
    }

    this.write_(SEMI_COLON);
  }

  // Translate './foo' -> './foo.dart'
  transformModuleUrl(url) {
    var prefix = url.charAt(1) === '.' ? '' : 'package:';
    return "'" + prefix + url.substring(1, url.length - 1) + ".dart'";
  }

  visitModuleSpecifier(tree) {
    this.write_(this.transformModuleUrl(tree.token.value));
  }

  visitImportSpecifier(tree) {
    if (tree.name) {
      throw new Error('"as" syntax not supported');
    }
    this.visitAny(tree.binding);
  }

  visitImportedBinding(tree) {
    if (tree.binding && tree.binding.identifierToken) {
      var b = tree.binding;
      var t = b.identifierToken;
      var token = new IdentifierToken(t.location, this.normalizeType_(t.value));
      var binding = new BindingIdentifier(b.location, token);
      super.visitImportedBinding(new ImportedBinding(tree.location, binding));
    } else {
      super.visitImportedBinding(tree);
    }
  }

  visitImportSpecifierSet(tree) {
    if (tree.specifiers.type == STAR) {
      throw new Error('"*" syntax not supported');
    } else {
      this.write_(' show ');
      this.writeList_(tree.specifiers, COMMA, false);
    }
  }

  visitModuleDeclaration(tree) {
    // module import - import the entire module.
    // import * as foo from './bar';
    this.write_(IMPORT);
    this.writeSpace_();
    this.visitAny(tree.expression);
    this.write_(' as ');
    this.visitAny(tree.binding);
    this.write_(SEMI_COLON);
  }

  // ANNOTATIONS
  // TODO(vojta): this is just fixing a bug in Traceur, send a PR.
  visitAnnotation(tree) {
    // TODO(tbosch): Disabled the removal of control annotations (annotations in uppercase),
    // as they should be handeled by a transformer and right now lead
    // to errors (unused import) in dartanalyzer.
    // if (tree.name.identifierToken) {
    //   var nameValue = tree.name.identifierToken.value;
    //   if (nameValue === nameValue.toUpperCase()) {
    //     // control annotations for transpiler
    //     return;
    //   }
    // }
    this.write_(AT);
    this.visitAny(tree.name);

    if (tree.args !== null) {
      this.write_(OPEN_PAREN);
      this.writeList_(tree.args.args, COMMA, false);
      this.write_(CLOSE_PAREN);
    }

    this.writeSpace_()
  }

  visitGetAccessor(tree) {
    this.writeAnnotations_(tree.annotations);
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }
    this.writeType_(tree.typeAnnotation);
    this.writeSpace_();
    this.write_(GET);
    this.writeSpace_();
    this.visitAny(tree.name);
    this.writeSpace_();
    this.visitAny(tree.body);
  }

  visitNamedParameterList(tree) {
    this.writeList_(tree.parameterNameAndValues, COMMA, false);
  }

  toString() {
    return "library " + this.libName + ";\n" + super.toString();
  }
}

