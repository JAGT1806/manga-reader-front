import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LanguageService } from '../services/language.service';

export const redirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const languageService = inject(LanguageService);

  //const storedLang = localStorage.getItem('selectedLanguage');

  
  //if (storedLang && languageService.isValidLanguage(storedLang)) {
    //router.navigate([storedLang])
    //return false;
  //} 

  const browserLang = languageService.getBrowserLanguage();
  router.navigate([browserLang]);

  return false;
};
