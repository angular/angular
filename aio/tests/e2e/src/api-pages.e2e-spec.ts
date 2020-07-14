import { ApiPage } from './api.po';

describe('Api pages', function() {
  it('should show direct subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    expect(page.getDescendants('class', true)).toEqual(['ControlContainer', 'NgControl']);
  });

  it('should show direct and indirect subclasses of a class', () => {
    const page = new ApiPage('api/forms/AbstractControlDirective');
    expect(page.getDescendants('class')).toEqual([
      'ControlContainer',
      'AbstractFormGroupDirective',
      'NgModelGroup',
      'FormGroupName',
      'NgForm',
      'FormGroupDirective',
      'FormArrayName',
      'NgControl',
      'NgModel',
      'FormControlDirective',
      'FormControlName'
    ]);
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

  it('should not show parenthesis for getters', () => {
    const page = new ApiPage('api/core/NgModuleRef');
    expect(page.getOverview('class').getText()).toContain('injector: Injector');
  });

  it('should show both type and initializer if set', () => {
    const page = new ApiPage('api/common/HashLocationStrategy');
    expect(page.getOverview('class').getText()).toContain('path(includeHash: boolean = false): string');
  });

  it('should show a "Properties" section if there are public properties', () => {
    const page = new ApiPage('api/core/ViewContainerRef');
    expect(page.getSection('instance-properties').isPresent()).toBe(true);
  });

  it('should not show a "Properties" section if there are only internal properties', () => {
    const page = new ApiPage('api/forms/FormControl');
    expect(page.getSection('instance-properties').isPresent()).toBe(false);
  });

  it('should show "impure" badge if pipe is not pure', () => {
    const page = new ApiPage('api/common/AsyncPipe');
    const impureBadge = page.getBadge('impure-pipe');
    expect(impureBadge.isPresent()).toBe(true);
  });

  it('should show links to github', () => {
    const page = new ApiPage('api/core/EventEmitter');
    /* tslint:disable:max-line-length */
    expect(page.ghLinks.get(0).getAttribute('href'))
      .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/packages\/core\/src\/event_emitter\.ts\?message=docs\(core\)%3A%20describe%20your%20change\.\.\.#L\d+-L\d+/);
    expect(page.ghLinks.get(1).getAttribute('href'))
      .toMatch(/https:\/\/github\.com\/angular\/angular\/tree\/[^/]+\/packages\/core\/src\/event_emitter\.ts#L\d+-L\d+/);
    /* tslint:enable:max-line-length */
  });
});
