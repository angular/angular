export interface WaitForOptions {
  timeout?: number;
  interval?: number;
}

export async function waitFor<T>(
  action: () => PromiseLike<T> | T,
  isValid: (result: T) => boolean,
  options: WaitForOptions = {},
): Promise<T> {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 100;
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await action();
    if (isValid(result)) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Timed out waiting for condition after ${timeout}ms`);
}
