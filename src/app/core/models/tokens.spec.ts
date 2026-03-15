import { TestBed } from '@angular/core/testing';
import { API_URL } from './tokens';

describe('API_URL Token', () => {
  it('should provide the API URL from environment by default', () => {
    TestBed.configureTestingModule({});
    const apiUrl = TestBed.inject(API_URL);
    expect(apiUrl).toBeTruthy();
    expect(typeof apiUrl).toBe('string');
  });
});
