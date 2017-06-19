declare module jasmine {

  interface Matchers {
    toHaveTextByCss(expected: any): boolean;
    toHaveText(expected: any): boolean;
    toBeDisplayed(expectationFailOutput?: any): boolean;
    toBePresent(expectationFailOutput?: any): boolean;
    toHaveValue(expected: any): boolean;
    toContainText(expected: any): boolean;
    toBeSelected(expectationFailOutput?: any): boolean;
  }

  interface ProtractorCustomMatcherResult {
    pass: webdriver.promise.Promise<boolean>;
    message?: string;
  }

}
