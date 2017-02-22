import * as fs from 'fs';
import * as path from 'path';
import {browser} from 'protractor';

const OUTPUT_DIR = './screenshots/';
const HEIGHT = 768;
const WIDTH = 1024;

let currentJasmineSpecName = '';

/**  Adds a custom jasmine reporter that simply keeps track of the current test name. */
function initializeEnvironment(jasmine: any) {
  browser.manage().window().setSize(WIDTH, HEIGHT);
  let reporter = new jasmine.JsApiReporter({});
  reporter.specStarted = function(result: any) {
    currentJasmineSpecName = result.fullName;
  };
  jasmine.getEnv().addReporter(reporter);
}

initializeEnvironment(jasmine);

export class Screenshot {
  id: string;

  /** The filename used to store the screenshot. */
  get filename(): string {
    return this.id
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^/a-z0-9_]+/g, '')
      + '.screenshot.png';
  }

  /** The full path to the screenshot */
  get fullPath(): string {
    return path.resolve(OUTPUT_DIR, this.filename);
  }

  constructor(id?: string) {
    this.id = id ? `${currentJasmineSpecName} ${id}` : currentJasmineSpecName;
    browser.takeScreenshot().then(png => this.storeScreenshot(png));
  }

  /** Replaces the existing screenshot with the newly generated one. */
  storeScreenshot(png: any) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, '744');
    }

    if (fs.existsSync(OUTPUT_DIR)) {
      fs.writeFileSync(this.fullPath, png, {encoding: 'base64' });
    }
  }
}

export function screenshot(id?: string) {
  if (process.env['TRAVIS']) {
    return new Screenshot(id);
  }
}
