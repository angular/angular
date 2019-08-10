/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Xliff2MessageRenderer {
  startRender(): void;
  endRender(): void;
  text(text: string): void;
  placeholder(name: string, body: string|undefined): void;
  startPlaceholder(name: string): void;
  closePlaceholder(name: string): void;
  startContainer(): void;
  closeContainer(): void;
  startIcu(): void;
  endIcu(): void;
}

export class InternalXliff2MessageRenderer implements Xliff2MessageRenderer {
  output = '';
  icuDepth = 0;
  startRender(): void { this.output = ''; }
  endRender(): void {}
  text(text: string): void { this.output += text; }
  placeholder(name: string, body: string|undefined): void { this.renderPlaceholder(name); }
  startPlaceholder(name: string): void { this.renderPlaceholder(name); }
  closePlaceholder(name: string): void { this.renderPlaceholder(name); }
  startContainer(): void {}
  closeContainer(): void {}
  startIcu(): void { this.icuDepth++; }
  endIcu(): void { this.icuDepth--; }
  private renderPlaceholder(name: string) {
    this.output += this.icuDepth > 0 ? `{${name}}` : `{$${name}}`;
  }
}

export class ExternalXliff2MessageRenderer implements Xliff2MessageRenderer {
  output: string = '';
  private placeholderStack: PlaceholderContext[] = [];
  startRender(): void {
    this.output = '';
    this.placeholderStack.length = 0;
  }
  endRender(): void {}
  text(text: string): void { this.output += text; }
  placeholder(name: string, body: string|undefined): void {
    this.output += body === undefined ?
        `<ph name="${name}"/>` :
        `<ph name="${name}">{${stripInterpolationMarkers(body)}}</ph>`;
  }
  startPlaceholder(name: string): void {
    this.placeholderStack.unshift({inContainer: false});
    this.output += `<ph tag name="${name}">`;
  }
  closePlaceholder(name: string): void {
    const placeholderInfo = this.placeholderStack.shift();
    if (placeholderInfo === undefined) {
      throw new Error(`No matching opening placeholder for ${name} in translation file`);
    }
    if (placeholderInfo.inContainer) {
      this.output += ']';
    }
    this.output += `</ph name="${name}">`;
  }
  startContainer(): void { this.output += '['; }
  closeContainer(): void { this.output += ']'; }
  startIcu(): void {}
  endIcu(): void {}
}

function stripInterpolationMarkers(interpolation: string): string {
  return interpolation.replace(/^\{\{/, '').replace(/}}$/, '');
}

interface PlaceholderContext {
  inContainer: boolean;
}

export class TargetMessageRenderer implements Xliff2MessageRenderer {
  messageParts: string[] = [];
  placeholderNames: string[] = [];
  currentText = '';
  icuDepth = 0;
  startRender(): void {
    this.messageParts.length = 0;
    this.placeholderNames.length = 0;
    this.currentText = '';
  }
  endRender(): void { this.messageParts.push(this.currentText); }
  text(text: string): void { this.currentText += text; }
  placeholder(name: string, body: string|undefined): void { this.renderPlaceholder(name); }
  startPlaceholder(name: string): void { this.renderPlaceholder(name); }
  closePlaceholder(name: string): void { this.renderPlaceholder(name); }
  startContainer(): void {}
  closeContainer(): void {}
  startIcu(): void { this.icuDepth++; }
  endIcu(): void { this.icuDepth--; }
  private renderPlaceholder(name: string) {
    if (this.icuDepth > 0) {
      this.currentText += `{${name}}`;
    } else {
      this.messageParts.push(this.currentText);
      this.currentText = '';
      this.placeholderNames.push(name);
    }
  }
}
