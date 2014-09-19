import {DOM} from './dom';
export class App {
  @field('input:Element')
  constructor() {
    this.input = null;
    this.list = null;
  }
  run() {
    this.input = DOM.query('input');
    this.list = DOM.query('ul');
    DOM.on(this.input, 'change', (evt) => this.add(evt));
  }
  add(evt) {
    var html = DOM.getInnerHTML(this.list);
    html += '<li>'+this.input.value+'</li>';
    DOM.setInnerHTML(this.list, html);
    this.input.value = '';
  }
}
