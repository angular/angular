# Gulp Tasks folder

This folder contains one file for each task (or group of related tasks) for the project's gulpfile.
The dependencies between the tasks is kept in the gulpfile.

## Task File Structure
Each task is defined by a factory function that accepts `gulp` as a parameter.
Each file exports either one factory or an object of factories.

E.g. The `build.js` file contains only one task:

```js
module.exports = (gulp) => (done) => {
  ...
};
```

## Loading Tasks

The tasks are loaded in the gulp file, by requiring them. There is a helper called `loadTask(fileName, taskName)`
will do this for us, where the `taskName` is optional if the file only exports one task.

E.g. Loading the task that will run the build, from a task file that contains only one task.

```js
gulp.task('build.sh', loadTask('build'));
```
