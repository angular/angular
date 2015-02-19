import {CONSTRUCTOR, FROM} from 'traceur/src/syntax/PredefinedName';
import {
  AT,
  CLASS,
  CLOSE_CURLY,
  CLOSE_PAREN,
  CLOSE_SQUARE,
  COLON,
  COMMA,
  EQUAL,
  EQUAL_EQUAL_EQUAL,
  EXTENDS,
  IMPLEMENTS,
  IMPORT,
  OPEN_CURLY,
  OPEN_PAREN,
  OBJECT_PATTERN,
  OPEN_SQUARE,
  PERIOD,
  SEMI_COLON,
  STAR,
  STATIC,
  VAR,
  OPEN_ANGLE,
  CLOSE_ANGLE
} from 'traceur/src/syntax/TokenType';

import {
  GET
} from 'traceur/src/syntax/PredefinedName';

import {ParseTreeWriter as JavaScriptParseTreeWriter, ObjectLiteralExpression} from 'traceur/src/outputgeneration/ParseTreeWriter';
import {ImportedBinding, BindingIdentifier} from 'traceur/src/syntax/trees/ParseTrees';
import {IdentifierToken} from 'traceur/src/syntax/IdentifierToken';
import {EXPORT_STAR, NAMED_EXPORT} from 'traceur/src/syntax/trees/ParseTreeType';
import {typeMapping} from '../type_mapping';

