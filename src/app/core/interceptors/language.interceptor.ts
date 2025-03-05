import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = getLanguageFromUrl(req.url);
  if (lang) {
    req = req.clone({
      headers: req.headers.set('Accept-Language', lang)
    });
  }

  return next(req);
};

function getLanguageFromUrl(url: string): string {
  const urlParts = url.split('/');
  return urlParts[1];
}
