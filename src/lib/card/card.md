`<md-card>` is a content container for text, photos, and actions. Cards are intended to provide 
information on a single subject.

<!-- example(card-overview) -->


### Basic card sections
The most basic card needs only an `<md-card>` element with some content. However, Angular Material
provides a number of preset sections that you can use inside of an `<md-card>`:


| Element               | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `<md-card-title>`     | Card title                                                               |
| `<md-card-subtitle>`  | Card subtitle                                                            |
| `<md-card-content>`   | Primary card content. Intended for blocks of text                        |
| `<img md-card-image>` | Card image. Stretches the image to the container width                   |
| `<md-card-actions>`   | Container for buttons at the bottom of the card                          |
| `<md-card-footer>`    | Section anchored to the bottom of the card                               |

These elements primary serve as pre-styled content containers without any additional APIs. 
However, the `align` property on `<md-card-actions>` can be used to position the actions at the 
`'start'` or `'end` of the container.  


### Card headers
In addition to the aforementioned sections, `<md-card-header>` gives the ability to add a rich
header to a card. This header can contain:

| Element                | Description                                                             |
|------------------------|-------------------------------------------------------------------------|
| `<md-card-title>`      | A title within the header                                               |
| `<md-card-subtitle>`   | A subtitle within the header                                            |
| `<img md-card-avatar>` | An image used as an avatar within the header                            |


### Title groups
An `<md-card-title-group>` can be used to combine a title, subtitle, and image into a single section.
This element can contain:
* `<md-card-title>`
* `<md-card-subtitle>`
* One of:
    * `<img md-card-sm-image>`
    * `<img md-card-md-image>`
    * `<img md-card-lg-image>`