export class DartParseTreeWriter extends JavaScriptParseTreeWriter {
  constructor(moduleName, outputPath) {
    super(outputPath);
    this.libName = moduleName.replace(/\//g, '.').replace(/[^\w.\/]/g, '_');
    this.annotationContextCounter = 0;
  }

  visitEmptyStatement() {}

  // CLASS FIELDS
  visitPropertyVariableDeclaration(tree) {
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }

    if (tree.typeAnnotation === null) {
      this.write_(tree.isFinal ? 'final' : VAR);
    } else {
      if (tree.isFinal) {
        this.write_('final');
      }
      this.writeTypeAndSpace_(tree.typeAnnotation);
    }
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
    this.writeTypeAndSpace_(tree.typeAnnotation);
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
      throw new Error('tagged template strings are not supported');
    }
    this.writeRaw_("'''");
    this.visitList(tree.elements);
    this.writeRaw_("'''");
  }

  visitTemplateLiteralPortion(tree) {
    this.writeRaw_(tree.value.toString()
      .replace(/('|")/g, "\\$&")
      .replace(/([^\\])\$/g, "$1\\\$")
      .replace(/^\$/, '\\\$'));
  }

  visitLiteralExpression(tree) {
    this.write_(('' + tree.literalToken).replace(/([^\\])\$/g, "$1\\\$"));
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
      this.writeTypeAndSpace_(tree.typeAnnotation);
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

    this.writeTypeAndSpace_(tree.typeAnnotation);
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

    this.writeTypeAndSpace_(tree.typeAnnotation);
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
    return typeMapping[typeName] || typeName;
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

    this.writeTypeAndSpace_(typeAnnotation);
    this.visitAny(tree.binding);

    if (tree.initializer) {
      this.writeSpace_();
      this.write_(initSeparator);
      this.writeSpace_();
      this.visitAny(tree.initializer);
    }
  }

  writeTypeAndSpace_(typeAnnotation) {
    this.writeType_(typeAnnotation);
    this.writeSpace_();
  }


  writeType_(typeAnnotation) {
    if (!typeAnnotation) {
      return;
    }
    var typeNameNode;
    var args = [];
    if (typeAnnotation.typeName) {
      typeNameNode = typeAnnotation.typeName;
      args = typeAnnotation.args.args;
    } else {
      typeNameNode = typeAnnotation;
      args = [];
    }

    if (typeNameNode.moduleName && typeNameNode.moduleName.name && typeNameNode.moduleName.name.value) {
      this.write_(typeNameNode.moduleName.name.value);
      this.write_(PERIOD);
    }

    // TODO(vojta): Figure out why `typeNameNode` has different structure when used with a variable.
    // This should probably be fixed in Traceur.
    var typeName = typeNameNode.typeToken && typeNameNode.typeToken.value || (typeNameNode.name && typeNameNode.name.value) || null;
    if (!typeName) {
      return;
    }

    this.write_(this.normalizeType_(typeName));
    if (args.length) {
      this.write_(OPEN_ANGLE);
      this.writeType_(args[0]);
      for (var i=1; i<args.length; i++) {
        this.write_(COMMA);
        this.writeSpace_();
        this.writeType_(args[i]);
      }
      this.write_(CLOSE_ANGLE);
    }
  }

  // EXPORTS
  visitExportDeclaration(tree) {
    if (tree.declaration.type === NAMED_EXPORT) {
      // export {...}
      // export {...} from './foo'
      // export * from './foo'

      if (tree.declaration.moduleSpecifier) {
        if (tree.declaration.specifierSet.type === EXPORT_STAR) {
          // export * from './foo'
          // ===>
          // export './foo';
          this.write_('export');
          this.writeSpace_();
          this.visitModuleSpecifier(tree.declaration.moduleSpecifier);
          this.write_(SEMI_COLON);
        } else {
          // export {Foo, Bar} from './foo'
          // ===>
          // export './foo' show Foo, Bar;
          this.write_('export');
          this.writeSpace_();
          this.visitModuleSpecifier(tree.declaration.moduleSpecifier);
          this.writeSpace_();
          this.write_('show');
          this.writeSpace_();
          this.writeList_(tree.declaration.specifierSet.specifiers, COMMA, false);
          this.write_(SEMI_COLON);
        }
      } else {
        // export {...}
        // This case is handled in `ExportTransformer`.
        throw new Error('Should never happen!');
      }
    } else {
      // export var x = true
      // export class Foo {}
      // export function bar() {}
      // Just remove "export" keyword.
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
      this.annotationContextCounter++;
      this.write_(OPEN_PAREN);
      this.writeList_(tree.args.args, COMMA, false);
      this.write_(CLOSE_PAREN);
      this.annotationContextCounter--;
    }

    this.writeSpace_()
  }

  visitGetAccessor(tree) {
    this.writeAnnotations_(tree.annotations);
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }
    this.writeTypeAndSpace_(tree.typeAnnotation);
    this.writeSpace_();
    this.write_(GET);
    this.writeSpace_();
    this.visitAny(tree.name);
    this.writeSpace_();
    this.visitAny(tree.body);
  }

  visitObjectLiteralExpression(tree) {
    if (this.annotationContextCounter) {
      this.write_('const');
    }
    super.visitObjectLiteralExpression(tree);
  }

  visitArrayLiteralExpression(tree) {
    if (this.annotationContextCounter) {
      this.write_('const');
    }
    super.visitArrayLiteralExpression(tree);
  }

  visitNewExpression(tree) {
    if (this.annotationContextCounter) {
      this.write_('const');
      this.writeSpace_();
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    } else {
      super.visitNewExpression(tree);
    }
  }

  visitNamedParameterList(tree) {
    this.writeList_(tree.parameterNameAndValues, COMMA, false);
  }

  visitClassDeclaration(tree) {
    this.writeAnnotations_(tree.annotations);
    this.write_(CLASS);
    this.writeSpace_();
    this.visitAny(tree.name);

    if (tree.superClass) {
      this.writeSpace_();
      this.write_(EXTENDS);
      this.writeSpace_();
      this.visitAny(tree.superClass);
    }

    if (tree.implements) {
      this.writeSpace_();
      this.write_(IMPLEMENTS);
      this.writeSpace_();
      this.writeList_(tree.implements.interfaces, COMMA, false);
    }

    this.writeSpace_();
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.elements);
    this.write_(CLOSE_CURLY);
  }

  toString() {
    return "library " + this.libName + "_dart;\n" + super.toString();
  }
}

