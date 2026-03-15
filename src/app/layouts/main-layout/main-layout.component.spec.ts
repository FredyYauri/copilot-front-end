import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { API_URL } from '@core/models/tokens';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://test-api.com/api' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have authService injected', () => {
    expect(component.authService).toBeTruthy();
  });

  it('should render sidebar brand', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar__logo')?.textContent).toContain('CRM');
  });

  it('should contain a router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render dashboard link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('.sidebar__link');
    expect(link?.textContent).toContain('Dashboard');
  });

  it('should render logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.sidebar__logout');
    expect(button?.textContent).toContain('Cerrar sesión');
  });

  it('should call authService.logout on onLogout', () => {
    spyOn(authService, 'logout');
    component.onLogout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
