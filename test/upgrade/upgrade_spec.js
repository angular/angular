var testing_internal_1 = require('angular2/testing_internal');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var angular2_1 = require('angular2/angular2');
var upgrade_1 = require('angular2/upgrade');
var angular = require('angular2/src/upgrade/angular_js');
function main() {
    if (!dom_adapter_1.DOM.supportsDOMEvents())
        return;
    testing_internal_1.describe('adapter: ng1 to ng2', function () {
        testing_internal_1.it('should have angular 1 loaded', function () { return testing_internal_1.expect(angular.version.major).toBe(1); });
        testing_internal_1.it('should instantiate ng2 in ng1 template and project content', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var ng1Module = angular.module('ng1', []);
            var Ng2 = angular2_1.Component({ selector: 'ng2', template: "{{ 'NG2' }}(<ng-content></ng-content>)" })
                .Class({ constructor: function () { } });
            var element = html("<div>{{ 'ng1[' }}<ng2>~{{ 'ng-content' }}~</ng2>{{ ']' }}</div>");
            var adapter = new upgrade_1.UpgradeAdapter();
            ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
            adapter.bootstrap(element, ['ng1'])
                .ready(function (ref) {
                testing_internal_1.expect(document.body.textContent).toEqual("ng1[NG2(~ng-content~)]");
                ref.dispose();
                async.done();
            });
        }));
        testing_internal_1.it('should instantiate ng1 in ng2 template and project content', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var adapter = new upgrade_1.UpgradeAdapter();
            var ng1Module = angular.module('ng1', []);
            var Ng2 = angular2_1.Component({
                selector: 'ng2',
                template: "{{ 'ng2(' }}<ng1>{{'transclude'}}</ng1>{{ ')' }}",
                directives: [adapter.upgradeNg1Component('ng1')]
            }).Class({ constructor: function () { } });
            ng1Module.directive('ng1', function () {
                return { transclude: true, template: '{{ "ng1" }}(<ng-transclude></ng-transclude>)' };
            });
            ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
            var element = html("<div>{{'ng1('}}<ng2></ng2>{{')'}}</div>");
            adapter.bootstrap(element, ['ng1'])
                .ready(function (ref) {
                testing_internal_1.expect(document.body.textContent).toEqual("ng1(ng2(ng1(transclude)))");
                ref.dispose();
                async.done();
            });
        }));
        testing_internal_1.describe('scope/component change-detection', function () {
            testing_internal_1.it('should interleave scope and component expressions', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var ng1Module = angular.module('ng1', []);
                var log = [];
                var l = function (value) {
                    log.push(value);
                    return value + ';';
                };
                var adapter = new upgrade_1.UpgradeAdapter();
                ng1Module.directive('ng1a', function () { return { template: "{{ l('ng1a') }}" }; });
                ng1Module.directive('ng1b', function () { return { template: "{{ l('ng1b') }}" }; });
                ng1Module.run(function ($rootScope) {
                    $rootScope.l = l;
                    $rootScope.reset = function () { return log.length = 0; };
                });
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: "{{l('2A')}}<ng1a></ng1a>{{l('2B')}}<ng1b></ng1b>{{l('2C')}}",
                    directives: [adapter.upgradeNg1Component('ng1a'), adapter.upgradeNg1Component('ng1b')]
                }).Class({ constructor: function () { this.l = l; } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div>{{reset(); l('1A');}}<ng2>{{l('1B')}}</ng2>{{l('1C')}}</div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(document.body.textContent).toEqual("1A;2A;ng1a;2B;ng1b;2C;1C;");
                    // https://github.com/angular/angular.js/issues/12983
                    testing_internal_1.expect(log).toEqual(['1A', '1B', '1C', '2A', '2B', '2C', 'ng1a', 'ng1b']);
                    ref.dispose();
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('downgrade ng2 component', function () {
            testing_internal_1.it('should bind properties, events', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                ng1Module.run(function ($rootScope) {
                    $rootScope.dataA = 'A';
                    $rootScope.dataB = 'B';
                    $rootScope.modelA = 'initModelA';
                    $rootScope.modelB = 'initModelB';
                    $rootScope.eventA = '?';
                    $rootScope.eventB = '?';
                });
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    inputs: ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
                    outputs: [
                        'eventA',
                        'eventB',
                        'twoWayAEmitter: twoWayAChange',
                        'twoWayBEmitter: twoWayBChange'
                    ],
                    template: "ignore: {{ignore}}; " +
                        "literal: {{literal}}; interpolate: {{interpolate}}; " +
                        "oneWayA: {{oneWayA}}; oneWayB: {{oneWayB}}; " +
                        "twoWayA: {{twoWayA}}; twoWayB: {{twoWayB}}; ({{onChangesCount}})"
                })
                    .Class({
                    constructor: function () {
                        this.onChangesCount = 0;
                        this.ignore = '-';
                        this.literal = '?';
                        this.interpolate = '?';
                        this.oneWayA = '?';
                        this.oneWayB = '?';
                        this.twoWayA = '?';
                        this.twoWayB = '?';
                        this.eventA = new angular2_1.EventEmitter();
                        this.eventB = new angular2_1.EventEmitter();
                        this.twoWayAEmitter = new angular2_1.EventEmitter();
                        this.twoWayBEmitter = new angular2_1.EventEmitter();
                    },
                    onChanges: function (changes) {
                        var _this = this;
                        var assert = function (prop, value) {
                            if (_this[prop] != value) {
                                throw new Error("Expected: '" + prop + "' to be '" + value + "' but was '" + _this[prop] + "'");
                            }
                        };
                        var assertChange = function (prop, value) {
                            assert(prop, value);
                            if (!changes[prop]) {
                                throw new Error("Changes record for '" + prop + "' not found.");
                            }
                            var actValue = changes[prop].currentValue;
                            if (actValue != value) {
                                throw new Error("Expected changes record for'" + prop + "' to be '" + value + "' but was '" + actValue + "'");
                            }
                        };
                        switch (this.onChangesCount++) {
                            case 0:
                                assert('ignore', '-');
                                assertChange('literal', 'Text');
                                assertChange('interpolate', 'Hello world');
                                assertChange('oneWayA', 'A');
                                assertChange('oneWayB', 'B');
                                assertChange('twoWayA', 'initModelA');
                                assertChange('twoWayB', 'initModelB');
                                this.twoWayAEmitter.next('newA');
                                this.twoWayBEmitter.next('newB');
                                this.eventA.next('aFired');
                                this.eventB.next('bFired');
                                break;
                            case 1:
                                assertChange('twoWayA', 'newA');
                                break;
                            case 2:
                                assertChange('twoWayB', 'newB');
                                break;
                            default:
                                throw new Error('Called too many times! ' + JSON.stringify(changes));
                        }
                    }
                });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div>\n              <ng2 literal=\"Text\" interpolate=\"Hello {{'world'}}\"\n                   bind-one-way-a=\"dataA\" [one-way-b]=\"dataB\"\n                   bindon-two-way-a=\"modelA\" [(two-way-b)]=\"modelB\"\n                   on-event-a='eventA=$event' (event-b)=\"eventB=$event\"></ng2>\n              | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};\n              </div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent))
                        .toEqual("ignore: -; " + "literal: Text; interpolate: Hello world; " +
                        "oneWayA: A; oneWayB: B; twoWayA: initModelA; twoWayB: initModelB; (1) | " +
                        "modelA: initModelA; modelB: initModelB; eventA: ?; eventB: ?;");
                    setTimeout(function () {
                        // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
                        // events, and so without this we would not see the events processed.
                        testing_internal_1.expect(multiTrim(document.body.textContent))
                            .toEqual("ignore: -; " + "literal: Text; interpolate: Hello world; " +
                            "oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | " +
                            "modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;");
                        ref.dispose();
                        async.done();
                    });
                });
            }));
        });
        testing_internal_1.describe('upgrade ng1 component', function () {
            testing_internal_1.it('should bind properties, events', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                var ng1 = function () {
                    return {
                        template: 'Hello {{fullName}}; A: {{dataA}}; B: {{dataB}}; | ',
                        scope: { fullName: '@', modelA: '=dataA', modelB: '=dataB', event: '&' },
                        link: function (scope) {
                            scope.$watch('dataB', function (v) {
                                if (v == 'Savkin') {
                                    scope.dataB = 'SAVKIN';
                                    scope.event('WORKS');
                                    // Should not update becaus [model-a] is uni directional
                                    scope.dataA = 'VICTOR';
                                }
                            });
                        }
                    };
                };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1 full-name="{{last}}, {{first}}" [model-a]="first" [(model-b)]="last" ' +
                        '(event)="event=$event"></ng1>' +
                        '<ng1 full-name="{{\'TEST\'}}" model-a="First" model-b="Last"></ng1>' +
                        '{{event}}-{{last}}, {{first}}',
                    directives: [adapter.upgradeNg1Component('ng1')]
                })
                    .Class({
                    constructor: function () {
                        this.first = 'Victor';
                        this.last = 'Savkin';
                        this.event = '?';
                    }
                });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
                    // events, and so without this we would not see the events processed.
                    setTimeout(function () {
                        testing_internal_1.expect(multiTrim(document.body.textContent))
                            .toEqual("Hello SAVKIN, Victor; A: VICTOR; B: SAVKIN; | Hello TEST; A: First; B: Last; | WORKS-SAVKIN, Victor");
                        ref.dispose();
                        async.done();
                    }, 0);
                });
            }));
            testing_internal_1.it('should support templateUrl fetched from $httpBackend', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                ng1Module.value('$httpBackend', function (method, url, post, cbFn) { cbFn(200, method + ":" + url); });
                var ng1 = function () { return { templateUrl: 'url.html' }; };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent)).toEqual('GET:url.html');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should support templateUrl fetched from $templateCache', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                ng1Module.run(function ($templateCache) { return $templateCache.put('url.html', 'WORKS'); });
                var ng1 = function () { return { templateUrl: 'url.html' }; };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent)).toEqual('WORKS');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should support controller with controllerAs', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                var ng1 = function () {
                    return {
                        scope: true,
                        template: '{{ctl.scope}}; {{ctl.isClass}}; {{ctl.hasElement}}; {{ctl.isPublished()}}',
                        controllerAs: 'ctl',
                        controller: angular2_1.Class({
                            constructor: function ($scope, $element) {
                                this.verifyIAmAClass();
                                this.scope = $scope.$parent.$parent == $scope.$root ? 'scope' : 'wrong-scope';
                                this.hasElement = $element[0].nodeName;
                                this.$element = $element;
                            },
                            verifyIAmAClass: function () { this.isClass = 'isClass'; },
                            isPublished: function () {
                                return this.$element.controller('ng1') == this ? 'published' : 'not-published';
                            }
                        })
                    };
                };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent))
                        .toEqual('scope; isClass; NG1; published');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should support bindToController', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                var ng1 = function () {
                    return {
                        scope: { title: '@' },
                        bindToController: true,
                        template: '{{ctl.title}}',
                        controllerAs: 'ctl',
                        controller: angular2_1.Class({ constructor: function () { } })
                    };
                };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1 title="WORKS"></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent)).toEqual('WORKS');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should support single require in linking fn', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                var ng1 = function ($rootScope) {
                    return {
                        scope: { title: '@' },
                        bindToController: true,
                        template: '{{ctl.status}}',
                        require: 'ng1',
                        controllerAs: 'ctrl',
                        controller: angular2_1.Class({ constructor: function () { this.status = 'WORKS'; } }),
                        link: function (scope, element, attrs, linkController) {
                            testing_internal_1.expect(scope.$root).toEqual($rootScope);
                            testing_internal_1.expect(element[0].nodeName).toEqual('NG1');
                            testing_internal_1.expect(linkController.status).toEqual('WORKS');
                            scope.ctl = linkController;
                        }
                    };
                };
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><ng2></ng2></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent)).toEqual('WORKS');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should support array require in linking fn', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var ng1Module = angular.module('ng1', []);
                var parent = function () {
                    return { controller: angular2_1.Class({ constructor: function () { this.parent = 'PARENT'; } }) };
                };
                var ng1 = function () {
                    return {
                        scope: { title: '@' },
                        bindToController: true,
                        template: '{{parent.parent}}:{{ng1.status}}',
                        require: ['ng1', '^parent', '?^^notFound'],
                        controllerAs: 'ctrl',
                        controller: angular2_1.Class({ constructor: function () { this.status = 'WORKS'; } }),
                        link: function (scope, element, attrs, linkControllers) {
                            testing_internal_1.expect(linkControllers[0].status).toEqual('WORKS');
                            testing_internal_1.expect(linkControllers[1].parent).toEqual('PARENT');
                            testing_internal_1.expect(linkControllers[2]).toBe(undefined);
                            scope.ng1 = linkControllers[0];
                            scope.parent = linkControllers[1];
                        }
                    };
                };
                ng1Module.directive('parent', parent);
                ng1Module.directive('ng1', ng1);
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    template: '<ng1></ng1>',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                var element = html("<div><parent><ng2></ng2></parent></div>");
                adapter.bootstrap(element, ['ng1'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent)).toEqual('PARENT:WORKS');
                    ref.dispose();
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('injection', function () {
            function SomeToken() { }
            testing_internal_1.it('should export ng2 instance to ng1', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var module = angular.module('myExample', []);
                adapter.addProvider(angular2_1.provide(SomeToken, { useValue: 'correct_value' }));
                module.factory('someToken', adapter.downgradeNg2Provider(SomeToken));
                adapter.bootstrap(html('<div>'), ['myExample'])
                    .ready(function (ref) {
                    testing_internal_1.expect(ref.ng1Injector.get('someToken')).toBe('correct_value');
                    ref.dispose();
                    async.done();
                });
            }));
            testing_internal_1.it('should export ng1 instance to ng2', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var module = angular.module('myExample', []);
                module.value('testValue', 'secreteToken');
                adapter.upgradeNg1Provider('testValue');
                adapter.upgradeNg1Provider('testValue', { asToken: 'testToken' });
                adapter.upgradeNg1Provider('testValue', { asToken: String });
                adapter.bootstrap(html('<div>'), ['myExample'])
                    .ready(function (ref) {
                    testing_internal_1.expect(ref.ng2Injector.get('testValue')).toBe('secreteToken');
                    testing_internal_1.expect(ref.ng2Injector.get(String)).toBe('secreteToken');
                    testing_internal_1.expect(ref.ng2Injector.get('testToken')).toBe('secreteToken');
                    ref.dispose();
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('examples', function () {
            testing_internal_1.it('should verify UpgradeAdapter example', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var adapter = new upgrade_1.UpgradeAdapter();
                var module = angular.module('myExample', []);
                module.directive('ng1', function () {
                    return {
                        scope: { title: '=' },
                        transclude: true,
                        template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
                    };
                });
                var Ng2 = angular2_1.Component({
                    selector: 'ng2',
                    inputs: ['name'],
                    template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
                    directives: [adapter.upgradeNg1Component('ng1')]
                }).Class({ constructor: function () { } });
                module.directive('ng2', adapter.downgradeNg2Component(Ng2));
                document.body.innerHTML = '<ng2 name="World">project</ng2>';
                adapter.bootstrap(document.body, ['myExample'])
                    .ready(function (ref) {
                    testing_internal_1.expect(multiTrim(document.body.textContent))
                        .toEqual("ng2[ng1[Hello World!](transclude)](project)");
                    ref.dispose();
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
function multiTrim(text) {
    return text.replace(/\n/g, '').replace(/\s\s+/g, ' ').trim();
}
function html(html) {
    var body = document.body;
    body.innerHTML = html;
    if (body.childNodes.length == 1 && body.firstChild instanceof HTMLElement)
        return body.firstChild;
    return body;
}
//# sourceMappingURL=upgrade_spec.js.map