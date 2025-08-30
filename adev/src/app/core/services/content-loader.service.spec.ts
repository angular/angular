/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {ContentLoader} from './content-loader.service';
import {HttpClient} from '@angular/common/http';
import {of, throwError} from 'rxjs';

describe('ContentLoader', () => {
  let service: ContentLoader;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [ContentLoader, {provide: HttpClient, useValue: httpClientSpy}],
    });
    service = TestBed.inject(ContentLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should append .md.html if path has no extension', async () => {
    httpClientSpy.get.and.returnValue(of('file contents'));
    const result = await service.getContent('guide/intro');
    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/content/guide/intro.md.html', {
      responseType: 'text',
    } as any);
    expect(result).toEqual({contents: 'file contents', id: 'guide/intro.md.html'});
  });

  it('should not append .md.html if path has extension', async () => {
    httpClientSpy.get.and.returnValue(of('other contents'));
    const result = await service.getContent('guide/intro.html');
    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/content/guide/intro.html', {
      responseType: 'text',
    } as any);
    expect(result).toEqual({contents: 'other contents', id: 'guide/intro.html'});
  });

  it('should cache requests for the same path', async () => {
    httpClientSpy.get.and.returnValue(of('cached contents'));
    const promise1 = service.getContent('cached');
    const promise2 = service.getContent('cached');
    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
  });

  it('should remove cache on non-404 error', async () => {
    const error = {status: 500, name: 'HttpErrorResponse'};
    httpClientSpy.get.and.returnValue(throwError(() => error));
    await expectAsync(service.getContent('error')).toBeRejectedWith(error);
    httpClientSpy.get.calls.reset();
    httpClientSpy.get.and.returnValue(of('recovered'));
    const result = await service.getContent('error');
    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual({contents: 'recovered', id: 'error.md.html'});
  });

  it('should not remove cache on 404 error', async () => {
    const error = {status: 404, name: 'HttpErrorResponse'};
    httpClientSpy.get.and.returnValue(throwError(() => error));
    await expectAsync(service.getContent('notfound')).toBeRejectedWith(error);
    httpClientSpy.get.calls.reset();
    await expectAsync(service.getContent('notfound')).toBeRejectedWith(error);
    expect(httpClientSpy.get).not.toHaveBeenCalled();
  });
});
