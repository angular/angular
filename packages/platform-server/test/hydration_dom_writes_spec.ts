/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {
  Component,
  destroyPlatform,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  Type,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';

import {clearDocument, hydrate, prepareEnvironment, resetTViewsFor} from './dom_utils';
import {getComponentRef, ssr} from './hydration_utils';

/** Finds a property's accessor on the prototype chain of an element. */
function findDescriptor(el: Element, name: string): PropertyDescriptor | undefined {
  for (let proto = Object.getPrototypeOf(el); proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (descriptor) return descriptor;
  }
  return undefined;
}

/**
 * Records the writes made to an element: `setAttribute` calls and assignments to `properties`.
 *
 * DOM shims define `setAttribute` as a read-only inherited property, which `spyOn` can't replace,
 * so the calls are recorded through an own property instead.
 */
function recordWrites(el: Element, properties: string[] = []): string[] {
  const writes: string[] = [];
  const setAttribute = el.setAttribute;
  Object.defineProperty(el, 'setAttribute', {
    configurable: true,
    value(this: Element, name: string, value: string) {
      writes.push(`attr:${name}`);
      return setAttribute.call(this, name, value);
    },
  });
  for (const property of properties) {
    const descriptor = findDescriptor(el, property)!;
    Object.defineProperty(el, property, {
      configurable: true,
      get() {
        return descriptor.get!.call(this);
      },
      set(value: unknown) {
        writes.push(`prop:${property}`);
        descriptor.set!.call(this, value);
      },
    });
  }
  return writes;
}

describe('platform-server hydration resource URLs', () => {
  const originalWindow = globalThis.window;
  let doc: Document;

  beforeAll(async () => {
    globalThis.window = globalThis as unknown as Window & typeof globalThis;
    await import('../../core/primitives/event-dispatch/contract_bundle_min.js' as string);
  });

  afterAll(() => {
    globalThis.window = originalWindow;
  });

  beforeEach(() => {
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    clearDocument(doc);
    destroyPlatform();
    window._ejsas = {};
  });

  /** Renders a component on the server and puts the result in the document. */
  async function serverRender(component: Type<unknown>): Promise<void> {
    const html = await ssr(component);
    resetTViewsFor(component);
    prepareEnvironment(doc, html);
  }

  /** Hydrates the component that `serverRender` rendered and waits for it to be stable. */
  async function hydrateAndWait<T>(component: Type<T>) {
    const appRef = await hydrate(doc, component);
    await appRef.whenStable();
    return {appRef, instance: getComponentRef<T>(appRef).instance};
  }

  describe('static resource URLs', () => {
    it('should not write static resource URLs that the server rendered', async () => {
      @Component({
        selector: 'app',
        template: `
          <video src="clip.mp4"></video>
          <audio src="clip.mp3"></audio>
          <iframe src="frame.html"></iframe>
          <embed src="frame.html" />
          <object data="frame.html"></object>
        `,
      })
      class App {}

      await serverRender(App);
      const allWrites = ['video', 'audio', 'iframe', 'embed', 'object'].map((tag) =>
        recordWrites(doc.querySelector(tag)!),
      );

      await hydrateAndWait(App);

      for (const writes of allWrites) {
        expect(writes).toEqual([]);
      }
      expect(doc.querySelector('iframe')!.getAttribute('src')).toBe('frame.html');
    });

    it('should keep writing other static attributes, class and style', async () => {
      @Component({
        selector: 'app',
        template: `<video src="clip.mp4" title="Clip" class="a" style="color: red;"></video>`,
      })
      class App {}

      await serverRender(App);
      const writes = recordWrites(doc.querySelector('video')!);

      await hydrateAndWait(App);

      expect(writes.sort()).toEqual(['attr:class', 'attr:style', 'attr:title']);
    });

    it('should restore static resource URLs that differ from the template or are missing', async () => {
      @Component({
        selector: 'app',
        template: `
          <iframe src="frame.html"></iframe>
          <video src="clip.mp4"></video>
        `,
      })
      class App {}

      await serverRender(App);
      const iframe = doc.querySelector('iframe')!;
      const video = doc.querySelector('video')!;
      iframe.setAttribute('src', 'changed-before-hydration.html');
      video.removeAttribute('src');

      await hydrateAndWait(App);

      expect(iframe.getAttribute('src')).toBe('frame.html');
      expect(video.getAttribute('src')).toBe('clip.mp4');
    });

    it('should write a static resource URL on a node created on the client', async () => {
      let created: Element;

      @Directive({selector: '[capture]'})
      class Capture {
        constructor() {
          created = inject(ElementRef).nativeElement;
        }
      }

      // Without `<ng-content>`, the server doesn't render the projected node.
      @Component({selector: 'no-slot', template: ''})
      class NoSlot {}

      @Component({
        selector: 'app',
        imports: [NoSlot, Capture],
        template: `<no-slot><iframe capture src="frame.html"></iframe></no-slot>`,
      })
      class App {}

      await serverRender(App);

      await hydrateAndWait(App);

      expect(created!.getAttribute('src')).toBe('frame.html');
    });
  });

  describe('resource URL bindings', () => {
    it('should not write resource URLs that the server rendered', async () => {
      @Component({
        selector: 'app',
        template: `
          <video id="video-prop" [src]="clip()"></video>
          <video id="video-attr" [attr.src]="clip()"></video>
          <audio id="audio-prop" [src]="clip()"></audio>
          <iframe id="iframe-prop" [src]="frame()"></iframe>
          <iframe id="iframe-attr" [attr.src]="frame()"></iframe>
          <embed id="embed-prop" [src]="frame()" />
          <embed id="embed-attr" [attr.src]="frame()" />
          <object id="object-prop" [data]="frame()"></object>
          <object id="object-attr" [attr.data]="frame()"></object>
          @if (show()) {
            <video id="video-embedded" [src]="clip()"></video>
          }
        `,
      })
      class App {
        clip = signal('clip.mp4');
        show = signal(true);
        frame = signal(inject(DomSanitizer).bypassSecurityTrustResourceUrl('frame.html'));
      }

      await serverRender(App);
      const allWrites = [
        ...['video-prop', 'video-embedded', 'audio-prop', 'iframe-prop', 'embed-prop'].map((id) =>
          recordWrites(doc.getElementById(id)!, ['src']),
        ),
        recordWrites(doc.getElementById('object-prop')!, ['data']),
        ...['video-attr', 'iframe-attr', 'embed-attr', 'object-attr'].map((id) =>
          recordWrites(doc.getElementById(id)!),
        ),
      ];

      await hydrateAndWait(App);

      for (const writes of allWrites) {
        expect(writes.filter((write) => /:(src|data)$/.test(write))).toEqual([]);
      }
      expect(doc.getElementById('iframe-prop')!.getAttribute('src')).toBe('frame.html');
    });

    it('should write resource URLs that differ from what the server rendered', async () => {
      @Component({
        selector: 'app',
        template: `
          <video id="prop" [src]="clip()"></video>
          <video id="attr" [attr.src]="clip()"></video>
        `,
      })
      class App {
        clip = signal(isPlatformServer(inject(PLATFORM_ID)) ? 'server.mp4' : 'browser.mp4');
      }

      await serverRender(App);
      const prop = doc.querySelector('#prop')!;
      const attr = doc.querySelector('#attr')!;
      expect(prop.getAttribute('src')).toBe('server.mp4');
      expect(attr.getAttribute('src')).toBe('server.mp4');

      await hydrateAndWait(App);

      expect(prop.getAttribute('src')).toBe('browser.mp4');
      expect(attr.getAttribute('src')).toBe('browser.mp4');
    });

    it('should write resource URLs when they change after hydration', async () => {
      @Component({
        selector: 'app',
        template: `
          <video id="prop" [src]="clip()"></video>
          <video id="attr" [attr.src]="clip()"></video>
        `,
      })
      class App {
        clip = signal('clip.mp4');
      }

      await serverRender(App);
      const {appRef, instance} = await hydrateAndWait(App);

      instance.clip.set('next.mp4');
      await appRef.whenStable();

      expect(doc.querySelector('#prop')!.getAttribute('src')).toBe('next.mp4');
      expect(doc.querySelector('#attr')!.getAttribute('src')).toBe('next.mp4');
    });

    it('should write a resource URL on a node created on the client', async () => {
      let created: Element;

      @Directive({selector: '[capture]'})
      class Capture {
        constructor() {
          created = inject(ElementRef).nativeElement;
        }
      }

      @Component({selector: 'no-slot', template: ''})
      class NoSlot {}

      @Component({
        selector: 'app',
        imports: [NoSlot, Capture],
        template: `<no-slot><video capture [src]="clip()"></video></no-slot>`,
      })
      class App {
        clip = signal('clip.mp4');
      }

      await serverRender(App);

      await hydrateAndWait(App);

      expect(created!.getAttribute('src')).toBe('clip.mp4');
    });

    it('should keep writing other bindings during hydration', async () => {
      @Component({
        selector: 'app',
        template: `<video
          [attr.data-kind]="kind()"
          [attr.poster]="kind()"
          [title]="kind()"
        ></video>`,
      })
      class App {
        kind = signal('trailer');
      }

      await serverRender(App);
      const writes = recordWrites(doc.querySelector('video')!, ['title']);

      await hydrateAndWait(App);

      expect(writes.sort()).toEqual(['attr:data-kind', 'attr:poster', 'prop:title']);
    });
  });
});
