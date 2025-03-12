import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = localStorage.getItem('selectedLanguage') || 'es';
  if (lang) 
    req = req.clone({
      headers: req.headers.set('Accept-Language', lang)
    });

  return next(req);
};
