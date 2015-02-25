# Polymer 0.8 Preview

Authors interested in learning the core concepts in 0.8 may be interested in our [primer](https://github.com/Polymer/polymer/blob/0.8-preview/PRIMER.md).

## From The Ground Up

Let us begin this tale with a short stroll through the layers that Polymer is
built upon, and some of the rationale of how we got there.

### Raw Custom Elements

Custom Elements are a powerful emerging web standard that allows developers to create their own elements by attaching a class to a tag-name. 

#### document.registerElement

The native API is very simple, it looks something like this:

```js
document.registerElement(<name String>, {prototype: Object[, extends: String]});
```

#### Typical Boilerplate

There is a little bit of work one has to do to set up the class with the right prototypes and so on to construct a Custom Element. Here is an typical example (using ES5 syntax):

```js
var ctor = function() {
  return document.createElement('x-custom');
};
ctor.prototype = Object.create(HTMLElement.prototype);
ctor.prototype.constructor = ctor;
ctor.prototype.createdCallback = function() {
  this.innerHTML = 'Hello World, I am a <b>Custom Element!</b>';
}
document.registerElement('x-custom', ctor);
```

### Reluctant Polymer() Abstraction

By principle, Polymer team tries to avoid abstracting DOM APIs, especially new ones. But in this case we finally decided the ergonomic benefit was worth it. By wrapping `registerElement` in our own function, we can reduce the above boilerplate to:

```js
var ctor = Polymer({
  is: 'x-custom',
  created: function() {
    this.innerHTML = 'Hello World, I am a <b>Custom Element!</b>';
  }
});
```

### Polymer() Does a Bit More

You might notice the `Polymer()` invocation defines `created` instead of `createdCallback`. This is a feature of `Polymer.Base`, a tiny prototype that `Polymer()` adds to your prototype chain as it's handling the boilerplate above. `Polymer.Base` hooks the standard Custom Element lifecycle callbacks to provide helper implementations. The hooks in turn call shorter-named lifecycle methods on your prototype.

- `created` instead of `createdCallback`
- `attached` instead of `attachedCallback`
- `detached` instead of `detachedCallback`
- `attributeChanged` instead of `attributeChangedCallback`

You can always fallback to using the low-level methods if you wish (iow, you could simply implement `createdCallback` in your prototype).

`Polymer.Base` also implements `registerCallback` on your prototype. `Polymer()` calls `registerCallback` which allows `Polymer.Base` to supply a layering system for Polymer abstractions so that no element needs to pay for features it doesn't use. 

## Features

By default, the default Polymer distribution include several features. Although `Polymer.Base` itself is tiny, if you examine `Polymer.Base` you will probably see several methods that have been plugged-in to that prototype by feature definitions. The next few sections will explain these features and why we include them in the default set. Keep in mind that it's entirely possible to construct custom feature sets, or even use a trivial, featureless form of `Polymer()`.

### Feature: _published_

The first feature implements support for the `published` property. By placing a object-valued `published` property on your prototype, let's you define various aspects of your custom-elements public API. 

By itself, the `published` feature **doesn't do anything**. It only provides API for asking questions about these special properties (see [link to docs] for details).

```js
Polymer({

  is: 'x-custom',

  published: {
    user: String,
    isHappy: Boolean,
    count: {
      type: Number,
      readOnly: true,
      notify: true
    }
  },

  created: function() {
    this.innerHTML = 'Hello World, I am a <b>Custom Element!</b>';
  }

});
```

Remember that the fields assigned to `count`, such as `readOnly` and `notify` don't do anything by themselves, it requires other features to give them life.

### Feature: _attributes_

Many custom elements want to support configuration using HTML attributes. Custom Elements provides the `attributeChanged` callback gives us the raw API for this ability, but then we have to deal with initialization and type conversion (attributes are always strings). Here is an example of a custom element that supports a `user` attribute using the raw API.

```js
  Polymer({

    is: 'x-custom',

    created: function() {
      // handle any initial value
      this.attributeChanged('user');
      // render
      this.innerHTML = 'Hello World, my user is ' + (this.user || 'nobody') + '.';
    },

    attributeChanged: function(name) {
      switch(name) {
        case 'user':
          // pretty easy since user is a String, for other types
          // we have to do more work
          if (this.hasAttribute('user')) {
            this.user = this.getAttribute('user');
          }
          break;
      }
    }

  });
```

Although it's relatively simple, having to write this code becomes annoying when working with multiple attributes or non-String types. It's also not very DRY. 

Instead, Polymer's `attributes` feature handles this work for you (using the `published` feature data). If an attribute is set that matches a property listed in the `published` object, the value is captured into the matching property. Strings are automatically converted to the published type.

The type system includes support for Object values expressed as JSON, or Date objects expressed as any Date-parsable string representation. Boolean properties are mapped to Boolean attributes, in other words, if the attribute exists at all, its value is true, regardless of its string-value (and the value is only false if the attribute does not exist).

Here is the equivalent of the above code, taking advantage of the `attributes` feature.

```html
<script>

  Polymer({

    is: 'x-custom',

    published: {
      user: String
    },

    created: function() {
      // render
      this.innerHTML = 'Hello World, my user is ' + (this.user || 'nobody') + '.';
    }

  });

</script>

<x-custom user="Scott"></x-custom>
```

### [ToDoc] attributes:hostAttributes

### Feature: _template_

HTML templates are an emerging web standard that we like to consider part of the Web Components family. Templates are a great way to provide archetypal DOM content for your custom element, and this is where the `template` feature comes in.

As usual, we started by writing basic template support by hand. It generally looks something like this:

```html
<template>

  Hello World from x-custom!

  </template>

<script>

  Polymer({

    is: 'x-custom',

    created: function() {
      var template = <find the template somehow>;
      var instance = document.importNode(template.content, true);
      this.appendChild(instance);
    }

  });

</script>
```

Again, it's simple, but it's a common pattern, so the `template` feature does it automatically. By default it looks for a template as the first element before the script, so our code can look like this:

```html
<template>

  Hello World from x-custom!

</template>

<script>

  Polymer({

    is: 'x-custom'

  });

</script>
```

### Feature: _annotations_

Most elements need to customize the DOM instanced from a template. For this reason, it's handy to encode markers into your template to indicate special nodes, attributes, or text. Polymer calls these markers _annotations_. The `annotations` feature scans the template (once per element, at registration time) and builds a data-structure into the prototype that identifies markers it finds in the DOM (see [link to docs] for details). Normally you do not need to work with this data directly, Polymer does it for you.

### Feature: _annotations-nodes_

Traditionally, modifying DOM is done by querying for elements to manipulate. Here is an example:

```html
<template>

  Hello World from <span id="name"></span>!

</template>

<script>

  Polymer({

    is: 'x-custom',

    created: function() {
      this.querySelector("#name").textContent = this.name;
    }

  });

</script>
```

This example is very simple. But in real projects, repeating queries is inefficient, so query results are often stored (memoized). Also, as DOM composition becomes more tricky, crafting correct queries can be difficult. For these reasons, automatically capturing nodes makes a good feature.

The `annotations-nodes` feature builds a map of instance nodes by `id` in `this.$` (using the `annotations` feature data). Here is how the `annotations-nodes` feature simplifies the above example.

```html
<template>

  Hello World from <span id="name"></span>!

</template>

<script>

  Polymer({

    is: 'x-custom',

    created: function() {
      this.$.name.textContent = this.name;
    }

  });

</script>
```

### Feature: _annotations-events_

Most elements also need to listen for events. The standard DOM method `addEventListener` provides the low-level support:

```html
<template>

  <button id="button">Kick Me</button>

</template>

<script>

  Polymer({

    is: 'x-custom',

    created: function() {
      this.$.button.addEventListener('click', function() {
        alert('Ow!');
      });
    }

  });

</script>
```

Again, this is pretty simple, but it's so common that it's worth making even simpler. The `annotations-events` feature supports declaring event listeners directly in our template. 

Declaring listeners in the template is convenient, and also helps us decouple view from behavior.

```html
<template>

  <button on-click="kickAction">Kick Me</button>

</template>

<script>

  Polymer({

    is: 'x-custom',

    kickAction: function() {
      alert('Ow!');
    }

  });

</script>
```

Notice that the `kickAction` method doesn't know anything about `button`. If we decided that kicking should be performed by a key-press, or a menu-item, the element code doesn't need to know. We can change the UI however we want. Also notice that by attaching the event declaratively, we have removed the need to give the button an id.

### [ToDoc] events feature

### [ToDoc] keys feature

### [ToDoc] content feature


