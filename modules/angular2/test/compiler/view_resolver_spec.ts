import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {ViewResolver} from 'angular2/src/compiler/view_resolver';
import {Component, ViewMetadata} from 'angular2/src/core/metadata';

class SomeDir {}
class SomePipe {}

@Component({
  selector: 'sample',
  template: "some template",
  directives: [SomeDir],
  pipes: [SomePipe],
  styles: ["some styles"]
})
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
class ComponentWithViewTemplate {
}

@Component({selector: 'sample', templateUrl: "some template url", template: "some template"})
class ComponentWithViewTemplateUrl {
}

@Component({selector: 'sample'})
class ComponentWithoutView {
}


class SimpleClass {}

export function main() {
  describe("ViewResolver", () => {
    var resolver: ViewResolver;

    beforeEach(() => { resolver = new ViewResolver(); });

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

    it('should throw when Component has no View decorator and no template is set', () => {
      expect(() => resolver.resolve(ComponentWithoutView))
          .toThrowErrorWith(
              "Component 'ComponentWithoutView' must have either 'template' or 'templateUrl' set");
    });

    it('should throw when simple class has no View decorator and no template is set', () => {
      expect(() => resolver.resolve(SimpleClass))
          .toThrowErrorWith("Could not compile 'SimpleClass' because it is not a component.");
    });
  });
}
