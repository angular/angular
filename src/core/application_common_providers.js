var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var application_tokens_1 = require('./application_tokens');
var change_detection_1 = require('./change_detection/change_detection');
var view_pool_1 = require('./linker/view_pool');
var view_manager_1 = require('./linker/view_manager');
var view_manager_2 = require("./linker/view_manager");
var view_manager_utils_1 = require('./linker/view_manager_utils');
var view_resolver_1 = require('./linker/view_resolver');
var view_listener_1 = require('./linker/view_listener');
var proto_view_factory_1 = require('./linker/proto_view_factory');
var directive_resolver_1 = require('./linker/directive_resolver');
var pipe_resolver_1 = require('./linker/pipe_resolver');
var compiler_1 = require('./linker/compiler');
var compiler_2 = require("./linker/compiler");
var dynamic_component_loader_1 = require('./linker/dynamic_component_loader');
var dynamic_component_loader_2 = require("./linker/dynamic_component_loader");
var render_1 = require('./render');
/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
exports.APPLICATION_COMMON_PROVIDERS = lang_1.CONST_EXPR([
    new di_1.Provider(compiler_1.Compiler, { useClass: compiler_2.Compiler_ }),
    application_tokens_1.APP_ID_RANDOM_PROVIDER,
    view_pool_1.AppViewPool,
    new di_1.Provider(view_pool_1.APP_VIEW_POOL_CAPACITY, { useValue: 10000 }),
    new di_1.Provider(view_manager_1.AppViewManager, { useClass: view_manager_2.AppViewManager_ }),
    view_manager_utils_1.AppViewManagerUtils,
    view_listener_1.AppViewListener,
    proto_view_factory_1.ProtoViewFactory,
    view_resolver_1.ViewResolver,
    new di_1.Provider(change_detection_1.IterableDiffers, { useValue: change_detection_1.defaultIterableDiffers }),
    new di_1.Provider(change_detection_1.KeyValueDiffers, { useValue: change_detection_1.defaultKeyValueDiffers }),
    directive_resolver_1.DirectiveResolver,
    pipe_resolver_1.PipeResolver,
    new di_1.Provider(dynamic_component_loader_1.DynamicComponentLoader, { useClass: dynamic_component_loader_2.DynamicComponentLoader_ }),
    render_1.EventManager
]);
//# sourceMappingURL=application_common_providers.js.map