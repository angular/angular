// Imports
import {EventEmitter} from 'events';
import {ClientRequest, IncomingMessage} from 'http';
import * as https from 'https';
import {GithubApi} from '../../lib/common/github-api';

// Tests
describe('GithubApi', () => {
  let api: GithubApi;

  beforeEach(() => api = new GithubApi('12345'));


  describe('constructor()', () => {

    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => new GithubApi('')).toThrowError('Missing or empty required parameter \'githubToken\'!');
    });

  });


  describe('get()', () => {
    let apiBuildPathSpy: jasmine.Spy;
    let apiRequestSpy: jasmine.Spy;

    beforeEach(() => {
      apiBuildPathSpy = spyOn(api as any, 'buildPath');
      apiRequestSpy = spyOn(api as any, 'request');
    });


    it('should call \'buildPath()\' with the pathname and params', () => {
      api.get('/foo', {bar: 'baz'});

      expect(apiBuildPathSpy).toHaveBeenCalled();
      expect(apiBuildPathSpy.calls.argsFor(0)).toEqual(['/foo', {bar: 'baz'}]);
    });


    it('should call \'request()\' with the correct method', () => {
      api.get('/foo');

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[0]).toBe('get');
    });


    it('should call \'request()\' with the correct path', () => {
      apiBuildPathSpy.and.returnValue('/foo/bar');
      api.get('foo');

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[1]).toBe('/foo/bar');
    });


    it('should not pass data to \'request()\'', () => {
      (api.get as any)('foo', {}, {});

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[2]).toBeUndefined();
    });

  });


  describe('post()', () => {
    let apiBuildPathSpy: jasmine.Spy;
    let apiRequestSpy: jasmine.Spy;

    beforeEach(() => {
      apiBuildPathSpy = spyOn(api as any, 'buildPath');
      apiRequestSpy = spyOn(api as any, 'request');
    });


    it('should call \'buildPath()\' with the pathname and params', () => {
      api.post('/foo', {bar: 'baz'});

      expect(apiBuildPathSpy).toHaveBeenCalled();
      expect(apiBuildPathSpy.calls.argsFor(0)).toEqual(['/foo', {bar: 'baz'}]);
    });


    it('should call \'request()\' with the correct method', () => {
      api.post('/foo');

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[0]).toBe('post');
    });


    it('should call \'request()\' with the correct path', () => {
      apiBuildPathSpy.and.returnValue('/foo/bar');
      api.post('/foo');

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[1]).toBe('/foo/bar');
    });


    it('should pass the data to \'request()\'', () => {
      api.post('/foo', {}, {bar: 'baz'});

      expect(apiRequestSpy).toHaveBeenCalled();
      expect(apiRequestSpy.calls.argsFor(0)[2]).toEqual({bar: 'baz'});
    });

  });


  // Protected methods

  describe('buildPath()', () => {

    it('should return the pathname if no params', () => {
      expect((api as any).buildPath('/foo')).toBe('/foo');
      expect((api as any).buildPath('/foo', undefined)).toBe('/foo');
      expect((api as any).buildPath('/foo', null)).toBe('/foo');
    });


    it('should append the params to the pathname', () => {
      expect((api as any).buildPath('/foo', {bar: 'baz'})).toBe('/foo?bar=baz');
    });


    it('should join the params with \'&\'', () => {
      expect((api as any).buildPath('/foo', {bar: 1, baz: 2})).toBe('/foo?bar=1&baz=2');
    });


    it('should ignore undefined/null params', () => {
      expect((api as any).buildPath('/foo', {bar: undefined, baz: null})).toBe('/foo');
    });


    it('should encode param values as URI components', () => {
      expect((api as any).buildPath('/foo', {bar: 'b a&z'})).toBe('/foo?bar=b%20a%26z');
    });

  });


  describe('getPaginated()', () => {
    let deferreds: {resolve: (v: any) => void, reject: (v: any) => void}[];

    beforeEach(() => {
      deferreds = [];
      spyOn(api, 'get').and.callFake(() => new Promise((resolve, reject) => deferreds.push({resolve, reject})));
    });


    it('should return a promise', () => {
      expect((api as any).getPaginated()).toEqual(jasmine.any(Promise));
    });


    it('should call \'get()\' with the correct pathname and params', () => {
      (api as any).getPaginated('/foo/bar');
      (api as any).getPaginated('/foo/bar', {baz: 'qux'});

      expect(api.get).toHaveBeenCalledWith('/foo/bar', {page: 0, per_page: 100});
      expect(api.get).toHaveBeenCalledWith('/foo/bar', {baz: 'qux', page: 0, per_page: 100});
    });


    it('should reject if the request fails', done => {
      (api as any).getPaginated('/foo/bar').catch((err: any) => {
        expect(err).toBe('Test');
        done();
      });

      deferreds[0].reject('Test');
    });


    it('should resolve with the returned items', done => {
      const items = [{id: 1}, {id: 2}];

      (api as any).getPaginated('/foo/bar').then((data: any) => {
        expect(data).toEqual(items);
        done();
      });

      deferreds[0].resolve(items);
    });


    it('should iteratively call \'get()\' to fetch all items', done => {
      // Create an array or 250 objects.
      const allItems = '.'.repeat(250).split('').map((_, i) => ({id: i}));
      const apiGetSpy = api.get as jasmine.Spy;

      (api as any).getPaginated('/foo/bar', {baz: 'qux'}).then((data: any) => {
        const paramsForPage = (page: number) => ({baz: 'qux', page, per_page: 100});

        expect(apiGetSpy).toHaveBeenCalledTimes(3);
        expect(apiGetSpy.calls.argsFor(0)).toEqual(['/foo/bar', paramsForPage(0)]);
        expect(apiGetSpy.calls.argsFor(1)).toEqual(['/foo/bar', paramsForPage(1)]);
        expect(apiGetSpy.calls.argsFor(2)).toEqual(['/foo/bar', paramsForPage(2)]);

        expect(data).toEqual(allItems);

        done();
      });

      deferreds[0].resolve(allItems.slice(0, 100));
      setTimeout(() => {
        deferreds[1].resolve(allItems.slice(100, 200));
        setTimeout(() => {
          deferreds[2].resolve(allItems.slice(200));
        }, 0);
      }, 0);
    });

  });


  describe('request()', () => {
    let httpsRequestSpy: jasmine.Spy;
    let latestRequest: ClientRequest;

    beforeEach(() => {
      const originalRequest = https.request;

      httpsRequestSpy = spyOn(https, 'request').and.callFake((...args: any[]) => {
        latestRequest = originalRequest.apply(https, args);

        spyOn(latestRequest, 'on').and.callThrough();
        spyOn(latestRequest, 'end');

        return latestRequest;
      });
    });


    it('should return a promise', () => {
      expect((api as any).request()).toEqual(jasmine.any(Promise));
    });


    it('should call \'https.request()\' with the correct options', () => {
      (api as any).request('method', 'path');

      expect(httpsRequestSpy).toHaveBeenCalled();
      expect(httpsRequestSpy.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'User-Agent': `Node/${process.versions.node}`,
        }),
        host: 'api.github.com',
        method: 'method',
        path: 'path',
      }));
    });


    it('should call specify an \'Authorization\' header if \'githubToken\' is present', () => {
      (api as any).request('method', 'path');

      expect(httpsRequestSpy).toHaveBeenCalled();
      expect(httpsRequestSpy.calls.argsFor(0)[0].headers).toEqual(jasmine.objectContaining({
        Authorization: 'token 12345',
      }));
    });


    it('should reject on request error', done => {
      (api as any).request('method', 'path').catch((err: any) => {
        expect(err).toBe('Test');
        done();
      });

      latestRequest.emit('error', 'Test');
    });


    it('should send the request (i.e. call \'end()\')', () => {
      (api as any).request('method', 'path');
      expect(latestRequest.end).toHaveBeenCalled();
    });


    it('should \'JSON.stringify\' and send the data along with the request', () => {
      (api as any).request('method', 'path');
      expect(latestRequest.end).toHaveBeenCalledWith(null);

      (api as any).request('method', 'path', {key: 'value'});
      expect(latestRequest.end).toHaveBeenCalledWith('{"key":"value"}');
    });


    describe('onResponse', () => {
      let promise: Promise<object>;
      let respond: (statusCode: number) => IncomingMessage;

      beforeEach(() => {
        promise = (api as any).request('method', 'path');

        respond = (statusCode: number) => {
          const mockResponse = new EventEmitter() as IncomingMessage;
          mockResponse.statusCode = statusCode;

          const onResponse = httpsRequestSpy.calls.argsFor(0)[1];
          onResponse(mockResponse);

          return mockResponse;
        };
      });


      it('should reject on response error', done => {
        promise.catch(err => {
          expect(err).toBe('Test');
          done();
        });

        const res = respond(200);
        res.emit('error', 'Test');
      });


      it('should reject if returned statusCode is <200', done => {
        promise.catch(err => {
          expect(err).toContain('failed');
          expect(err).toContain('status: 199');
          done();
        });

        const res = respond(199);
        res.emit('end');
      });


      it('should reject if returned statusCode is >=400', done => {
        promise.catch(err => {
          expect(err).toContain('failed');
          expect(err).toContain('status: 400');
          done();
        });

        const res = respond(400);
        res.emit('end');
      });


      it('should include the response text in the rejection message', done => {
        promise.catch(err => {
          expect(err).toContain('Test');
          done();
        });

        const res = respond(500);
        res.emit('data', 'Test');
        res.emit('end');
      });


      it('should resolve if returned statusCode is <=200 <400', done => {
        promise.then(done);

        const res = respond(200);
        res.emit('data', '{}');
        res.emit('end');
      });


      it('should resolve with the response text \'JSON.parsed\'', done => {
        promise.then(data => {
          expect(data).toEqual({foo: 'bar'});
          done();
        });

        const res = respond(300);
        res.emit('data', '{"foo":"bar"}');
        res.emit('end');
      });


      it('should collect and concatenate the whole response text', done => {
        promise.then(data => {
          expect(data).toEqual({foo: 'bar', baz: 'qux'});
          done();
        });

        const res = respond(300);
        res.emit('data', '{"foo":');
        res.emit('data', '"bar","baz"');
        res.emit('data', ':"qux"}');
        res.emit('end');
      });


      it('should reject if the response text is malformed JSON', done => {
        promise.catch(err => {
          expect(err).toEqual(jasmine.any(SyntaxError));
          done();
        });

        const res = respond(300);
        res.emit('data', '}');
        res.emit('end');
      });

    });

  });

});
