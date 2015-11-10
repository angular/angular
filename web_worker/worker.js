function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('../lifecycle_hooks'));
__export(require('../src/core/metadata'));
__export(require('../src/core/util'));
__export(require('../src/core/di'));
__export(require('../src/common/pipes'));
__export(require('angular2/src/facade/facade'));
// Do not export application in web_worker,
// web_worker exports its own
// export * from '../src/core/application';
__export(require('../src/core/application_ref'));
__export(require('../src/core/services'));
__export(require('../src/core/linker'));
__export(require('../src/core/zone'));
// Do not export render in web_worker
// export * from '../src/core/render';
// Add special import for just render API
// TODO: Hard coded exports from render that need to be cleaned up
var render_1 = require('../src/core/render/render');
exports.Renderer = render_1.Renderer;
exports.RenderViewRef = render_1.RenderViewRef;
exports.RenderProtoViewRef = render_1.RenderProtoViewRef;
exports.RenderFragmentRef = render_1.RenderFragmentRef;
exports.RenderViewWithFragments = render_1.RenderViewWithFragments;
exports.RenderTemplateCmd = render_1.RenderTemplateCmd;
exports.RenderTextCmd = render_1.RenderTextCmd;
exports.RenderNgContentCmd = render_1.RenderNgContentCmd;
exports.RenderBeginElementCmd = render_1.RenderBeginElementCmd;
exports.RenderBeginComponentCmd = render_1.RenderBeginComponentCmd;
exports.RenderEmbeddedTemplateCmd = render_1.RenderEmbeddedTemplateCmd;
exports.RenderBeginCmd = render_1.RenderBeginCmd;
__export(require('../src/common/directives'));
__export(require('../src/common/forms'));
__export(require('../src/core/debug'));
__export(require('../src/core/change_detection'));
__export(require('../profile'));
__export(require('../src/web_workers/worker/application'));
var client_message_broker_1 = require('../src/web_workers/shared/client_message_broker');
exports.ClientMessageBroker = client_message_broker_1.ClientMessageBroker;
exports.ClientMessageBrokerFactory = client_message_broker_1.ClientMessageBrokerFactory;
exports.FnArg = client_message_broker_1.FnArg;
exports.UiArguments = client_message_broker_1.UiArguments;
var service_message_broker_1 = require('../src/web_workers/shared/service_message_broker');
exports.ReceivedMessage = service_message_broker_1.ReceivedMessage;
exports.ServiceMessageBroker = service_message_broker_1.ServiceMessageBroker;
exports.ServiceMessageBrokerFactory = service_message_broker_1.ServiceMessageBrokerFactory;
var serializer_1 = require('../src/web_workers/shared/serializer');
exports.PRIMITIVE = serializer_1.PRIMITIVE;
//# sourceMappingURL=worker.js.map