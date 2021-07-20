function Input(): any {}

export async function fnDeclaration(a: number, b: Promise<string>): Promise<number|string> {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
}

export const fnExpression =
    async function fnExpression(a: number, b: Promise<string>): Promise<number|string> {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
};

export const fnArrowBlock = async(a: number, b: Promise<string>): Promise<number|string> => {
  const x = await a;
  if (x > 10) {
    return await 200;
  }
  return await b;
};

export const fnArrowExpression = async(a: number, b: Promise<string>): Promise<number|string> =>
    await a > 10 ? await 200 : await b;


export class Test {
  static async staticMethodDeclaration(a: number, b: Promise<string>): Promise<number|string> {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  }

  @Input()
  async methodDeclaration(a: number, b: Promise<string>): Promise<number|string> {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  }

  @Input()
  protected methodExpression =
      async function methodExpression(a: number, b: Promise<string>): Promise<number|string> {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  };

  @Input()
  readonly methodArrowBlock = async(a: number, b: Promise<string>): Promise<number|string> => {
    const x = await a;
    if (x > 10) {
      return await 200;
    }
    return await b;
  };

  @Input()
  methodArrowExpression = async(a: number, b: Promise<string>): Promise<number|string> =>
      await a > 10? await 200: await b;
}
