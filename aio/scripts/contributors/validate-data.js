#!/usr/bin/env node

// Imports
const {readdirSync, readFileSync, statSync} = require('fs');
const {join, resolve} = require('path');

// Constants
const MAX_IMAGE_SIZE = 30 * 1024;  // 30kb
const CONTENT_DIR = resolve(__dirname, '../../content');
const IMAGES_DIR = join(CONTENT_DIR, 'images/bios');
const CONTRIBUTORS_PATH = join(CONTENT_DIR, 'marketing/contributors.json');
const EXISTING_GROUPS = new Set(['Angular', 'GDE', 'Collaborators']);

// Run
_main();

// Functions - Definitions
function _main() {
  const contributors = JSON.parse(readFileSync(CONTRIBUTORS_PATH, 'utf8'));
  const expectedImages = Object.keys(contributors)
      .filter(key => !!contributors[key].picture)
      .map(key => join(IMAGES_DIR, contributors[key].picture));
  const existingImages = readdirSync(IMAGES_DIR)
      .filter(name => name !== '_no-one.jpg')
      .map(name => join(IMAGES_DIR, name));

  // Check that there are no missing images.
  const missingImages = expectedImages.filter(path => !existingImages.includes(path));
  if (missingImages.length > 0) {
    throw new Error(
        'The following pictures are referenced in \'contributors.json\' but do not exist:' +
        missingImages.map(path => `\n  - ${path}`).join(''));
  }

  // Check that there are no unused images.
  const unusedImages = existingImages.filter(path => !expectedImages.includes(path));
  if (unusedImages.length > 0) {
    throw new Error(
        'The following pictures are not referenced in \'contributors.json\' and should be deleted:' +
        unusedImages.map(path => `\n  - ${path}`).join(''));
  }

  // Check that there are no images that exceed the size limit.
  const tooLargeImages = expectedImages.filter(path => statSync(path).size > MAX_IMAGE_SIZE);
  if (tooLargeImages.length > 0) {
    throw new Error(
        `The following pictures exceed maximum size limit of ${MAX_IMAGE_SIZE / 1024}kb:` +
        tooLargeImages.map(path => `\n  - ${path}`).join(''));
  }

  // Verify that all keys are sorted alphabetically
  const keys = Object.keys(contributors);
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1].toLowerCase() > keys[i].toLowerCase()) {
      throw new Error(
        `The following keys in 'contributors.json' are not in alphabetical order: '${keys[i - 1]}' and '${keys[i]}'.`
      );
    }
  }

  Object.entries(contributors).forEach(([key, entry]) => {
    // Make sure `lead` and `mentor` fields refer to existing entries
    if (entry.lead && !contributors[entry.lead]) {
      throw new Error(`The '${key}' entry contains 'lead' field, but it refers to non-existing entry ('${entry.lead}').`);
    }
    if (entry.mentor && !contributors[entry.mentor]) {
      throw new Error(`The '${key}' entry contains 'mentor' field, but it refers to non-existing entry ('${entry.mentor}').`);
    }

    // Verify that `groups` field is always present and contains existing groups
    if (!entry.groups || !Array.isArray(entry.groups) || entry.groups.length === 0) {
      throw new Error(`The 'groups' field should be defined as a non-empty array (entry: '${key}').`);
    }
    if (entry.groups.some(group => !EXISTING_GROUPS.has(group))) {
      throw new Error(`The '${key}' entry contains 'groups' field with unknown values ` +
        `(groups: ${JSON.stringify(entry.groups)}, known values: ${JSON.stringify(Array.from(EXISTING_GROUPS))}).`);
    }
  });
}
