import {SelectorMatcher} from "angular2/src/render/dom/compiler/selector";
import {CssSelector} from "angular2/src/render/dom/compiler/selector";
import {StringWrapper, Math} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

export function main() {
  BrowserDomAdapter.makeCurrent();
  var count = getIntParameter('selectors');

  var fixedMatcher;
  var fixedSelectorStrings = [];
  var fixedSelectors = [];
  for (var i=0; i<count; i++) {
    ListWrapper.push(fixedSelectorStrings, randomSelector());
  }
  for (var i=0; i<count; i++) {
    ListWrapper.push(fixedSelectors, CssSelector.parse(fixedSelectorStrings[i]));
  }
  fixedMatcher = new SelectorMatcher();
  for (var i=0; i<count; i++) {
    fixedMatcher.addSelectables(fixedSelectors[i], i);
  }

  function parse() {
    var result = [];
    for (var i=0; i<count; i++) {
      ListWrapper.push(result, CssSelector.parse(fixedSelectorStrings[i]));
    }
    return result;
  }

  function addSelectable() {
    var matcher = new SelectorMatcher();
    for (var i=0; i<count; i++) {
      matcher.addSelectables(fixedSelectors[i], i);
    }
    return matcher;
  }

  function match() {
    var matchCount = 0;
    for (var i=0; i<count; i++) {
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
