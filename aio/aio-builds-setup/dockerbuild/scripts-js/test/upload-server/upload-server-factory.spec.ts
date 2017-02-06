// Imports
import * as express from 'express';
import * as http from 'http';
import * as supertest from 'supertest';
import {BuildCreator} from '../../lib/upload-server/build-creator';
import {CreatedBuildEvent} from '../../lib/upload-server/build-events';
import {uploadServerFactory as usf} from '../../lib/upload-server/upload-server-factory';

// Tests
describe('uploadServerFactory', () => {

  describe('create()', () => {
    let usfCreateMiddlewareSpy: jasmine.Spy;

    beforeEach(() => {
      usfCreateMiddlewareSpy = spyOn(usf as any, 'createMiddleware').and.callThrough();
    });


    it('should throw if \'buildsDir\' is empty', () => {
      expect(() => usf.create('')).toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should return an http.Server', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();
      const server = usf.create('builds/dir');

      expect(server).toBe(httpCreateServerSpy.calls.mostRecent().returnValue);
    });


    it('should create and use an appropriate middleware', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();

      usf.create('builds/dir');
      const middleware: express.Express = usfCreateMiddlewareSpy.calls.mostRecent().returnValue;

      expect(usfCreateMiddlewareSpy).toHaveBeenCalledWith(jasmine.any(BuildCreator));
      expect(httpCreateServerSpy).toHaveBeenCalledWith(middleware);
    });


    it('should pass \'buildsDir\' to the created BuildCreator', () => {
      usf.create('builds/dir');
      const buildCreator: BuildCreator = usfCreateMiddlewareSpy.calls.argsFor(0)[0];

      expect((buildCreator as any).buildsDir).toBe('builds/dir');
    });


    it('should pass CreatedBuildEvents emitted on BuildCreator through to the server', done => {
      const server = usf.create('builds/dir');
      const buildCreator: BuildCreator = usfCreateMiddlewareSpy.calls.argsFor(0)[0];
      const evt = new CreatedBuildEvent(42, 'foo');

      server.on(CreatedBuildEvent.type, (data: CreatedBuildEvent) => {
        expect(data).toBe(evt);
        done();
      });

      buildCreator.emit(CreatedBuildEvent.type, evt);
    });


    it('should log the server address info on \'listening\'', () => {
      const consoleInfoSpy = spyOn(console, 'info');
      const server = usf.create('builds/dir');
      server.address = () => ({address: 'foo', family: '', port: 1337});

      expect(consoleInfoSpy).not.toHaveBeenCalled();

      server.emit('listening');
      expect(consoleInfoSpy).toHaveBeenCalledWith('Up and running (and listening on foo:1337)...');
    });

  });


  // Protected methods

  describe('createMiddleware()', () => {
    let buildCreator: BuildCreator;
    let agent: supertest.SuperTest<supertest.Test>;

    // Helpers
    const promisifyRequest = (req: supertest.Request) =>
      new Promise((resolve, reject) => req.end(err => err ? reject(err) : resolve()));
    const verifyRequests = (reqs: supertest.Request[], done: jasmine.DoneFn) =>
      Promise.all(reqs.map(promisifyRequest)).then(done, done.fail);

    beforeEach(() => {
      buildCreator = new BuildCreator('builds/dir');
      agent = supertest.agent((usf as any).createMiddleware(buildCreator));

      spyOn(console, 'error');
    });


    describe('GET /create-build/<pr>/<sha>', () => {
      const pr = '9';
      const sha = '9'.repeat(40);
      let buildCreatorCreateSpy: jasmine.Spy;
      let deferred: {resolve: Function, reject: Function};

      beforeEach(() => {
        const promise = new Promise((resolve, reject) => deferred = {resolve, reject});
        promise.catch(() => null);   // Avoid "unhandled rejection" warnings.

        buildCreatorCreateSpy = spyOn(buildCreator, 'create').and.returnValue(promise);
      });


      it('should respond with 405 for non-GET requests', done => {
        verifyRequests([
          agent.put(`/create-build/${pr}/${sha}`).expect(405),
          agent.post(`/create-build/${pr}/${sha}`).expect(405),
          agent.patch(`/create-build/${pr}/${sha}`).expect(405),
          agent.delete(`/create-build/${pr}/${sha}`).expect(405),
        ], done);
      });


      it('should respond with 400 for requests without an \'X-FILE\' header', done => {
        const url = `/create-build/${pr}/${sha}`;
        const responseBody = `Missing or empty 'X-FILE' header in request: GET ${url}`;

        verifyRequests([
          agent.get(url).expect(400, responseBody),
          agent.get(url).field('X-FILE', '').expect(400, responseBody),
        ], done);
      });


      it('should respond with 404 for unknown paths', done => {
        verifyRequests([
          agent.get(`/foo/create-build/${pr}/${sha}`).expect(404),
          agent.get(`/foo-create-build/${pr}/${sha}`).expect(404),
          agent.get(`/fooncreate-build/${pr}/${sha}`).expect(404),
          agent.get(`/create-build/foo/${pr}/${sha}`).expect(404),
          agent.get(`/create-build-foo/${pr}/${sha}`).expect(404),
          agent.get(`/create-buildnfoo/${pr}/${sha}`).expect(404),
          agent.get(`/create-build/pr${pr}/${sha}`).expect(404),
          agent.get(`/create-build/${pr}/${sha}42`).expect(404),
        ], done);
      });


      it('should propagate errors from BuildCreator', done => {
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('X-FILE', 'foo').
          expect(500, 'Test');

        verifyRequests([req], done);
        deferred.reject('Test');
      });


      it('should respond with 201 on successful upload', done => {
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('X-FILE', 'foo').
          expect(201, http.STATUS_CODES[201]);

        verifyRequests([req], done);
        deferred.resolve();
      });


      it('should call \'BuildCreator#create()\' with appropriate arguments', done => {
        promisifyRequest(agent.get(`/create-build/${pr}/${sha}`).set('X-FILE', 'foo').expect(201)).
          then(() => expect(buildCreatorCreateSpy).toHaveBeenCalledWith(pr, sha, 'foo')).
          then(done, done.fail);

        deferred.resolve();
      });


      it('should reject PRs with leading zeros', done => {
        verifyRequests([agent.get(`/create-build/0${pr}/${sha}`).expect(404)], done);
      });


      it('should accept SHAs with leading zeros (but not ignore them)', done => {
        const sha40 = '0'.repeat(40);
        const sha41 = `0${sha40}`;

        Promise.all([
          promisifyRequest(agent.get(`/create-build/${pr}/${sha41}`).expect(404)),
          promisifyRequest(agent.get(`/create-build/${pr}/${sha40}`).set('X-FILE', 'foo')).
            then(() => expect(buildCreatorCreateSpy).toHaveBeenCalledWith(pr, sha40, 'foo')),
        ]).then(done, done.fail);

        deferred.resolve();
      });

    });


    describe('GET /health-check', () => {

      it('should respond with 200', done => {
        verifyRequests([
          agent.get('/health-check').expect(200),
          agent.get('/health-check/').expect(200),
         ], done);
      });


      it('should respond with 405 for non-GET requests', done => {
        verifyRequests([
          agent.put('/health-check').expect(405),
          agent.post('/health-check').expect(405),
          agent.patch('/health-check').expect(405),
          agent.delete('/health-check').expect(405),
        ], done);
      });


      it('should respond with 404 if the path does not match exactly', done => {
        verifyRequests([
          agent.get('/health-check/foo').expect(404),
          agent.get('/health-check-foo').expect(404),
          agent.get('/health-checknfoo').expect(404),
          agent.get('/foo/health-check').expect(404),
          agent.get('/foo-health-check').expect(404),
          agent.get('/foonhealth-check').expect(404),
        ], done);
      });

    });


    describe('GET *', () => {

      it('should respond with 404', done => {
        const responseBody = 'Unknown resource in request: GET /some/url';
        verifyRequests([agent.get('/some/url').expect(404, responseBody)], done);
      });

    });


    describe('ALL *', () => {

      it('should respond with 405', done => {
        const responseFor = (method: string) => `Unsupported method in request: ${method.toUpperCase()} /some/url`;

        verifyRequests([
          agent.put('/some/url').expect(405, responseFor('put')),
          agent.post('/some/url').expect(405, responseFor('post')),
          agent.patch('/some/url').expect(405, responseFor('patch')),
          agent.delete('/some/url').expect(405, responseFor('delete')),
        ], done);
      });

    });

  });

});
