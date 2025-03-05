import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LanguageService } from '../services/language.service';

export const languageGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const languageService = inject(LanguageService);

  const langParam = route.params['lang'];

  if (languageService.isValidLanguage(langParam)) {
    languageService.setLanguage(langParam);
    return true;
  } else {
    const defaultLang = languageService.getDefaultLanguage();

    const currentUrl = state.url.split('/');
    currentUrl[1] = defaultLang;

    router.navigateByUrl(currentUrl.join('/'));
    return false;
  }
};
