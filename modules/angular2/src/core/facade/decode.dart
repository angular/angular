library angular2.src.core.facade.decode;

import 'dart:core' show String, Uri;

String tryDecodeURIComponent(String encodedComponent) {
  try {
    return Uri.decodeComponent(encodedComponent);
  } catch(exception, stackTrace) {
    // Ignore any invalid uri component
  }
}