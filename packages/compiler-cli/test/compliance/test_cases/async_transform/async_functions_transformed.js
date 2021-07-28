function* fnDeclaration_generator(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* fnExpression_generator(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* fnArrowBlock_generator(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* fnArrowExpression_generator(a, b) { return (yield a) > 10 ? yield 200 : yield b; }
function* staticMethodDeclaration_generator(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}
function* methodDeclaration_generator(a, b) {
  const x = yield a;
  if (x > 10) {
      return yield 200;
  }
  return yield b;
}

function Input() {}

export function fnDeclaration(a, b) {
  return Zone.__awaiter(this, [a, b], fnDeclaration_generator);
}

export const fnExpression = function(a, b) {
  return Zone.__awaiter(this, [a, b], fnExpression_generator);
};

export const fnArrowBlock = (a, b) =>
  Zone.__awaiter(this, [a, b], fnArrowBlock_generator);

export const fnArrowExpression = (a, b) =>
  Zone.__awaiter(this, [a, b], fnArrowExpression_generator);

export class Test {
  constructor() {
    function* methodExpression_generator(a, b) {
      const x = yield a;
      if (x > 10) {
          return yield 200;
      }
      return yield b;
    }
    function* methodArrowBlock_generator(a, b) {
      const x = yield a;
      if (x > 10) {
          return yield 200;
      }
      return yield b;
    }
    function* methodArrowExpression_generator(a, b) { return (yield a) > 10 ? yield 200 : yield b; }

    this.methodExpression = function(a, b) {
      return Zone.__awaiter(this, [a, b], methodExpression_generator);
    };

    this.methodArrowBlock = (a, b) =>
      Zone.__awaiter(this, [a, b], methodArrowBlock_generator);

    this.methodArrowExpression = (a, b) =>
      Zone.__awaiter(this, [a, b], methodArrowExpression_generator);
  }

  static staticMethodDeclaration(a, b) {
    return Zone.__awaiter(this, [a, b], staticMethodDeclaration_generator);
  }

  methodDeclaration(a, b) {
    return Zone.__awaiter(this, [a, b], methodDeclaration_generator);
  }
}
