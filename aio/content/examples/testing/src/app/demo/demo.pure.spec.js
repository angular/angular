describe('TestedMethodScopeDefinition', () => {
  // #docregion TestedMethodScopeDefinition
  describe('#TestedMethodScopeDefinition', () => {
    beforeEach(() => {/*initialization of dynamic dependencies*/});

    it('should do this', () => {/*test1*/});
    it('should do that', () => {/*test2*/})
  });
// #enddocregion TestedMethodScopeDefinition
});

describe('IndependentTestScope', () => {
  describe('invalid', () => {
    // #docregion IndependentTestScopeInvalid
    let value = true;

    it('value should be truthy', () => {
      value = false;
      expect(value).toBeFalsy();
    });

    it('value should be truthy', () => {
      expect(value).toBeTruthy();
    });
    // #enddocregion IndependentTestScopeInvalid
  });

  describe('valid', () => {
    // #docregion IndependentTestScopeValid
    let value;

    beforeEach(() => {
      value = true
    });

    it('value should be truthy', () => {
      value = false;
      expect(value).toBeFalsy();
    });

    it('value should be truthy', () => {
      expect(value).toBeTruthy();
    });
    // #enddocregion IndependentTestScopeValid
  });

});

describe('TestingOnlyUnitFunctionality', () => {
  describe('invalid', () => {
    // #docregion TestingOnlyUnitFunctionalityInvalid
    // #docplaster
    import { testedMethod, dependencyWithHandler, realParams } from './demo';

    describe('#testedMethod', () => {
      let realResult;

      beforeEach(() => {
        realResult = {};
      });

      it('should handle passed params by dependency handler', () => {
        expect(testedMethod(realParams, dependencyWithHandler)).toEqual(realResult);
      });
    });
    // #enddocregion TestingOnlyUnitFunctionalityInvalid
  });

  describe('valid', () => {
    // #docregion TestingOnlyUnitFunctionalityValid
    // #docplaster
    import { testedMethod } from './demo';

    describe('#testedMethod', () => {
      let comfortableMockedParams;
      let comfortablePredictableTestResult;
      let mockedDataWithDefinedMethod;

      beforeEach(() => {
        comfortableMockedParams = 'any-comfortable-mocked-params-value';
        comfortablePredictableTestResult = 'any-comfortable-predictable-result-value';

        mockedDataWithDefinedMethod = {
          handler: () => comfortablePredictableTestResult
        };
      });

      it('should handle passed params by dependency handler', () => {
        expect(testedMethod(comfortableMockedParams, mockedDataWithDefinedMethod)).toBe(comfortablePredictableTestResult);
      });
    });
    // #enddocregion TestingOnlyUnitFunctionalityValid
  });
});

describe('MockingDataAndDependencies', () => {
  // #docregion MockingDataAndDependencies
  // #docplaster
  import { testedMethod } from './demo';

  describe('#testedMethod', () => {
    // all the values are used for the test only are defined inside the unit test scope only
    let dependency;
    let handler;

    // definition of "static" or values can be performed once if they are primitives
    const expectedResult = 'expectedResult';
    const params = 'params';

    // definition of "dynamic" values should be performed before each test to make tests independent
    beforeEach(() => {
      handler = jasmine.createSpy('handler').and.returnValue(expectedResult);
      dependency = { handler };
    });

    it('should return expected result', () => {
      expect(testedMethod(params, dependency)).toBe(expectedResult);
    });
  });
  // #enddocregion MockingDataAndDependencies
});

describe('DataSimplificationExample', () => {
  // #docregion DataSimplificationExample
  // #docplaster
  import { productionMethod1, productionMethod2 } from './demo';

  describe('productionMethods', () => {
    let handler;

    const params = 'any primitive field which can be unique for test';
    const nestedComplicatedDataTypes = 'nestedComplicatedDataTypes';

    beforeEach(() => {
      handler = jasmine.createSpy('handler');
    });

    describe('#productionMethod1', () => {
      it('should call handler', () => {
        // pass only used data
        productionMethod1(params, {handler});
        expect(handler).toHaveBeenCalledWith(params);
      });
    });

    describe('#productionMethod2', () => {
      it('should call handler', () => {
        // pass only used data
        productionMethod2({ nestedComplicatedDataTypes }, { handler });
        expect(handler).toHaveBeenCalledWith(nestedComplicatedDataTypes);
      });
    });
  });
  // #enddocregion DataSimplificationExample
});

describe('AvoidMutations', () => {
  describe('invalid', () => {

    // #docregion AvoidMutationsInvalid
    describe('#spy', () => {
      const spy = jasmine.createSpy('spy');

      it('should call spy', () => {
        spy();
        expect(spy).toHaveBeenCalled();
      });

      it('should not call spy', () => {
        expect(spy).not.toHaveBeenCalled(); // failed
      })
    });
    // #enddocregion AvoidMutationsInvalid
  });

  describe('valid', () => {

    // #docregion AvoidMutationsValid
    describe('#spy', () => {
      let spy;

      beforeEach(() => {
        spy = jasmine.createSpy('spy');
      });

      it('should call spy', () => {
        spy();
        expect(spy).toHaveBeenCalled();
      });

      it('should not call spy', () => {
        expect(spy).not.toHaveBeenCalled(); // success
      })
    });
    // #enddocregion AvoidMutationsValid
  });
});

