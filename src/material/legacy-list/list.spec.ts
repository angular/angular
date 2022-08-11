import {fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {dispatchFakeEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';
import {Component, QueryList, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatLegacyListItem, MatLegacyListModule} from './index';

describe('MatList', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyListModule],
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
        ActionListWithoutType,
        ActionListWithType,
        ListWithDisabledItems,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should not apply any additional class to a list without lines', () => {
    const fixture = TestBed.createComponent(ListWithOneItem);
    const listItem = fixture.debugElement.query(By.css('mat-list-item'))!;
    fixture.detectChanges();
    expect(listItem.nativeElement.classList.length).toBe(2);
    expect(listItem.nativeElement.classList).toContain('mat-list-item');

    // This spec also ensures the focus indicator is present.
    expect(listItem.nativeElement.classList).toContain('mat-focus-indicator');
  });

  it('should apply a particular class to lists with two lines', () => {
    const fixture = TestBed.createComponent(ListWithTwoLineItem);
    fixture.detectChanges();

    const listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-2-line');
    expect(listItems[1].nativeElement.className).toContain('mat-2-line');
  });

  it('should apply a particular class to lists with three lines', () => {
    const fixture = TestBed.createComponent(ListWithThreeLineItem);
    fixture.detectChanges();

    const listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-3-line');
    expect(listItems[1].nativeElement.className).toContain('mat-3-line');
  });

  it('should apply a particular class to lists with more than 3 lines', () => {
    const fixture = TestBed.createComponent(ListWithManyLines);
    fixture.detectChanges();

    const listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-multi-line');
    expect(listItems[1].nativeElement.className).toContain('mat-multi-line');
  });

  it('should apply a class to list items with avatars', () => {
    const fixture = TestBed.createComponent(ListWithAvatar);
    fixture.detectChanges();

    const listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.className).toContain('mat-list-item-with-avatar');
    expect(listItems[1].nativeElement.className).not.toContain('mat-list-item-with-avatar');
  });

  it('should not clear custom classes provided by user', () => {
    const fixture = TestBed.createComponent(ListWithItemWithCssClass);
    fixture.detectChanges();

    const listItems = fixture.debugElement.children[0].queryAll(By.css('mat-list-item'));
    expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
  });

  it('should update classes if number of lines change', () => {
    const fixture = TestBed.createComponent(ListWithDynamicNumberOfLines);
    fixture.debugElement.componentInstance.showThirdLine = false;
    fixture.detectChanges();

    const listItem = fixture.debugElement.children[0].query(By.css('mat-list-item'))!;
    expect(listItem.nativeElement.classList.length).toBe(3);
    expect(listItem.nativeElement.classList).toContain('mat-2-line');
    expect(listItem.nativeElement.classList).toContain('mat-list-item');
    expect(listItem.nativeElement.classList).toContain('mat-focus-indicator');

    fixture.debugElement.componentInstance.showThirdLine = true;
    fixture.detectChanges();
    expect(listItem.nativeElement.className).toContain('mat-3-line');
  });

  it('should not apply aria roles to mat-list', () => {
    const fixture = TestBed.createComponent(ListWithMultipleItems);
    fixture.detectChanges();

    const list = fixture.debugElement.children[0];
    const listItem = fixture.debugElement.children[0].query(By.css('mat-list-item'))!;
    expect(list.nativeElement.getAttribute('role'))
      .withContext('Expect mat-list no role')
      .toBeNull();
    expect(listItem.nativeElement.getAttribute('role'))
      .withContext('Expect mat-list-item no role')
      .toBeNull();
  });

  it('should apply role="navigation" to mat-nav-list', () => {
    const fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const list = fixture.debugElement.children[0];
    expect(list.nativeElement.getAttribute('role'))
      .withContext('Expect mat-nav-list to have navigation role')
      .toBe('navigation');
  });

  it('should apply role="group" to mat-action-list', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const list = fixture.debugElement.children[0];
    expect(list.nativeElement.getAttribute('role'))
      .withContext('Expect mat-action-list to have group role')
      .toBe('group');
  });

  it('should not show ripples for non-nav lists', () => {
    const fixture = TestBed.createComponent(ListWithOneAnchorItem);
    fixture.detectChanges();

    const items: QueryList<MatLegacyListItem> = fixture.debugElement.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);
    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
  });

  it('should allow disabling ripples for specific nav-list items', () => {
    const fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);

    // Ripples should be enabled by default, and can be disabled with a binding.
    items.forEach(item => expect(item._isRippleDisabled()).toBe(false));

    fixture.componentInstance.disableItemRipple = true;
    fixture.detectChanges();

    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
  });

  it('should create an action list', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);
  });

  it('should set the proper class on the action list host', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('mat-action-list');
    expect(host.classList).toContain('mat-action-list');
  });

  it('should enable ripples for action lists by default', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.toArray().every(item => !item._isRippleDisabled())).toBe(true);
  });

  it('should allow disabling ripples for specific action list items', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems.toArray();
    expect(items.length).toBeGreaterThan(0);

    expect(items.every(item => !item._isRippleDisabled())).toBe(true);

    fixture.componentInstance.disableItemRipple = true;
    fixture.detectChanges();

    expect(items.every(item => item._isRippleDisabled())).toBe(true);
  });

  it('should set default type attribute to button for action list', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const listItemEl = fixture.debugElement.query(By.css('.mat-list-item'))!;
    expect(listItemEl.nativeElement.getAttribute('type')).toBe('button');
  });

  it('should not change type attribute if it is already specified', () => {
    const fixture = TestBed.createComponent(ActionListWithType);
    fixture.detectChanges();

    const listItemEl = fixture.debugElement.query(By.css('.mat-list-item'))!;
    expect(listItemEl.nativeElement.getAttribute('type')).toBe('submit');
  });

  it('should allow disabling ripples for the whole nav-list', () => {
    const fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems;
    expect(items.length).toBeGreaterThan(0);

    // Ripples should be enabled by default, and can be disabled with a binding.
    items.forEach(item => expect(item._isRippleDisabled()).toBe(false));

    fixture.componentInstance.disableListRipple = true;
    fixture.detectChanges();

    items.forEach(item => expect(item._isRippleDisabled()).toBe(true));
  });

  it('should allow disabling ripples for the entire action list', () => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const items = fixture.componentInstance.listItems.toArray();
    expect(items.length).toBeGreaterThan(0);

    expect(items.every(item => !item._isRippleDisabled())).toBe(true);

    fixture.componentInstance.disableListRipple = true;
    fixture.detectChanges();

    expect(items.every(item => item._isRippleDisabled())).toBe(true);
  });

  it('should disable item ripples when list ripples are disabled via the input in nav list', fakeAsync(() => {
    const fixture = TestBed.createComponent(NavListWithOneAnchorItem);
    fixture.detectChanges();

    const rippleTarget = fixture.nativeElement.querySelector('.mat-list-item-content');

    dispatchMouseEvent(rippleTarget, 'mousedown');
    dispatchMouseEvent(rippleTarget, 'mouseup');

    // Flush the ripple enter animation.
    dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected ripples to be enabled by default.')
      .toBe(1);

    // Flush the ripple exit animation.
    dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected ripples to go away.')
      .toBe(0);

    fixture.componentInstance.disableListRipple = true;
    fixture.detectChanges();

    dispatchMouseEvent(rippleTarget, 'mousedown');
    dispatchMouseEvent(rippleTarget, 'mouseup');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected no ripples after list ripples are disabled.')
      .toBe(0);
  }));

  it('should disable item ripples when list ripples are disabled via the input in an action list', fakeAsync(() => {
    const fixture = TestBed.createComponent(ActionListWithoutType);
    fixture.detectChanges();

    const rippleTarget = fixture.nativeElement.querySelector('.mat-list-item-content');

    dispatchMouseEvent(rippleTarget, 'mousedown');
    dispatchMouseEvent(rippleTarget, 'mouseup');

    // Flush the ripple enter animation.
    dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected ripples to be enabled by default.')
      .toBe(1);

    // Flush the ripple exit animation.
    dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected ripples to go away.')
      .toBe(0);

    fixture.componentInstance.disableListRipple = true;
    fixture.detectChanges();

    dispatchMouseEvent(rippleTarget, 'mousedown');
    dispatchMouseEvent(rippleTarget, 'mouseup');

    expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected no ripples after list ripples are disabled.')
      .toBe(0);
  }));

  it('should be able to disable a single list item', () => {
    const fixture = TestBed.createComponent(ListWithDisabledItems);
    const listItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-list-item'),
    );
    fixture.detectChanges();

    expect(
      listItems.map(item => {
        return item.classList.contains('mat-list-item-disabled');
      }),
    ).toEqual([false, false, false]);

    fixture.componentInstance.firstItemDisabled = true;
    fixture.detectChanges();

    expect(
      listItems.map(item => {
        return item.classList.contains('mat-list-item-disabled');
      }),
    ).toEqual([true, false, false]);
  });

  it('should be able to disable the entire list', () => {
    const fixture = TestBed.createComponent(ListWithDisabledItems);
    const listItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-list-item'),
    );
    fixture.detectChanges();

    expect(listItems.every(item => item.classList.contains('mat-list-item-disabled'))).toBe(false);

    fixture.componentInstance.listDisabled = true;
    fixture.detectChanges();

    expect(listItems.every(item => item.classList.contains('mat-list-item-disabled'))).toBe(true);
  });
});

