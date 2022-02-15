# Installing Angular DevTools in Firefox

To install Angular DevTools in Firefox follow the steps:-

* Open menu item from top bar `Tools -> Browser Tools -> Remote Debugging`.

* After clicking `Remote Debugging` click on `This Firefox` option from left navigation. You will see the below screen with list of extensions. Temporary extensions are unreleased extensions loaded in development mode.

* Click on `Load Temporary Add-on` button to select and load the Angular DevTools extension for Firefox.

* Select any file from `dist -> shell chrome` directory to load extension. If you have not build extension for Firefox yet. You can do it using `yarn build:firefox` which will generate build for Firefox.

* After selecting file and clicking open, you should be able to see Angular DevTools as a Temporary Extension in Firefox.

* Open any Angular application in dev mode and open Firefox DevTools you should see Angular Tab in there.
