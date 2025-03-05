import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { Language } from '../../models/enum/language.enum';
import { SettingsService } from '../../core/services/settings.service';
import { UserSettings } from '../../models/interface/user.settings';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private languageService = inject(LanguageService);
  private settingsService = inject(SettingsService);

  Language = Language;
  currentLanguage: string = this.languageService.getDefaultLanguage();
  searchQuery: string = '';

  isSettingsOpen = signal(false);

  currentUser = signal<any>(null);
  settings = signal<UserSettings> (this.settingsService.getSettings());


  constructor(
    private router: Router
  ) { 
    const initialSettings = this.settingsService.getSettings();
  }

  selectedLanguage(): string {
    return this.currentLanguage
  }

  ngOnInit(): void {
    this.settings.set(this.settingsService.getSettings());

    this.settingsService.settings$.subscribe(
      newSettings => this.settings.set(newSettings)
    );

    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const urlParts = this.router.url.split('/');
      if(urlParts.length > 1 && this.languageService.isValidLanguage(urlParts[1])) {
        this.currentLanguage = urlParts[1];
      }
    });

    this.loadSavedTheme();
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/', this.currentLanguage, 'search'], { 
        queryParams: { 
          title: this.searchQuery,
          nsfw: this.settings().nsfw
        } 
      });
    } else {
      this.router.navigate(['/', this.currentLanguage, 'home']);
    }
  }
  
  changeLanguage(lang: Language): void {
    // Actualizar la URL manteniendo la ruta actual
    const urlSegments = this.router.url.split('/');
    if (urlSegments.length > 1) {
      urlSegments[1] = lang;
      const newUrl = urlSegments.join('/');
      
      // Navegar a la misma ruta pero con el nuevo idioma
      this.router.navigateByUrl(newUrl);
    }
  }
  
  toggleDataSaver(): void {
    this.settingsService.updateSettings({
      dataSaver: !this.settings().dataSaver
    })
  }
  
  toggleNSFW(): void {
    this.settingsService.updateSettings({
      nsfw: !this.settings().nsfw
    });
  }
  
  toggleTheme(): void {
    const newTheme = this.settings().theme === 'light' ? 'dark' : 'light';
    
    this.settingsService.updateSettings({
      theme: newTheme
    })
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    
  }
  
  loadSavedTheme(): void {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
  }
  
  onLogout(): void {
    // Implementar lógica de cierre de sesión
    // Por ejemplo: this.authService.logout();
    this.currentUser.set(null);
    this.router.navigate(['/', this.currentLanguage, 'home']);
  }
  
  isAdmin1(): boolean {
    // Implementar lógica para verificar si el usuario es administrador
    return this.currentUser()?.user?.role === 'admin';
  }

}
