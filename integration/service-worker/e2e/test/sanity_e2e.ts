import {create, Server} from '../server/server';
import {sendPush} from '../server/push';
import {HarnessPageObject} from '../server/page-object';

import fs = require('fs');

import {browser} from 'protractor';

let server: Server;
let po: HarnessPageObject;

const SIMPLE_MANIFEST = {
  static: {
    urls: {
      '/hello.txt': 'test',
      '/goodbye.txt': 'same',
    }
  },
  external: {
    urls: [
      {url: 'http://localhost:8080/full.txt'},
    ],
  },
  push: {
    showNotifications: true
  }
};

const UPDATE_MANIFEST = {
  static: {
    urls: {
      '/hello.txt': 'changed',
      '/goodbye.txt': 'same'
    }
  },
  push: {
    showNotifications: true
  }
};

const FORCED_UPDATE_MANIFEST = {
  static: {
    urls: {
      '/hello.txt': 'changed_again',
      '/goodbye.txt': 'same',
      '/index2.html': 'added'
    },
  },
  dynamic: {
    group: [{
      name: 'testPerf',
      urls: {
        '/perf': {
          match: 'prefix',
        },
      },
      cache: {
        optimizeFor: 'performance',
        strategy: 'fifo',
        maxEntries: 10,
        refreshAheadMs: 1000,
      },
    }, {
      name: 'testFresh',
      urls: {
        '/fresh': {
          match: 'prefix',
        },
      },
      cache: {
        optimizeFor: 'freshness',
        strategy: 'fifo',
        maxEntries: 10,
        networkTimeoutMs: 1000,
      },
    }],
  },
};

beforeAll(done => {
  console.log(process.cwd());
  create(8080, 'dist').then(s => {
    server = s;
    done();
  });
});

beforeEach(() => {
  server.clearResponses();
  po = new HarnessPageObject();
});


afterAll(done => {
  server.shutdown();
  done();
});

function expectNoServiceWorker(): Promise<void> {
  return po
    .hasServiceWorker()
    .then(workerPresent => {
      expect(workerPresent).toBeFalsy();
    });
}

describe('world sanity', () => {
  it('starts without a service worker', done => {
    browser.get('/index.html');
    po
      .hasActiveWorker()
      .then(hasWorker => {
        expect(hasWorker).toBeFalsy();
      })
      .then(done);
  });
  it('starts without cache keys', done => {
    po
      .cacheKeys()
      .then(keys => {
        expect(keys).toEqual([]);
      })
      .then(done);
  })
  it('able to mock a request', done => {
    server.addResponse('/hello.txt', 'Hello world!');
    po
      .request('/hello.txt')
      .then(result => {
        expect(result).toBe('Hello world!');
      })
      .then(done);
  });
  it('can install a service worker', done => {
    server.addResponse('/ngsw-manifest.json.js', '/* mocked */');
    server.addResponse('/ngsw-manifest.json', JSON.stringify(SIMPLE_MANIFEST));
    server.addResponse('/hello.txt', 'Hello world!');
    server.addResponse('/full.txt', 'Cached initially!');
    server.addResponse('/goodbye.txt', 'Goodbye world!');
    po.installServiceWorker('/worker-test.js');
    po
      .hasActiveWorker()
      .then(hasWorker => {
        expect(hasWorker).toBeTruthy();
      })
      .then(done);
  });
  it('after reload, worker serves cached /hello.txt', done => {
    browser.get('/index.html');
    server.addResponse('/hello.txt', 'Goodbye world?');
    setTimeout(() => po
      .request('/hello.txt')
      .then(result => expect(result).toBe('Hello world!'))
      .then(done), 2000);
  });
  it('and cached /full.txt with full url', done => {
    server.addResponse('/full.txt', 'Not cached?');
    po
      .request('http://localhost:8080/full.txt')
      .then(result => expect(result).toBe('Cached initially!'))
      .then(done);
});
  it('worker responds to ping', done => {
    po
      .ping()
      .then(result => {
        expect(result).toBe('pong');
      })
      .then(done);
  });
  it('sends push notifications', done => {
    po
      .registerForPush()
      .then(result => JSON.parse(result))
      .then(reg => po.waitForPush())
      .then(() => po.asyncResult)
      .then(result => JSON.parse(result))
      .then(result => {
        expect(result['message']).toBe('hello from the server');
      })
      .then(done);
  });
  it('updates the page', done => {
    server.addResponse('/ngsw-manifest.json', JSON.stringify(UPDATE_MANIFEST));
    server.addResponse('/hello.txt', 'Hola mundo!');
    server.addResponse('/goodbye.txt', 'Should not be re-fetched.');
    server.addResponse('/full.txt', 'Should be reloaded');
    po
      .checkForUpdate()
      .then(updated => expect(updated).toBeTruthy())
      .then(() => browser.refresh())
      .then(() => server.addResponse('/hello.txt', 'Should not be re-fetched either.'))
      .then(() => po.request('/hello.txt'))
      .then(result => expect(result).toBe('Hola mundo!'))
      .then(() => po.request('/goodbye.txt'))
      .then(result => expect(result).toBe('Goodbye world!'))
      .then(() => po.request('http://localhost:8080/full.txt'))
      .then(result => expect(result).toBe('Should be reloaded'))
      .then(() => done());
  });
  it('notifies the app when an update is available', done => {
    server.addResponse('/ngsw-manifest.json', JSON.stringify(FORCED_UPDATE_MANIFEST));
    server.addResponse('/hello.txt', 'And again');
    server.addResponse('/goodbye.txt', 'Should still not be re-fetched.');
    Promise
      .resolve()
      .then(() => po.subscribeToUpdates())
      .then(() => po.checkForUpdate())
      .then(updated => expect(updated).toBeTruthy())
      .then(() => po.updates)
      .then(updates => JSON.parse(updates))
      .then(updates => {
        expect(updates.length).toBe(1);
        const update = updates[0];
        expect(update['type']).toBe('pending');
        const hash = update['version'];
        po.reset();
        return po.forceUpdate(hash);
      })
      .then(() => po.updates)
      .then(updates => JSON.parse(updates))
      .then(updates => {
        expect(updates.length).toBe(2);
        expect(updates[1].type).toBe('activation');
      })
      .then(() => po.request('/hello.txt'))
      .then(result => expect(result).toBe('And again'))
      .then(() => po.request('/goodbye.txt'))
      .then(result => expect(result).toBe('Goodbye world!'))
      .then(() => done());
  });
  it('requests fresh data from the server', done => {
    server.addResponse('/fresh/test', 'Returned right away.');
    Promise
      .resolve()
      .then(() => po.request('/fresh/test'))
      .then(result => expect(result).toBe('Returned right away.'))
      .then(() => server.addResponse('/fresh/test', 'Delayed long', 2000))
      .then(() => po.request('/fresh/test'))
      .then(result => expect(result).toBe('Returned right away.'))
      .then(() => wait(1500))
      .then(() => server.addResponse('/fresh/test', 'Delayed longer', 3000))
      .then(() => po.request('/fresh/test'))
      .then(result => expect(result).toBe('Delayed long'))
      .then(() => done());
  });
  it('reloads from /index2.html without failure', done => {
    (browser
      .get('http://localhost:8080/index2.html') as any as Promise<any>)
      .then(() => po.ping())
      .then(() => done());
  });
});

function wait(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), delayMs);
  });
}
