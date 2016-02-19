import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';
import {Component, View, ViewMetadata} from 'angular2/src/core/metadata';

class SomeDir {}
class SomePipe {}

@Component({selector: 'sample'})
@View(
    {template: "some template", directives: [SomeDir], pipes: [SomePipe], styles: ["some styles"]})
class ComponentWithView {
}

@Component({
  selector: 'sample',
  template: "some template",
  directives: [SomeDir],
  pipes: [SomePipe],
  styles: ["some styles"]
})
class ComponentWithTemplate {
}

@Component({selector: 'sample', template: "some template"})
@View({template: "some template"})
class ComponentWithViewTemplate {
}

@Component({selector: 'sample', templateUrl: "some template url"})
@View({template: "some template"})
class ComponentWithViewTemplateUrl {
}

@Component({selector: 'sample'})
class ComponentWithoutView {
}

@View({template: "some template"})
class ClassWithView {
}

class SimpleClass {}

export function main() {
  describe("ViewResolver", () => {
    var resolver: ViewResolver;

    beforeEach(() => { resolver = new ViewResolver(); });

    it('should read out the View metadata', () => {
      var viewMetadata = resolver.resolve(ComponentWithView);
      expect(viewMetadata)
          .toEqual(new View({
            template: "some template",
            directives: [SomeDir],
            pipes: [SomePipe],
            styles: ["some styles"]
          }));
    });

    it('should read out the View metadata from the Component metadata', () => {
      var viewMetadata = resolver.resolve(ComponentWithTemplate);
      expect(viewMetadata)
          .toEqual(new ViewMetadata({
            template: "some template",
            directives: [SomeDir],
            pipes: [SomePipe],
            styles: ["some styles"]
          }));
    });

    it('should read out the View metadata from a simple class', () => {
      var viewMetadata = resolver.resolve(ClassWithView);
      expect(viewMetadata).toEqual(new View({template: "some template"}));
    });

    it('should throw when Component.template is specified together with the View metadata', () => {
      expect(() => resolver.resolve(ComponentWithViewTemplate))
          .toThrowErrorWith(
              "Component 'ComponentWithViewTemplate' cannot have both 'template' and '@View' set at the same time");
    });

    it('should throw when Component.template is specified together with the View metadata', () => {
      expect(() => resolver.resolve(ComponentWithViewTemplateUrl))
          .toThrowErrorWith(
              "Component 'ComponentWithViewTemplateUrl' cannot have both 'templateUrl' and '@View' set at the same time");
    });

    it('should throw when Component has no View decorator and no template is set', () => {
      expect(() => resolver.resolve(ComponentWithoutView))
          .toThrowErrorWith(
              "Component 'ComponentWithoutView' must have either 'template', 'templateUrl', or '@View' set");
    });

    it('should throw when simple class has no View decorator and no template is set', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowErrorWith("No View decorator found on component 'SimpleClass'");
    });
  });
}
