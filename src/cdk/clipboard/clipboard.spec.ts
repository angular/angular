import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';

import {Clipboard, PendingCopy} from './clipboard';

const COPY_CONTENT = 'copy content';

describe('Clipboard', () => {
  let clipboard: Clipboard;

  let execCommand: jasmine.Spy;
  let document: Document;
  let body: HTMLElement;
  let focusedInput: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    clipboard = TestBed.get(Clipboard);
    document = TestBed.get(DOCUMENT);
    execCommand = spyOn(document, 'execCommand').and.returnValue(true);
    body = document.body;

    focusedInput = document.createElement('input');
    body.appendChild(focusedInput);
    focusedInput.focus();
  });

  afterEach(() => {
    focusedInput.remove();
  });

  describe('#beginCopy', () => {
    let pendingCopy: PendingCopy;

    beforeEach(() => {
      pendingCopy = clipboard.beginCopy(COPY_CONTENT);
    });

    afterEach(() => {
      pendingCopy.destroy();
    });

    it('loads the copy content in textarea', () => {
      expect(body.querySelector('textarea')!.value).toBe(COPY_CONTENT);
    });

    it('removes the textarea after destroy()', () => {
      pendingCopy.destroy();

      expect(body.querySelector('textarea')).toBeNull();
    });
  });

  describe('#copy', () => {
    it('returns true when execCommand succeeds', () => {
      expect(clipboard.copy(COPY_CONTENT)).toBe(true);

      expect(body.querySelector('textarea')).toBeNull();
    });

    it('does not move focus away from focused element', () => {
      expect(clipboard.copy(COPY_CONTENT)).toBe(true);

      expect(document.activeElement).toBe(focusedInput);
    });

    describe('when execCommand fails', () => {
      beforeEach(() => {
        execCommand.and.throwError('could not copy');
      });

      it('returns false', () => {
        expect(clipboard.copy(COPY_CONTENT)).toBe(false);
      });

      it('removes the text area', () => {
        expect(body.querySelector('textarea')).toBeNull();
      });
    });

    it('returns false when execCommand returns false', () => {
      execCommand.and.returnValue(false);

      expect(clipboard.copy(COPY_CONTENT)).toBe(false);
    });
  });
});
