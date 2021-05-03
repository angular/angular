/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SelectorMatcher} from '@angular/compiler/src/selector';
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {bindAction, getIntParameter} from '@angular/testing/src/benchmark_util';

export function main() {
  BrowserDomAdapter.makeCurrent();
  const count = getIntParameter('selectors');

  let fixedMatcher;
  const fixedSelectorStrings = [];
  const fixedSelectors = [];
  for (let i = 0; i < count; i++) {
    fixedSelectorStrings.push(randomSelector());
  }
  for (let i = 0; i < count; i++) {
    fixedSelectors.push(CssSelector.parse(fixedSelectorStrings[i]));
  }
  fixedMatcher = new SelectorMatcher();
  for (let i = 0; i < count; i++) {
    fixedMatcher.addSelectables(fixedSelectors[i], i);
  }

  function parse() {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(CssSelector.parse(fixedSelectorStrings[i]));
    }
    return result;
  }

  function addSelectable() {
    const matcher = new SelectorMatcher();
    for (let i = 0; i < count; i++) {
      matcher.addSelectables(fixedSelectors[i], i);
    }
    return matcher;
  }

  function match() {
    let matchCount = 0;
    for (let i = 0; i < count; i++) {
      fixedMatcher.match(fixedSelectors[i][0], (selector, selected) => {
        matchCount += selected;
      });
    }
    return matchCount;
  }

  bindAction('#parse', parse);
  bindAction('#addSelectable', addSelectable);
  bindAction('#match', match);
}

function randomSelector() {
  let res = randomStr(5);
  for (let i = 0; i < 3; i++) {
    res += '.' + randomStr(5);
  }
  for (let i = 0; i < 3; i++) {
    res += '[' + randomStr(3) + '=' + randomStr(6) + ']';
  }
  return res;
}

function randomStr(len) {
  let s = '';
  while (s.length < len) {
    s += randomChar();
  }
  return s;
}

function randomChar() {
  const n = randomNum(62);
  if (n < 10) return n.toString();                        // 1-10
  if (n < 36) return StringWrapper.fromCharCode(n + 55);  // A-Z
  return StringWrapper.fromCharCode(n + 61);              // a-z
}

function randomNum(max) {
  return Math.floor(Math.random() * max);
}
