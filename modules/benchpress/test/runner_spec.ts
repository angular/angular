import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/testing_internal';
import {
  Runner,
  Sampler,
  SampleDescription,
  Validator,
  bind,
  provide,
  ReflectiveInjector,
  Injector,
  Metric,
  Options,
  WebDriverAdapter,
  SampleState
} from 'benchpress/common';
import {isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  describe('runner', () => {
    var injector: ReflectiveInjector;
    var runner;

    function createRunner(defaultBindings = null): Runner {
      if (isBlank(defaultBindings)) {
        defaultBindings = [];
      }
      runner = new Runner([
        defaultBindings,
        bind(Sampler).toFactory(
            (_injector) => {
              injector = _injector;
              return new MockSampler();
            },
            [Injector]),
        bind(Metric).toFactory(() => new MockMetric(), []),
        bind(Validator).toFactory(() => new MockValidator(), []),
        bind(WebDriverAdapter).toFactory(() => new MockWebDriverAdapter(), [])
      ]);
      return runner;
    }

    it('should set SampleDescription.id', inject([AsyncTestCompleter], (async) => {
         createRunner()
             .sample({id: 'someId'})
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.id).toBe('someId');
               async.done();
             });
       }));

    it('should merge SampleDescription.description', inject([AsyncTestCompleter], (async) => {
         createRunner([bind(Options.DEFAULT_DESCRIPTION).toValue({'a': 1})])
             .sample({id: 'someId', bindings: [bind(Options.SAMPLE_DESCRIPTION).toValue({'b': 2})]})
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.description)
                   .toEqual(
                       {'forceGc': false, 'userAgent': 'someUserAgent', 'a': 1, 'b': 2, 'v': 11});
               async.done();
             });
       }));

    it('should fill SampleDescription.metrics from the Metric',
       inject([AsyncTestCompleter], (async) => {
         createRunner()
             .sample({id: 'someId'})
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {

               expect(desc.metrics).toEqual({'m1': 'some metric'});
               async.done();
             });
       }));

    it('should bind Options.EXECUTE', inject([AsyncTestCompleter], (async) => {
         var execute = () => {};
         createRunner()
             .sample({id: 'someId', execute: execute})
             .then((_) => {
               expect(injector.get(Options.EXECUTE)).toEqual(execute);
               async.done();
             });
       }));

    it('should bind Options.PREPARE', inject([AsyncTestCompleter], (async) => {
         var prepare = () => {};
         createRunner()
             .sample({id: 'someId', prepare: prepare})
             .then((_) => {
               expect(injector.get(Options.PREPARE)).toEqual(prepare);
               async.done();
             });
       }));

    it('should bind Options.MICRO_METRICS', inject([AsyncTestCompleter], (async) => {
         createRunner()
             .sample({id: 'someId', microMetrics: {'a': 'b'}})
             .then((_) => {
               expect(injector.get(Options.MICRO_METRICS)).toEqual({'a': 'b'});
               async.done();
             });
       }));

    it('should overwrite bindings per sample call', inject([AsyncTestCompleter], (async) => {
         createRunner([
           bind(Options.DEFAULT_DESCRIPTION)
               .toValue({'a': 1}),
         ])
             .sample({
               id: 'someId',
               bindings: [
                 bind(Options.DEFAULT_DESCRIPTION)
                     .toValue({'a': 2}),
               ]
             })
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {

               expect(desc.description['a']).toBe(2);
               async.done();
             });

       }));

  });
}

class MockWebDriverAdapter extends WebDriverAdapter {
  executeScript(script): Promise<string> { return PromiseWrapper.resolve('someUserAgent'); }
  capabilities() { return null; }
}

class MockValidator extends Validator {
  constructor() { super(); }
  describe() { return {'v': 11}; }
}

class MockMetric extends Metric {
  constructor() { super(); }
  describe() { return {'m1': 'some metric'}; }
}

class MockSampler extends Sampler {
  constructor() { super(); }
  sample(): Promise<SampleState> { return PromiseWrapper.resolve(new SampleState([], [])); }
}
