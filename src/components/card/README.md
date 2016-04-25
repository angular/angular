# md-card

`md-card` is a content container component that conforms to the spec of a Material Design card.

See plunker example [here](http://plnkr.co/edit/pkUNGMXPcf8RXKapXNXQ?p=preview).

## Usage

Simply add your content between `md-card` tags to consume basic card styles like box-shadow and default padding.

```html
<md-card>
   Basic card.
</md-card>
```

Output:

<img src="https://material.angularjs.org/material2_assets/cards/basic-card-min.png">

### Preset sections 

We also provide a number of preset sections that you can mix and match within the `md-card` tags. 

  * `<md-card-title>`: adds styles for a title
  * `<md-card-subtitle>`: adds styles for a subtitle
  * `<md-card-content>`: main content section, intended for blocks of text
  * `<img md-card-image>`: stretches image to container width
  * `<md-card-actions>`: wraps and styles buttons
  * `<md-card-footer>`: anchors section to bottom of card

Example markup for a card with section presets:

```html
<md-card>
   <md-card-subtitle>Subtitle first</md-card-subtitle>
   <md-card-title>Card with title</md-card-title>   
   <md-card-content>
        <p>This is supporting text.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad</p>
   </md-card-content>
   <md-card-actions>
        <button md-button>LIKE</button>
        <button md-button>SHARE</button>
   </md-card-actions>
</md-card>
```

Output:

<img src="https://material.angularjs.org/material2_assets/cards/sections-card-min.png">

#### Preset shortcuts

`md-card-actions` has a few layout shortcuts. You can add `align="end"` to align the buttons at the end of
the main axis (flex-end). The default is `align="start"` (flex-start).

### Preset layouts

You can also leverage preset layouts that format some of the sections together.

#### `<md-card-header>`

Formats the following sections into a header:

  * `<md-card-title>`: title to format within header
  * `<md-card-subtitle>`: subtitle to format within header
  * `<img md-card-avatar>`: image to use for avatar
    
Example markup for a card with a header:

```html
<md-card>
   <md-card-header>
      <img md-card-avatar src="path/to/img.png">
      <md-card-title>Header title</md-card-title>
      <md-card-subtitle>Header subtitle</md-card-subtitle>
   </md-card-header>
   <img md-card-image src="path/to/img.png">
   <md-card-content>
      <p>Here is some more content</p>
   </md-card-content>
</md-card>
```

Output:

<img src="https://material.angularjs.org/material2_assets/cards/header-card-min.png">    
    
#### `<md-card-title-group>`

Groups the following sections together:

  * `<md-card-title>`: title to format within group
  * `<md-card-subtitle>`: subtitle to format within group
  * One of the following image sizes:
    * `<img md-card-sm-image>`
    * `<img md-card-md-image>`
    * `<img md-card-lg-image>`

Example markup for a card with title-group layout:

```html
<md-card>
   <md-card-title-group>
      <img md-card-sm-image src="path/to/img.png">
      <md-card-title>Card with title</md-card-title>
      <md-card-subtitle>Subtitle</md-card-subtitle>
   </md-card-title-group>
</md-card>
```

Output:

<img src="https://material.angularjs.org/material2_assets/cards/title-group-card-min.png">