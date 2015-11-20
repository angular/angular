library angular2.src.core.change_detection.parser.ast;

import "package:angular2/src/facade/collection.dart" show ListWrapper;

class AST {
  dynamic visit(AstVisitor visitor) {
    return null;
  }

  String toString() {
    return "AST";
  }
}

class EmptyExpr extends AST {
  visit(AstVisitor visitor) {}
}

class ImplicitReceiver extends AST {
  dynamic visit(AstVisitor visitor) {
    return visitor.visitImplicitReceiver(this);
  }
}

/**
 * Multiple expressions separated by a semicolon.
 */
class Chain extends AST {
  List<dynamic> expressions;
  Chain(this.expressions) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitChain(this);
  }
}

class Conditional extends AST {
  AST condition;
  AST trueExp;
  AST falseExp;
  Conditional(this.condition, this.trueExp, this.falseExp) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitConditional(this);
  }
}

class PropertyRead extends AST {
  AST receiver;
  String name;
  Function getter;
  PropertyRead(this.receiver, this.name, this.getter) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitPropertyRead(this);
  }
}

class PropertyWrite extends AST {
  AST receiver;
  String name;
  Function setter;
  AST value;
  PropertyWrite(this.receiver, this.name, this.setter, this.value) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitPropertyWrite(this);
  }
}

class SafePropertyRead extends AST {
  AST receiver;
  String name;
  Function getter;
  SafePropertyRead(this.receiver, this.name, this.getter) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitSafePropertyRead(this);
  }
}

class KeyedRead extends AST {
  AST obj;
  AST key;
  KeyedRead(this.obj, this.key) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitKeyedRead(this);
  }
}

class KeyedWrite extends AST {
  AST obj;
  AST key;
  AST value;
  KeyedWrite(this.obj, this.key, this.value) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitKeyedWrite(this);
  }
}

class BindingPipe extends AST {
  AST exp;
  String name;
  List<dynamic> args;
  BindingPipe(this.exp, this.name, this.args) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitPipe(this);
  }
}

class LiteralPrimitive extends AST {
  var value;
  LiteralPrimitive(this.value) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitLiteralPrimitive(this);
  }
}

class LiteralArray extends AST {
  List<dynamic> expressions;
  LiteralArray(this.expressions) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitLiteralArray(this);
  }
}

class LiteralMap extends AST {
  List<dynamic> keys;
  List<dynamic> values;
  LiteralMap(this.keys, this.values) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitLiteralMap(this);
  }
}

class Interpolation extends AST {
  List<dynamic> strings;
  List<dynamic> expressions;
  Interpolation(this.strings, this.expressions) : super() {
    /* super call moved to initializer */;
  }
  visit(AstVisitor visitor) {
    visitor.visitInterpolation(this);
  }
}

class Binary extends AST {
  String operation;
  AST left;
  AST right;
  Binary(this.operation, this.left, this.right) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitBinary(this);
  }
}

class PrefixNot extends AST {
  AST expression;
  PrefixNot(this.expression) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitPrefixNot(this);
  }
}

class MethodCall extends AST {
  AST receiver;
  String name;
  Function fn;
  List<dynamic> args;
  MethodCall(this.receiver, this.name, this.fn, this.args) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitMethodCall(this);
  }
}

class SafeMethodCall extends AST {
  AST receiver;
  String name;
  Function fn;
  List<dynamic> args;
  SafeMethodCall(this.receiver, this.name, this.fn, this.args) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitSafeMethodCall(this);
  }
}

class FunctionCall extends AST {
  AST target;
  List<dynamic> args;
  FunctionCall(this.target, this.args) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return visitor.visitFunctionCall(this);
  }
}

class ASTWithSource extends AST {
  AST ast;
  String source;
  String location;
  ASTWithSource(this.ast, this.source, this.location) : super() {
    /* super call moved to initializer */;
  }
  dynamic visit(AstVisitor visitor) {
    return this.ast.visit(visitor);
  }

  String toString() {
    return '''${ this . source} in ${ this . location}''';
  }
}

class TemplateBinding {
  String key;
  bool keyIsVar;
  String name;
  ASTWithSource expression;
  TemplateBinding(this.key, this.keyIsVar, this.name, this.expression) {}
}

abstract class AstVisitor {
  dynamic visitBinary(Binary ast);
  dynamic visitChain(Chain ast);
  dynamic visitConditional(Conditional ast);
  dynamic visitFunctionCall(FunctionCall ast);
  dynamic visitImplicitReceiver(ImplicitReceiver ast);
  dynamic visitInterpolation(Interpolation ast);
  dynamic visitKeyedRead(KeyedRead ast);
  dynamic visitKeyedWrite(KeyedWrite ast);
  dynamic visitLiteralArray(LiteralArray ast);
  dynamic visitLiteralMap(LiteralMap ast);
  dynamic visitLiteralPrimitive(LiteralPrimitive ast);
  dynamic visitMethodCall(MethodCall ast);
  dynamic visitPipe(BindingPipe ast);
  dynamic visitPrefixNot(PrefixNot ast);
  dynamic visitPropertyRead(PropertyRead ast);
  dynamic visitPropertyWrite(PropertyWrite ast);
  dynamic visitSafeMethodCall(SafeMethodCall ast);
  dynamic visitSafePropertyRead(SafePropertyRead ast);
}

