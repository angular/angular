import {document, DOM} from 'facade/dom';

import {SelectorMatcher} from "core/compiler/selector";
import {CssSelector} from "core/compiler/selector";
import {StringWrapper, Math} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

var COUNT = 1000;

export function main() {
  var fixedMatcher;
  var fixedSelectorStrings = [];
  var fixedSelectors = [];
  for (var i=0; i<COUNT; i++) {
    ListWrapper.push(fixedSelectorStrings, randomSelector());
  }
  for (var i=0; i<COUNT; i++) {
    ListWrapper.push(fixedSelectors, CssSelector.parse(fixedSelectorStrings[i]));
  }
  fixedMatcher = new SelectorMatcher();
  for (var i=0; i<COUNT; i++) {
    fixedMatcher.addSelectable(fixedSelectors[i], i);
  }

  function parse(_) {
    var result = [];
    for (var i=0; i<COUNT; i++) {
      ListWrapper.push(result, CssSelector.parse(fixedSelectorStrings[i]));
    }
    return result;
  }

  function addSelectable(_) {
    var matcher = new SelectorMatcher();
    for (var i=0; i<COUNT; i++) {
      matcher.addSelectable(fixedSelectors[i], i);
    }
    return matcher;
  }

  function match(_) {
    var matchCount = 0;
    for (var i=0; i<COUNT; i++) {
      fixedMatcher.match(fixedSelectors[i], (selected) => {
        matchCount += selected;
      });
    }
    return matchCount;
  }

  DOM.on(DOM.querySelector(document, '#parse'), 'click', parse);
  DOM.on(DOM.querySelector(document, '#addSelectable'), 'click', addSelectable);
  DOM.on(DOM.querySelector(document, '#match'), 'click', match);
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
