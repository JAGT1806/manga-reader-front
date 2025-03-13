import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChapterFeed, Manga } from '../../models/interface/manga.interface';
import { UserSettings } from '../../models/interface/user.settings';
import { combineLatest, Subscription } from 'rxjs';
import { MangaService } from '../../core/services/manga.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-manga',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './manga.component.html',
  styleUrl: './manga.component.css'
})
export class MangaComponent {
  manga: Manga | null = null;
  volumes: { volume: string; chapters: ChapterFeed[]}[] = [];
  loading: boolean = true;
  isFavorite: boolean = false;
  
  private subscription = new Subscription();

  private settingsService = inject(SettingsService);
  settings: UserSettings = this.settingsService.getSettings();

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    const mangaId = this.route.snapshot.paramMap.get('id');
    if (!mangaId) {
      this.router.navigate(['/', this.languageService.getDefaultLanguage(), 'home']);
      return;
    }

    this.subscription.add(
      combineLatest([
        this.mangaService.getMangaById(mangaId),
        this.settingsService.settings$,
        this.languageService.currentLanguage$
      ]).subscribe({
        next: ([mangaResponse, newSettings]) => {
          this.manga = mangaResponse.data;
          this.settings = newSettings;
          this.loading = true;
          this.loadMangaDetails(mangaId);

        },
        error: () => {
          this.router.navigate(['/', this.languageService.getDefaultLanguage(), 'home']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigateToChapter(chapterId: string): void {
    this.router.navigate(['/', this.languageService.getDefaultLanguage(), 'chapter', chapterId]);
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  private loadMangaDetails(id: string): void {
    this.loading = true;
    
    this.subscription.add(
      this.mangaService.getMangaById(id).subscribe({
        next: (mangaResponse) => {
          this.manga = mangaResponse.data;
          this.loadMangaFeed(id);
        },
        error: () => {
          this.router.navigate(['/', this.languageService.getDefaultLanguage(), 'home']);
          this.loading = false;
        }
      })
    );
  }

  private loadMangaFeed(id: string): void {
    if(!id) return;

    this.subscription.add(
      this.mangaService.getFeed(id, this.settings.nsfw).subscribe({
        next: (chapters) => {
          this.volumes = this.groupChaptersByVolume(chapters);
          this.sortVolumes();
        },
        error: () => {
          // Manejo de error
        },
        complete: () => {
          this.loading = false;
        }
      })
    );
  }

  private groupChaptersByVolume(chapters: ChapterFeed[]): { volume: string; chapters: ChapterFeed[] }[] {
    const volumeMap = new Map<string, ChapterFeed[]>();
    const NO_VOLUME = 'NULL';

    chapters.forEach((chapter) => {
      console.log(chapter.attributes.title);
      const volumeKey = chapter.attributes.volume ?? NO_VOLUME;

      if(!volumeMap.has(volumeKey)) {
        volumeMap.set(volumeKey, []);
      }

      volumeMap.get(volumeKey)!.push(chapter);
    });

    return Array.from(volumeMap.entries()).map(([volume, chapters]) => ({ volume, chapters: this.sortChapter(chapters) }));
  }

  private sortChapter(chapters: ChapterFeed[]): ChapterFeed[] {
    return chapters.sort((a, b) => {
      const capA = a.attributes.chapter ? parseFloat(a.attributes.chapter) : Infinity;
      const capB = b.attributes.chapter ? parseFloat(b.attributes.chapter) : Infinity;
      return capA - capB;
    })
  }

  private sortVolumes(): void {
    this.volumes.sort((a, b) => {
      if (a.volume === 'NULL') return 1;
      if (b.volume === 'NULL') return -1;
      
      const volA = parseFloat(a.volume || '0');
      const volB = parseFloat(b.volume || '0');
      return volA - volB;
    });
  }

}
