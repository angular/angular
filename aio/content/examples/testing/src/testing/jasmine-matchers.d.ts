// tslint:disable-next-line: no-namespace
declare namespace jasmine {
  interface Matchers<T> {
    toHaveText(actual: any, expectationFailOutput?: any): jasmine.CustomMatcher;
  }
}
