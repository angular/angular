import {benchmark, benchmarkStep} from '../benchpress';

import {SelectorMatcher} from "core/compiler/selector";
import {CssSelector} from "core/compiler/selector";
import {StringWrapper, Math} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

var fixedMatcher;
var fixedSelectorStrings = [];
var fixedSelectors = [];

var COUNT = 1000;

export function main() {
  setup(COUNT);

  benchmark(`cssSelector.parse * ${COUNT}`, function() {
    benchmarkStep(`run`, function() {
      var result = [];
      for (var i=0; i<COUNT; i++) {
        ListWrapper.push(result, CssSelector.parse(fixedSelectorStrings[i]));
      }
      return result;
    });
  });

  benchmark(`cssSelector.addSelectable * ${COUNT}`, function() {
    benchmarkStep(`run`, function() {
      var matcher = new SelectorMatcher();
      for (var i=0; i<COUNT; i++) {
        matcher.addSelectable(fixedSelectors[i], i);
      }
      return matcher;
    });
  });

  benchmark(`cssSelector.match * ${COUNT}`, function() {
    benchmarkStep(`run`, function() {
      var matchCount = 0;
      for (var i=0; i<COUNT; i++) {
        fixedMatcher.match(fixedSelectors[i], (selected) => {
          matchCount += selected;
        });
      }
      return matchCount;
    });
  });
}

function setup(count) {
  for (var i=0; i<count; i++) {
    ListWrapper.push(fixedSelectorStrings, randomSelector());
  }
  for (var i=0; i<count; i++) {
    ListWrapper.push(fixedSelectors, CssSelector.parse(fixedSelectorStrings[i]));
  }
  fixedMatcher = new SelectorMatcher();
  for (var i=0; i<count; i++) {
    fixedMatcher.addSelectable(fixedSelectors[i], i);
  }
}

function randomSelector() {
  var res = randomStr(5);
  for (var i=0; i<3; i++) {
    res += '.'+randomStr(5);
  }
  for (var i=0; i<3; i++) {
    res += '['+randomStr(3)+'='+randomStr(6)+']';
  }
  return res;
}

function randomStr(len){
  var s = '';
  while (s.length < len) {
    s += randomChar();
  }
  return s;
}

function randomChar(){
  var n = randomNum(62);
  if(n<10) return n.toString(); //1-10
  if(n<36) return StringWrapper.fromCharCode(n+55); //A-Z
  return StringWrapper.fromCharCode(n+61); //a-z
}

function randomNum(max) {
  return Math.floor(Math.random() * max);
}
