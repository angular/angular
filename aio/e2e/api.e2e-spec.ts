import { ApiPage } from './api.po';

describe('Api pages', function() {
  it('should show direct subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    expect(page.getDescendants('class', true)).toEqual(['ControlContainer', 'NgControl']);
  });

  it('should show direct and indirect subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    expect(page.getDescendants('class')).toEqual(['ControlContainer', 'AbstractFormGroupDirective', 'NgControl']);
  });

  it('should show child interfaces that extend an interface', () => {
    const page = new ApiPage('api/forms/Validator');
    expect(page.getDescendants('interface')).toEqual(['AsyncValidator']);
  });

  it('should show classes that implement an interface', () => {
    const page = new ApiPage('api/animations/AnimationPlayer');
    expect(page.getDescendants('class')).toEqual(['NoopAnimationPlayer', 'MockAnimationPlayer']);
  });

  it('should show type params of type-aliases', () => {
    const page = new ApiPage('api/common/http/HttpEvent');
    expect(page.getOverview('type-alias').getText()).toContain('type HttpEvent<T>');
  });

  it('should show readonly properties as getters', () => {
    const page = new ApiPage('api/common/http/HttpRequest');
    expect(page.getOverview('class').getText()).toContain('get body: T | null');
  });

  it('should not show parenthesis for getters', () => {
    const page = new ApiPage('api/core/NgModuleRef');
    expect(page.getOverview('class').getText()).toContain('get injector: Injector');
  });

  it('should show both type and initializer if set', () => {
    const page = new ApiPage('api/common/HashLocationStrategy');
    expect(page.getOverview('class').getText()).toContain('path(includeHash: boolean = false): string');
  });
});
