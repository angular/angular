import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';

import {Component, View, Inject} from 'angular2/angular2';
import {createUpgradeModule, UpgradeModule, bootstrapHybrid} from 'upgrade/upgrade';

export function main() {
  describe('upgrade: ng1 to ng2', () => {
    it('should have angular 1 loaded', () => expect(angular.version.major).toBe(1));

    it('should instantiate ng2 in ng1 template', inject([AsyncTestCompleter], (async) => {
         var Ng2 = Component({selector: 'ng2'})
                       .View({template: `{{ 'NG2' }}`})
                       .Class({constructor: function() {}});

         var element = html("<div>{{ 'ng1-' }}<ng2>~~</ng2>{{ '-ng1' }}</div>");

         var upgradeModule: UpgradeModule = createUpgradeModule();
         upgradeModule.importNg2Component(Ng2);
         upgradeModule.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1-NG2-ng1");
           async.done();
         });
       }));

    it('should instantiate ng1 in ng2 template', inject([AsyncTestCompleter], (async) => {
         var upgradeModule: UpgradeModule = createUpgradeModule();

         var Ng2 = Component({selector: 'ng2-1'})
                       .View({
                         template: `{{ 'ng2(' }}<ng1></ng1>{{ ')' }}`,
                         directives: [upgradeModule.exportAsNg2Component('ng1')]
                       })
                       .Class({constructor: function() {}});

         upgradeModule.ng1Module.directive('ng1',
                                           () => { return {template: 'ng1 {{ "WORKS" }}!'}; });
         upgradeModule.importNg2Component(Ng2);

         var element = html("<div>{{'ng1('}}<ng2-1></ng2-1>{{')'}}</div>");

         upgradeModule.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1(ng2(ng1 WORKS!))");
           async.done();
         });
       }));
  });
}


function html(html: string): Element {
  var body = document.body;
  body.innerHTML = html;
  if (body.childNodes.length == 1 && body.firstChild instanceof HTMLElement)
    return <Element>body.firstChild;
  return body;
}
