import {Platform} from '@angular/cdk/platform';
import {inject} from '@angular/core/testing';
import {InteractivityChecker} from './interactivity-checker';

describe('InteractivityChecker', () => {
  let platform: Platform;
  let testContainerElement: HTMLElement;
  let checker: InteractivityChecker;

  beforeEach(inject([Platform, InteractivityChecker], (p: Platform, i: InteractivityChecker) => {
    testContainerElement = document.createElement('div');
    document.body.appendChild(testContainerElement);
    platform = p;
    checker = i;
  }));

  afterEach(() => {
    document.body.removeChild(testContainerElement);
    testContainerElement.innerHTML = '';
  });

  describe('isDisabled', () => {
    it('should return true for disabled elements', () => {
      const elements = createElements('input', 'textarea', 'select', 'button', 'mat-checkbox');
      elements.forEach(el => el.setAttribute('disabled', ''));
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isDisabled(el))
            .toBe(true, `Expected <${el.nodeName} disabled> to be disabled`);
      });
    });

    it('should return false for elements without disabled', () => {
      const elements = createElements('input', 'textarea', 'select', 'button', 'mat-checkbox');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isDisabled(el))
            .toBe(false, `Expected <${el.nodeName}> not to be disabled`);
      });
    });
  });

  describe('isVisible', () => {
    it('should return false for a `display: none` element', () => {
      testContainerElement.innerHTML =
          `<input style="display: none;">`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `display: none` to not be visible');
    });

    it('should return false for the child of a `display: none` element', () => {
      testContainerElement.innerHTML =
        `<div style="display: none;">
           <input>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `display: none` parent to not be visible');
    });

    it('should return false for a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
          `<input style="visibility: hidden;">`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `visibility: hidden` to not be visible');
    });

    it('should return false for the child of a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <input>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `visibility: hidden` parent to not be visible');
    });

    it('should return true for an element with `visibility: hidden` ancestor and *closer* ' +
        '`visibility: visible` ancestor', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <div style="visibility: visible;">
             <input>
           </div>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(true, 'Expected element with `visibility: hidden` ancestor and closer ' +
              '`visibility: visible` ancestor to be visible');
    });

    it('should return true for an element without visibility modifiers', () => {
      const input = document.createElement('input');
      testContainerElement.appendChild(input);

      expect(checker.isVisible(input))
          .toBe(true, 'Expected element without visibility modifiers to be visible');
    });
  });

  describe('isFocusable', () => {
    it('should return true for native form controls', () => {
      const elements = createElements('input', 'textarea', 'select', 'button');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el)).toBe(true, `Expected <${el.nodeName}> to be focusable`);
      });
    });

    it('should return true for an anchor with an href', () => {
      const anchor = document.createElement('a');
      anchor.href = 'google.com';
      testContainerElement.appendChild(anchor);

      expect(checker.isFocusable(anchor)).toBe(true, `Expected <a> with href to be focusable`);
    });

    it('should return false for an anchor without an href', () => {
      const anchor = document.createElement('a');
      testContainerElement.appendChild(anchor);

      expect(checker.isFocusable(anchor))
          .toBe(false, `Expected <a> without href not to be focusable`);
    });

    it('should return false for disabled form controls', () => {
      const elements = createElements('input', 'textarea', 'select', 'button');
      elements.forEach(el => el.setAttribute('disabled', ''));
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el))
            .toBe(false, `Expected <${el.nodeName} disabled> not to be focusable`);
      });
    });

    it('should return false for a `display: none` element', () => {
      testContainerElement.innerHTML =
          `<input style="display: none;">`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `display: none` to not be visible');
    });

    it('should return false for the child of a `display: none` element', () => {
      testContainerElement.innerHTML =
        `<div style="display: none;">
           <input>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `display: none` parent to not be visible');
    });

    it('should return false for a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
          `<input style="visibility: hidden;">`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `visibility: hidden` not to be focusable');
    });

    it('should return false for the child of a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <input>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `visibility: hidden` parent not to be focusable');
    });

    it('should return true for an element with `visibility: hidden` ancestor and *closer* ' +
        '`visibility: visible` ancestor', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <div style="visibility: visible;">
             <input>
           </div>
         </div>`;
      const input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(true, 'Expected element with `visibility: hidden` ancestor and closer ' +
              '`visibility: visible` ancestor to be focusable');
    });

    it('should return false for an element with an empty tabindex', () => {
      const element = document.createElement('div');
      element.setAttribute('tabindex', '');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(false, `Expected element with tabindex="" not to be focusable`);
    });

    it('should return false for an element with a non-numeric tabindex', () => {
      const element = document.createElement('div');
      element.setAttribute('tabindex', 'abba');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(false, `Expected element with non-numeric tabindex not to be focusable`);
    });

    it('should return true for an element with contenteditable', () => {
      const element = document.createElement('div');
      element.setAttribute('contenteditable', '');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(true, `Expected element with contenteditable to be focusable`);
    });


    it('should return false for inert div and span', () => {
      const elements = createElements('div', 'span');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el))
            .toBe(false, `Expected <${el.nodeName}> not to be focusable`);
      });
    });


  });

  describe('isTabbable', () => {

    it('should respect the tabindex for video elements with controls', () => {
      // Do not run for Blink, Firefox and iOS because those treat video elements
      // with controls different and are covered in other tests.
      if (platform.BLINK || platform.FIREFOX || platform.IOS) {
        return;
      }

      const video = createFromTemplate('<video controls>', true);

      expect(checker.isTabbable(video)).toBe(true);

      video.tabIndex = -1;

      expect(checker.isTabbable(video)).toBe(false);
    });

    it('should always mark video elements with controls as tabbable (BLINK & FIREFOX)', () => {
      // Only run this spec for Blink and Firefox, because those always treat video
      // elements with controls as tabbable.
      if (!platform.BLINK && !platform.FIREFOX) {
        return;
      }

      const video = createFromTemplate('<video controls>', true);

      expect(checker.isTabbable(video)).toBe(true);

      video.tabIndex = -1;

      expect(checker.isTabbable(video)).toBe(true);
    });

    // Some tests should not run inside of iOS browsers, because those only allow specific
    // elements to be tabbable and cause the tests to always fail.
    describe('for non-iOS browsers', () => {
      let shouldSkip: boolean;

      beforeEach(() => {
        shouldSkip = platform.IOS;
      });

      it('should mark form controls and anchors without tabindex attribute as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        const elements = createElements('input', 'textarea', 'select', 'button', 'a');
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el)).toBe(true, `Expected <${el.nodeName}> to be tabbable`);
        });
      });

      it('should return true for div and span with tabindex == 0', () => {
        if (shouldSkip) {
          return;
        }

        const elements = createElements('div', 'span');

        elements.forEach(el => el.setAttribute('tabindex', '0'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isFocusable(el))
            .toBe(true, `Expected <${el.nodeName} tabindex="0"> to be focusable`);
        });
      });

      it('should return false for native form controls and anchor with tabindex == -1', () => {
        if (shouldSkip) {
          return;
        }

        const elements = createElements('input', 'textarea', 'select', 'button', 'a');

        elements.forEach(el => el.setAttribute('tabindex', '-1'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el))
            .toBe(false, `Expected <${el.nodeName} tabindex="-1"> not to be tabbable`);
        });
      });

      it('should return true for div and span with tabindex == 0', () => {
        if (shouldSkip) {
          return;
        }

        const elements = createElements('div', 'span');

        elements.forEach(el => el.setAttribute('tabindex', '0'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el))
            .toBe(true, `Expected <${el.nodeName} tabindex="0"> to be tabbable`);
        });
      });

      it('should respect the inherited tabindex inside of frame elements', () => {
        if (shouldSkip) {
          return;
        }

        const iframe = createFromTemplate('<iframe>', true) as HTMLFrameElement;
        const button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([iframe]);

        iframe.setAttribute('tabindex', '-1');
        iframe.contentDocument!.body.appendChild(button);

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);

        iframe.removeAttribute('tabindex');

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(true);
      });

      it('should carefully try to access the frame element of an elements window', () => {
        if (shouldSkip) {
          return;
        }

        const iframe = createFromTemplate('<iframe>', true) as HTMLFrameElement;
        const button = createFromTemplate('<button tabindex="1">Not Tabbable</button>');

        appendElements([iframe]);

        iframe.setAttribute('tabindex', '-1');
        iframe.contentDocument!.body.appendChild(button);

        // Some browsers explicitly prevent overwriting of properties on a `Window` object.
        if (!platform.SAFARI) {
          Object.defineProperty(iframe.contentWindow, 'frameElement', {
            get: () => { throw 'Access Denied!'; }
          });
        }

        expect(() => checker.isTabbable(button)).not.toThrow();
      });

      it('should mark elements which are contentEditable as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        const editableEl = createFromTemplate('<div contenteditable="true">', true);

        expect(checker.isTabbable(editableEl)).toBe(true);

        editableEl.tabIndex = -1;

        expect(checker.isTabbable(editableEl)).toBe(false);
      });

      it('should never mark iframe elements as tabbable', () => {
        if (!shouldSkip) {
          const iframe = createFromTemplate('<iframe>', true);

          // iFrame elements will be never marked as tabbable, because it depends on the content
          // which is mostly not detectable due to CORS and also the checks will be not reliable.
          expect(checker.isTabbable(iframe)).toBe(false);
        }
      });

      it('should always mark audio elements without controls as not tabbable', () => {
        if (!shouldSkip) {
          const audio = createFromTemplate('<audio>', true);

          expect(checker.isTabbable(audio)).toBe(false);
        }
      });

    });

    describe('for Blink and Webkit browsers', () => {
      let shouldSkip: boolean;

      beforeEach(() => {
        shouldSkip = !platform.BLINK && !platform.WEBKIT;
      });

      it('should not mark elements inside of object frames as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        const objectEl = createFromTemplate('<object>', true) as HTMLObjectElement;
        const button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([objectEl]);

        // This creates an empty contentDocument for the frame element.
        objectEl.type = 'text/html';
        objectEl.contentDocument!.body.appendChild(button);

        expect(checker.isTabbable(objectEl)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);
      });

      it('should not mark elements inside of invisible frames as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        const iframe = createFromTemplate('<iframe>', true) as HTMLFrameElement;
        const button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([iframe]);

        iframe.style.display = 'none';
        iframe.contentDocument!.body.appendChild(button);

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);
      });

      it('should never mark object frame elements as tabbable', () => {
        if (!shouldSkip) {
          const objectEl = createFromTemplate('<object>', true);
          expect(checker.isTabbable(objectEl)).toBe(false);
        }
      });

    });

    describe('for Blink browsers', () => {
      let shouldSkip: boolean;

      beforeEach(() => {
        shouldSkip = !platform.BLINK;
      });

      it('should always mark audio elements with controls as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        const audio = createFromTemplate('<audio controls>', true);

        expect(checker.isTabbable(audio)).toBe(true);

        audio.tabIndex = -1;

        // The audio element will be still tabbable because Blink always
        // considers them as tabbable.
        expect(checker.isTabbable(audio)).toBe(true);
      });

    });

    describe('for Internet Explorer', () => {
      let shouldSkip: boolean;

      beforeEach(() => {
        shouldSkip = !platform.TRIDENT;
      });

      it('should never mark video elements without controls as tabbable', () => {
        if (shouldSkip) {
          return;
        }

        // In Internet Explorer video elements without controls are never tabbable.
        const video = createFromTemplate('<video>', true);

        expect(checker.isTabbable(video)).toBe(false);

        video.tabIndex = 0;

        expect(checker.isTabbable(video)).toBe(false);

      });

    });

    describe('for iOS browsers', () => {
      let shouldSkip: boolean;

      beforeEach(() => {
        shouldSkip = !platform.IOS || !platform.WEBKIT;
      });

      it('should never allow div elements to be tabbable', () => {
        if (!shouldSkip) {
          const divEl = createFromTemplate('<div tabindex="0">', true);
          expect(checker.isTabbable(divEl)).toBe(false);
        }
      });

      it('should never allow span elements to be tabbable', () => {
        if (!shouldSkip) {
          const spanEl = createFromTemplate('<span tabindex="0">Text</span>', true);
          expect(checker.isTabbable(spanEl)).toBe(false);
        }
      });

      it('should never allow button elements to be tabbable', () => {
        if (!shouldSkip) {
          const buttonEl = createFromTemplate('<button tabindex="0">', true);
          expect(checker.isTabbable(buttonEl)).toBe(false);
        }
      });

      it('should never allow anchor elements to be tabbable', () => {
        if (!shouldSkip) {
          const anchorEl = createFromTemplate('<a tabindex="0">Link</a>', true);
          expect(checker.isTabbable(anchorEl)).toBe(false);
        }
      });

    });


  });

  /** Creates an array of elements with the given node names. */
  function createElements(...nodeNames: string[]) {
    return nodeNames.map(name => document.createElement(name));
  }

  function createFromTemplate(template: string, append = false) {
    const tmpRoot = document.createElement('div');
    tmpRoot.innerHTML = template;

    const element = tmpRoot.firstElementChild!;

    tmpRoot.removeChild(element);

    if (append) {
      appendElements([element]);
    }

    return element as HTMLElement;
  }

  /** Appends elements to the testContainerElement. */
  function appendElements(elements: Element[]) {
    for (const e of elements) {
      testContainerElement.appendChild(e);
    }
  }

});
