import { writeFileSync } from 'fs';

const goldens: string[] = process.argv.slice(2);

export const goldenMatcher: jasmine.CustomMatcherFactories = {
  toMatchGolden(util: jasmine.MatchersUtil): jasmine.CustomMatcher {
    return {
      compare(actual: {command: string}, golden: string): jasmine.CustomMatcherResult {
        const expected = require(`./goldens/${golden}`);
        const pass = util.equals(actual, expected);
        if (!pass && goldens.indexOf(golden) >= 0) {
          console.error(`Writing golden file ${golden}`);
          writeFileSync(`./goldens/${golden}`, JSON.stringify(actual, null, 2));
          return { pass : true };
        }
        return {
          pass,
          message: `Expected response for '${actual.command}' to match golden file ${golden}.\n` +
            `To generate new golden file, run "yarn golden ${golden}".`,
        };
      }
    };
  },
};

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toMatchGolden(golden: string): void
    }
  }
}
