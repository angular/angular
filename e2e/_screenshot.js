"use strict";

const path = require('path');
const child_process  = require('child_process');
const mapnik = require('mapnik');

const SHA = process.env.TRAVIS_COMMIT;
const LFS_BASE_URL = 'https://media.githubusercontent.com/media/angular/material2';

/**
 * Generates a screenshot from the current state of the Protractor test and compares it to the
 * previous stored screenshot.  If the screenshots do not match or if no existing screenshot is
 * found, an error will be thrown.  In both cases, the new screenshot will be stored so that it can
 * be added to git.
 */
class Screenshot {
  /**
   * @param {string} id A unique identifier used for the screenshot
   */
  constructor(id) {
    this.id   = id;
    this.path = path.resolve(__dirname, '..', 'screenshots', id + '.screenshot.png');
    this.url  = `${LFS_BASE_URL}/${SHA}/screenshots/${encodeURIComponent(id)}.screenshot.png`;
    browser.takeScreenshot().then(png => this.storeScreenshot(png));
  }

  /**
   * Stores a local copy of the screenshot for future comparison
   * @param {string} png The base64-encoded screenshot generated from the current browser state
   */
  storeScreenshot(png) {
    console.info(`[STATUS] Generated new screenshot for "${this.id}"`);
    this.png = mapnik.Image.fromBytes(new Buffer(png, 'base64'));
    if (SHA) {
      this.downloadFromGithub();
    } else {
      this.compareScreenshots();
    }
  }

  /**
   * Since we are using `git-lfs`, screenshots are not necessarily available within our local
   * directory.  To get around this, we download the latest screenshot from Github.
   */
  downloadFromGithub() {
    console.info(`[STATUS] Downloading screenshot from Github: ${this.url} => ${this.path}`);
    child_process.execSync(`curl ${this.url} > "${this.path}"`);
    this.compareScreenshots();
  }

  /**
   * Compares the generated screenshot to the existing screenshot.  If it does not match, an error
   * will be thrown.
   */
  compareScreenshots() {
    console.info(`[STATUS] Comparing screenshots`);
    try {
      let referenceScreenshot = mapnik.Image.open(this.path);
      this.overwriteExistingScreenshot();
      if (referenceScreenshot.compare(this.png)) {
        throw new Error(`screenshot "${this.id}" has changed.`);
      } else {
        console.info('[STATUS] Screenshot has not changed');
      }
    } catch (e) {
      console.info(`[STATUS] No reference screenshot found`);
      this.overwriteExistingScreenshot();
      throw new Error(`screenshot "${this.id}" was not found.`);
    }
  }

  /**
   * Replaces the existing screenshot with the newly generated one.
   */
  overwriteExistingScreenshot() {
    console.info(`[STATUS] Saving new screenshot`);
    this.png.save(this.path);
  }
}

module.exports = (id) => new Screenshot(id);