import {Component} from '@angular/core';

@Component({
  template: `
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div class="a{{one}}b{{two}}c{{three}}d"></div>
    <div class="a{{one}}b{{two}}c"></div>
    <div class="a{{one}}b"></div>
    <div class="{{one}}"></div>
  `
})
export class MyComponent {
  one = '';
  two = '';
  three = '';
  four = '';
  five = '';
  six = '';
  seven = '';
  eight = '';
  nine = '';
}