class BaseTestList {
  items: any[] = [
    {'name': 'Paprika', 'description': 'A seasoning'},
    {'name': 'Pepper', 'description': 'Another seasoning'},
  ];

  showThirdLine: boolean = false;
}

@Component({
  template: `
  <mat-list>
    <a mat-list-item>
      Paprika
    </a>
  </mat-list>`,
})
class ListWithOneAnchorItem extends BaseTestList {
  // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
  // it doesn't get populated.
  @ViewChildren(MatLegacyListItem) listItems: QueryList<MatLegacyListItem>;
}

@Component({
  template: `
  <mat-nav-list [disableRipple]="disableListRipple">
    <a mat-list-item [disableRipple]="disableItemRipple">
      Paprika
    </a>
  </mat-nav-list>`,
})
class NavListWithOneAnchorItem extends BaseTestList {
  @ViewChildren(MatLegacyListItem) listItems: QueryList<MatLegacyListItem>;
  disableItemRipple: boolean = false;
  disableListRipple: boolean = false;
}

@Component({
  template: `
  <mat-action-list [disableRipple]="disableListRipple">
    <button mat-list-item [disableRipple]="disableItemRipple">
      Paprika
    </button>
  </mat-action-list>`,
})
class ActionListWithoutType extends BaseTestList {
  @ViewChildren(MatLegacyListItem) listItems: QueryList<MatLegacyListItem>;
  disableListRipple = false;
  disableItemRipple = false;
}

