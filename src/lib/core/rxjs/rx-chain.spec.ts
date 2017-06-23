import {Observable} from 'rxjs/Observable';
import {of as observableOf} from 'rxjs/observable/of';
import {RxChain, map, filter, first} from './index';

describe('RxChain', () => {
  it('should call all of the operators in the chain', () => {
    let operators = { map, filter, first };

    spyOn(operators, 'map');
    spyOn(operators, 'filter');
    spyOn(operators, 'first');

    RxChain.from(observableOf(1, 2, 3))
      .call(operators.map, i => i * 2)
      .call(operators.filter, i => i % 2 === 0)
      .call(operators.first);

    expect(operators.map).toHaveBeenCalled();
    expect(operators.filter).toHaveBeenCalled();
    expect(operators.first).toHaveBeenCalled();
  });

  it('should be able to subscribe', () => {
    const spy = jasmine.createSpy('subscription spy');

    RxChain.from(observableOf(1, 2))
      .call(map, i => i * 2)
      .call(first)
      .subscribe(spy);

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should be able to return the result observable', () => {
    const chain = RxChain.from(observableOf(1, 2))
      .call(map, i => i * 2)
      .call(first);

    expect(chain.result() instanceof Observable).toBe(true);
  });
});
