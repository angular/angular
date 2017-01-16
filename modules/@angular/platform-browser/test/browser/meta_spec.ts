/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, Meta} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('Meta service', () => {

    const metaService: Meta = new Meta(getDOM());
    const doc: HTMLDocument = getDOM().defaultDoc();
    let defaultMeta: HTMLMetaElement;

    beforeEach(() => {
      defaultMeta = getDOM().createElement('meta', doc) as HTMLMetaElement;
      defaultMeta.setAttribute('property', 'fb:app_id');
      defaultMeta.setAttribute('content', '123456789');
      getDOM().getElementsByTagName(doc, 'head')[0].appendChild(defaultMeta);
    });

    afterEach(() => getDOM().remove(defaultMeta));

    it('should return meta tag matching selector', () => {
      const actual: HTMLMetaElement = metaService.getTag('property="fb:app_id"');
      expect(actual).not.toBeNull();
      expect(actual.content).toEqual('123456789');
    });

    it('should return all meta tags matching selector', () => {
      const tag1 = metaService.addTag({name: 'author', content: 'page author'});
      const tag2 = metaService.addTag({name: 'author', content: 'another page author'});

      const actual: HTMLMetaElement[] = metaService.getTags('name=author');
      expect(actual.length).toEqual(2);
      expect(actual[0].content).toEqual('page author');
      expect(actual[1].content).toEqual('another page author');

      // clean up
      metaService.removeTagElement(tag1);
      metaService.removeTagElement(tag2);
    });

    it('should return null if meta tag does not exist', () => {
      const actual: HTMLMetaElement = metaService.getTag('fake=fake');
      expect(actual).toBeNull();
    });

    it('should remove meta tag by the given selector', () => {
      expect(metaService.getTag('name=author')).toBeNull();

      metaService.addTag({name: 'author', content: 'page author'});

      expect(metaService.getTag('name=author')).not.toBeNull();

      metaService.removeTag('name=author');

      expect(metaService.getTag('name=author')).toBeNull();
    });

    it('should remove meta tag by the given element', () => {
      expect(metaService.getTag('name=keywords')).toBeNull();

      metaService.addTags([{name: 'keywords', content: 'meta test'}]);

      const meta = metaService.getTag('name=keywords');
      expect(meta).not.toBeNull();

      metaService.removeTagElement(meta);

      expect(metaService.getTag('name=keywords')).toBeNull();
    });

    it('should update meta tag matching the given selector', () => {
      metaService.updateTag({content: '4321'}, 'property="fb:app_id"');

      const actual = metaService.getTag('property="fb:app_id"');
      expect(actual).not.toBeNull();
      expect(actual.content).toEqual('4321');
    });

    it('should extract selector from the tag definition', () => {
      metaService.updateTag({property: 'fb:app_id', content: '666'});

      const actual = metaService.getTag('property="fb:app_id"');
      expect(actual).not.toBeNull();
      expect(actual.content).toEqual('666');
    });

    it('should create meta tag if it does not exist', () => {
      expect(metaService.getTag('name="twitter:title"')).toBeNull();

      metaService.updateTag(
          {name: 'twitter:title', content: 'Content Title'}, 'name="twitter:title"');

      const actual = metaService.getTag('name="twitter:title"');
      expect(actual).not.toBeNull();
      expect(actual.content).toEqual('Content Title');

      // clean up
      metaService.removeTagElement(actual);
    });

    it('should add new meta tag', () => {
      expect(metaService.getTag('name="og:title"')).toBeNull();

      metaService.addTag({name: 'og:title', content: 'Content Title'});

      const actual = metaService.getTag('name="og:title"');
      expect(actual).not.toBeNull();
      expect(actual.content).toEqual('Content Title');

      // clean up
      metaService.removeTagElement(actual);
    });

    it('should add multiple new meta tags', () => {
      expect(metaService.getTag('name="twitter:title"')).toBeNull();
      expect(metaService.getTag('property="og:title"')).toBeNull();

      metaService.addTags([
        {name: 'twitter:title', content: 'Content Title'},
        {property: 'og:title', content: 'Content Title'}
      ]);
      const twitterMeta = metaService.getTag('name="twitter:title"');
      const fbMeta = metaService.getTag('property="og:title"');
      expect(twitterMeta).not.toBeNull();
      expect(fbMeta).not.toBeNull();

      // clean up
      metaService.removeTagElement(twitterMeta);
      metaService.removeTagElement(fbMeta);
    });

    it('should not add meta tag if it is already present on the page and has the same attr', () => {
      expect(metaService.getTags('property="fb:app_id"').length).toEqual(1);

      metaService.addTag({property: 'fb:app_id', content: '123456789'});

      expect(metaService.getTags('property="fb:app_id"').length).toEqual(1);
    });

    it('should add meta tag if it is already present on the page and but has different attr',
       () => {
         expect(metaService.getTags('property="fb:app_id"').length).toEqual(1);

         const meta = metaService.addTag({property: 'fb:app_id', content: '666'});

         expect(metaService.getTags('property="fb:app_id"').length).toEqual(2);

         // clean up
         metaService.removeTagElement(meta);
       });

    it('should add meta tag if it is already present on the page and force true', () => {
      expect(metaService.getTags('property="fb:app_id"').length).toEqual(1);

      const meta = metaService.addTag({property: 'fb:app_id', content: '123456789'}, true);

      expect(metaService.getTags('property="fb:app_id"').length).toEqual(2);

      // clean up
      metaService.removeTagElement(meta);
    });

  });

  describe('integration test', () => {

    @Injectable()
    class DependsOnMeta {
      constructor(public meta: Meta) {}
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        providers: [DependsOnMeta],
      });
    });

    it('should inject Meta service when using BrowserModule',
       () => expect(TestBed.get(DependsOnMeta).meta).toBeAnInstanceOf(Meta));
  });
}
