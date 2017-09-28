import {Platform} from '@angular/cdk/platform';
import {InteractivityChecker} from './interactivity-checker';


describe('InteractivityChecker', () => {
  let testContainerElement: HTMLElement;
  let checker: InteractivityChecker;
  let platform: Platform = new Platform();

  beforeEach(() => {
    testContainerElement = document.createElement('div');
    document.body.appendChild(testContainerElement);

    checker = new InteractivityChecker(platform);
  });

  afterEach(() => {
    document.body.removeChild(testContainerElement);
    testContainerElement.innerHTML = '';
  });

  describe('isDisabled', () => {
    it('should return true for disabled elements', () => {
      let elements = createElements('input', 'textarea', 'select', 'button', 'mat-checkbox');
      elements.forEach(el => el.setAttribute('disabled', ''));
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isDisabled(el))
            .toBe(true, `Expected <${el.nodeName} disabled> to be disabled`);
      });
    });

    it('should return false for elements without disabled', () => {
      let elements = createElements('input', 'textarea', 'select', 'button', 'mat-checkbox');
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
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `display: none` to not be visible');
    });

    it('should return false for the child of a `display: none` element', () => {
      testContainerElement.innerHTML =
        `<div style="display: none;">
           <input>
         </div>`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `display: none` parent to not be visible');
    });

    it('should return false for a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
          `<input style="visibility: hidden;">`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(false, 'Expected element with `visibility: hidden` to not be visible');
    });

    it('should return false for the child of a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <input>
         </div>`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

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
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isVisible(input))
          .toBe(true, 'Expected element with `visibility: hidden` ancestor and closer ' +
              '`visibility: visible` ancestor to be visible');
    });

    it('should return true for an element without visibility modifiers', () => {
      let input = document.createElement('input');
      testContainerElement.appendChild(input);

      expect(checker.isVisible(input))
          .toBe(true, 'Expected element without visibility modifiers to be visible');
    });
  });

  describe('isFocusable', () => {
    it('should return true for native form controls', () => {
      let elements = createElements('input', 'textarea', 'select', 'button');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el)).toBe(true, `Expected <${el.nodeName}> to be focusable`);
      });
    });

    it('should return true for an anchor with an href', () => {
      let anchor = document.createElement('a');
      anchor.href = 'google.com';
      testContainerElement.appendChild(anchor);

      expect(checker.isFocusable(anchor)).toBe(true, `Expected <a> with href to be focusable`);
    });

    it('should return false for an anchor without an href', () => {
      let anchor = document.createElement('a');
      testContainerElement.appendChild(anchor);

      expect(checker.isFocusable(anchor))
          .toBe(false, `Expected <a> without href not to be focusable`);
    });

    it('should return false for disabled form controls', () => {
      let elements = createElements('input', 'textarea', 'select', 'button');
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
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `display: none` to not be visible');
    });

    it('should return false for the child of a `display: none` element', () => {
      testContainerElement.innerHTML =
        `<div style="display: none;">
           <input>
         </div>`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `display: none` parent to not be visible');
    });

    it('should return false for a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
          `<input style="visibility: hidden;">`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(false, 'Expected element with `visibility: hidden` not to be focusable');
    });

    it('should return false for the child of a `visibility: hidden` element', () => {
      testContainerElement.innerHTML =
        `<div style="visibility: hidden;">
           <input>
         </div>`;
      let input = testContainerElement.querySelector('input') as HTMLElement;

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
      let input = testContainerElement.querySelector('input') as HTMLElement;

      expect(checker.isFocusable(input))
          .toBe(true, 'Expected element with `visibility: hidden` ancestor and closer ' +
              '`visibility: visible` ancestor to be focusable');
    });

    it('should return false for an element with an empty tabindex', () => {
      let element = document.createElement('div');
      element.setAttribute('tabindex', '');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(false, `Expected element with tabindex="" not to be focusable`);
    });

    it('should return false for an element with a non-numeric tabindex', () => {
      let element = document.createElement('div');
      element.setAttribute('tabindex', 'abba');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(false, `Expected element with non-numeric tabindex not to be focusable`);
    });

    it('should return true for an element with contenteditable', () => {
      let element = document.createElement('div');
      element.setAttribute('contenteditable', '');
      testContainerElement.appendChild(element);

      expect(checker.isFocusable(element))
          .toBe(true, `Expected element with contenteditable to be focusable`);
    });


    it('should return false for inert div and span', () => {
      let elements = createElements('div', 'span');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el))
            .toBe(false, `Expected <${el.nodeName}> not to be focusable`);
      });
    });


  });

  describe('isTabbable', () => {

    it('should respect the tabindex for video elements with controls',
      // Do not run for Blink, Firefox and iOS because those treat video elements
      // with controls different and are covered in other tests.
      runIf(!platform.BLINK && !platform.FIREFOX && !platform.IOS, () => {
        let video = createFromTemplate('<video controls>', true);

        expect(checker.isTabbable(video)).toBe(true);

        video.tabIndex = -1;

        expect(checker.isTabbable(video)).toBe(false);
      })
    );

    it('should always mark video elements with controls as tabbable (BLINK & FIREFOX)',
      // Only run this spec for Blink and Firefox, because those always treat video
      // elements with controls as tabbable.
      runIf(platform.BLINK || platform.FIREFOX, () => {
        let video = createFromTemplate('<video controls>', true);

        expect(checker.isTabbable(video)).toBe(true);

        video.tabIndex = -1;

        expect(checker.isTabbable(video)).toBe(true);
      })
    );

    // Some tests should not run inside of iOS browsers, because those only allow specific
    // elements to be tabbable and cause the tests to always fail.
    describe('for non-iOS browsers', runIf(!platform.IOS, () => {

      it('should mark form controls and anchors without tabindex attribute as tabbable', () => {
        let elements = createElements('input', 'textarea', 'select', 'button', 'a');
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el)).toBe(true, `Expected <${el.nodeName}> to be tabbable`);
        });
      });

      it('should return true for div and span with tabindex == 0', () => {
        let elements = createElements('div', 'span');

        elements.forEach(el => el.setAttribute('tabindex', '0'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isFocusable(el))
            .toBe(true, `Expected <${el.nodeName} tabindex="0"> to be focusable`);
        });
      });

      it('should return false for native form controls and anchor with tabindex == -1', () => {
        let elements = createElements('input', 'textarea', 'select', 'button', 'a');

        elements.forEach(el => el.setAttribute('tabindex', '-1'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el))
            .toBe(false, `Expected <${el.nodeName} tabindex="-1"> not to be tabbable`);
        });
      });

      it('should return true for div and span with tabindex == 0', () => {
        let elements = createElements('div', 'span');

        elements.forEach(el => el.setAttribute('tabindex', '0'));
        appendElements(elements);

        elements.forEach(el => {
          expect(checker.isTabbable(el))
            .toBe(true, `Expected <${el.nodeName} tabindex="0"> to be tabbable`);
        });
      });

      it('should respect the inherited tabindex inside of frame elements', () => {
        let iframe = createFromTemplate('<iframe>', true) as HTMLFrameElement;
        let button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([iframe]);

        iframe.setAttribute('tabindex', '-1');
        iframe.contentDocument.body.appendChild(button);

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);

        iframe.removeAttribute('tabindex');

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(true);
      });

      it('should mark elements which are contentEditable as tabbable', () => {
        let editableEl = createFromTemplate('<div contenteditable="true">', true);

        expect(checker.isTabbable(editableEl)).toBe(true);

        editableEl.tabIndex = -1;

        expect(checker.isTabbable(editableEl)).toBe(false);
      });

      it('should never mark iframe elements as tabbable', () => {
        let iframe = createFromTemplate('<iframe>', true);

        // iFrame elements will be never marked as tabbable, because it depends on the content
        // which is mostly not detectable due to CORS and also the checks will be not reliable.
        expect(checker.isTabbable(iframe)).toBe(false);
      });

      it('should always mark audio elements without controls as not tabbable', () => {
        let audio = createFromTemplate('<audio>', true);

        expect(checker.isTabbable(audio)).toBe(false);
      });

    }));

    describe('for Blink and Webkit browsers', runIf(platform.BLINK || platform.WEBKIT, () => {

      it('should not mark elements inside of object frames as tabbable', () => {
        let objectEl = createFromTemplate('<object>', true) as HTMLObjectElement;
        let button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([objectEl]);

        // This is a hack to create an empty contentDocument for the frame element.
        objectEl.type = 'text/html';
        objectEl.contentDocument.body.appendChild(button);

        expect(checker.isTabbable(objectEl)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);
      });

      it('should not mark elements inside of invisible frames as tabbable', () => {
        let iframe = createFromTemplate('<iframe>', true) as HTMLFrameElement;
        let button = createFromTemplate('<button tabindex="0">Not Tabbable</button>');

        appendElements([iframe]);

        iframe.style.display = 'none';
        iframe.contentDocument.body.appendChild(button);

        expect(checker.isTabbable(iframe)).toBe(false);
        expect(checker.isTabbable(button)).toBe(false);
      });

      it('should never mark object frame elements as tabbable', () => {
        let objectEl = createFromTemplate('<object>', true);

        expect(checker.isTabbable(objectEl)).toBe(false);
      });

    }));

    describe('for Blink browsers', runIf(platform.BLINK, () => {

      it('should always mark audio elements with controls as tabbable', () => {
        let audio = createFromTemplate('<audio controls>', true);

        expect(checker.isTabbable(audio)).toBe(true);

        audio.tabIndex = -1;

        // The audio element will be still tabbable because Blink always
        // considers them as tabbable.
        expect(checker.isTabbable(audio)).toBe(true);
      });

    }));

    describe('for Internet Explorer', runIf(platform.TRIDENT, () => {

      it('should never mark video elements without controls as tabbable', () => {
        // In Internet Explorer video elements without controls are never tabbable.
        let video = createFromTemplate('<video>', true);

        expect(checker.isTabbable(video)).toBe(false);

        video.tabIndex = 0;

        expect(checker.isTabbable(video)).toBe(false);

      });

    }));

    describe('for iOS browsers', runIf(platform.IOS && platform.WEBKIT, () => {

      it('should never allow div elements to be tabbable', () => {
        let divEl = createFromTemplate('<div tabindex="0">', true);

        expect(checker.isTabbable(divEl)).toBe(false);
      });

      it('should never allow span elements to be tabbable', () => {
        let spanEl = createFromTemplate('<span tabindex="0">Text</span>', true);

        expect(checker.isTabbable(spanEl)).toBe(false);
      });

      it('should never allow button elements to be tabbable', () => {
        let buttonEl = createFromTemplate('<button tabindex="0">', true);

        expect(checker.isTabbable(buttonEl)).toBe(false);
      });

      it('should never allow anchor elements to be tabbable', () => {
        let anchorEl = createFromTemplate('<a tabindex="0">Link</a>', true);

        expect(checker.isTabbable(anchorEl)).toBe(false);
      });

    }));


  });

  /** Creates an array of elements with the given node names. */
  function createElements(...nodeNames: string[]) {
    return nodeNames.map(name => document.createElement(name));
  }

  function createFromTemplate(template: string, append = false) {
    let tmpRoot = document.createElement('div');
    tmpRoot.innerHTML = template;

    let element = tmpRoot.firstElementChild!;

    tmpRoot.removeChild(element);

    if (append) {
      appendElements([element]);
    }

    return element as HTMLElement;
  }

  /** Appends elements to the testContainerElement. */
  function appendElements(elements: Element[]) {
    for (let e of elements) {
      testContainerElement.appendChild(e);
    }
  }

  function runIf(condition: boolean, runFn: Function): () => void {
    return (...args: any[]) => {
      if (condition) {
        runFn.apply(this, args);
      }
    };
  }

});
