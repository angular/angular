/**
 * Processor to filter out symbols that should not be shown in the Material docs.
 */

const INTERNAL_METHODS = [
  // Lifecycle methods
  'ngOnInit',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',

  // ControlValueAccessor methods
  'writeValue',
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',

  // Don't ever need to document constructors
  'constructor',

  // tabIndex exists on all elements, no need to document it
  'tabIndex',
];

module.exports = function docsPrivateFilter() {
  return {
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      return docs.filter(d => !(hasDocsPrivateTag(d) || INTERNAL_METHODS.includes(d.name)));
    }
  };
};

function hasDocsPrivateTag(doc) {
  let tags = doc.tags && doc.tags.tags;
  return tags ? tags.find(d => d.tagName == 'docs-private') : false;
}
