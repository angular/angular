import { ApiPage } from './api.po';

describe('Api pages', function() {
  it('should show direct subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    // We must use `as any` (here and below) because of broken typings for jasmine
    expect(page.getDescendants('class', true)).toEqual(['ControlContainer', 'NgControl'] as any);
  });

  it('should show direct and indirect subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    expect(page.getDescendants('class')).toEqual(['ControlContainer', 'AbstractFormGroupDirective', 'NgControl'] as any);
  });

  it('should show child interfaces that extend an interface', () => {
    const page = new ApiPage('api/forms/Validator');
    expect(page.getDescendants('interface')).toEqual(['AsyncValidator'] as any);
  });

  it('should show classes that implement an interface', () => {
    const page = new ApiPage('api/animations/AnimationPlayer');
    expect(page.getDescendants('class')).toEqual(['NoopAnimationPlayer', 'MockAnimationPlayer'] as any);
  });
});
