function Input() {}

export async function fnDeclaration(a, b) {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
}

export const fnExpression = async function fnExpression(a, b) {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
};

export const fnArrowBlock = async (a, b) => {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
};

export const fnArrowExpression = async (a, b) =>
  await a > 10 ? await 200 : await b;

export class Test {
  constructor() {
    this.methodExpression = async function methodExpression(a, b) {
      const x = await a;
      if (x > 10) {
        return await 200;
      }
      return await b;
    };

    this.methodArrowBlock = async (a, b) => {
      const x = await a;
      if (x > 10) {
        return await 200;
      }
      return await b;
    };

    this.methodArrowExpression = async (a, b) =>
       await a > 10? await 200: await b;
  }

  static async staticMethodDeclaration(a, b) {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  }

  async methodDeclaration(a, b) {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  }
}
