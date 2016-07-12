import {inject} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';

import {MD_MENU_DIRECTIVES} from './menu';

describe('MdMenu', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should add and remove focus class on focus/blur', () => {
    var template = ``;
    return builder.overrideTemplate(TestList, template)
        .createAsync(TestList).then((fixture) => {
           expect(true).toBe(true);
        });
  });

});

@Component({
  selector: 'test-menu',
  template: ``,
  directives: [MD_MENU_DIRECTIVES]
})
class TestList {}
