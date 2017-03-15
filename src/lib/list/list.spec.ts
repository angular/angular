import {async, TestBed} from '@angular/core/testing';
import {Component, QueryList, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdListItem, MdListModule} from './index';


describe('MdList', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdListModule.forRoot()],
      declarations: [
        ListWithOneAnchorItem,
        ListWithOneItem,
        ListWithTwoLineItem,
        ListWithThreeLineItem,
        ListWithAvatar,
        ListWithItemWithCssClass,
        ListWithDynamicNumberOfLines,
        ListWithMultipleItems,
        ListWithManyLines,
        NavListWithOneAnchorItem,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should add and remove focus class on focus/blur', () => {
    let fixture = TestBed.createComponent(ListWithOneAnchorItem);
    let listItem = fixture.debugElement.query(By.directive(MdListItem));
    let listItemDiv = fixture.debugElement.query(By.css('.mat-list-item-content'));
    fixture.detectChanges();
    expect(listItemDiv.nativeElement.classList).not.toContain('mat-list-item-focus');

    listItem.componentInstance._handleFocus();
    fixture.detectChanges();
    expect(listItemDiv.nativeElement.classList).toContain('mat-list-item-focus');

    listItem.componentInstance._handleBlur();
    fixture.detectChanges();
    expect(listItemDiv.nativeElement.classList).not.toContain('mat-list-item-focus');
  });

  it('should not apply any additional class to a list without lines', () => {
    let fixture = TestBed.createComponent(ListWithOneItem);
    let listItem = fixture.debugElement.query(By.css('md-list-item'));
    fixture.detectChanges();
    expect(listItem.nativeElement.className).toBe('mat-list-item');
  });

  it('should apply mat-2-line class to lists with two lines', () => {
    let fixture = TestBed.createComponent(ListWithTwoLineItem);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-2-line');
    expect(listItems[1].nativeElement.className).toContain('mat-2-line');
  });

  it('should apply mat-3-line class to lists with three lines', () => {
    let fixture = TestBed.createComponent(ListWithThreeLineItem);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-3-line');
    expect(listItems[1].nativeElement.className).toContain('mat-3-line');
  });

  it('should apply mat-multi-line class to lists with more than 3 lines', () => {
    let fixture = TestBed.createComponent(ListWithManyLines);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-multi-line');
    expect(listItems[1].nativeElement.className).toContain('mat-multi-line');
  });

  it('should apply mat-list-avatar class to list items with avatars', () => {
    let fixture = TestBed.createComponent(ListWithAvatar);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-list-item-avatar');
    expect(listItems[1].nativeElement.className).not.toContain('mat-list-item-avatar');
  });

  it('should not clear custom classes provided by user', () => {
    let fixture = TestBed.createComponent(ListWithItemWithCssClass);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('md-list-item'));
    expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
  });

  it('should update classes if number of lines change', () => {
    let fixture = TestBed.createComponent(ListWithDynamicNumberOfLines);
    fixture.debugElement.componentInstance.showThirdLine = false;
    fixture.detectChanges();

    let listItem = fixture.debugElement.children[0].query(By.css('md-list-item'));
    expect(listItem.nativeElement.className).toBe('mat-2-line mat-list-item');

    fixture.debugElement.componentInstance.showThirdLine = true;
    fixture.detectChanges();
    expect(listItem.nativeElement.className).toContain('mat-3-line');
  });

  it('should add aria roles properly', () => {
    let fixture = TestBed.createComponent(ListWithMultipleItems);
    fixture.detectChanges();

    let list = fixture.debugElement.children[0];
    let listItem = fixture.debugElement.children[0].query(By.css('md-list-item'));
    expect(list.nativeElement.getAttribute('role')).toBe('list');
    expect(listItem.nativeElement.getAttribute('role')).toBe('listitem');
  });

  it('should not show ripples for non-nav lists', () => {
    let fixture = TestBed.createComponent(ListWithOneAnchorItem);
    fixture.detectChanges();

    const items: QueryList<MdListItem> = fixture.debugElement.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);
    items.forEach(item => expect(item.isRippleEnabled()).toBe(false));
  });

  it('should maybe show ripples for nav lists', () => {
    let fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const items: QueryList<MdListItem> = fixture.debugElement.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);
    // Ripples should be enabled by default, and can be disabled with a binding.
    items.forEach(item => expect(item.isRippleEnabled()).toBe(true));

    fixture.debugElement.componentInstance.disableRipple = true;
    fixture.detectChanges();
    items.forEach(item => expect(item.isRippleEnabled()).toBe(false));
  });
});


class BaseTestList {
  items: any[] = [
    {'name': 'Paprika', 'description': 'A seasoning'},
    {'name': 'Pepper', 'description': 'Another seasoning'}
  ];

  showThirdLine: boolean = false;
}

@Component({template: `
  <md-list>
    <a md-list-item>
      Paprika
    </a>
  </md-list>`})
class ListWithOneAnchorItem extends BaseTestList {
  // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
  // it doesn't get populated.
  @ViewChildren(MdListItem) listItems: QueryList<MdListItem>;
}

@Component({template: `
  <md-nav-list>
    <a md-list-item [disableRipple]="disableRipple">
      Paprika
    </a>
  </md-nav-list>`})
class NavListWithOneAnchorItem extends BaseTestList {
  @ViewChildren(MdListItem) listItems: QueryList<MdListItem>;
  disableRipple: boolean = false;
}

@Component({template: `
  <md-list>
    <md-list-item>
      Paprika
    </md-list-item>
  </md-list>`})
class ListWithOneItem extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item *ngFor="let item of items">
      <img src="">
      <h3 md-line>{{item.name}}</h3>
      <p md-line>{{item.description}}</p>
    </md-list-item>
  </md-list>`})
class ListWithTwoLineItem extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item *ngFor="let item of items">
      <h3 md-line>{{item.name}}</h3>
      <p md-line>{{item.description}}</p>
      <p md-line>Some other text</p>
    </md-list-item>
  </md-list>`})
class ListWithThreeLineItem extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item *ngFor="let item of items">
      <h3 md-line>Line 1</h3>
      <p md-line>Line 2</p>
      <p md-line>Line 3</p>
      <p md-line>Line 4</p>
    </md-list-item>
  </md-list>`})
class ListWithManyLines extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item>
      <img src="" md-list-avatar>
      Paprika
    </md-list-item>
    <md-list-item>
      Pepper
    </md-list-item>
  </md-list>`})
class ListWithAvatar extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item class="test-class" *ngFor="let item of items">
      <h3 md-line>{{item.name}}</h3>
      <p md-line>{{item.description}}</p>
    </md-list-item>
  </md-list>`})
class ListWithItemWithCssClass extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item *ngFor="let item of items">
      <h3 md-line>{{item.name}}</h3>
      <p md-line>{{item.description}}</p>
      <p md-line *ngIf="showThirdLine">Some other text</p>
    </md-list-item>
  </md-list>`})
class ListWithDynamicNumberOfLines extends BaseTestList { }

@Component({template: `
  <md-list>
    <md-list-item *ngFor="let item of items">
      {{item.name}}
    </md-list-item>
  </md-list>`})
class ListWithMultipleItems extends BaseTestList { }
