const fs = require('fs');
const {resolve} = require('canonical-path');
const {generateDocs} = require('./index.js');
const rootPath = resolve(__dirname, '../../../..');
const outputPath = resolve(rootPath, 'aio/src/content/docs');

describe('authors-package', () => {
  let files;

  beforeEach(() => {
    files = [];
    spyOn(fs, 'writeFile').and.callFake((file, content, callback) => {
      files.push(file);
      callback();
    });
  });

  it('should generate marketing docs if the "fileChanged" is a marketing doc', (done) => {
    generateDocs('aio/content/marketing/about.html').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'about.json'));
      expect(files).toContain(resolve(outputPath, '../navigation.json'));
      expect(files).toContain(resolve(outputPath, '../contributors.json'));
      expect(files).toContain(resolve(outputPath, '../resources.json'));
      done();
    });
  }, 2000);

  it('should generate tutorial docs if the "fileChanged" is a tutorial doc', (done) => {
    generateDocs('aio/content/tutorial/toh-pt5.md').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt1.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt2.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt3.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt4.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt5.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt6.json'));
      done();
    });
  }, 2000);

  it('should generate tutorial docs if the "fileChanged" is the tutorial index', (done) => {
    generateDocs('aio/content/tutorial/index.md').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt1.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt2.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt3.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt4.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt5.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt6.json'));
      done();
    });
  }, 2000);

  it('should generate tutorial docs if the "fileChanged" is a tutorial example', (done) => {
    generateDocs('aio/content/examples/toh-3/app/app.component.1.html').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt1.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt2.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt3.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt4.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt5.json'));
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt6.json'));
      done();
    });
  }, 2000);

  it('should generate guide doc if the "fileChanged" is a guide doc', (done) => {
    generateDocs('aio/content/guide/architecture.md').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'guide/architecture.json'));
      done();
    });
  }, 2000);

  it('should generate guide doc if the "fileChanged" is a guide example', (done) => {
    generateDocs('aio/content/examples/architecture/src/app/app.module.ts').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'guide/architecture.json'));
      done();
    });
  }, 2000);

  it('should generate API doc if the "fileChanged" is an API doc', (done) => {
    generateDocs('packages/forms/src/form_builder.ts').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'api/forms/FormBuilder.json'));
      done();
    });
  }, 4000);

  it('should generate API doc if the "fileChanged" is an API example', (done) => {
    generateDocs('packages/examples/forms/ts/formBuilder/form_builder_example.ts').then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'api/forms/FormBuilder.json'));
      done();
    });
  }, 4000);
});