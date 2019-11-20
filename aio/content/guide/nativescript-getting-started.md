# Getting Started

In this section we will look at preparing your development environment, setting up your project and building your first mobile app with NativeScript.

## NativeScript CLI

To run mobile apps with NativeScript you will need to install the **NativeScript CLI**. Execute the following command:

```sh
npm install --global nativescript
```

### Preview

The NativeScript CLI performs only the build of your Angular code while skipping the Android/iOS build, then it deploys your code to **NativeScript Preview** (a companion app hosting your app code).

To use preview, you need to install two companion apps on your Android/iOS device(s):

- **NativeScript Playground** ([Android](https://play.google.com/store/apps/details?id=org.nativescript.play), [iOS](https://apps.apple.com/us/app/nativescript-playground/id1263543946)) — used to scan a QR code provided by the NativeScript CLI
- **NativeScript Preview** ([Android](https://play.google.com/store/apps/details?id=org.nativescript.preview), [iOS](https://apps.apple.com/us/app/nativescript-preview/id1264484702)) — used to host display your app

## Project setup

As the basis of this tutorial, you will use a completed version of `Your First App` from the [Getting Started with Angular](start).

### Recreate Your First App

If you don't have your copy of **Your First App**, you can prepare it based on this [stackblitz project](https://stackblitz.com/edit/getting-started-complete).

First, you will need to download the source code from [getting-started-complete StackBlitz project](https://stackblitz.com/edit/getting-started-complete). Click the `Download Project` icon in the left menu across from `Project` to download your files.

Create a new Angular CLI workspace using the [`ng new`](cli/new "CLI ng new command reference") command:

```sh
ng new my-project-name
```

From there you replace the `/src` folder with the one from the `StackBlitz` download, and then serve the web application by calling:

```sh
ng serve -o
```

## Add Mobile to the Web Project

The idea is to add NativeScript to the web project - which will allow you to build web, iOS and Android apps from a single project - then step by step convert all web components to also work in NativeScript.

Here are the high level steps that you will follow:

1. Convert the web project to a code-sharing structure
2. Update the NativeScript AppModule
3. Update the first component
4. Update the rest of the components

## Add NativeScript

First you need to convert your project to a code-sharing structure. 

Run the following `ng add` command from the root of your project:

```sh
ng add @nativescript/schematics
```

This command adds the **NativeScript-specific**:

- npm modules
- AppModule definition
- AppComponent definition
- TypeScript configuration

And as a result it allows you to build a NativeScript app from the same project.

However, this does not convert your components to work in a mobile app, as HTML doesn't map to Native Mobile UI components.

## Global NativeScript Styles

<div class="alert is-helpful">

NativeScript uses CSS to change the looks and appearance of elements in the application.

However, styling is out of scope for this tutorial.

You can find more info on styling a NativeScript app in the [NativeScript docs](https://docs.nativescript.org/angular/ui/styling).

</div>

The global stylesheet for the mobile part of the project is located in **app.css**.

You should update it with the below code, which provides you with common styling classes that you will use across the app.

`app.css`

```css
@import '~nativescript-theme-core/css/core.light.css';

ActionBar {
  background-color: #1976d2;
  color: white;
}

.action-bar-item {
  color: white;
  padding-right: 5;
}

.big-btn, .btn-red, .btn-green, .btn-blue, .btn-blue-outline {
  font-weight: bold;
  font-size: 18;
  padding: 10 30;
  border-radius: 25;
  margin: 20 10 0 10;
  width: 90%;
}
.btn-red {
  color: white;
  background-color: #ED4472;
}
.btn-green {
  color: white;
  background-color: #30CE91;
}
.btn-blue {
  color: white;
  background-color: #1976d2;
}
.btn-blue-outline {
  color: #1976d2;
  border-color: #1976d2;
  border-width: 2;
}

.title {
  color: #1976d2;
  font-size: 32;
  text-align: center;
  margin-bottom: 8;
}

.cart-item, .shipping-item {
  padding: 2 4;
  margin: 4;
  border-radius: 16;
  background-color: #EEEEEE;
}

.form {
  margin-top: 20px;
  width: 90%;
}

.form Label {
  color: #5a78e3;
  font-size: 20;
  font-weight: bold;
  margin: 5;
  position: top;
}

.form TextField {
  background-color: white;
  padding-left: 5;
  border-color: #5a78e3;
  border-width: 2;
  border-radius: 5;
}
```

## Web vs Mobile code

Before you can start sharing code, you need to know how to separate the web code from the mobile code. This is important, so that you can easily create platform-specific code without creating conflicts.

File **extensions** are used to load NativeScript specific code. By adding a **.tns** before the file extension, you indicate that this file is NativeScript-specific, while the same file without the **.tns** extension is considered web-specific. If we have just one file without the **.tns** extension, then this file is used for both web and mobile.

### Component — Code-Sharing Format

The most common scenario is a component code. Usually we would have:

- `name.component.ts` — a shared file for the Component Class definition
- `name.component.html` — a web-specific template
- `name.component.tns.html` — a mobile-specific template
- `name.component.css` — a web-specific stylesheet
- `name.component.tns.css` — a mobile-specific stylesheet

<img src="generated/images/guide/nativescript/0-component-splitting.png" width="100%">

## First Run

To preview the mobile application on a device use the NativeScript CLI **preview command**.

From the root of your project run the following command:

```sh
tns preview
```

After a short moment, the CLI will present you with a QR Code. Scan it with the **NativeScript Playground** app, which will connect your project with the **NativeScript Preview** app.

As soon as you scan the QR Code, the CLI will bundle the TypeScript code from your project and push it to the **NativeScript Preview** app.

Your app should look something like this:

<img src="generated/images/guide/nativescript/1-first-run-android.png" height="600">
<img src="generated/images/guide/nativescript/1-first-run-ios.png" height="600">

You may notice that a big button with text saying *"auto-generated works!"* is not what you had in your web project. Don't worry, this is just a demo component to show you that the mobile app works.

### Livesync

While the `tns preview` command is active, any changes to the project will get automatically picked up by the NativeScript CLI and an update will be pushed to the app.

To see this in action, find your `src/app/auto-generated/auto-generated.component.tns.html` file, change the `text` value to `text="update now 😃"`, save and wait for a moment.


<img src="generated/images/guide/nativescript/1-livesync-android.png" height="600">
<img src="generated/images/guide/nativescript/1-livesync-ios.png" height="600">

<div class="alert is-helpful">

You don't need to re-run the build manually, as most of the times your changes will show up in your app automatically — just what you would expect from the `ng serve` command.

</div>

## Next steps

Next, you need to update the NativeScript AppModule, so that it uses the mobile-specific modules where required.

To learn what this means and how to do it, see [Prepare NativeScript AppModule](guide/nativescript-prepare-app-module).
