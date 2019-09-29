import {computeMsgId} from '@angular/compiler';
import {loadTranslations} from '@angular/localize';

// Load some runtime translations!
loadTranslations({
  [computeMsgId(' Hello {$INTERPOLATION}! ')]: 'Bonjour {$INTERPOLATION}!',
  [computeMsgId('Welcome to the i18n app.')]: 'Bienvenue sur l\'application i18n.',
});
