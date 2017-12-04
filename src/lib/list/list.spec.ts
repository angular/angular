import {async, TestBed} from '@angular/core/testing';
import {Component, QueryList, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatListItem, MatListModule} from './index';


describe('MatList', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatListModule],
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
    fixture.detectChanges();
    let listItem = fixture.debugElement.query(By.directive(MatListItem));
    let listItemEl = fixture.debugElement.query(By.css('.mat-list-item'));

    expect(listItemEl.nativeElement.classList).not.toContain('mat-list-item-focus');

    listItem.componentInstance._handleFocus();
    fixture.detectChanges();
    expect(listItemEl.nativeElement.classList).toContain('mat-list-item-focus');

    listItem.componentInstance._handleBlur();
    fixture.detectChanges();
    expect(listItemEl.nativeElement.classList).not.toContain('mat-list-item-focus');
  });

  it('should not apply any additional class to a list without lines', () => {
    let fixture = TestBed.createComponent(ListWithOneItem);
    let listItem = fixture.debugElement.query(By.css('mat-list-item'));
    fixture.detectChanges();
    expect(listItem.nativeElement.className).toBe('mat-list-item');
  });

  it('should apply mat-2-line class to lists with two lines', () => {
    let fixture = TestBed.createComponent(ListWithTwoLineItem);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-2-line');
    expect(listItems[1].nativeElement.className).toContain('mat-2-line');
  });

  it('should apply mat-3-line class to lists with three lines', () => {
    let fixture = TestBed.createComponent(ListWithThreeLineItem);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-3-line');
    expect(listItems[1].nativeElement.className).toContain('mat-3-line');
  });

  it('should apply mat-multi-line class to lists with more than 3 lines', () => {
    let fixture = TestBed.createComponent(ListWithManyLines);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-multi-line');
    expect(listItems[1].nativeElement.className).toContain('mat-multi-line');
  });

  it('should apply mat-list-avatar class to list items with avatars', () => {
    let fixture = TestBed.createComponent(ListWithAvatar);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-list-item-avatar');
    expect(listItems[1].nativeElement.className).not.toContain('mat-list-item-avatar');
  });

  it('should not clear custom classes provided by user', () => {
    let fixture = TestBed.createComponent(ListWithItemWithCssClass);
    fixture.detectChanges();

    let listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
  });

  it('should update classes if number of lines change', () => {
    let fixture = TestBed.createComponent(ListWithDynamicNumberOfLines);
    fixture.debugElement.componentInstance.showThirdLine = false;
    fixture.detectChanges();

    let listItem = fixture.debugElement.children[0].query(By.css('mat-list-item'));
    expect(listItem.nativeElement.classList.length).toBe(2);
    expect(listItem.nativeElement.classList).toContain('mat-2-line');
    expect(listItem.nativeElement.classList).toContain('mat-list-item');

    fixture.debugElement.componentInstance.showThirdLine = true;
    fixture.detectChanges();
    expect(listItem.nativeElement.className).toContain('mat-3-line');
  });

  it('should add aria roles properly', () => {
    let fixture = TestBed.createComponent(ListWithMultipleItems);
    fixture.detectChanges();

    let list = fixture.debugElement.children[0];
    let listItem = fixture.debugElement.children[0].query(By.css('mat-list-item'));
    expect(list.nativeElement.getAttribute('role')).toBeNull('Expect mat-list no role');
    expect(listItem.nativeElement.getAttribute('role')).toBeNull('Expect mat-list-item no role');
  });

  it('should not show ripples for non-nav lists', () => {
    let fixture = TestBed.createComponent(ListWithOneAnchorItem);
    fixture.detectChanges();

    const items: QueryList<MatListItem> = fixture.debugElement.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);
    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
  });

  it('should allow disabling ripples for specific nav-list items', () => {
    let fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);

    // Ripples should be enabled by default, and can be disabled with a binding.
    items.forEach(item => expect(item._isRippleDisabled()).toBe(false));

    fixture.componentInstance.disableItemRipple = true;
    fixture.detectChanges();

    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
  });

  it('should allow disabling ripples for the whole nav-list', () => {
    let fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);

    // Ripples should be enabled by default, and can be disabled with a binding.
    items.forEach(item => expect(item._isRippleDisabled()).toBe(false));

    fixture.componentInstance.disableListRipple = true;
    fixture.detectChanges();

    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
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
  <mat-list>
    <a mat-list-item>
      Paprika
    </a>
  </mat-list>`})
class ListWithOneAnchorItem extends BaseTestList {
  // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
  // it doesn't get populated.
  @ViewChildren(MatListItem) listItems: QueryList<MatListItem>;
}

@Component({template: `
  <mat-nav-list [disableRipple]="disableListRipple">
    <a mat-list-item [disableRipple]="disableItemRipple">
      Paprika
    </a>
  </mat-nav-list>`})
class NavListWithOneAnchorItem extends BaseTestList {
  @ViewChildren(MatListItem) listItems: QueryList<MatListItem>;
  disableItemRipple: boolean = false;
  disableListRipple: boolean = false;
}

@Component({template: `
  <mat-list>
    <mat-list-item>
      Paprika
    </mat-list-item>
  </mat-list>`})
class ListWithOneItem extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <img src="">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
    </mat-list-item>
  </mat-list>`})
class ListWithTwoLineItem extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
      <p mat-line>Some other text</p>
    </mat-list-item>
  </mat-list>`})
class ListWithThreeLineItem extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>Line 1</h3>
      <p mat-line>Line 2</p>
      <p mat-line>Line 3</p>
      <p mat-line>Line 4</p>
    </mat-list-item>
  </mat-list>`})
class ListWithManyLines extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item>
      <img src="" mat-list-avatar>
      Paprika
    </mat-list-item>
    <mat-list-item>
      Pepper
    </mat-list-item>
  </mat-list>`})
class ListWithAvatar extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item class="test-class" *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
    </mat-list-item>
  </mat-list>`})
class ListWithItemWithCssClass extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
      <p mat-line *ngIf="showThirdLine">Some other text</p>
    </mat-list-item>
  </mat-list>`})
class ListWithDynamicNumberOfLines extends BaseTestList { }

@Component({template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      {{item.name}}
    </mat-list-item>
  </mat-list>`})
class ListWithMultipleItems extends BaseTestList { }
