import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Manga } from '../../models/interface/manga.interface';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manga-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink
  ],
  templateUrl: './manga-card.component.html',
  styleUrl: './manga-card.component.css'
})
export class MangaCardComponent {
  @Input() manga: Manga | undefined;
  currentLang: string = '';

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }


  selectedLanguage(): string {
    return this.currentLang;
  }
}
