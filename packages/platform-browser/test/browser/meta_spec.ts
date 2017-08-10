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
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('Meta service', () => {
    const doc = getDOM().createHtmlDocument();
    const metaService = new Meta(doc);
    let defaultMeta: HTMLMetaElement;

    beforeEach(() => {
      defaultMeta = getDOM().createElement('meta', doc) as HTMLMetaElement;
      getDOM().setAttribute(defaultMeta, 'property', 'fb:app_id');
      getDOM().setAttribute(defaultMeta, 'content', '123456789');
      getDOM().appendChild(getDOM().getElementsByTagName(doc, 'head')[0], defaultMeta);
    });

    afterEach(() => getDOM().remove(defaultMeta));

    it('should return meta tag matching selector', () => {
      const actual: HTMLMetaElement = metaService.getTag('property="fb:app_id"') !;
      expect(actual).not.toBeNull();
      expect(getDOM().getAttribute(actual, 'content')).toEqual('123456789');
    });

    it('should return all meta tags matching selector', () => {
      const tag1 = metaService.addTag({name: 'author', content: 'page author'}) !;
      const tag2 = metaService.addTag({name: 'author', content: 'another page author'}) !;

      const actual: HTMLMetaElement[] = metaService.getTags('name=author');
      expect(actual.length).toEqual(2);
      expect(getDOM().getAttribute(actual[0], 'content')).toEqual('page author');
      expect(getDOM().getAttribute(actual[1], 'content')).toEqual('another page author');

      // clean up
      metaService.removeTagElement(tag1);
      metaService.removeTagElement(tag2);
    });

    it('should return null if meta tag does not exist', () => {
      const actual: HTMLMetaElement = metaService.getTag('fake=fake') !;
      expect(actual).toBeNull();
    });

    it('should remove meta tag by the given selector', () => {
      const selector = 'name=author';
      expect(metaService.getTag(selector)).toBeNull();

      metaService.addTag({name: 'author', content: 'page author'});

      expect(metaService.getTag(selector)).not.toBeNull();

      metaService.removeTag(selector);

      expect(metaService.getTag(selector)).toBeNull();
    });

    it('should remove meta tag by the given element', () => {
      const selector = 'name=keywords';
      expect(metaService.getTag(selector)).toBeNull();

      metaService.addTags([{name: 'keywords', content: 'meta test'}]);

      const meta = metaService.getTag(selector) !;
      expect(meta).not.toBeNull();

      metaService.removeTagElement(meta);

      expect(metaService.getTag(selector)).toBeNull();
    });

    it('should update meta tag matching the given selector', () => {
      const selector = 'property="fb:app_id"';
      metaService.updateTag({content: '4321'}, selector);

      const actual = metaService.getTag(selector);
      expect(actual).not.toBeNull();
      expect(getDOM().getAttribute(actual, 'content')).toEqual('4321');
    });

    it('should extract selector from the tag definition', () => {
      const selector = 'property="fb:app_id"';
      metaService.updateTag({property: 'fb:app_id', content: '666'});

      const actual = metaService.getTag(selector);
      expect(actual).not.toBeNull();
      expect(getDOM().getAttribute(actual, 'content')).toEqual('666');
    });

    it('should create meta tag if it does not exist', () => {
      const selector = 'name="twitter:title"';

      metaService.updateTag({name: 'twitter:title', content: 'Content Title'}, selector);

      const actual = metaService.getTag(selector) !;
      expect(actual).not.toBeNull();
      expect(getDOM().getAttribute(actual, 'content')).toEqual('Content Title');

      // clean up
      metaService.removeTagElement(actual);
    });

    it('should add new meta tag', () => {
      const selector = 'name="og:title"';
      expect(metaService.getTag(selector)).toBeNull();

      metaService.addTag({name: 'og:title', content: 'Content Title'});

      const actual = metaService.getTag(selector) !;
      expect(actual).not.toBeNull();
      expect(getDOM().getAttribute(actual, 'content')).toEqual('Content Title');

      // clean up
      metaService.removeTagElement(actual);
    });

    it('should add multiple new meta tags', () => {
      const nameSelector = 'name="twitter:title"';
      const propertySelector = 'property="og:title"';
      expect(metaService.getTag(nameSelector)).toBeNull();
      expect(metaService.getTag(propertySelector)).toBeNull();

      metaService.addTags([
        {name: 'twitter:title', content: 'Content Title'},
        {property: 'og:title', content: 'Content Title'}
      ]);
      const twitterMeta = metaService.getTag(nameSelector) !;
      const fbMeta = metaService.getTag(propertySelector) !;
      expect(twitterMeta).not.toBeNull();
      expect(fbMeta).not.toBeNull();

      // clean up
      metaService.removeTagElement(twitterMeta);
      metaService.removeTagElement(fbMeta);
    });

    it('should not add meta tag if it is already present on the page and has the same attr', () => {
      const selector = 'property="fb:app_id"';
      expect(metaService.getTags(selector).length).toEqual(1);

      metaService.addTag({property: 'fb:app_id', content: '123456789'});

      expect(metaService.getTags(selector).length).toEqual(1);
    });

    it('should add meta tag if it is already present on the page and but has different attr',
       () => {
         const selector = 'property="fb:app_id"';
         expect(metaService.getTags(selector).length).toEqual(1);

         const meta = metaService.addTag({property: 'fb:app_id', content: '666'}) !;

         expect(metaService.getTags(selector).length).toEqual(2);

         // clean up
         metaService.removeTagElement(meta);
       });

    it('should add meta tag if it is already present on the page and force true', () => {
      const selector = 'property="fb:app_id"';
      expect(metaService.getTags(selector).length).toEqual(1);

      const meta = metaService.addTag({property: 'fb:app_id', content: '123456789'}, true) !;

      expect(metaService.getTags(selector).length).toEqual(2);

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
