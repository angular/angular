import {SelectorMatcher} from "core/compiler/selector";
import {CssSelector} from "core/compiler/selector";
import {StringWrapper, Math} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

var fixedMatcher;
var fixedSelectorStrings = [];
var fixedSelectors = [];

var COUNT = 1000;

export function setup() {
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
}

export function runParse() {
  var result = [];
  for (var i=0; i<COUNT; i++) {
    ListWrapper.push(result, CssSelector.parse(fixedSelectorStrings[i]));
  }
  return result;
}

export function runAdd() {
  // The sum is used to prevent Chrome from optimizing the loop away...
  var matcher = new SelectorMatcher();
  var count = 0;
  for (var i=0; i<COUNT; i++) {
    count += matcher.addSelectable(fixedSelectors[i], i);
  }
  return count;
}

export function runMatch() {
  // The sum is used to prevent Chrome from optimizing the loop away...
  var count = 0;
  for (var i=0; i<COUNT; i++) {
    fixedMatcher.match(fixedSelectors[i], (selected) => {
      count += selected;
    });
  }
  return count;
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
  if(n<10) return n; //1-10
  if(n<36) return StringWrapper.fromCharCode(n+55); //A-Z
  return StringWrapper.fromCharCode(n+61); //a-z
}

function randomNum(max) {
  return Math.floor(Math.random() * max);
}
