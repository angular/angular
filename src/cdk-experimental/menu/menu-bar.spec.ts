import {ComponentFixture, TestBed, waitForAsync, fakeAsync, tick} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  EventEmitter,
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  TAB,
  RIGHT_ARROW,
  LEFT_ARROW,
  DOWN_ARROW,
  UP_ARROW,
  SPACE,
  HOME,
  END,
  E,
  D,
  ESCAPE,
  S,
  H,
} from '@angular/cdk/keycodes';
import {
  dispatchKeyboardEvent,
  createKeyboardEvent,
  dispatchEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing/private';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenu} from './menu';
import {CdkMenuItem} from './menu-item';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {CdkMenuGroup} from './menu-group';

describe('MenuBar', () => {
  describe('as radio group', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menuItems: CdkMenuItemRadio[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(element => element.injector.get(CdkMenuItemRadio));
    }));

    it('should toggle menuitemradio items', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('radiogroup change events', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menuItems: CdkMenuItemRadio[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);

      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(element => element.injector.get(CdkMenuItemRadio));
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement
        .query(By.directive(CdkMenuBar))
        .injector.get(CdkMenuBar)
        .change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });

  describe('Keyboard handling', () => {
    describe('(with ltr layout)', () => {
      let fixture: ComponentFixture<MultiMenuWithSubmenu>;
      let nativeMenuBar: HTMLElement;
      let nativeMenus: HTMLElement[];
      let menuBarNativeItems: HTMLButtonElement[];
      let fileMenuNativeItems: HTMLButtonElement[];

      function grabElementsForTesting() {
        nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

        nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

        menuBarNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(0, 2); // menu bar has the first 2 menu items

        fileMenuNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(2, 5); // file menu has the next 3 menu items
      }

      /** Run change detection and extract then set the rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** Set focus to the MenuBar and run change detection. */
      function focusMenuBar() {
        dispatchKeyboardEvent(document, 'keydown', TAB);
        nativeMenuBar.focus();

        detectChanges();
      }

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule],
          declarations: [MultiMenuWithSubmenu],
        }).compileComponents();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(MultiMenuWithSubmenu);
        detectChanges();
      });

      describe('for MenuBar', () => {
        it('should focus the first menu item when the menubar gets tabbed in', () => {
          focusMenuBar();

          expect(document.activeElement).toEqual(menuBarNativeItems[0]);
        });

        it('should toggle the last/first menu item on end/home key press', () => {
          focusMenuBar();
          dispatchKeyboardEvent(nativeMenuBar, 'keydown', END);
          detectChanges();

          expect(document.activeElement).toEqual(menuBarNativeItems[menuBarNativeItems.length - 1]);

          focusMenuBar();
          dispatchKeyboardEvent(nativeMenuBar, 'keydown', HOME);
          detectChanges();

          expect(document.activeElement).toEqual(menuBarNativeItems[0]);
        });

        it('should not focus the last item when pressing end with modifier', () => {
          focusMenuBar();

          const event = createKeyboardEvent('keydown', END, '', {control: true});
          dispatchEvent(nativeMenuBar, event);
          detectChanges();

          expect(document.activeElement).toEqual(menuBarNativeItems[0]);
        });

        it('should not focus the first item when pressing home with modifier', () => {
          focusMenuBar();
          dispatchKeyboardEvent(nativeMenuBar, 'keydown', END);
          detectChanges();

          let event = createKeyboardEvent('keydown', HOME, '', {control: true});
          dispatchEvent(nativeMenuBar, event);
          detectChanges();

          expect(document.activeElement).toEqual(menuBarNativeItems[menuBarNativeItems.length - 1]);
        });

        it('should focus the edit MenuItem on E, D character keys', fakeAsync(() => {
          focusMenuBar();
          dispatchKeyboardEvent(nativeMenuBar, 'keydown', E);
          dispatchKeyboardEvent(nativeMenuBar, 'keydown', D);
          tick(500);
          detectChanges();

          expect(document.activeElement).toEqual(menuBarNativeItems[1]);
        }));

        it(
          'should toggle and wrap when cycling the right/left arrow keys on menu bar ' +
            'without toggling menus',
          () => {
            focusMenuBar();

            dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
            detectChanges();
            expect(document.activeElement).toEqual(menuBarNativeItems[1]);

            dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
            detectChanges();
            expect(document.activeElement).toEqual(menuBarNativeItems[0]);

            dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
            detectChanges();
            expect(document.activeElement).toEqual(menuBarNativeItems[1]);

            dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
            detectChanges();
            expect(document.activeElement).toEqual(menuBarNativeItems[0]);

            expect(nativeMenus.length).toBe(0);
          }
        );

        it('should toggle tabindex of menu bar items with left/right arrow keys', () => {
          focusMenuBar();

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
          detectChanges();
          expect(menuBarNativeItems[0].tabIndex).toEqual(-1);
          expect(menuBarNativeItems[1].tabIndex).toEqual(0);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
          detectChanges();
          expect(menuBarNativeItems[0].tabIndex).toEqual(0);
          expect(menuBarNativeItems[1].tabIndex).toEqual(-1);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
          detectChanges();
          expect(menuBarNativeItems[0].tabIndex).toEqual(-1);
          expect(menuBarNativeItems[1].tabIndex).toEqual(0);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
          detectChanges();
          expect(menuBarNativeItems[0].tabIndex).toEqual(0);
          expect(menuBarNativeItems[1].tabIndex).toEqual(-1);

          expect(nativeMenus.length).toBe(0);
        });

        it(
          "should open the focused menu item's menu and focus the first submenu" +
            ' item on the down key',
          () => {
            focusMenuBar();

            dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', DOWN_ARROW);
            detectChanges();

            expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
          }
        );

        it(
          "should open the focused menu item's menu and focus the last submenu" +
            ' item on the up key',
          () => {
            focusMenuBar();

            dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', UP_ARROW);
            detectChanges();

            expect(document.activeElement).toEqual(
              fileMenuNativeItems[fileMenuNativeItems.length - 1]
            );
          }
        );

        it('should open the focused menu items menu and focus first submenu item on space', () => {
          focusMenuBar();

          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
          detectChanges();

          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
        });

        it(
          'should set the tabindex to 0 on the active item and reset the previous active items ' +
            'to -1 when navigating down to a submenu and within it using the arrow keys',
          () => {
            focusMenuBar();

            expect(menuBarNativeItems[0].tabIndex).toEqual(0);

            dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
            detectChanges();

            expect(menuBarNativeItems[0].tabIndex).toEqual(-1);
            expect(fileMenuNativeItems[0].tabIndex).toEqual(0);

            dispatchKeyboardEvent(fileMenuNativeItems[0], 'keydown', DOWN_ARROW);
            detectChanges();

            expect(fileMenuNativeItems[0].tabIndex).toEqual(-1);
            expect(fileMenuNativeItems[1].tabIndex).toEqual(0);
          }
        );
      });

      describe('for Menu', () => {
        function openFileMenu() {
          focusMenuBar();
          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
          detectChanges();
        }

        function openShareMenu() {
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW);
          detectChanges();
        }

        it('should open the submenu with focus on item with menu on right arrow press', () => {
          openFileMenu();
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW);
          detectChanges();

          expect(nativeMenus.length).withContext('menu bar, menu and submenu').toBe(2);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(nativeMenus[1].id).toBe('share_menu');
        });

        it('should cycle focus on down/up arrow without toggling menus', () => {
          openFileMenu();
          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[1]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[2]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[1]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[2]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

          expect(nativeMenus.length).toBe(1);
        });

        it('should focus the first/last item on home/end keys', () => {
          openFileMenu();
          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', END);
          expect(document.activeElement).toEqual(
            fileMenuNativeItems[fileMenuNativeItems.length - 1]
          );

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', HOME);
          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
        });

        it('should not focus the last item when pressing end with modifier', () => {
          openFileMenu();

          const event = createKeyboardEvent('keydown', END, '', {control: true});
          dispatchEvent(nativeMenus[0], event);
          detectChanges();

          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
        });

        it('should not focus the first item when pressing home with modifier', () => {
          openFileMenu();
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', END);
          detectChanges();

          const event = createKeyboardEvent('keydown', HOME, '', {control: true});
          dispatchEvent(nativeMenus[0], event);
          detectChanges();

          expect(document.activeElement).toEqual(
            fileMenuNativeItems[fileMenuNativeItems.length - 1]
          );
        });

        it(
          'should call user defined function and close out menus on space key on a non-trigger ' +
            'menu item',
          () => {
            openFileMenu();
            openShareMenu();
            const spy = jasmine.createSpy('user defined callback spy');
            fixture.componentInstance.clickEmitter.subscribe(spy);

            dispatchKeyboardEvent(document.activeElement!, 'keydown', SPACE);
            detectChanges();

            expect(nativeMenus.length).toBe(0);
            expect(spy).toHaveBeenCalledTimes(1);
          }
        );

        it('should close the submenu on left arrow and place focus back on its trigger', () => {
          openFileMenu();
          openShareMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
        });

        it(
          'should close menu tree, focus next menu bar item and open its menu on right arrow ' +
            "when currently focused item doesn't trigger a menu",
          () => {
            openFileMenu();
            openShareMenu();

            dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW);
            detectChanges();

            expect(nativeMenus.length).toBe(1);
            expect(nativeMenus[0].id).toBe('edit_menu');
            expect(document.activeElement).toEqual(menuBarNativeItems[1]);
          }
        );

        it('should close first level menu and focus previous menubar item on left arrow', () => {
          openFileMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('edit_menu');
          expect(document.activeElement).toEqual(menuBarNativeItems[1]);
        });

        it('should close the open submenu and focus its trigger on escape press', () => {
          openFileMenu();
          openShareMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', ESCAPE);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(document.activeElement)
            .withContext('re-focus trigger')
            .toEqual(fileMenuNativeItems[1]);
        });

        it('should not close submenu and focus parent on escape with modifier', () => {
          openFileMenu();
          openShareMenu();
          const event = createKeyboardEvent('keydown', ESCAPE, '', {control: true});

          dispatchEvent(nativeMenus[1], event);
          detectChanges();

          expect(nativeMenus.length).withContext('menu bar, file menu, share menu').toBe(2);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(nativeMenus[1].id).toBe('share_menu');
        });

        it('should close out all menus on tab', () => {
          openFileMenu();
          openShareMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', TAB);
          detectChanges();

          expect(nativeMenus.length).toBe(0);
        });

        it('should focus share MenuItem on S, H character key press', fakeAsync(() => {
          openFileMenu();

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', S);
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', H);
          tick(500);
          detectChanges();

          expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
        }));

        it('should handle keyboard actions if initial menu is opened programmatically', () => {
          fixture.debugElement
              .queryAll(By.directive(CdkMenuItem))[0]
              .injector.get(CdkMenuItem)
              .getMenuTrigger()!
              .openMenu();
          detectChanges();
          fixture.debugElement
              .queryAll(By.directive(CdkMenuItem))[2]
              .injector.get(CdkMenuItem)
              .getMenuTrigger()!
              .openMenu();
          detectChanges();

          fileMenuNativeItems[0].focus();
          dispatchKeyboardEvent(fileMenuNativeItems[0], 'keydown', TAB);
          detectChanges();

          expect(nativeMenus.length).toBe(0);
        });
      });
    });

    describe('(with rtl layout)', () => {
      let fixture: ComponentFixture<MultiMenuWithSubmenu>;
      let nativeMenuBar: HTMLElement;
      let nativeMenus: HTMLElement[];
      let menuBarNativeItems: HTMLButtonElement[];
      let fileMenuNativeItems: HTMLButtonElement[];

      function grabElementsForTesting() {
        nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

        nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

        menuBarNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(0, 2); // menu bar has the first 2 menu items

        fileMenuNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(2, 5); // file menu has the next 3 menu items
      }

      /** Run change detection and extract then set the rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** Place focus on the MenuBar and run change detection. */
      function focusMenuBar() {
        dispatchKeyboardEvent(document, 'keydown', TAB);
        nativeMenuBar.focus();

        detectChanges();
      }

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule],
          declarations: [MultiMenuWithSubmenu],
        }).compileComponents();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(MultiMenuWithSubmenu);
        detectChanges();
      });

      beforeAll(() => {
        document.dir = 'rtl';
      });

      afterAll(() => {
        document.dir = 'ltr';
      });

      describe('for Menu', () => {
        function openFileMenu() {
          focusMenuBar();
          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
          detectChanges();
        }

        function openShareMenu() {
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW);
          detectChanges();
        }

        it('should open the submenu for menu item with menu on left arrow', () => {
          openFileMenu();
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW);
          detectChanges();

          expect(nativeMenus.length).withContext('menu and submenu').toBe(2);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(nativeMenus[1].id).toBe('share_menu');
        });

        it('should close the submenu and focus its trigger on right arrow', () => {
          openFileMenu();
          openShareMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('file_menu');
          expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
        });

        it(
          'should close menu tree, focus next menu bar item and open its menu on left arrow when ' +
            "focused item doesn't have a menu",
          () => {
            openFileMenu();
            openShareMenu();

            dispatchKeyboardEvent(document.activeElement!, 'keydown', LEFT_ARROW);
            detectChanges();

            expect(nativeMenus.length).toBe(1);
            expect(nativeMenus[0].id).toBe('edit_menu');
            expect(document.activeElement).toEqual(menuBarNativeItems[1]);
          }
        );

        it(
          'should close first level menu and focus the previous menubar item on right' +
            ' arrow press',
          () => {
            openFileMenu();

            dispatchKeyboardEvent(document.activeElement!, 'keydown', RIGHT_ARROW);
            detectChanges();

            expect(nativeMenus.length).toBe(1);
            expect(nativeMenus[0].id).toBe('edit_menu');
            expect(document.activeElement).toEqual(menuBarNativeItems[1]);
          }
        );
      });
    });

    describe('with menuitemcheckbox components', () => {
      let fixture: ComponentFixture<MenuWithCheckboxes>;
      let nativeMenuBar: HTMLElement;
      let nativeMenus: HTMLElement[];
      let menuBarNativeItems: HTMLButtonElement[];
      let fontMenuItems: CdkMenuItemCheckbox[];

      function grabElementsForTesting() {
        nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

        nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

        menuBarNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(0, 2); // menu bar has the first 2 menu items

        fontMenuItems = fixture.componentInstance.checkboxItems.toArray();
      }

      /** Run change detection and extract then set the rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** Place focus on the menu bar and run change detection. */
      function focusMenuBar() {
        dispatchKeyboardEvent(document, 'keydown', TAB);
        nativeMenuBar.focus();

        detectChanges();
      }

      function openFontMenu() {
        focusMenuBar();
        dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
        detectChanges();
      }

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule],
          declarations: [MenuWithCheckboxes],
        }).compileComponents();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(MenuWithCheckboxes);
        detectChanges();
      });

      it(
        'should set the checked state on the focused checkbox on space key and keep the' +
          ' menu open',
        () => {
          openFontMenu();

          dispatchKeyboardEvent(document.activeElement!, 'keydown', SPACE);
          detectChanges();

          expect(fontMenuItems[0].checked).toBeTrue();
          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('font_menu');
        }
      );
    });

    describe('with menuitemradio components', () => {
      let fixture: ComponentFixture<MenuWithRadioButtons>;
      let nativeMenuBar: HTMLElement;
      let nativeMenus: HTMLElement[];
      let menuBarNativeItems: HTMLButtonElement[];
      let fontMenuItems: CdkMenuItemRadio[];

      function grabElementsForTesting() {
        nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

        nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

        menuBarNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(0, 1); // menu bar only has a single item

        fontMenuItems = fixture.componentInstance.radioItems.toArray();
      }

      /** run change detection and, extract and set the rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** set focus the the MenuBar and run change detection. */
      function focusMenuBar() {
        dispatchKeyboardEvent(document, 'keydown', TAB);
        nativeMenuBar.focus();

        detectChanges();
      }

      function openFontMenu() {
        focusMenuBar();
        dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
        detectChanges();
      }

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule],
          declarations: [MenuWithRadioButtons],
        }).compileComponents();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(MenuWithRadioButtons);
        detectChanges();
      });

      it(
        'should set the checked state on the active radio button on space key and keep the' +
          ' menu open',
        () => {
          openFontMenu();

          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(document.activeElement!, 'keydown', SPACE);
          detectChanges();

          expect(fontMenuItems[1].checked).toBeTrue();
          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('text_menu');
        }
      );
    });
  });

  describe('background click closeout', () => {
    let fixture: ComponentFixture<MenuBarWithMenusAndInlineMenu>;

    let popoutMenus: CdkMenu[];
    let triggers: CdkMenuItemTrigger[];
    let nativeInlineMenuItem: HTMLElement;

    /** open the attached menu. */
    function openMenu() {
      triggers[0].toggle();
      detectChanges();
    }

    /** set the menus and triggers arrays. */
    function grabElementsForTesting() {
      popoutMenus = fixture.componentInstance.menus.toArray().filter(el => !el._isInline());
      triggers = fixture.componentInstance.triggers.toArray();
      nativeInlineMenuItem = fixture.componentInstance.nativeInlineMenuItem.nativeElement;
    }

    /** run change detection and, extract and set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarWithMenusAndInlineMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuBarWithMenusAndInlineMenu);
      detectChanges();
    });

    it('should close out all open menus when clicked outside the menu tree', () => {
      openMenu();
      expect(popoutMenus.length).toBe(1);


      fixture.debugElement.query(By.css('#container')).nativeElement.click();
      detectChanges();

      expect(popoutMenus.length).toBe(0);
    });

    it('should not close open menus when clicking on a menu group', () => {
      openMenu();
      expect(popoutMenus.length).toBe(1);

      const menuGroups = fixture.debugElement.queryAll(By.directive(CdkMenuGroup));
      menuGroups[2].nativeElement.click();
      detectChanges();

      expect(popoutMenus.length).toBe(1);
    });

    it('should not close open menus when clicking on a menu', () => {
      openMenu();
      expect(popoutMenus.length).toBe(1);

      fixture.debugElement.query(By.directive(CdkMenu)).nativeElement.click();
      detectChanges();

      expect(popoutMenus.length).toBe(1);
    });

    it('should not close when clicking on a CdkMenuItemCheckbox element', () => {
      openMenu();
      expect(popoutMenus.length).toBe(1);

      fixture.debugElement.query(By.directive(CdkMenuItemCheckbox)).nativeElement.click();
      fixture.detectChanges();

      expect(popoutMenus.length).toBe(1);
    });

    it('should not close when clicking on a non-menu element inside menu', () => {
      openMenu();
      expect(popoutMenus.length).toBe(1);

      fixture.debugElement.query(By.css('#inner-element')).nativeElement.click();
      detectChanges();

      expect(popoutMenus.length)
        .withContext('menu should stay open if clicking on an inner span element')
        .toBe(1);
    });

    it('should close the open menu when clicking on an inline menu item', () => {
      openMenu();

      nativeInlineMenuItem.click();
      detectChanges();

      expect(popoutMenus.length).toBe(0);
    });
  });

  describe('Mouse handling', () => {
    let fixture: ComponentFixture<MultiMenuWithSubmenu>;
    let nativeMenus: HTMLElement[];
    let menuBarNativeItems: HTMLButtonElement[];
    let fileMenuNativeItems: HTMLButtonElement[];
    let shareMenuNativeItems: HTMLButtonElement[];

    /** Get menus and items used for tests. */
    function grabElementsForTesting() {
      nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

      menuBarNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(0, 2); // menu bar has the first 2 menu items

      fileMenuNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(2, 5); // file menu has the next 3 menu items

      shareMenuNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(5, 7); // share menu has the next 2 menu items
    }

    /** Run change detection and extract then set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    /** Mock mouse events required to open the file menu. */
    function openFileMenu() {
      dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
      dispatchMouseEvent(menuBarNativeItems[0], 'click');
      dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
      detectChanges();
    }

    /** Mock mouse events required to open the share menu. */
    function openShareMenu() {
      dispatchMouseEvent(fileMenuNativeItems[1], 'mouseenter');
      detectChanges();
    }

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MultiMenuWithSubmenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiMenuWithSubmenu);
      detectChanges();
    });

    it('should toggle menu from menu bar when clicked', () => {
      openFileMenu();

      expect(nativeMenus.length).toBe(1);
      expect(nativeMenus[0].id).toBe('file_menu');

      dispatchMouseEvent(menuBarNativeItems[0], 'click');
      detectChanges();

      expect(nativeMenus.length).toBe(0);
    });

    it('should not open menu when hovering over trigger in menu bar with no open siblings', () => {
      dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
      detectChanges();

      expect(nativeMenus.length).toBe(0);
    });

    it(
      'should not change focused items when hovering over trigger in menu bar with no open ' +
        'siblings',
      () => {
        dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
        detectChanges();

        expect(document.querySelector(':focus')).not.toEqual(menuBarNativeItems[0]);
        expect(document.querySelector(':focus')).not.toEqual(menuBarNativeItems[1]);
      }
    );

    it(
      'should toggle open menus in menu bar if sibling is open when mouse moves from one item ' +
        'to the other',
      () => {
        openFileMenu();

        dispatchMouseEvent(menuBarNativeItems[1], 'mouseenter');
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('edit_menu');

        dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('file_menu');

        dispatchMouseEvent(menuBarNativeItems[1], 'mouseenter');
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('edit_menu');
      }
    );

    it('should not close the menu when re-hovering the trigger', () => {
      openFileMenu();

      dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');

      expect(nativeMenus.length).toBe(1);
      expect(nativeMenus[0].id).toBe('file_menu');
    });

    it('should open a submenu when hovering over a trigger in a menu with no siblings open', () => {
      openFileMenu();

      openShareMenu();

      expect(nativeMenus.length).toBe(2);
      expect(nativeMenus[0].id).toBe('file_menu');
      expect(nativeMenus[1].id).toBe('share_menu');
    });

    it('should close menu when hovering over non-triggering sibling menu item', () => {
      openFileMenu();
      openShareMenu();

      dispatchMouseEvent(fileMenuNativeItems[0], 'mouseenter');
      detectChanges();

      expect(nativeMenus.length).toBe(1);
      expect(nativeMenus[0].id).toBe('file_menu');
    });

    it('should retain open menus when hovering over root level trigger which opened them', () => {
      openFileMenu();
      openShareMenu();

      dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
      detectChanges();

      expect(nativeMenus.length).toBe(2);
    });

    it('should close out the menu tree when hovering over sibling item in menu bar', () => {
      openFileMenu();
      openShareMenu();

      dispatchMouseEvent(menuBarNativeItems[1], 'mouseenter');
      detectChanges();

      expect(nativeMenus.length).toBe(1);
      expect(nativeMenus[0].id).toBe('edit_menu');
    });

    it('should close out the menu tree when clicking a non-triggering menu item', () => {
      openFileMenu();
      openShareMenu();

      dispatchMouseEvent(shareMenuNativeItems[0], 'mouseenter');
      dispatchMouseEvent(shareMenuNativeItems[0], 'click');
      detectChanges();

      expect(nativeMenus.length).toBe(0);
    });

    it(
      'should allow keyboard down arrow to focus next item after mouse sets focus to' +
        ' initial item',
      () => {
        openFileMenu();
        dispatchMouseEvent(fileMenuNativeItems[0], 'mouseenter');
        detectChanges();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);

        expect(document.querySelector(':focus')).toEqual(fileMenuNativeItems[1]);
      }
    );

    it(
      'should not re-open a menu when hovering over the trigger in the menubar after clicking to ' +
        'open and then close it',
      () => {
        openFileMenu();
        dispatchMouseEvent(menuBarNativeItems[0], 'click');
        detectChanges();

        dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
        detectChanges();

        expect(nativeMenus.length).toBe(0);
      }
    );

    it(
      'should not set the tabindex when hovering over menubar item and there is no open' +
        ' sibling menu',
      () => {
        dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
        detectChanges();

        expect(menuBarNativeItems[0].tabIndex).toBe(-1);
      }
    );

    it(
      'should set the tabindex of the opened trigger to 0 and toggle tabindex' +
        ' when hovering between items',
      () => {
        openFileMenu();

        expect(menuBarNativeItems[0].tabIndex).toBe(0);

        dispatchMouseEvent(menuBarNativeItems[1], 'mouseenter');
        detectChanges();

        expect(menuBarNativeItems[0].tabIndex).toBe(-1);
        expect(menuBarNativeItems[1].tabIndex).toBe(0);

        dispatchMouseEvent(menuBarNativeItems[0], 'mouseenter');
        detectChanges();

        expect(menuBarNativeItems[0].tabIndex).toBe(0);
        expect(menuBarNativeItems[1].tabIndex).toBe(-1);
      }
    );

    it(
      'should set the tabindex to 0 on the active item and reset the previous active items ' +
        'to -1 when navigating down to a submenu and within it using a mouse',
      () => {
        openFileMenu();
        expect(menuBarNativeItems[0].tabIndex).toBe(0);

        dispatchMouseEvent(fileMenuNativeItems[0], 'mouseenter');
        dispatchMouseEvent(menuBarNativeItems[0], 'mouseout');
        detectChanges();

        expect(menuBarNativeItems[0].tabIndex).toBe(-1);
        expect(fileMenuNativeItems[0].tabIndex).toBe(0);

        dispatchMouseEvent(fileMenuNativeItems[1], 'mouseenter');
        detectChanges();

        expect(fileMenuNativeItems[0].tabIndex).toBe(-1);
        expect(fileMenuNativeItems[1].tabIndex).toBe(0);
      }
    );
  });
});

