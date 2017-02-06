declare namespace jasmine {
  export interface DoneFn extends Function {
    (): void;
    fail: (message: Error | string) => void;
  }
}
