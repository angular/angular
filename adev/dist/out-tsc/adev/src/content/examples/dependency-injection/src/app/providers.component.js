import {__esDecorate, __runInitializers} from 'tslib';
/*
 * A collection of demo components showing different ways to provide services
 * in @Component metadata
 */
import {Component, inject, Injectable} from '@angular/core';
import {APP_CONFIG, HERO_DI_CONFIG} from './injection.config';
import {HeroService} from './heroes/hero.service';
import {heroServiceProvider} from './heroes/hero.service.provider';
import {Logger} from './logger.service';
import {UserService} from './user.service';
const template = '{{log}}';
let Provider1Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-1',
      template,
      // #docregion providers-logger
      providers: [Logger],
      // #enddocregion providers-logger
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider1Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider1Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const logger = inject(Logger);
      logger.log('Hello from logger provided with Logger class');
      this.log = logger.logs[0];
    }
  };
  return (Provider1Component = _classThis);
})();
export {Provider1Component};
//////////////////////////////////////////
let Provider3Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-3',
      template,
      providers:
        // #docregion providers-3
        [{provide: Logger, useClass: Logger}],
      // #enddocregion providers-3
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider3Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider3Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const logger = inject(Logger);
      logger.log('Hello from logger provided with useClass:Logger');
      this.log = logger.logs[0];
    }
  };
  return (Provider3Component = _classThis);
})();
export {Provider3Component};
//////////////////////////////////////////
export class BetterLogger extends Logger {}
let Provider4Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-4',
      template,
      providers:
        // #docregion providers-4
        [{provide: Logger, useClass: BetterLogger}],
      // #enddocregion providers-4
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider4Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider4Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const logger = inject(Logger);
      logger.log('Hello from logger provided with useClass:BetterLogger');
      this.log = logger.logs[0];
    }
  };
  return (Provider4Component = _classThis);
})();
export {Provider4Component};
//////////////////////////////////////////
// #docregion EvenBetterLogger
let EvenBetterLogger = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = Logger;
  var EvenBetterLogger = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      EvenBetterLogger = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    userService = inject(UserService);
    log(message) {
      const name = this.userService.user.name;
      super.log(`Message to ${name}: ${message}`);
    }
  };
  return (EvenBetterLogger = _classThis);
})();
export {EvenBetterLogger};
// #enddocregion EvenBetterLogger
let Provider5Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-5',
      template,
      providers:
        // #docregion providers-5
        [UserService, {provide: Logger, useClass: EvenBetterLogger}],
      // #enddocregion providers-5
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider5Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider5Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const logger = inject(Logger);
      logger.log('Hello from EvenBetterlogger');
      this.log = logger.logs[0];
    }
  };
  return (Provider5Component = _classThis);
})();
export {Provider5Component};
//////////////////////////////////////////
export class NewLogger extends Logger {}
export class OldLogger {
  logs = [];
  log(message) {
    throw new Error('Should not call the old logger!');
  }
}
let Provider6aComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-6a',
      template,
      providers: [
        NewLogger,
        // Not aliased! Creates two instances of `NewLogger`
        {provide: OldLogger, useClass: NewLogger},
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider6aComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider6aComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const newLogger = inject(NewLogger);
      const oldLogger = inject(OldLogger);
      if (newLogger === oldLogger) {
        throw new Error('expected the two loggers to be different instances');
      }
      oldLogger.log('Hello OldLogger (but we want NewLogger)');
      // The newLogger wasn't called so no logs[]
      // display the logs of the oldLogger.
      this.log = newLogger.logs[0] || oldLogger.logs[0];
    }
  };
  return (Provider6aComponent = _classThis);
})();
export {Provider6aComponent};
let Provider6bComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-6b',
      template,
      providers:
        // #docregion providers-6b
        [
          NewLogger,
          // Alias OldLogger w/ reference to NewLogger
          {provide: OldLogger, useExisting: NewLogger},
        ],
      // #enddocregion providers-6b
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider6bComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider6bComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const newLogger = inject(NewLogger);
      const oldLogger = inject(OldLogger);
      if (newLogger !== oldLogger) {
        throw new Error('expected the two loggers to be the same instance');
      }
      oldLogger.log('Hello from NewLogger (via aliased OldLogger)');
      this.log = newLogger.logs[0];
    }
  };
  return (Provider6bComponent = _classThis);
})();
export {Provider6bComponent};
//////////////////////////////////////////
// An object in the shape of the logger service
function silentLoggerFn() {}
export const SilentLogger = {
  logs: ['Silent logger says "Shhhhh!". Provided via "useValue"'],
  log: silentLoggerFn,
};
let Provider7Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-7',
      template,
      providers: [{provide: Logger, useValue: SilentLogger}],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider7Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider7Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log;
    constructor() {
      const logger = inject(Logger);
      logger.log('Hello from logger provided with useValue');
      this.log = logger.logs[0];
    }
  };
  return (Provider7Component = _classThis);
})();
export {Provider7Component};
/////////////////
let Provider8Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-8',
      template,
      providers: [heroServiceProvider, Logger, UserService],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider8Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider8Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // must be true else this component would have blown up at runtime
    log = 'Hero service injected successfully via heroServiceProvider';
    heroService = inject(HeroService);
  };
  return (Provider8Component = _classThis);
})();
export {Provider8Component};
/////////////////
let Provider9Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-9',
      template,
      /*
             // #docregion providers-9-interface
             // Can't use interface as provider token
             [{ provide: AppConfig, useValue: HERO_DI_CONFIG })]
             // #enddocregion providers-9-interface
             */
      // #docregion providers-9
      providers: [{provide: APP_CONFIG, useValue: HERO_DI_CONFIG}],
      // #enddocregion providers-9
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider9Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider9Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log = '';
    /*
         // #docregion provider-9-ctor-interface
         // Can't inject using the interface as the parameter type
         constructor(private config: AppConfig){ }
         // #enddocregion provider-9-ctor-interface
         */
    config = inject(APP_CONFIG);
    constructor() {
      this.log = 'APP_CONFIG Application title is ' + this.config.title;
    }
  };
  return (Provider9Component = _classThis);
})();
export {Provider9Component};
const someMessage = 'Hello from the injected logger';
let Provider10Component = (() => {
  let _classDecorators = [
    Component({
      selector: 'provider-10',
      template,
      providers: [{provide: Logger, useValue: null}],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Provider10Component = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Provider10Component = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    log = '';
    logger = inject(Logger, {optional: true});
    constructor() {
      if (this.logger) {
        this.logger.log(someMessage);
      }
    }
    ngOnInit() {
      this.log = this.logger ? this.logger.logs[0] : 'Optional logger was not available';
    }
  };
  return (Provider10Component = _classThis);
})();
export {Provider10Component};
/////////////////
let ProvidersComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-providers',
      template: `
  <h2>Provider variations</h2>
  <div id="p1"><provider-1></provider-1></div>
  <div id="p3"><provider-3></provider-3></div>
  <div id="p4"><provider-4></provider-4></div>
  <div id="p5"><provider-5></provider-5></div>
  <div id="p6a"><provider-6a></provider-6a></div>
  <div id="p6b"><provider-6b></provider-6b></div>
  <div id="p7"><provider-7></provider-7></div>
  <div id="p8"><provider-8></provider-8></div>
  <div id="p9"><provider-9></provider-9></div>
  <div id="p10"><provider-10></provider-10></div>
  `,
      imports: [
        Provider1Component,
        Provider3Component,
        Provider4Component,
        Provider5Component,
        Provider6aComponent,
        Provider6bComponent,
        Provider7Component,
        Provider8Component,
        Provider9Component,
        Provider10Component,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ProvidersComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ProvidersComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ProvidersComponent = _classThis);
})();
export {ProvidersComponent};
//# sourceMappingURL=providers.component.js.map
