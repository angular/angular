import {SomeConfig} from '../src/features';
import {SomeConfigInjectorFactory} from '../src/features.ngfactory';

describe('injector codegen', () => {
  it('should support providers in the annotation', () => {
    var inj = SomeConfigInjectorFactory.create(null, new SomeConfig());
    expect(inj.get('strToken')).toEqual('strValue');
  });

  it('should support property providers',
     () => { var inj = SomeConfigInjectorFactory.create(null, new SomeConfig()); });
});
