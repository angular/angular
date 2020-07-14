import { writeFileSync, readFileSync } from 'fs';

const goldens: string[] = process.argv.slice(2);

export const goldenMatcher: jasmine.CustomMatcherFactories = {
  toMatchGolden(util: jasmine.MatchersUtil): jasmine.CustomMatcher {
    return {
      compare(actual: {body?: {}}, golden: string): jasmine.CustomMatcherResult {
        if (goldens.includes(golden)) {
          console.error(`Writing golden file ${golden}`);
          writeFileSync(`./goldens/${golden}`, JSON.stringify(actual, null, 2));
          return { pass : true };
        }
        const content = readFileSync(`./goldens/${golden}`, 'utf-8');
        const expected = JSON.parse(content.replace("${PWD}", process.env.PWD!));
        const hasBody = Object.hasOwnProperty.call(expected, 'body');
        const pass = hasBody ? util.equals(actual.body, expected.body) : util.equals(actual, expected);
        return {
          pass,
          message: `Expected ${JSON.stringify(actual, null, 2)} to match golden ` +
            `${JSON.stringify(expected, null, 2)}.\n` +
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
