/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {DocContent} from '@angular/docs';
import {ContentLoader} from './content-loader.service';

describe('ContentLoader', () => {
  let service: ContentLoader;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentLoader, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ContentLoader);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('getContent', () => {
    it('should fetch content successfully', async () => {
      const path = 'test-document.md.html';
      const mockContent = '<h1>Test Document</h1>';
      const expectedDocContent: DocContent = {
        contents: mockContent,
        id: path,
      };

      const contentPromise = service.getContent(path);

      const req = httpTestingController.expectOne(`assets/content/${path}`);
      expect(req.request.method).toEqual('GET');
      expect(req.request.responseType).toEqual('text');
      req.flush(mockContent);

      const result = await contentPromise;
      expect(result).toEqual(expectedDocContent);
    });

    it('should add .md.html extension when path has no extension', async () => {
      const path = 'test-document';
      const expectedPath = 'test-document.md.html';
      const mockContent = '<h1>Test Document</h1>';

      const contentPromise = service.getContent(path);

      const req = httpTestingController.expectOne(`assets/content/${expectedPath}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockContent);

      const result = await contentPromise;
      expect(result.id).toEqual(expectedPath);
      expect(result.contents).toEqual(mockContent);
    });

    it('should not modify path when it already has an extension', async () => {
      const path = 'test-document.html';
      const mockContent = '<h1>Test Document</h1>';

      const contentPromise = service.getContent(path);

      const req = httpTestingController.expectOne(`assets/content/${path}`);
      req.flush(mockContent);

      const result = await contentPromise;
      expect(result.id).toEqual(path);
    });

    it('should cache content and return cached version on subsequent calls', async () => {
      const path = 'cached-document.md.html';
      const mockContent = '<h1>Cached Document</h1>';

      // First call
      const firstCallPromise = service.getContent(path);
      const req1 = httpTestingController.expectOne(`assets/content/${path}`);
      req1.flush(mockContent);
      const firstResult = await firstCallPromise;

      // Second call - should use cache, no HTTP request
      const secondResult = await service.getContent(path);

      expect(firstResult).toEqual(secondResult);
      expect(firstResult.contents).toEqual(mockContent);
      httpTestingController.expectNone(`assets/content/${path}`);
    });

    it('should handle 404 errors and keep them in cache', async () => {
      const path = 'non-existent.md.html';

      const contentPromise = service.getContent(path);

      const req = httpTestingController.expectOne(`assets/content/${path}`);
      req.flush('Not Found', {status: 404, statusText: 'Not Found'});

      try {
        await contentPromise;
        fail('Expected promise to be rejected');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect((error as HttpErrorResponse).status).toBe(404);
      }

      // Second call should also fail without making another HTTP request
      // because 404 errors are cached
      try {
        await service.getContent(path);
        fail('Expected second call to be rejected');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect((error as HttpErrorResponse).status).toBe(404);
      }
      httpTestingController.expectNone(`assets/content/${path}`);
    });

    it('should not cache non-404 errors and retry on subsequent calls', async () => {
      const path = 'server-error.md.html';

      // First call - server error
      const firstCallPromise = service.getContent(path);
      const req1 = httpTestingController.expectOne(`assets/content/${path}`);
      req1.flush('Server Error', {status: 500, statusText: 'Internal Server Error'});

      try {
        await firstCallPromise;
        fail('Expected first call to be rejected');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect((error as HttpErrorResponse).status).toBe(500);
      }

      // Second call should make another HTTP request since 500 errors are not cached
      const secondCallPromise = service.getContent(path);
      const req2 = httpTestingController.expectOne(`assets/content/${path}`);
      req2.flush('Success content');

      const result = await secondCallPromise;
      expect(result.contents).toEqual('Success content');
    });

    it('should handle network errors and not cache them', async () => {
      const path = 'network-error.md.html';

      // First call - network error
      const firstCallPromise = service.getContent(path);
      const req1 = httpTestingController.expectOne(`assets/content/${path}`);
      req1.error(new ProgressEvent('Network error'));

      try {
        await firstCallPromise;
        fail('Expected first call to be rejected');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpErrorResponse);
      }

      // Second call should make another HTTP request since network errors are not cached
      const secondCallPromise = service.getContent(path);
      const req2 = httpTestingController.expectOne(`assets/content/${path}`);
      req2.flush('Success after network error');

      const result = await secondCallPromise;
      expect(result.contents).toEqual('Success after network error');
    });

    it('should handle paths with different extensions correctly', async () => {
      const testCases = [
        {input: 'document.txt', expected: 'document.txt'},
        {input: 'document.json', expected: 'document.json'},
        {input: 'document.xml', expected: 'document.xml'},
        {input: 'document', expected: 'document.md.html'},
      ];

      for (const testCase of testCases) {
        const mockContent = `Content for ${testCase.input}`;

        const contentPromise = service.getContent(testCase.input);

        const req = httpTestingController.expectOne(`assets/content/${testCase.expected}`);
        req.flush(mockContent);

        const result = await contentPromise;
        expect(result.id).toEqual(testCase.expected);
        expect(result.contents).toEqual(mockContent);
      }
    });
  });
});
