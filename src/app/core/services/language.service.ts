import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private availableLanguages = ['es', 'en', 'fr'];
  private defaultLanguage = 'es';
  private currentLanguage = new BehaviorSubject<string>(this.defaultLanguage);

  currentLanguage$ = this.currentLanguage.asObservable();

  constructor(private translate: TranslateService) { 
    this.translate.addLangs(this.availableLanguages);
    this.translate.setDefaultLang(this.defaultLanguage);
  }

  setLanguage(lang: string): boolean {
    if (this.isValidLanguage(lang)) {
      this.translate.use(lang);
      this.currentLanguage.next(lang);
      localStorage.setItem('selectedLanguage', lang);
      return true;
    }
    return false;
  }

  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  getAvailableLanguages(): string[] {
    return this.availableLanguages;
  }

  isValidLanguage(lang: string): boolean {
    return this.availableLanguages.includes(lang);
  }

  getBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    return this.isValidLanguage(browserLang) ? browserLang : this.defaultLanguage;
  }
}
