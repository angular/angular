import { Response } from '@angular/http';

// tslint:disable:quotemark
export function getTestNavMapResponse(): Response {

  const navMapJson = { "nodes": [
    {
      "docId": "guide/quickstart",
      "navTitle": "Quickstart",
      "tooltip": "A quick look at an Angular app."
    },

    {
      "docId": "guide/cli-quickstart",
      "navTitle": "CLI Quickstart",
      "tooltip": "A quick look at an Angular app built with the Angular CLI.",
      "hide": true  // <----- SHOULD BE FILTERED OUT
    },

    {
      "navTitle": "Tutorial",
      "children": [
        {
          "docId": " tutorial/",
          "navTitle": "Introduction",
          "tooltip": "Introduction to the Tour of Heroes tutorial"
        },
        {
          "docId": "tutorial/toh-pt1",
          "navTitle": "The Hero Editor",
          "tooltip": "Build a simple hero editor."
        }
      ]
    },

    {
      "navTitle": "Getting started",
      "tooltip": "A gentle introduction to Angular",
      "children": [
        {
          "docId": "guide/docs-overview",
          "navTitle": "Overview",
          "tooltip": "How to read and use this documentation."
        },
        {
          "docId": "guide/setup",
          "navTitle": "Setup",
          "tooltip": "Install the Angular QuickStart seed for faster, more efficient development on your machine."
        }
      ]
    },

    {
      "navTitle": "Core",
      "tooltip": "Learn the core capabilities of Angular",
      "children": [
        {
          "docId": "guide/NgModule",
          "navTitle": "Angular Modules (NgModule)",
          "tooltip": "Define application modules with @NgModule."
        },
        {
          "docId": "guide/directives",
          "navTitle": "Directives",
          "tooltip": "Learn how directives modify the layout and behavior of elements.",
          "children": [
            {
              "docId": "guide/attribute-directives",
              "navTitle": "Attribute directives",
              "tooltip": "Attribute directives attach behavior to elements."
            },
            {
              "docId": "guide/structural-directives",
              "navTitle": "Structural directives",
              "tooltip": "Structural directives manipulate the layout of the page."
            }
          ]
        }
      ]
    },
    {
      "navTitle": "Empty Heading",
      "children": [ ]
    },
    {
      "navTitle": "External",
      "children": [
        {
          "url": "https://gitter.im/angular/angular",
          "navTitle": "Gitter",
          "tooltip": "Chat about Angular with other birds of a feather"
        }
      ]
    }
  ]};

  // tslint:enable:quotemark
  return {
    status: 200,
    json: () => navMapJson
  } as Response;
}
