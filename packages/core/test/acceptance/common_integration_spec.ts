/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('@angular/common integration', () => {
  describe('NgForOf', () => {
    @Directive({selector: '[dir]'})
    class MyDirective {
    }

    @Component({selector: 'app-child', template: '<div dir>comp text</div>'})
    class ChildComponent {
    }

    @Component({selector: 'app-root', template: ''})
    class AppComponent {
      items: string[] = ['first', 'second'];
    }

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [AppComponent, ChildComponent, MyDirective]});
    });

    it('should update a loop', () => {
      TestBed.overrideTemplate(
          AppComponent, '<ul><li *ngFor="let item of items">{{item}}</li></ul>');
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      let listItems =
          Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['first', 'second']);

      // change detection cycle, no model changes
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['first', 'second']);

      // remove the last item
      const items = fixture.componentInstance.items;
      items.length = 1;
      fixture.detectChanges();

      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['first']);

      // change an item
      items[0] = 'one';
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['one']);

      // add an item
      items.push('two');
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['one', 'two']);
    });

    it('should support ngForOf context variables', () => {
      TestBed.overrideTemplate(
          AppComponent,
          '<ul><li *ngFor="let item of items; index as myIndex; count as myCount">{{myIndex}} of {{myCount}}: {{item}}</li></ul>');
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      let listItems =
          Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual(['0 of 2: first', '1 of 2: second']);

      // add an item in the middle
      const items = fixture.componentInstance.items;
      items.splice(1, 0, 'middle');
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.map(li => li.textContent)).toEqual([
        '0 of 3: first', '1 of 3: middle', '2 of 3: second'
      ]);
    });

    it('should instantiate directives inside directives properly in an ngFor', () => {
      TestBed.overrideTemplate(AppComponent, '<app-child *ngFor="let item of items"></app-child>');
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      const children = fixture.debugElement.queryAll(By.directive(ChildComponent));

      // expect 2 children, each one with a directive
      expect(children.length).toBe(2);
      expect(children.map(child => child.nativeElement.innerHTML)).toEqual([
        '<div dir="">comp text</div>', '<div dir="">comp text</div>'
      ]);
      let directive = children[0].query(By.directive(MyDirective));
      expect(directive).not.toBeNull();
      directive = children[1].query(By.directive(MyDirective));
      expect(directive).not.toBeNull();

      // add an item
      const items = fixture.componentInstance.items;
      items.push('third');
      fixture.detectChanges();

      const childrenAfterAdd = fixture.debugElement.queryAll(By.directive(ChildComponent));

      expect(childrenAfterAdd.length).toBe(3);
      expect(childrenAfterAdd.map(child => child.nativeElement.innerHTML)).toEqual([
        '<div dir="">comp text</div>', '<div dir="">comp text</div>', '<div dir="">comp text</div>'
      ]);
      directive = childrenAfterAdd[2].query(By.directive(MyDirective));
      expect(directive).not.toBeNull();
    });

    it('should retain parent view listeners when the NgFor destroy views', () => {
      @Component({
        selector: 'app-toggle',
        template: `<button (click)="toggle()">Toggle List</button>
         <ul>
            @for (item of items; track item) {
  <li>{{item}}</li>
}
         </ul>`
      })
      class ToggleComponent {
        private _data: number[] = [1, 2, 3];
        items: number[] = [];

        toggle() {
          if (this.items.length) {
            this.items = [];
          } else {
            this.items = this._data;
          }
        }
      }

      TestBed.configureTestingModule({declarations: [ToggleComponent]});
      const fixture = TestBed.createComponent(ToggleComponent);
      fixture.detectChanges();

      // no elements in the list
      let listItems =
          Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(0);

      // this will fill the list
      fixture.componentInstance.toggle();
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(3);
      expect(listItems.map(li => li.textContent)).toEqual(['1', '2', '3']);

      // now toggle via the button
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(0);

      // toggle again
      button.click();
      fixture.detectChanges();
      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(3);
    });

    it('should support multiple levels of embedded templates', () => {
      @Component({
        selector: 'app-multi',
        template: `<ul>
          @for (row of items; track row) {
  <li>
            @for (cell of row.data; track cell) {
  <span>{{cell}} - {{ row.value }} - {{ items.length }}</span>
}
          </li>
}
       </ul>`
      })
      class MultiLevelComponent {
        items: any[] = [{data: ['1', '2'], value: 'first'}, {data: ['3', '4'], value: 'second'}];
      }

      TestBed.configureTestingModule({declarations: [MultiLevelComponent]});
      const fixture = TestBed.createComponent(MultiLevelComponent);
      fixture.detectChanges();

      // change detection cycle, no model changes
      let listItems =
          Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(2);
      let spanItems = Array.from(listItems[0].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual(['1 - first - 2', '2 - first - 2']);
      spanItems = Array.from(listItems[1].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual(['3 - second - 2', '4 - second - 2']);

      // remove the last item
      const items = fixture.componentInstance.items;
      items.length = 1;
      fixture.detectChanges();

      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(1);
      spanItems = Array.from(listItems[0].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual(['1 - first - 1', '2 - first - 1']);

      // change an item
      items[0].data[0] = 'one';
      fixture.detectChanges();

      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(1);
      spanItems = Array.from(listItems[0].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual(['one - first - 1', '2 - first - 1']);

      // add an item
      items[1] = {data: ['three', '4'], value: 'third'};
      fixture.detectChanges();

      listItems = Array.from((fixture.nativeElement as HTMLUListElement).querySelectorAll('li'));
      expect(listItems.length).toBe(2);
      spanItems = Array.from(listItems[0].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual(['one - first - 2', '2 - first - 2']);
      spanItems = Array.from(listItems[1].querySelectorAll('span'));
      expect(spanItems.map(span => span.textContent)).toEqual([
        'three - third - 2', '4 - third - 2'
      ]);
    });

    it('should support multiple levels of embedded templates with listeners', () => {
      @Component({
        selector: 'app-multi',
        template: `@for (row of items; track row) {
  <div>
          @for (cell of row.data; track cell) {
  <p>
            <span (click)="onClick(row.value, name)"></span>
            {{ row.value }} - {{ name }}
          </p>
}
        </div>
}`
      })
      class MultiLevelWithListenerComponent {
        items: any[] = [{data: ['1'], value: 'first'}];
        name = 'app';
        events: string[] = [];

        onClick(value: string, name: string) {
          this.events.push(value, name);
        }
      }

      TestBed.configureTestingModule({declarations: [MultiLevelWithListenerComponent]});
      const fixture = TestBed.createComponent(MultiLevelWithListenerComponent);
      fixture.detectChanges();

      const elements = fixture.nativeElement.querySelectorAll('p');
      expect(elements.length).toBe(1);
      expect(elements[0].innerHTML).toBe('<span></span> first - app ');

      const span: HTMLSpanElement = fixture.nativeElement.querySelector('span');
      span.click();
      expect(fixture.componentInstance.events).toEqual(['first', 'app']);

      fixture.componentInstance.name = 'new name';
      fixture.detectChanges();
      expect(elements[0].innerHTML).toBe('<span></span> first - new name ');

      span.click();
      expect(fixture.componentInstance.events).toEqual(['first', 'app', 'first', 'new name']);
    });

    it('should support skipping contexts', () => {
      @Component({
        selector: 'app-multi',
        template: `@for (row of items; track row) {
  <div>
           @for (cell of row; track cell) {
  <div>
              @for (span of cell.data; track span) {
  <span>{{ cell.value }} - {{ name }}</span>
}
           </div>
}
        </div>
}`
      })
      class SkippingContextComponent {
        name = 'app';
        items: any[] = [
          [
            // row
            {value: 'one', data: ['1', '2']}  // cell
          ],
          [{value: 'two', data: ['3', '4']}]
        ];
      }

      TestBed.configureTestingModule({declarations: [SkippingContextComponent]});
      const fixture = TestBed.createComponent(SkippingContextComponent);
      fixture.detectChanges();

      const elements = fixture.nativeElement.querySelectorAll('span');
      expect(elements.length).toBe(4);
      expect(elements[0].textContent).toBe('one - app');
      expect(elements[1].textContent).toBe('one - app');
      expect(elements[2].textContent).toBe('two - app');
      expect(elements[3].textContent).toBe('two - app');

      fixture.componentInstance.name = 'other';
      fixture.detectChanges();
      expect(elements[0].textContent).toBe('one - other');
      expect(elements[1].textContent).toBe('one - other');
      expect(elements[2].textContent).toBe('two - other');
      expect(elements[3].textContent).toBe('two - other');
    });

    it('should support context for 9+ levels of embedded templates', () => {
      @Component({
        selector: 'app-multi',
        template: `@for (item0 of items; track item0) {
  <div>
            @for (item1 of item0.data; track item1) {
  <span>
               @for (item2 of item1.data; track item2) {
  <span>
                   @for (item3 of item2.data; track item3) {
  <span>
                       @for (item4 of item3.data; track item4) {
  <span>
                           @for (item5 of item4.data; track item5) {
  <span>
                               @for (item6 of item5.data; track item6) {
  <span>
                                   @for (item7 of item6.data; track item7) {
  <span>
                                       @for (item8 of item7.data; track item8) {
  <span>{{ item8 }}.{{ item7.value }}.{{ item6.value }}.{{ item5.value }}.{{ item4.value }}.{{ item3.value }}.{{ item2.value }}.{{ item1.value }}.{{ item0.value }}.{{ value }}</span>
}
                                   </span>
}
                               </span>
}
                           </span>
}
                       </span>
}
                   </span>
}
               </span>
}
            </span>
}
         </div>
}`
      })
      class NineLevelsComponent {
        value = 'App';
        items: any[] = [
          {
            // item0
            data: [{
              // item1
              data: [{
                // item2
                data: [{
                  // item3
                  data: [{
                    // item4
                    data: [{
                      // item5
                      data: [{
                        // item6
                        data: [{
                          // item7
                          data: [
                            '1', '2'  // item8
                          ],
                          value: 'h'
                        }],
                        value: 'g'
                      }],
                      value: 'f'
                    }],
                    value: 'e'
                  }],
                  value: 'd'
                }],
                value: 'c'
              }],
              value: 'b'
            }],
            value: 'a'
          },
          {
            // item0
            data: [{
              // item1
              data: [{
                // item2
                data: [{
                  // item3
                  data: [{
                    // item4
                    data: [{
                      // item5
                      data: [{
                        // item6
                        data: [{
                          // item7
                          data: [
                            '3', '4'  // item8
                          ],
                          value: 'H'
                        }],
                        value: 'G'
                      }],
                      value: 'F'
                    }],
                    value: 'E'
                  }],
                  value: 'D'
                }],
                value: 'C'
              }],
              value: 'B'
            }],
            value: 'A'
          }
        ];
      }

      TestBed.configureTestingModule({declarations: [NineLevelsComponent]});
      const fixture = TestBed.createComponent(NineLevelsComponent);
      fixture.detectChanges();

      const divItems = (fixture.nativeElement as HTMLElement).querySelectorAll('div');
      expect(divItems.length).toBe(2);  // 2 outer loops
      let spanItems =
          divItems[0].querySelectorAll('span > span > span > span > span > span > span > span');
      expect(spanItems.length).toBe(2);  // 2 inner elements
      expect(spanItems[0].textContent).toBe('1.h.g.f.e.d.c.b.a.App');
      expect(spanItems[1].textContent).toBe('2.h.g.f.e.d.c.b.a.App');
      spanItems =
          divItems[1].querySelectorAll('span > span > span > span > span > span > span > span');
      expect(spanItems.length).toBe(2);  // 2 inner elements
      expect(spanItems[0].textContent).toBe('3.H.G.F.E.D.C.B.A.App');
      expect(spanItems[1].textContent).toBe('4.H.G.F.E.D.C.B.A.App');
    });
  });

  describe('ngIf', () => {
    it('should support sibling ngIfs', () => {
      @Component({
        selector: 'app-multi',
        template: `
          @if (showing) {
<div>{{ valueOne }}</div>
}
          @if (showing) {
<div>{{ valueTwo }}</div>
}
        `
      })
      class SimpleConditionComponent {
        showing = true;
        valueOne = 'one';
        valueTwo = 'two';
      }

      TestBed.configureTestingModule({declarations: [SimpleConditionComponent]});
      const fixture = TestBed.createComponent(SimpleConditionComponent);
      fixture.detectChanges();

      const elements = fixture.nativeElement.querySelectorAll('div');
      expect(elements.length).toBe(2);
      expect(elements[0].textContent).toBe('one');
      expect(elements[1].textContent).toBe('two');

      fixture.componentInstance.valueOne = '$$one$$';
      fixture.componentInstance.valueTwo = '$$two$$';
      fixture.detectChanges();
      expect(elements[0].textContent).toBe('$$one$$');
      expect(elements[1].textContent).toBe('$$two$$');
    });

    it('should handle nested ngIfs with no intermediate context vars', () => {
      @Component({
        selector: 'app-multi',
        template: `@if (showing) {
<div>
          @if (outerShowing) {
<div>
              @if (innerShowing) {
<div>{{ name }}</div>
}
            </div>
}
          </div>
}
        `
      })
      class NestedConditionsComponent {
        showing = true;
        outerShowing = true;
        innerShowing = true;
        name = 'App name';
      }

      TestBed.configureTestingModule({declarations: [NestedConditionsComponent]});
      const fixture = TestBed.createComponent(NestedConditionsComponent);
      fixture.detectChanges();

      const elements = fixture.nativeElement.querySelectorAll('div');
      expect(elements.length).toBe(3);
      expect(elements[2].textContent).toBe('App name');

      fixture.componentInstance.name = 'Other name';
      fixture.detectChanges();
      expect(elements[2].textContent).toBe('Other name');
    });
  });

  describe('NgTemplateOutlet', () => {
    it('should create and remove embedded views', () => {
      @Component({
        selector: 'app-multi',
        template: `<ng-template #tpl>from tpl</ng-template>
          <ng-template [ngTemplateOutlet]="showing ? tpl : null"></ng-template>
        `
      })
      class EmbeddedViewsComponent {
        showing = false;
      }

      TestBed.configureTestingModule({declarations: [EmbeddedViewsComponent]});
      const fixture = TestBed.createComponent(EmbeddedViewsComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toBe('from tpl');

      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('from tpl');

      fixture.componentInstance.showing = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toBe('from tpl');
    });

    it('should create and remove embedded views', () => {
      @Component({
        selector: 'app-multi',
        template: `<ng-template #tpl>from tpl</ng-template>
          <ng-container [ngTemplateOutlet]="showing ? tpl : null"></ng-container>
        `
      })
      class NgContainerComponent {
        showing = false;
      }

      TestBed.configureTestingModule({declarations: [NgContainerComponent]});
      const fixture = TestBed.createComponent(NgContainerComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toBe('from tpl');

      fixture.componentInstance.showing = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('from tpl');

      fixture.componentInstance.showing = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toBe('from tpl');
    });
  });
});
