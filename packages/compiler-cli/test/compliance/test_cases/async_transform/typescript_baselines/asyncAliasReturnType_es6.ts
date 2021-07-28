type PromiseAlias<T> = Promise<T>;

async function f(): PromiseAlias<void> {}
