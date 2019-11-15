# Introduction

<img src="generated/images/guide/nativescript/0-nativescript.png" width="100%">

[NativeScript](https://www.nativescript.org/) is an **open source** framework for building **truly native** mobile apps with **JavaScript**.

Use **web skills** like: **TypeScript**, **Angular** and **CSS** and **get native UI &** **performance** on **iOS** and **Android**.

## NativeScript can do this for you

- **Native Performance** - Beautiful, accessible, platform-native UI - without WebViews. Define once and let NativeScript adapt to run everywhere, or tailor the UI to specific devices and screens.
- **Cross-Platform** - Write and deploy native mobile apps for **iOS** and **Android** from a single codebase.
- **Easy to learn** - Use the web skills you already have to develop truly native apps with JavaScript, CSS, and Native UI markup.
- **Extensible** - With NativeScript, you have 100% direct access to all iOS and Android APIs. You can easily reuse CocoaPods and Android SDKs, plus find free plugins, templates, and application samples on the Marketplace.

### Learn NativeScript

As part of this tutorial, we will look at NativeScript in the context of a code-sharing project, which allows you to build Android, iOS and Web apps from a single project.

<div class="alert is-helpful">

Please note, you can also use NativeScript to target only mobile platforms (Android and iOS).

If you are interested in learning how to build mobile-only projects, see this [tutorial](https://docs.nativescript.org/angular/start/introduction).

</div>

## Code Sharing

You can use NativeScript Angular side by side with Web Angular in a single **code-sharing project**, which allows you to build both **web** and **native mobile** apps — for Android and iOS — from a single project.

The objective is to share as much code as possible, and break the platform-specific code into separate files.

This usually means that we can share the code for:

- the **Routes** for the navigation
- the **Services** for the common business logic
- the **Component Class definition** for the common behaviour of each component

While, separating the code for:

- the **UI Layer** (**stylesheets** and **html**) — as you need to use different user interface components in web and NativeScript-built native apps
- the **NgModules** — so that we can import platform-specific modules, without creating conflicts (i.e. Angular Material Design — which is web only) between web and mobile

Here’s a diagram to show you what that looks like at a high level.

<img src="generated/images/guide/nativescript/0-project-structure.png" width="100%">

## Next steps

To get started with NativeScript and a code-sharing project, see [Getting Started](guide/nativescript-getting-started).