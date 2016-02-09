#!/usr/bin/env node

'use strict';

/**
 * Just a small command-line wrapper around the conventional-changelog npm module
 * (https://www.npmjs.com/package/conventional-changelog), which also prepends
 * changes to CHANGELOG.md.
 *
 * Runs with default (latest tag...head)
 * $ ./changelog.js
 */

var fs = require('fs');
var cl = require('conventional-changelog');
var angularPreset = require('conventional-changelog/presets/angular');
var _ = require('lodash');

var changelogStream = fs.createWriteStream('CHANGELOG.md');

var typesToHeadings = {
  refactor: 'Refactor',
  build: 'Build',
  cleanup: 'Cleanup',
  chore: 'Chore'
};

var config = {
  preset: 'angular',
  releaseCount: 1,
};

angularPreset(function(err, opts) {
  cl(config, null, null, null, {
    transform: transformFn.bind(opts)
  }).on('error', function(err) {
              console.error('Failed to generate changelog: ' + err);
            }).pipe(changelogStream);
});

function transformFn(commit) {
  var transformed = this.writerOpts.transform(commit);

  /**
   * If a commit has breaking changes, but didn't pass the angular preset,
   * include it in the Changelog.
  **/
  if (!transformed && commit.notes.filter(function(note) {
      return note.title.indexOf('BREAKING CHANGE') > -1}).length) {
    transformed = commit;
    transformed.type = typesToHeadings[commit.type];

    /**
     * Begin copying of code from angular preset
    **/
    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
    }

    if (typeof commit.subject === 'string') {
      commit.subject = commit.subject.substring(0, 80);
    }

    _.map(commit.notes, function(note) {
      if (note.title === 'BREAKING CHANGE') {
        note.title = 'BREAKING CHANGES';
      }
      return note;
    });
    /**
     * End copying of code from angular preset
    **/
  }
  return transformed;
};
