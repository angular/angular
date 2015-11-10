var testing_internal_1 = require('angular2/testing_internal');
var pipe_provider_1 = require('angular2/src/core/pipes/pipe_provider');
var metadata_1 = require('angular2/src/core/metadata');
var MyPipe = (function () {
    function MyPipe() {
    }
    return MyPipe;
})();
function main() {
    testing_internal_1.describe("PipeProvider", function () {
        testing_internal_1.it('should create a provider out of a type', function () {
            var provider = pipe_provider_1.PipeProvider.createFromType(MyPipe, new metadata_1.Pipe({ name: 'my-pipe' }));
            testing_internal_1.expect(provider.name).toEqual('my-pipe');
            testing_internal_1.expect(provider.key.token).toEqual(MyPipe);
        });
    });
}
exports.main = main;
//# sourceMappingURL=pipe_binding_spec.js.map