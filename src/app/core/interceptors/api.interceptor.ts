import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppConfig } from '../config/app-config.token';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isExternal = req.url.startsWith('http://') || req.url.startsWith('https://');

  if (isExternal) return next(req);

  const config = inject(AppConfig);

  const apiReq = req.clone({
    url: `${config.apiUrl}/${req.url.replace(/^\//, '')}`,
  });

  return next(apiReq);
};
