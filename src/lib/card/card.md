`<md-card>` is a content container for text, photos, and actions in the context of a single subject.

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
`<md-card-title-group>` can be used to combine a title, subtitle, and image into a single section.
This element can contain:
* `<md-card-title>`
* `<md-card-subtitle>`
* One of:
    * `<img md-card-sm-image>`
    * `<img md-card-md-image>`
    * `<img md-card-lg-image>`

### Accessibility
Cards can be used in a wide variety of scenarios and can contain many different types of content.
Due to this dynamic nature, the appropriate accessibility treatment depends on how `<md-card>` is
used.

#### Group, region, and landmarks
There are several ARIA roles that communicate that a portion of the UI represents some semantically
meaningful whole. Depending on what the content of the card means to your application,
[`role="group"`][0], [`role="region"`][1], or [one of the landmark roles][3] should typically be
applied to the `<md-card>` element.

A role is not necessary when the card is used as a purely decorative container that does not
convey a meaningful grouping of related content for a single subject. In these cases, the content
of the card should follow standard practices for document content.


#### Focus
Depending on how cards are used, it may be appropriate to apply a `tabindex` to the `<md-card>`
element. If cards are a primary mechanism through which user interact with the application,
`tabindex="0"` is appropriate. If attention can be sent to the card, but it's not part of the
document flow, `tabindex="-1"` is appropriate.

If the card acts as a purely decorative container, it does not need to be tabbable. In this case,
the card content should follow normal best practices for tab order.



 [0]: https://www.w3.org/TR/wai-aria/roles#group
 [1]: https://www.w3.org/TR/wai-aria/roles#region
 [2]: https://www.w3.org/TR/wai-aria/roles#landmark
