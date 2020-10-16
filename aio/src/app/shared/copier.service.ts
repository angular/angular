/**
 * This class is based on the code in the following projects:
 *
 * - https://github.com/zenorocha/select
 * - https://github.com/zenorocha/clipboard.js/
 *
 * Both released under MIT license - © Zeno Rocha
 *
 * It is also influenced by the Angular CDK `PendingCopy` class:
 * https://github.com/angular/components/blob/master/src/cdk/clipboard/pending-copy.ts
 */


export class CopierService {
  /**
   * Copy the contents of a `<textarea>` element to the clipboard.
   *
   * NOTE: For this method to work, the elements must be already inserted into the DOM.
   *
   * @param textArea The area containing the text to be copied to the clipboard.
   * @return Whether the copy operation was successful.
   */
  private copyTextArea(textArea: HTMLTextAreaElement): boolean {
    const currentFocus = document.activeElement as HTMLOrSVGElement | null;

    try {
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);

      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      // Calling `.select()` on the `<textarea>` element may have also focused it.
      // Change the focus back to the previously focused element.
      currentFocus?.focus();
    }
  }

  /**
   * Create a temporary, hidden `<textarea>` element and set its value to the specified text.
   *
   * @param text The text to be inserted into the textarea.
   * @return The temporary `<textarea>` element containing the specified text.
   */
  private createTextArea(text: string): HTMLTextAreaElement {
    const docElem = document.documentElement;
    const isRTL = docElem.getAttribute('dir') === 'rtl';

    // Create a temporary element to hold the contents to copy.
    const textArea = document.createElement('textarea');
    const style = textArea.style;

    // Prevent zooming on iOS.
    style.fontSize = '12pt';

    // Reset box model.
    style.border = '0';
    style.padding = '0';
    style.margin = '0';

    // Make the element invisible and move it out of screen horizontally.
    style.opacity = '0';
    style.position = 'fixed';
    style.top = '0';
    style[isRTL ? 'right' : 'left'] = '-999em';

    textArea.setAttribute('aria-hidden', 'true');
    textArea.setAttribute('readonly', '');
    textArea.value = text;

    return textArea;
  }

  /**
   * Copy the specified text to the clipboard.
   *
   * @param text The text to be copied to the clipboard.
   * @return Whether the copy operation was successful.
   */
  copyText(text: string): boolean {
    // Create a `<textarea>` element with the specified text.
    const textArea = this.createTextArea(text);

    // Insert it into the DOM.
    document.body.appendChild(textArea);

    // Copy its contents to the clipboard.
    const success = this.copyTextArea(textArea);

    // Remove it from the DOM, so it can be garbage-collected.
    if (textArea.parentNode) {
      // We cannot use ChildNode.remove() because of IE11.
      textArea.parentNode.removeChild(textArea);
    }

    return success;
  }
}
