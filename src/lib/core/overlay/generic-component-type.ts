
export interface ComponentType<T> {
  new (...args: any[]): T;
}
