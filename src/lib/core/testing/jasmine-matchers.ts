/**
 * Collection of useful custom jasmine matchers for tests.
 */
export const customMatchers: jasmine.CustomMatcherFactories = {
  toBeRole: function(util: jasmine.MatchersUtil,
                     customEqualityTesters: jasmine.CustomEqualityTester[]) {
    return {
      compare: function (element: Element, expectedRole: string) {
        const result: jasmine.CustomMatcherResult = {pass: false};
        result.pass = element.getAttribute('role') === expectedRole;
        result.message = `Expected role for ${element.tagName} to be ${expectedRole}`;

        if (!result.pass) {
          result.message += ` but was ${expectedRole}`;
        }

        return result;
      }
    };
  }
};
