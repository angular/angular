/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, TemplateRef, ViewChild, ViewContainerRef} from '../../src/core';
import {TestBed} from '../../testing';

describe('DOM node manipulation outside of Angular', () => {
  it('should throw a descriptive error when a tracked node was detached externally', () => {
    @Component({
      template: `
        <ng-template #tpl><span>view</span></ng-template>
        <div #container></div>
      `,
    })
    class App {
      @ViewChild('container', {read: ViewContainerRef, static: true})
      container: ViewContainerRef = null!;

      @ViewChild('tpl', {read: TemplateRef, static: true}) tpl: TemplateRef<any> = null!;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = fixture.componentInstance;

    // This view's first node will be used as the `refChild` for the next insert.
    app.container.createEmbeddedView(app.tpl);

    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    // Pretend a browser extension (Grammarly, a password manager, etc.) removed it.
    span.remove();

    // Inserting a new view in front of it now has to insertBefore(span), and span
    // isn't attached anymore.
    expect(() => app.container.createEmbeddedView(app.tpl, {}, 0)).toThrowError(
      /NG05106.*no longer a child/,
    );
  });
});