@Component({
  template: `
    <ul cdkMenuBar>
      <li role="none">
        <button checked="true" cdkMenuItemRadio>
          first
        </button>
      </li>
      <li role="none">
        <button cdkMenuItemRadio>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuBarRadioGroup {}

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
        <button cdkMenuItem [cdkMenuTriggerFor]="edit">Edit</button>
      </div>

      <ng-template cdkMenuPanel #file="cdkMenuPanel">
        <div cdkMenu id="file_menu" [cdkMenuPanel]="file">
          <button cdkMenuItem>Save</button>
          <button cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
          <button cdkMenuItem>Open</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #share="cdkMenuPanel">
        <div cdkMenu id="share_menu" [cdkMenuPanel]="share">
          <button (cdkMenuItemTriggered)="clickEmitter.next()" cdkMenuItem>Email</button>
          <button cdkMenuItem>Chat</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #edit="cdkMenuPanel">
        <div cdkMenu id="edit_menu" [cdkMenuPanel]="edit">
          <button cdkMenuItem>Undo</button>
          <button cdkMenuItem>Redo</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MultiMenuWithSubmenu {
  clickEmitter = new EventEmitter<void>();
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;
}

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="font">Font size</button>
      </div>

      <ng-template cdkMenuPanel #font="cdkMenuPanel">
        <div cdkMenu id="font_menu" [cdkMenuPanel]="font">
          <button cdkMenuItemCheckbox>Small</button>
          <button cdkMenuItemCheckbox>Large</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MenuWithCheckboxes {
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItemCheckbox) checkboxItems: QueryList<CdkMenuItemCheckbox>;
}

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="text">Text</button>
      </div>

      <ng-template cdkMenuPanel #text="cdkMenuPanel">
        <div cdkMenu id="text_menu" [cdkMenuPanel]="text">
          <button cdkMenuItemRadio>Bold</button>
          <button cdkMenuItemRadio>Italic</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MenuWithRadioButtons {
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItemRadio) radioItems: QueryList<CdkMenuItemRadio>;
}

@Component({
  template: `
    <div id="container">
      <div cdkMenuBar>
        <button cdkMenuItem [cdkMenuTriggerFor]="sub1">Trigger</button>
      </div>

      <ng-template cdkMenuPanel #sub1="cdkMenuPanel">
        <div cdkMenu [cdkMenuPanel]="sub1">
          <div cdkMenuGroup>
            <button cdkMenuItemCheckbox>Trigger</button>
            <span id="inner-element">A nested non-menuitem element</span>
          </div>
        </div>
      </ng-template>
    </div>

    <div cdkMenu>
      <button #inline_menu_item cdkMenuItem></button>
    </div>
  `,
})
class MenuBarWithMenusAndInlineMenu {
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;

  @ViewChildren(CdkMenuItemTrigger) triggers: QueryList<CdkMenuItemTrigger>;

  @ViewChild('inline_menu_item') nativeInlineMenuItem: ElementRef;
}
