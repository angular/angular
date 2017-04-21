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
    generateDocs('aio/content/marketing/about.html', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'about.json'));
      expect(files).toContain(resolve(outputPath, '../navigation.json'));
      expect(files).toContain(resolve(outputPath, '../contributors.json'));
      expect(files).toContain(resolve(outputPath, '../resources.json'));
      done();
    });
  }, 4000);

  it('should generate tutorial docs if the "fileChanged" is a tutorial doc', (done) => {
    generateDocs('aio/content/tutorial/toh-pt5.md', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt5.json'));
      done();
    });
  }, 4000);

  it('should generate tutorial docs if the "fileChanged" is the tutorial index', (done) => {
    generateDocs('aio/content/tutorial/index.md', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial.json'));
      done();
    });
  }, 4000);

  it('should generate tutorial docs if the "fileChanged" is a tutorial example', (done) => {
    generateDocs('aio/content/examples/toh-pt3/app/app.component.1.html', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'tutorial/toh-pt3.json'));
      done();
    });
  }, 4000);

  it('should generate guide doc if the "fileChanged" is a guide doc', (done) => {
    generateDocs('aio/content/guide/architecture.md', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'guide/architecture.json'));
      done();
    });
  }, 4000);

  it('should generate guide doc if the "fileChanged" is a guide example', (done) => {
    generateDocs('aio/content/examples/architecture/src/app/app.module.ts', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'guide/architecture.json'));
      done();
    });
  }, 4000);

  it('should generate API doc if the "fileChanged" is an API doc', (done) => {
    generateDocs('packages/forms/src/form_builder.ts', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'api/forms/FormBuilder.json'));
      done();
    });
  }, 4000);

  it('should generate API doc if the "fileChanged" is an API example', (done) => {
    generateDocs('packages/examples/forms/ts/formBuilder/form_builder_example.ts', { silent: true }).then(() => {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(files).toContain(resolve(outputPath, 'api/forms/FormBuilder.json'));
      done();
    });
  }, 4000);
});