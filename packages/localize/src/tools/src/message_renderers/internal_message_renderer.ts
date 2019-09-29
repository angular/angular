/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {MessageRenderer} from './message_renderer';

/**
 * A renderer that outputs the strings that are used for generating message ids.
 */
export class InternalMessageRenderer implements MessageRenderer<string> {
  message = '';
  icuDepth = 0;
  startRender(): void {
    this.message = '';
    this.icuDepth = 0;
  }
  endRender(): void {}
  text(text: string): void { this.message += text; }
  placeholder(name: string, body: string|undefined): void { this.renderPlaceholder(name); }
  startPlaceholder(name: string): void { this.renderPlaceholder(name); }
  closePlaceholder(name: string): void { this.renderPlaceholder(name); }
  startContainer(): void {}
  closeContainer(): void {}
  startIcu(): void {
    this.icuDepth++;
    this.message = '';
  }
  endIcu(): void { this.icuDepth--; }
  private renderPlaceholder(name: string) {
    this.message += this.icuDepth > 0 ? `{${name}}` : `{$${name}}`;
  }
}
