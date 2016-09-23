import {InteractivityChecker} from './interactivity-checker';

describe('InteractivityChecker', () => {
  let testContainerElement: HTMLElement;
  let checker: InteractivityChecker;

  beforeEach(() => {
    testContainerElement = document.createElement('div');
    document.body.appendChild(testContainerElement);

    checker = new InteractivityChecker();
  });

  afterEach(() => {
    document.body.removeChild(testContainerElement);
    testContainerElement.innerHTML = '';
  });

  describe('isDisabled', () => {
    it('should return true for disabled elements', () => {
      let elements = createElements('input', 'textarea', 'select', 'button', 'md-checkbox');
      elements.forEach(el => el.setAttribute('disabled', ''));
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isDisabled(el))
            .toBe(true, `Expected <${el.nodeName} disabled> to be disabled`);
      });
    });

    it('should return false for elements without disabled', () => {
      let elements = createElements('input', 'textarea', 'select', 'button', 'md-checkbox');
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

    it('should return true for div and span with tabindex == 0', () => {
      let elements = createElements('div', 'span');

      elements.forEach(el => el.setAttribute('tabindex', '0'));
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isFocusable(el))
            .toBe(true, `Expected <${el.nodeName} tabindex="0"> to be focusable`);
      });
    });
  });

  describe('isTabbable', () => {
    it('should return true for native form controls and anchor without tabindex attribute', () => {
      let elements = createElements('input', 'textarea', 'select', 'button', 'a');
      appendElements(elements);

      elements.forEach(el => {
        expect(checker.isTabbable(el)).toBe(true, `Expected <${el.nodeName}> to be tabbable`);
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
  });

  /** Creates an array of elements with the given node names. */
  function createElements(...nodeNames: string[]) {
    return nodeNames.map(name => document.createElement(name));
  }

  /** Appends elements to the testContainerElement. */
  function appendElements(elements: Element[]) {
    for (let e of elements) {
      testContainerElement.appendChild(e);
    }
  }
});
