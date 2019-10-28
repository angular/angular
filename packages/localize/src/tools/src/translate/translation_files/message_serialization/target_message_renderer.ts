/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation, ɵmakeParsedTranslation} from '@angular/localize';
import {MessageRenderer} from './message_renderer';

/**
 * A message renderer that outputs `ɵParsedTranslation` objects.
 */
export class TargetMessageRenderer implements MessageRenderer<ɵParsedTranslation> {
  private current: MessageInfo = {messageParts: [], placeholderNames: [], text: ''};
  private icuDepth = 0;

  get message(): ɵParsedTranslation {
    const {messageParts, placeholderNames} = this.current;
    return ɵmakeParsedTranslation(messageParts, placeholderNames);
  }
  startRender(): void {}
  endRender(): void { this.storeMessagePart(); }
  text(text: string): void { this.current.text += text; }
  placeholder(name: string, body: string|undefined): void { this.renderPlaceholder(name); }
  startPlaceholder(name: string): void { this.renderPlaceholder(name); }
  closePlaceholder(name: string): void { this.renderPlaceholder(name); }
  startContainer(): void {}
  closeContainer(): void {}
  startIcu(): void {
    this.icuDepth++;
    this.text('{');
  }
  endIcu(): void {
    this.icuDepth--;
    this.text('}');
  }
  private renderPlaceholder(name: string) {
    if (this.icuDepth > 0) {
      this.text(`{${name}}`);
    } else {
      this.storeMessagePart();
      this.current.placeholderNames.push(name);
    }
  }
  private storeMessagePart() {
    this.current.messageParts.push(this.current.text);
    this.current.text = '';
  }
}

interface MessageInfo {
  messageParts: string[];
  placeholderNames: string[];
  text: string;
}