describe('NativeJSEntriesAndAngularEntries', () => {
  // #docregion NativeJSEntriesAndAngularEntries
  // #docplaster
  import { nativeJSComponent, nativeJSService, angularComponent, angularService } from './demo';

  it('native and angular entries should be the same for testing', () => {
    expect(nativeJSComponent.method).toBe(angularComponent.method);
    expect(nativeJSService.serviceMethod).toBe(angularService.serviceMethod);
  });
  // #enddocregion NativeJSEntriesAndAngularEntries
});

describe('NamingForTestEntries', () => {
  describe('invalid', () => {
    // #docregion NamingForTestEntriesInvalid
    // #docplaster
    import { CustomNameService, CustomNameComponent } from './demo';

    describe('CustomNameService', () => {
      let cns;

      let httpSpy;

      beforeEach(() => {
        httpSpy = { get: jasmine.createSpy('get') };
      });

      beforeEach(() => {
        cns = new CustomNameService(httpSpy);
      });

      describe('#method', () => {
        const methodArgumentMock = 'methodArgumentMock';

        it('should request data', () => {
          cns.method(methodArgumentMock);
          expect(httpSpy.get).toBeCalledWith(methodArgumentMock);
        });
      });
    });

    describe('CustomNameComponent', () => {
      let cnc;

      let httpServiceSpy;

      beforeEach(() => {
        httpServiceSpy = { method: jasmine.createSpy('method') };
      });

      beforeEach(() => {
        cnc = new CustomNameComponent(httpServiceSpy);
      });

      // ...
    });
    // #enddocregion NamingForTestEntriesInvalid
  });

  describe('valid', () => {
    // #docregion NamingForTestEntriesValid
    // #docplaster
    import { CustomNameService, CustomNameComponent } from './demo';

    describe('CustomNameService', () => {
      let service;

      let http;

      beforeEach(() => {
        http = { get: jasmine.createSpy('get') };
      });

      beforeEach(() => {
        service = new CustomNameService(http);
      });

      describe('#method', () => {
        const url = 'url';

        it('should request data', () => {
          service.method(url);
          expect(http.get).toBeCalledWith(url);
        });
      });
    });

    describe('CustomNameComponent', () => {
      let component;

      let httpService;

      beforeEach(() => {
        httpService = { method: jasmine.createSpy('method') };
      });

      beforeEach(() => {
        component = new CustomNameComponent(httpService);
      });

      // ...
    });
    // #enddocregion NamingForTestEntriesValid
  });
});

describe('NamedOnlySpies', () => {
  describe('invalid', () => {
    // #docregion NamingForTestEntriesInvalid
    const spy = jasmine.createSpy();
    // #enddocregion NamingForTestEntriesInvalid
  });

  describe('valid', () => {
    // #docregion NamingForTestEntriesValid
    const spy = jasmine.createSpy('spy');
    // #enddocregion NamingForTestEntriesValid
  });
});

describe('SpyArgumentsTesting', () => {
  // #docregion SpyArgumentsTesting
  describe('#spy', () => {
    let spy;

    const param = 'param';

    beforeEach(() => {
      spy = jasmine.createSpy('spy');
    });

    it('should call spy', () => {
      spy();
      expect(spy).toBeCalled();
    });

    it('should call spy with param', () => {
      spy(param);
      expect(spy).toBeCalledWith(param);
    });

    it('should call spy with multiple params', () => {
      spy(param, { param });
      expect(spy).toBeCalledWith(param, { param });

      // or

      const { param: expectedParam } = spy.calls.argsFor(0)[1];
      expect(expectedParam).toBe(param);
    });
  });
  // #enddocregion SpyArgumentsTesting
});

describe('ReadonlyProperties', () => {
  // #docregion ReadonlyProperties
  // #docplaster
  import { RepresentativeComponent, templateLabels, selector } from './demo';

  describe('RepresentativeComponent', () => {
    let component;

    let state;

    beforeEach(() => {
      state = { select: jasmine.createSpy('select') };
    });

    beforeEach(() => {
      state.select.and.callFake(selector => selector)
    });

    beforeEach(() => {
      component = new RepresentativeComponent(state);
    });

    describe('initialization', () => {
      it('should define proper template labels', () => {
        expect(component.templateLabels).toBe(templateLabels);
      });

      it('should register value observable', () => {
        expect(component.templateValue$).toBe(selector);
        expect(state.select).toBeCalledWith(selector);
      });
    });
  });
  // #enddocregion ReadonlyProperties
});
