"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const testing_1 = require("@angular-devkit/schematics/testing");
const collectionPath = path_1.join('./node_modules/@schematics/angular/collection.json');
/**
 * Create a base app used for testing.
 */
function createTestApp() {
    const baseRunner = new testing_1.SchematicTestRunner('schematics', collectionPath);
    return baseRunner.runSchematic('application', {
        directory: '',
        name: 'app',
        prefix: 'app',
        sourceDir: 'src',
        inlineStyle: false,
        inlineTemplate: false,
        viewEncapsulation: 'None',
        version: '1.2.3',
        routing: true,
        style: 'scss',
        skipTests: false,
        minimal: false,
    });
}
exports.createTestApp = createTestApp;
//# sourceMappingURL=testing.js.map