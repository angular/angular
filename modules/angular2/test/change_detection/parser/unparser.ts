import {
  AST,
  AstVisitor,
  AccessMember,
  Assignment,
  Binary,
  Chain,
  Conditional,
  Pipe,
  FunctionCall,
  ImplicitReceiver,
  Interpolation,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  MethodCall,
  PrefixNot,
  SafeAccessMember,
  SafeMethodCall
} from 'angular2/src/change_detection/parser/ast';


import {StringWrapper, RegExpWrapper} from 'angular2/src/facade/lang';

var quoteRegExp = RegExpWrapper.create('"');

export class Unparser implements AstVisitor {
  private _expression: string;

  unparse(ast: AST) {
    this._expression = '';
    this._visit(ast);
    return this._expression;
  }

  visitAccessMember(ast: AccessMember) {
    this._visit(ast.receiver);

    this._expression += ast.receiver instanceof ImplicitReceiver ? `${ast.name}` : `.${ast.name}`;
  }

  visitAssignment(ast: Assignment) {
    this._visit(ast.target);
    this._expression += ' = ';
    this._visit(ast.value);
  }

  visitBinary(ast: Binary) {
    this._visit(ast.left);
    this._expression += ` ${ast.operation} `;
    this._visit(ast.right);
  }

  visitChain(ast: Chain) {
    ast.expressions.forEach(expression => {
      this._visit(expression);
      this._expression += ';'
    });
  }

  visitConditional(ast: Conditional) {
    this._visit(ast.condition);
    this._expression += ' ? ';
    this._visit(ast.trueExp);
    this._expression += ' : ';
    this._visit(ast.falseExp);
  }

  visitPipe(ast: Pipe) {
    this._visit(ast.exp);
    this._expression += ` | ${ast.name}`;
    ast.args.forEach(arg => {
      this._expression += ':';
      this._visit(arg);
    })
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

  visitKeyedAccess(ast: KeyedAccess) {
    this._visit(ast.obj);
    this._expression += '[';
    this._visit(ast.key);
    this._expression += ']';
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
    if (StringWrapper.isString(ast.value)) {
      this._expression += `"${StringWrapper.replaceAll(ast.value, quoteRegExp, '\"')}"`;
    } else {
      this._expression += `${ast.value}`;
    }
  }

  visitMethodCall(ast: MethodCall) {
    this._visit(ast.receiver);
    this._expression += ast.receiver instanceof ImplicitReceiver ? `${ast.name}(` :
                                                                   `.${ast.name}(`;
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

  visitSafeAccessMember(ast: SafeAccessMember) {
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
