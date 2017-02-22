import { browser } from 'protractor';

export var appLang = {
  appIsTs: false,
  appIsJs: false,
  appIsDart: false,
  appIsUnknown: false
};

export function describeIf(cond: boolean, name: string, func: () => void): void {
  if (cond) {
    describe(name, func);
  } else {
    xdescribe(name, func);
  }
}

export function itIf(cond: boolean, name: string, func: (done: DoneFn) => void): void {
  if (cond) {
    it(name, func);
  } else {
    xit(name, func);
  }
}

// protractor.config.js is set to ng2 mode by default, so we must manually
// change it for upgradeAdapter tests
export function setProtractorToNg1Mode(): void {
  browser.rootEl = 'body';
}

export function setProtractorToHybridMode() {
  setProtractorToNg1Mode();
  browser.ng12Hybrid = true;
}
