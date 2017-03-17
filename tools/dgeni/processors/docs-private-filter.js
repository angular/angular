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
    $runBefore: ['categorizer'],
    $process: docs => docs.filter(doc => isPublicDoc(doc))
  };
};

function isPublicDoc(doc) {
  if (hasDocsPrivateTag(doc)) {
    return false;
  } else if (doc.docType === 'member') {
    return !isInternalMember(doc);
  } else if (doc.docType === 'class') {
    doc.members = doc.members.filter(memberDoc => isPublicDoc(memberDoc));
  }

  return true;
}

function isInternalMember(memberDoc) {
  return INTERNAL_METHODS.includes(memberDoc.name)
}

function hasDocsPrivateTag(doc) {
  let tags = doc.tags && doc.tags.tags;
  return tags ? tags.find(d => d.tagName == 'docs-private') : false;
}
