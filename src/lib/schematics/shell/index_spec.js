"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular-devkit/schematics/testing");
const path_1 = require("path");
const test_1 = require("@schematics/angular/utility/test");
const testing_2 = require("../utils/testing");
const config_1 = require("@schematics/angular/utility/config");
const ast_1 = require("../utils/ast");
const core_1 = require("@angular-devkit/core");
const collectionPath = path_1.join(__dirname, '../collection.json');
describe('material-shell-schematic', () => {
    let runner;
    let appTree;
    beforeEach(() => {
        appTree = testing_2.createTestApp();
        runner = new testing_1.SchematicTestRunner('schematics', collectionPath);
    });
    it('should update package.json', () => {
        const tree = runner.runSchematic('materialShell', {}, appTree);
        const packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@angular/material']).toBeDefined();
        expect(packageJson.dependencies['@angular/cdk']).toBeDefined();
    });
    it('should add default theme', () => {
        const tree = runner.runSchematic('materialShell', {}, appTree);
        const config = config_1.getConfig(tree);
        config.apps.forEach(app => {
            expect(app.styles).toContain('../node_modules/@angular/material/prebuilt-themes/indigo-pink.css');
        });
    });
    it('should add custom theme', () => {
        const tree = runner.runSchematic('materialShell', {
            theme: 'custom'
        }, appTree);
        const config = config_1.getConfig(tree);
        const app = config_1.getAppFromConfig(config, '0');
        const stylesPath = core_1.normalize(`/${app.root}/styles.scss`);
        const buffer = tree.read(stylesPath);
        const src = buffer.toString();
        expect(src.indexOf(`@import '~@angular/material/theming';`)).toBeGreaterThan(-1);
        expect(src.indexOf(`$app-primary`)).toBeGreaterThan(-1);
    });
    it('should add font links', () => {
        const tree = runner.runSchematic('materialShell', {}, appTree);
        const indexPath = ast_1.getIndexHtmlPath(tree);
        const buffer = tree.read(indexPath);
        const indexSrc = buffer.toString();
        expect(indexSrc.indexOf('fonts.googleapis.com')).toBeGreaterThan(-1);
    });
});
//# sourceMappingURL=index_spec.js.map