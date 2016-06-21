@echo off
REM Stages a release by putting everything that should be packaged and released
REM into the ./deploy folder. This script should be run from the root of the
REM material2 repo.

REM Make sure you are not running `ng serve` or `ng build --watch` when running this.


REM Clear dist/ and deploy/ so that we guarantee there are no stale artifacts.
rmdir /S /Q dist
rmdir /S /Q deploy

REM Perform a build with the modified tsconfig.json.
call ng build

REM Inline the css and html into the component ts files.
call npm run inline-resources

REM deploy/ serves as a working directory to stage the release.
mkdir deploy

REM Copy all components/ to deploy/
xcopy /E dist\components\*.* deploy\

REM Copy the core/ directory directly into ./deploy
xcopy /E dist\core\*.* deploy\core\

REM To test the packages, simply `npm install` the package directories.
