[![CircleCI](https://circleci.com/gh/angular/angular/tree/master.svg?style=shield)](https://circleci.com/gh/angular/workflows/angular/tree/master)
[![Join the chat at https://gitter.im/angular/angular](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/angular/angular?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/%40angular%2Fcore.svg)](https://www.npmjs.com/@angular/core)


# Angular

Angular is a development platform for building mobile and desktop web applications using TypeScript/JavaScript and other languages.

## Quickstart

[Get started in 5 minutes][quickstart].

## Changelog

[Learn about the latest improvements][changelog].

# Getting Started

## Folder Structure

1. **e2e** : Here we write *end-to-end* test. Automated test that stimulate a real user.

2. **node_modules** :  Here we store all the third part libraries that our application may depend upon. This folder is purely for development. When we compile or app, parts of these third-party libraries are put in a bundle and deployed with our app.

3. **src** : Here we have the actual source code of our application.

    - **app** : Here we have modules and components. Every app has atleast one module and one component.
    
    - **assets** : Here we store the static assests for our app. Like image, icons, test files, etc.
    
    - **environments** : Here we store configuration settings for different environments. So, we have one file for production environment and one for development environment.
    
    - **favicon.ico** : Icon displayed in the browser.
    
    - ***index.html*** : This contains our application. Here we do not have any references to script or stylesheets. These references will be dynamically inserted into this page.
    
    - ***main.ts*** : A typescript file. It is the starting point of our application. Here we bootstrap the main module of our app, which is in this case "AppModule". So, Angular loads this module and everything else starts from there.
    
    - ***pollyfills.ts*** : This imports some scripts required for running angular beacuse Anglar framework uses features of JS which are not available in current version of JS supported b most browsers.
    
    - ***styles.css*** : Here we add global styles for our app. Also, each page each component has its own styles.
    
    - ***test.ts*** : Used for setting testing environments.

4. ***.editorconfig*** : If you are working in a team, make sure that all the developers use the same setting in the editor.

5. ***.gitignore*** :  To exclude certain files and folders from my your git repository.

6. ***angular.json*** : configuration file for angular-cli. It's a pre-standard configuration.

7. ***karma.conf.js*** : Config file for karma which is a test runner for js code. 

8. ***package.json*** : Contains the info of dependencies(libraries on which the app is dependent on) and devDependencies(libraries which we need to develop our app; We do not need to run our app on a production server).

9. ***protractor.conf.js*** : Tool for running end to end tests for Angular.

10. ***tsconfig.json*** : Contains buch of settings for your typescript compiler. TS compiler looks this setting and converts the TS code to JS code which the browsers could understand.

12. ***tslint.json*** : It includes a number of settings for tslint. TSLint is a static analysis tool for TS code. Check your TS code for readability, maintainability and functionality errors

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for [contributing][contributing] and then check out one of our issues in the [hotlist: community-help](https://github.com/angular/angular/labels/hotlist%3A%20community-help).

[contributing]: https://github.com/angular/angular/blob/master/CONTRIBUTING.md
[quickstart]: https://angular.io/start
[changelog]: https://github.com/angular/angular/blob/master/CHANGELOG.md
[ng]: https://angular.io
