function* fnDeclaration_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* fnExpression_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* anonymous_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* anonymous_generator_2(a, b) { return (yield a) > 10 ? yield 200 : yield b; }
function* staticMethodDeclaration_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* methodDeclaration_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* methodExpression_generator_1(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* anonymous_generator_3(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* anonymous_generator_4(a, b) { return (yield a) > 10 ? yield 200 : yield b; }

function Input() {}

export function fnDeclaration(a, b) {
  return Zone.__awaiter(this, [a, b], fnDeclaration_generator_1);
}

export const fnExpression = function fnExpression(a, b) {
  return Zone.__awaiter(this, [a, b], fnExpression_generator_1);
};

export const fnArrowBlock = (a, b) =>
  Zone.__awaiter(this, [a, b], anonymous_generator_1);

export const fnArrowExpression = (a, b) =>
  Zone.__awaiter(this, [a, b], anonymous_generator_2);

export class Test {
  constructor() {
    this.methodExpression = function methodExpression(a, b) {
      return Zone.__awaiter(this, [a, b], methodExpression_generator_1);
    };

    this.methodArrowBlock = (a, b) =>
      Zone.__awaiter(this, [a, b], anonymous_generator_3);

    this.methodArrowExpression = (a, b) =>
      Zone.__awaiter(this, [a, b], anonymous_generator_4);
  }

  static staticMethodDeclaration(a, b) {
    return Zone.__awaiter(this, [a, b], staticMethodDeclaration_generator_1);
  }

  methodDeclaration(a, b) {
    return Zone.__awaiter(this, [a, b], methodDeclaration_generator_1);
  }
}
