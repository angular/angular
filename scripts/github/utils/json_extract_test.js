#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var assert = require('assert');
var extractPaths = require('./json_extract').extractPaths;

var SAMPLE_LABELS = [
  {
    'id': 149476251,
    'url': 'https://api.github.com/repos/angular/angular/labels/cla:%20yes',
    'name': 'cla: yes',
    'color': '009800',
    'default': false
  },
  {
    'id': 533874619,
    'url': 'https://api.github.com/repos/angular/angular/labels/comp:%20aio',
    'name': 'comp: aio',
    'color': 'c7def8',
    'default': false
  },
  {
    'id': 133556520,
    'url': 'https://api.github.com/repos/angular/angular/labels/PR%20action:%20merge',
    'name': 'PR action: merge',
    'color': '99ff66',
    'default': false
  },
  {
    'id': 655699838,
    'url': 'https://api.github.com/repos/angular/angular/labels/PR%20target:%20master%20&%20patch',
    'name': 'PR target: master & patch',
    'color': '5319e7',
    'default': false
  }
];

assert.deepEqual(extractPaths({head: {label: 'value1'}}, ['head.label']), ['value1']);
assert.deepEqual(
    extractPaths(SAMPLE_LABELS, ['name']),
    ['cla: yes|comp: aio|PR action: merge|PR target: master & patch']);
assert.deepEqual(extractPaths(SAMPLE_LABELS, ['name=^PR target:']), ['PR target: master & patch']);