@Component({
  template: `
  <mat-action-list>
    <button mat-list-item type="submit">
      Paprika
    </button>
  </mat-action-list>`,
})
class ActionListWithType extends BaseTestList {
  @ViewChildren(MatLegacyListItem) listItems: QueryList<MatLegacyListItem>;
}

@Component({
  template: `
  <mat-list>
    <mat-list-item>
      Paprika
    </mat-list-item>
  </mat-list>`,
})
class ListWithOneItem extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <img src="">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
    </mat-list-item>
  </mat-list>`,
})
class ListWithTwoLineItem extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
      <p mat-line>Some other text</p>
    </mat-list-item>
  </mat-list>`,
})
class ListWithThreeLineItem extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>Line 1</h3>
      <p mat-line>Line 2</p>
      <p mat-line>Line 3</p>
      <p mat-line>Line 4</p>
    </mat-list-item>
  </mat-list>`,
})
class ListWithManyLines extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item>
      <img src="" mat-list-avatar>
      Paprika
    </mat-list-item>
    <mat-list-item>
      Pepper
    </mat-list-item>
  </mat-list>`,
})
class ListWithAvatar extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item class="test-class" *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
    </mat-list-item>
  </mat-list>`,
})
class ListWithItemWithCssClass extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      <h3 mat-line>{{item.name}}</h3>
      <p mat-line>{{item.description}}</p>
      <p mat-line *ngIf="showThirdLine">Some other text</p>
    </mat-list-item>
  </mat-list>`,
})
class ListWithDynamicNumberOfLines extends BaseTestList {}

@Component({
  template: `
  <mat-list>
    <mat-list-item *ngFor="let item of items">
      {{item.name}}
    </mat-list-item>
  </mat-list>`,
})
class ListWithMultipleItems extends BaseTestList {}

@Component({
  template: `
  <mat-list [disabled]="listDisabled">
    <mat-list-item [disabled]="firstItemDisabled">One</mat-list-item>
    <mat-list-item>Two</mat-list-item>
    <mat-list-item>Three</mat-list-item>
  </mat-list>`,
})
class ListWithDisabledItems {
  firstItemDisabled = false;
  listDisabled = false;
}
