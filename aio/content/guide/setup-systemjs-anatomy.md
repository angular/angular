@title
Anatomy of the Setup Project

@intro
Inside the local development environment for SystemJS.

@description



The documentation [setup](guide/setup) procedures install a _lot_ of files.
Most of them can be safely ignored.

Application files _inside the_ **`src/`** and **`e2e/`** folders matter most to developers.

Files _outside_ those folders condition the development environment.
They rarely change and you may never view or modify them.
If you do, this page can help you understand their purpose.


<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="10%">

  </col>

  <col width="90%">

  </col>

  <tr>

    <th>
      File
    </th>

    <th>
      Purpose
    </th>

  </tr>

  <tr>

    <td>
      <code>src/app/</code>
    </td>

    <td>


      Angular application files go here.

      Ships with the "Hello Angular" sample's
      `AppComponent`, `AppModule`, a component unit test (`app.component.spec.ts`), and
      the bootstrap file, `main.ts`.

      Try the <live-example name="setup">sample application</live-example>
      and the <live-example name="setup" plnkr="quickstart-specs">unit test</live-example>
      as _live examples_.
    </td>

  </tr>

  <tr>

    <td>
      <code>e2e/</code>
    </td>

    <td>


      _End-to-end_ (e2e) tests of the application,
      written in Jasmine and run by the
      <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>
      e2e test runner.

      Initialized with an e2e test for the "Hello Angular" sample.
    </td>

  </tr>

  <tr>

    <td>
      <code>node_modules/</code>
    </td>

    <td>


      The _npm_ packages installed with the `npm install` command.
    </td>

  </tr>

  <tr>

    <td>
      <code>.editorconfig<br>
.git/<br>
.gitignore<br>
.travis.yml</code>
    </td>

    <td>


      Tooling configuration files and folders.
      Ignore them until you have a compelling reason to do otherwise.
    </td>

  </tr>

  <tr>

    <td>
      <code>CHANGELOG.md</code>
    </td>

    <td>


      The history of changes to the _QuickStart_ repository.
      Delete or ignore.
    </td>

  </tr>

  <tr>

    <td>
      <code>favicon.ico</code>
    </td>

    <td>


      The application icon that appears in the browser tab.
    </td>

  </tr>

  <tr>

    <td>
      <code>index.html</code>
    </td>

    <td>


      The application host page.
      It loads a few essential scripts in a prescribed order.
      Then it boots the application, placing the root `AppComponent`
      in the custom `<my-app>` body tag.

      The same `index.html` satisfies all documentation application samples.
    </td>

  </tr>

  <tr>

    <td>
      <code>karma.conf.js</code>
    </td>

    <td>


      Configuration for the <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a>
      test runner described in the [Testing](guide/testing) guide.
    </td>

  </tr>

  <tr>

    <td>
      <code>karma-test-shim.js</code>
    </td>

    <td>


      Script to run <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a>
      with SystemJS as described in the [Testing](guide/testing) guide.
    </td>

  </tr>

  <tr>

    <td>
      <code>non-essential-files.txt</code>
    </td>

    <td>


      A list of files that you can delete if you want to purge your setup of the
      original QuickStart Seed testing and git maintainence artifacts.
      See instructions in the optional
      [_Deleting non-essential files_](guide/setup#non-essential "Setup: Deleting non-essential files") section.
      *Do this only in the beginning to avoid accidentally deleting your own tests and git setup!*
    </td>

  </tr>

  <tr>

    <td>
      <code>LICENSE</code>
    </td>

    <td>


      The open source MIT license to use this setup code in your application.
    </td>

  </tr>

  <tr>

    <td>
      <code>package.json</code>
    </td>

    <td>


      Identifies `npm `package dependencies for the project.

      Contains command scripts for running the application,
      running tests, and more. Enter `npm run` for a listing.
      <a href="https://github.com/angular/quickstart/blob/master/README.md#npm-scripts"
         title="npm scripts for Angular documentation samples">Read more</a> about them.
    </td>

  </tr>

  <tr>

    <td>
      <code>protractor.config.js</code>
    </td>

    <td>


      Configuration for the
      <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>
      _end-to-end_ (e2e) test runner.
    </td>

  </tr>

  <tr>

    <td>
      <code>README.md</code>
    </td>

    <td>


      Instruction for using this git repository in your project.
      Worth reading before deleting.
    </td>

  </tr>

  <tr>

    <td>
      <code>styles.css</code>
    </td>

    <td>


      Global styles for the application. Initialized with an `<h1>` style for the QuickStart demo.

    </td>

  </tr>

  <tr>

    <td>
      <code>systemjs<br>.config.js</code>
    </td>

    <td>


      Tells the **SystemJS** module loader where to find modules
      referenced in JavaScript `import` statements. For example:
      <code-example language="ts">
        import { Component } from '@angular/core;
      </code-example>


      Don't touch this file unless you are fully versed in SystemJS configuration.
    </td>

  </tr>

  <tr>

    <td>
      <code>systemjs<br>.config.extras.js</code>
    </td>

    <td>


      Optional extra SystemJS configuration.
      A way to add SystemJS mappings, such as for appliation _barrels_,
      without changing the original `system.config.js`.
    </td>

  </tr>

  <tr>

    <td>
      <code>tsconfig.json</code>
    </td>

    <td>


      Tells the TypeScript compiler how to transpile TypeScript source files
      into JavaScript files that run in all modern browsers.
    </td>

  </tr>

  <tr>

    <td>
      <code>tslint.json</code>
    </td>

    <td>


      The `npm` installed TypeScript linter inspects your TypeScript code
      and complains when you violate one of its rules.

      This file defines linting rules favored by the
      [Angular style guide](guide/styleguide) and by the authors of the documentation.
    </td>

  </tr>

</table>

