import { LocationService } from './location.service';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Logger } from './logger.service';
import { CONTENT_URL_PREFIX } from './../documents/document.service';
import { WindowToken } from './window';

const localizationPath = CONTENT_URL_PREFIX + '/localization.json';

export interface Localization {
  url: string;
  message: string;
  langCodes: string[];
}

@Injectable()
export class LocalizationService {

  constructor(@Inject(WindowToken) private window: Window, private http: HttpClient, private logger: Logger, private locationService: LocationService, private snackbar: MatSnackBar) { }

  suggestLocalizedVersion() {
    this.http.get<Localization[]>(localizationPath)
      .pipe(
        catchError(error => {
          this.logger.error(new Error(`${localizationPath} request failed: ${error.message}`));
          return [];
        }),
        map(localizations => this.findMatchLocalization(localizations)),
        catchError(error => {
          this.logger.error(new Error(`${localizationPath} contains invalid data: ${error.message}`));
          return [];
        }),
        switchMap(localization => {
          if (!localization) {
            return EMPTY;
          }
          return this.snackbar.open(localization.message, 'GO', { duration: 3000 }).onAction().pipe(
            tap(() => this.locationService.goExternal(localization.url))
          )
        })
      )
      .subscribe();

  }

  private findMatchLocalization(localizations: Localization[]) {
    const browserLanguage = this.window.navigator.language;
    if (!browserLanguage) {
      return undefined;
    }
    return localizations.find(localization => localization.langCodes.some(langCode => browserLanguage.startsWith(langCode)));
  }
}
