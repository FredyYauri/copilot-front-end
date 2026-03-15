import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl
});
