import {
  AST,
  AstVisitor,
  PropertyRead,
  PropertyWrite,
  Binary,
  Chain,
  Conditional,
  EmptyExpr,
  BindingPipe,
  FunctionCall,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  MethodCall,
  PrefixNot,
  SafePropertyRead,
  SafeMethodCall
} from 'angular2/src/core/change_detection/parser/ast';


import {StringWrapper, isPresent, isString} from 'angular2/src/facade/lang';

export class Unparser implements AstVisitor {
  private static _quoteRegExp = /"/g;
  private _expression: string;

  unparse(ast: AST) {
    this._expression = '';
    this._visit(ast);
    return this._expression;
  }

  visitPropertyRead(ast: PropertyRead) {
    this._visit(ast.receiver);
    this._expression += ast.receiver instanceof ImplicitReceiver ? `${ast.name}` : `.${ast.name}`;
  }

  visitPropertyWrite(ast: PropertyWrite) {
    this._visit(ast.receiver);
    this._expression +=
        ast.receiver instanceof ImplicitReceiver ? `${ast.name} = ` : `.${ast.name} = `;
    this._visit(ast.value);
  }

  visitBinary(ast: Binary) {
    this._visit(ast.left);
    this._expression += ` ${ast.operation} `;
    this._visit(ast.right);
  }

  visitChain(ast: Chain) {
    var len = ast.expressions.length;
    for (let i = 0; i < len; i++) {
      this._visit(ast.expressions[i]);
      this._expression += i == len - 1 ? ';' : '; ';
    }
  }

  visitConditional(ast: Conditional) {
    this._visit(ast.condition);
    this._expression += ' ? ';
    this._visit(ast.trueExp);
    this._expression += ' : ';
    this._visit(ast.falseExp);
  }

  visitPipe(ast: BindingPipe) {
    this._expression += '(';
    this._visit(ast.exp);
    this._expression += ` | ${ast.name}`;
    ast.args.forEach(arg => {
      this._expression += ':';
      this._visit(arg);
    });
    this._expression += ')';
  }

  visitFunctionCall(ast: FunctionCall) {
    this._visit(ast.target);
    this._expression += '(';
    var isFirst = true;
    ast.args.forEach(arg => {
      if (!isFirst) this._expression += ', ';
      isFirst = false;
      this._visit(arg);
    });
    this._expression += ')';
  }

  visitImplicitReceiver(ast: ImplicitReceiver) {}

  visitInterpolation(ast: Interpolation) {
    for (let i = 0; i < ast.strings.length; i++) {
      this._expression += ast.strings[i];
      if (i < ast.expressions.length) {
        this._expression += '{{ ';
        this._visit(ast.expressions[i]);
        this._expression += ' }}';
      }
    }
  }

  visitKeyedRead(ast: KeyedRead) {
    this._visit(ast.obj);
    this._expression += '[';
    this._visit(ast.key);
    this._expression += ']';
  }

  visitKeyedWrite(ast: KeyedWrite) {
    this._visit(ast.obj);
    this._expression += '[';
    this._visit(ast.key);
    this._expression += '] = ';
    this._visit(ast.value);
  }

  visitLiteralArray(ast: LiteralArray) {
    this._expression += '[';
    var isFirst = true;
    ast.expressions.forEach(expression => {
      if (!isFirst) this._expression += ', ';
      isFirst = false;
      this._visit(expression);
    });

    this._expression += ']';
  }

  visitLiteralMap(ast: LiteralMap) {
    this._expression += '{';
    var isFirst = true;
    for (let i = 0; i < ast.keys.length; i++) {
      if (!isFirst) this._expression += ', ';
      isFirst = false;
      this._expression += `${ast.keys[i]}: `;
      this._visit(ast.values[i]);
    }

    this._expression += '}';
  }

  visitLiteralPrimitive(ast: LiteralPrimitive) {
    if (isString(ast.value)) {
      this._expression += `"${StringWrapper.replaceAll(ast.value, Unparser._quoteRegExp, '\"')}"`;
    } else {
      this._expression += `${ast.value}`;
    }
  }

  visitMethodCall(ast: MethodCall) {
    this._visit(ast.receiver);
    this._expression += ast.receiver instanceof ImplicitReceiver ? `${ast.name}(` : `.${ast.name}(`;
    var isFirst = true;
    ast.args.forEach(arg => {
      if (!isFirst) this._expression += ', ';
      isFirst = false;
      this._visit(arg);
    });
    this._expression += ')';
  }

  visitPrefixNot(ast: PrefixNot) {
    this._expression += '!';
    this._visit(ast.expression);
  }

  visitSafePropertyRead(ast: SafePropertyRead) {
    this._visit(ast.receiver);
    this._expression += `?.${ast.name}`;
  }

  visitSafeMethodCall(ast: SafeMethodCall) {
    this._visit(ast.receiver);
    this._expression += `?.${ast.name}(`;
    var isFirst = true;
    ast.args.forEach(arg => {
      if (!isFirst) this._expression += ', ';
      isFirst = false;
      this._visit(arg);
    });
    this._expression += ')';
  }

  private _visit(ast: AST) { ast.visit(this); }
}
