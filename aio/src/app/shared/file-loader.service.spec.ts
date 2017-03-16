// import { WebpackFileLoaderService as FileLoaderService } from './file-loader-webpack.service';
import { XhrFileLoaderService as FileLoaderService } from './file-loader-xhr.service';

import 'rxjs/add/operator/map';

describe('FileLoaderService', () => {

  const navJsonUrl = 'navigation.json';

  let service: FileLoaderService;

  beforeEach(() => {
    service = new FileLoaderService();
  });

  it(`should get '${navJsonUrl}'`, done => {
    const req = service.load(navJsonUrl);
    req.subscribe(
      resp => {
        expect(resp.text().length).toBeGreaterThan(0, 'expect text');
      },
      err => {
        fail(err);
        done();
      },
      done
    );

  }, 500);

  it(`should get navigation JSON from '${navJsonUrl}'`, done => {
    const req = service.load(navJsonUrl).map(resp => resp.json());

    req.subscribe(
      data => {
        expect(data['SideNav']).toBeDefined('expect SideNav JSON');
        expect(data['TopBar']).toBeDefined('expect TopBar JSON');
      },
      err => {
        fail(err);
        done();
      },
      done
    );
  }, 500);

  it(`should 404 for bad URL`, done => {
    const req = service.load('this/is/bad');
    req.subscribe(
      resp => {
        throw new Error('Should fail but got a success response');
      },
      err => {
        expect(err).toBeDefined();
        expect(err.status).toBe(404, 'status 404 - Not Found');
        done();
      },
      () => {
        throw new Error('Should fail and not complete');
      }
    );
  }, 500);

  it(`should 400 for empty URL`, done => {
    const req = service.load(undefined);
    req.subscribe(
      resp => {
        throw new Error('Should fail but got a success response');
      },
      err => {
        expect(err).toBeDefined();
        expect(err.status).toBe(400, 'status 400 - Bad Request');
        done();
      },
      () => {
        throw new Error('Should fail and not complete');
      }
    );
  }, 500);
});

//// Helpers /////
class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
  warn = jasmine.createSpy('warn');
}
