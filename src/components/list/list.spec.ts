import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

import {MD_LIST_DIRECTIVES, MdListItem} from './list';

describe('MdList', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should add and remove focus class on focus/blur', () => {
    var template = `
        <md-list>
          <a md-list-item>
            Paprika
          </a>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
        .createAsync(TestList).then((fixture) => {
          let listItem = fixture.debugElement.query(By.directive(MdListItem));
          let listItemDiv = fixture.debugElement.query(By.css('.md-list-item'));
          fixture.detectChanges();
          expect(listItemDiv.nativeElement.classList).not.toContain('md-list-item-focus');

          listItem.componentInstance.handleFocus();
          fixture.detectChanges();
          expect(listItemDiv.nativeElement.classList).toContain('md-list-item-focus');

          listItem.componentInstance.handleBlur();
          fixture.detectChanges();
          expect(listItemDiv.nativeElement.classList).not.toContain('md-list-item-focus');
        });
  });

  it('should not apply any class to a list without lines', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item>
            Paprika
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        let listItem = fixture.debugElement.query(By.css('md-list-item'));
        fixture.detectChanges();
        expect(listItem.nativeElement.className).toBe('');
        done();
      });
  });

  it('should apply md-2-line class to lists with two lines', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item *ngFor="let item of items">
            <img src="">
            <h3 md-line>{{item.name}}</h3>
            <p md-line>{{item.description}}</p>
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.detectChanges();
        let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
        expect(listItems[0].nativeElement.className).toBe('md-2-line');
        expect(listItems[1].nativeElement.className).toBe('md-2-line');
        done();
      });
  });

  it('should apply md-3-line class to lists with three lines', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item *ngFor="let item of items">
            <h3 md-line>{{item.name}}</h3>
            <p md-line>{{item.description}}</p>
            <p md-line>Some other text</p>
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.detectChanges();
        let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
        expect(listItems[0].nativeElement.className).toBe('md-3-line');
        expect(listItems[1].nativeElement.className).toBe('md-3-line');
        done();
      });
  });

  it('should apply md-list-avatar class to list items with avatars', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item>
            <img src="" md-list-avatar>
            Paprika
          </md-list-item>
         <md-list-item>
            Pepper
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.detectChanges();
        let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
        expect(listItems[0].nativeElement.className).toBe('md-list-avatar');
        expect(listItems[1].nativeElement.className).toBe('');
        done();
      });
  });

  it('should not clear custom classes provided by user', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item class="test-class" *ngFor="let item of items">
            <h3 md-line>{{item.name}}</h3>
            <p md-line>{{item.description}}</p>
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.detectChanges();
        let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
        expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
        done();
      });
  });

  it('should update classes if number of lines change', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item *ngFor="let item of items">
            <h3 md-line>{{item.name}}</h3>
            <p md-line>{{item.description}}</p>
            <p md-line *ngIf="showThirdLine">Some other text</p>
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.debugElement.componentInstance.showThirdLine = false;
        fixture.detectChanges();
        let listItem = fixture.debugElement.children[0].query(By.css('md-list-item'));
        expect(listItem.nativeElement.className).toBe('md-2-line');

        fixture.debugElement.componentInstance.showThirdLine = true;
        fixture.detectChanges();
        setTimeout(() => {
          expect(listItem.nativeElement.className).toBe('md-3-line');
          done();
        });
      });
  });

  it('should add aria roles properly', (done: () => void) => {
    var template = `
        <md-list>
          <md-list-item *ngFor="let item of items">
            {{item.name}}
          </md-list-item>
        </md-list>
      `;
    return builder.overrideTemplate(TestList, template)
      .createAsync(TestList).then((fixture) => {
        fixture.detectChanges();
        let list = fixture.debugElement.children[0];
        let listItem = fixture.debugElement.children[0].query(By.css('md-list-item'));
        expect(list.nativeElement.getAttribute('role')).toBe('list');
        expect(listItem.nativeElement.getAttribute('role')).toBe('listitem');
        done();
      });
  });

});

@Component({
  selector: 'test-list',
  template: ``,
  directives: [MD_LIST_DIRECTIVES]
})
class TestList {
  items: any[] = [
    {'name': 'Paprika', 'description': 'A seasoning'},
    {'name': 'Pepper', 'description': 'Another seasoning'}
  ];
  showThirdLine: boolean = false;
}
