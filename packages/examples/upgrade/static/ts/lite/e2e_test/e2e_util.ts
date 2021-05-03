/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {by, ElementFinder} from 'protractor';

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeAHero(): Promise<void>;
      toHaveName(exectedName: string): Promise<void>;
    }
  }
}

const isTitleCased = (text: string) =>
    text.split(/\s+/).every(word => word[0] === word[0].toUpperCase());

export function addCustomMatchers() {
  jasmine.addMatchers({
    toBeAHero: () => ({
      compare(actualNg1Hero: ElementFinder|undefined) {
        const getText = (selector: string) => actualNg1Hero!.element(by.css(selector)).getText();
        const result = {
          message: 'Expected undefined to be an `ng1Hero` ElementFinder.',
          pass: !!actualNg1Hero &&
              Promise.all(['.title', 'h2', 'p'].map(getText) as PromiseLike<string>[])
                  .then(([actualTitle, actualName, actualDescription]) => {
                    const pass = (actualTitle === 'Super Hero') && isTitleCased(actualName) &&
                        (actualDescription.length > 0);

                    const actualHero = `Hero(${actualTitle}, ${actualName}, ${actualDescription})`;
                    result.message =
                        `Expected ${actualHero}'${pass ? ' not' : ''} to be a real hero.`;

                    return pass;
                  })
        };
        return result;
      }
    }),
    toHaveName: () => ({
      compare(actualNg1Hero: ElementFinder|undefined, expectedName: string) {
        const result = {
          message: 'Expected undefined to be an `ng1Hero` ElementFinder.',
          pass:
              !!actualNg1Hero && actualNg1Hero.element(by.css('h2')).getText().then(actualName => {
                const pass = actualName === expectedName;
                result.message = `Expected Hero(${actualName})${pass ? ' not' : ''} to have name '${
                    expectedName}'.`;
                return pass;
              })
        };
        return result;
      }
    }),
  } as any);
}
