"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular-devkit/schematics/testing");
const path_1 = require("path");
const testing_2 = require("../utils/testing");
const test_1 = require("@schematics/angular/utility/test");
const collectionPath = path_1.join(__dirname, '../collection.json');
describe('material-table-schematic', () => {
    let runner;
    const options = {
        name: 'foo',
        path: 'app',
        sourceDir: 'src',
        inlineStyle: false,
        inlineTemplate: false,
        changeDetection: 'Default',
        styleext: 'css',
        spec: true,
        module: undefined,
        export: false,
        prefix: undefined,
        viewEncapsulation: undefined,
    };
    beforeEach(() => {
        runner = new testing_1.SchematicTestRunner('schematics', collectionPath);
    });
    it('should create table files and add them to module', () => {
        const tree = runner.runSchematic('materialTable', Object.assign({}, options), testing_2.createTestApp());
        const files = tree.files;
        expect(files).toContain('/src/app/foo/foo.component.css');
        expect(files).toContain('/src/app/foo/foo.component.html');
        expect(files).toContain('/src/app/foo/foo.component.spec.ts');
        expect(files).toContain('/src/app/foo/foo.component.ts');
        expect(files).toContain('/src/app/foo/foo-datasource.ts');
        const moduleContent = test_1.getFileContent(tree, '/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
        expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
        const datasourceContent = test_1.getFileContent(tree, '/src/app/foo/foo-datasource.ts');
        expect(datasourceContent).toContain('FooItem');
        expect(datasourceContent).toContain('FooDataSource');
        const componentContent = test_1.getFileContent(tree, '/src/app/foo/foo.component.ts');
        expect(componentContent).toContain('FooDataSource');
    });
    it('should add table imports to module', () => {
        const tree = runner.runSchematic('materialTable', Object.assign({}, options), testing_2.createTestApp());
        const moduleContent = test_1.getFileContent(tree, '/src/app/app.module.ts');
        expect(moduleContent).toContain('MatTableModule');
        expect(moduleContent).toContain('MatPaginatorModule');
        expect(moduleContent).toContain('MatSortModule');
        expect(moduleContent).toContain(`import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';`);
    });
});
//# sourceMappingURL=index_spec.js.map