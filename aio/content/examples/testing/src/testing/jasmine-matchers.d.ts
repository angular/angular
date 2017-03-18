declare namespace jasmine {
  interface Matchers {
    toHaveText(actual: any, expectationFailOutput?: any): jasmine.CustomMatcher;
  }
}
