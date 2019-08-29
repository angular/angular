import { ReactiveModule } from './reactive.module';

describe('ReactiveModule', () => {
  let reactiveModule: ReactiveModule;

  beforeEach(() => {
    reactiveModule = new ReactiveModule();
  });

  it('should create an instance', () => {
    expect(reactiveModule).toBeTruthy();
  });
});
