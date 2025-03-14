import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChapterMangaResponse } from '../../models/interface/manga.interface';
import { MangaService } from '../../core/services/manga.service';
import { SettingsService } from '../../core/services/settings.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.css'
})
export class ChapterComponent {
  selectedLanguage: string = "";
  pages: string[] = [];
  loadedPages: boolean[] = [];
  currentPage: number = 0;
  loading: boolean = false;
  useLowQuality: boolean = false;
  originalData: ChapterMangaResponse | null = null;
  preloadedImages: Set<number> = new Set<number>();
  error: string = "";

  private loadedUrls: Set<string> = new Set<string>();

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private languageService: LanguageService,
    private elementRef: ElementRef
  ) { 
    this.selectedLanguage = this.languageService.getDefaultLanguage();
    this.useLowQuality = this.settingsService.getSettings().dataSaver;
  }

  ngOnInit(): void {
    const currentTheme = this.settingsService.getSettings().theme;
    this.elementRef.nativeElement.setAttribute('data-bs-theme', currentTheme);

    this.settingsService.settings$.subscribe(settings => {
      const oldQuality = this.useLowQuality;
      this.useLowQuality = settings.dataSaver;

      this.elementRef.nativeElement.setAttribute('data-bs-theme', settings.theme);

      if(this.originalData && oldQuality !== this.useLowQuality) {
        const oldPages = [...this.pages];
        const oldLoaded = [...this.loadedPages];

        this.pages = this.useLowQuality ? this.originalData.dataSaver : this.originalData.data;

        this.loadedPages = new Array(this.pages.length).fill(false);

        oldPages.forEach((url, index) => {
          if(oldLoaded[index]) 
            this.loadedUrls.add(url);
          
        });

        this.preloadedImages.clear();
        this.scrollToPage(this.currentPage);
        this.preloadNextImages(this.currentPage);
      }

    });

    this.loadChapter();
  }

  ngOnDestroy(): void {
    
  }


  scrollToPage(pageIndex: number): void {
    const element = document.getElementById(`page-${pageIndex}`);
    if(element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private preloadNextImages(startIndex: number, count: number = 3): void {
    for (let i = startIndex; i < startIndex + count; i++) {
      if (i < this.pages.length && !this.preloadedImages.has(i)) {
        const img = new Image();
        img.src = this.pages[i];
        this.preloadedImages.add(i);
      }
    }
  }

  private loadChapter(): void {
    const chapterId = this.route.snapshot.paramMap.get('id');
    if (!chapterId) 
      return;
    
    this.loading = true;
    this.mangaService.getChapter(chapterId).subscribe({
      next: (response) => {
        this.originalData = response;
        this.pages = this.useLowQuality ? response.dataSaver : response.data;
        this.loadedPages = new Array(this.pages.length).fill(false);
        this.preloadNextImages(0);
      },
      error: () => {},
      complete: () => {
        this.loading = false;
      }
    });
  }

  onImageLoad(index: number): void {
    this.loadedPages[index] = true;
    this.preloadNextImages(index + 1);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch(event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.nextPage();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        this.previousPage();
        break;
    }
  }

  nextPage(): void {
    this.currentPage++;
    this.scrollToPage(this.currentPage);
  }

  previousPage(): void {
    this.currentPage--;
    this.scrollToPage(this.currentPage);
  }

  changeTheme(theme: string) {
    // Instead of removing and adding classes, just update styling if needed
    const images = this.elementRef.nativeElement.querySelectorAll('.manga-page');
    
    // Keep the 'loaded' class which controls visibility
    // Add theme-specific styling without removing the essential 'loaded' class
    images.forEach((image: HTMLElement) => {
      // Remove any existing theme classes
      image.classList.remove('loaded-light', 'loaded-dark');
      
      // Add the new theme class while preserving 'loaded' class
      if (image.classList.contains('loaded')) {
        image.classList.add('loaded-' + theme);
      }
    });
  }
}