class RecursiveAstVisitor implements AstVisitor {
  dynamic visitBinary(Binary ast) {
    ast.left.visit(this);
    ast.right.visit(this);
    return null;
  }

  dynamic visitChain(Chain ast) {
    return this.visitAll(ast.expressions);
  }

  dynamic visitConditional(Conditional ast) {
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
    return null;
  }

  dynamic visitPipe(BindingPipe ast) {
    ast.exp.visit(this);
    this.visitAll(ast.args);
    return null;
  }

  dynamic visitFunctionCall(FunctionCall ast) {
    ast.target.visit(this);
    this.visitAll(ast.args);
    return null;
  }

  dynamic visitImplicitReceiver(ImplicitReceiver ast) {
    return null;
  }

  dynamic visitInterpolation(Interpolation ast) {
    return this.visitAll(ast.expressions);
  }

  dynamic visitKeyedRead(KeyedRead ast) {
    ast.obj.visit(this);
    ast.key.visit(this);
    return null;
  }

  dynamic visitKeyedWrite(KeyedWrite ast) {
    ast.obj.visit(this);
    ast.key.visit(this);
    ast.value.visit(this);
    return null;
  }

  dynamic visitLiteralArray(LiteralArray ast) {
    return this.visitAll(ast.expressions);
  }

  dynamic visitLiteralMap(LiteralMap ast) {
    return this.visitAll(ast.values);
  }

  dynamic visitLiteralPrimitive(LiteralPrimitive ast) {
    return null;
  }

  dynamic visitMethodCall(MethodCall ast) {
    ast.receiver.visit(this);
    return this.visitAll(ast.args);
  }

  dynamic visitPrefixNot(PrefixNot ast) {
    ast.expression.visit(this);
    return null;
  }

  dynamic visitPropertyRead(PropertyRead ast) {
    ast.receiver.visit(this);
    return null;
  }

  dynamic visitPropertyWrite(PropertyWrite ast) {
    ast.receiver.visit(this);
    ast.value.visit(this);
    return null;
  }

  dynamic visitSafePropertyRead(SafePropertyRead ast) {
    ast.receiver.visit(this);
    return null;
  }

  dynamic visitSafeMethodCall(SafeMethodCall ast) {
    ast.receiver.visit(this);
    return this.visitAll(ast.args);
  }

  dynamic visitAll(List<AST> asts) {
    asts.forEach((ast) => ast.visit(this));
    return null;
  }
}

class AstTransformer implements AstVisitor {
  ImplicitReceiver visitImplicitReceiver(ImplicitReceiver ast) {
    return ast;
  }

  Interpolation visitInterpolation(Interpolation ast) {
    return new Interpolation(ast.strings, this.visitAll(ast.expressions));
  }

  LiteralPrimitive visitLiteralPrimitive(LiteralPrimitive ast) {
    return new LiteralPrimitive(ast.value);
  }

  PropertyRead visitPropertyRead(PropertyRead ast) {
    return new PropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
  }

  PropertyWrite visitPropertyWrite(PropertyWrite ast) {
    return new PropertyWrite(
        ast.receiver.visit(this), ast.name, ast.setter, ast.value);
  }

  SafePropertyRead visitSafePropertyRead(SafePropertyRead ast) {
    return new SafePropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
  }

  MethodCall visitMethodCall(MethodCall ast) {
    return new MethodCall(
        ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  SafeMethodCall visitSafeMethodCall(SafeMethodCall ast) {
    return new SafeMethodCall(
        ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  FunctionCall visitFunctionCall(FunctionCall ast) {
    return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
  }

  LiteralArray visitLiteralArray(LiteralArray ast) {
    return new LiteralArray(this.visitAll(ast.expressions));
  }

  LiteralMap visitLiteralMap(LiteralMap ast) {
    return new LiteralMap(ast.keys, this.visitAll(ast.values));
  }

  Binary visitBinary(Binary ast) {
    return new Binary(
        ast.operation, ast.left.visit(this), ast.right.visit(this));
  }

  PrefixNot visitPrefixNot(PrefixNot ast) {
    return new PrefixNot(ast.expression.visit(this));
  }

  Conditional visitConditional(Conditional ast) {
    return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this),
        ast.falseExp.visit(this));
  }

  BindingPipe visitPipe(BindingPipe ast) {
    return new BindingPipe(
        ast.exp.visit(this), ast.name, this.visitAll(ast.args));
  }

  KeyedRead visitKeyedRead(KeyedRead ast) {
    return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
  }

  KeyedWrite visitKeyedWrite(KeyedWrite ast) {
    return new KeyedWrite(
        ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
  }

  List<dynamic> visitAll(List<dynamic> asts) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  Chain visitChain(Chain ast) {
    return new Chain(this.visitAll(ast.expressions));
  }
}
