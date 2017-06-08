/**
 * Collection of useful custom jasmine matchers for tests.
 */
export const customMatchers: jasmine.CustomMatcherFactories = {
  toBeRole: () => {
    return {
      compare: function (element: Element, expectedRole: string) {
        const result: jasmine.CustomMatcherResult = {pass: false};
        const actualRole = element.getAttribute('role');

        result.pass = actualRole === expectedRole;
        result.message = `Expected role for ${element.tagName} to be ${expectedRole}`;

        if (!result.pass) {
          result.message += ` but was ${actualRole}`;
        }

        return result;
      }
    };
  }
};
