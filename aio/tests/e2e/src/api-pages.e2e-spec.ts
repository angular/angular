import { ApiPage } from './api.po';

describe('Api pages', () => {
  let page: ApiPage;

  beforeEach(() => page = new ApiPage());

  it('should show direct subclasses of a class', async () => {
    await page.navigateTo('api/forms/AbstractControlDirective');
    expect(await page.getDescendants('class', true)).toEqual(['ControlContainer', 'NgControl']);
  });

  it('should show direct and indirect subclasses of a class', async () => {
    await page.navigateTo('api/forms/AbstractControlDirective');
    expect(await page.getDescendants('class')).toEqual([
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

  it('should show child interfaces that extend an interface', async () => {
    await page.navigateTo('api/forms/Validator');
    expect(await page.getDescendants('interface')).toEqual(['AsyncValidator']);
  });

  it('should show classes that implement an interface', async () => {
    await page.navigateTo('api/animations/AnimationPlayer');
    expect(await page.getDescendants('class')).toEqual(['NoopAnimationPlayer', 'MockAnimationPlayer']);
  });

  it('should show type params of type-aliases', async () => {
    await page.navigateTo('api/common/http/HttpEvent');
    expect(await page.getOverview('type-alias').getText()).toContain('type HttpEvent<T>');
  });

  it('should not show parenthesis for getters', async () => {
    await page.navigateTo('api/core/NgModuleRef');
    expect(await page.getOverview('class').getText()).toContain('injector: Injector');
  });

  it('should show both type and initializer if set', async () => {
    await page.navigateTo('api/common/HashLocationStrategy');
    expect(await page.getOverview('class').getText()).toContain('path(includeHash: boolean = false): string');
  });

  it('should show a "Properties" section if there are public properties', async () => {
    await page.navigateTo('api/core/ViewContainerRef');
    expect(await page.getSection('instance-properties').isPresent()).toBe(true);
  });

  it('should not show a "Properties" section if there are only internal properties', async () => {
    await page.navigateTo('api/forms/FormControl');
    expect(await page.getSection('instance-properties').isPresent()).toBe(false);
  });

  it('should show "impure" badge if pipe is not pure', async () => {
    await page.navigateTo('api/common/AsyncPipe');
    expect(await page.getBadge('impure-pipe').isPresent()).toBe(true);
  });

  it('should show links to github', async () => {
    await page.navigateTo('api/core/EventEmitter');
    /* eslint-disable max-len */
    expect(await page.ghLinks.get(0).getAttribute('href'))
      .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/packages\/core\/src\/event_emitter\.ts\?message=docs\(core\)%3A%20describe%20your%20change\.\.\.#L\d+-L\d+/);
    expect(await page.ghLinks.get(1).getAttribute('href'))
      .toMatch(/https:\/\/github\.com\/angular\/angular\/tree\/[^/]+\/packages\/core\/src\/event_emitter\.ts#L\d+-L\d+/);
    /* eslint-enable max-len */
  });
});
