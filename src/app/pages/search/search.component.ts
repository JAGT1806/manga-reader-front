import { Component, inject } from '@angular/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { MangaCardComponent } from "../../components/manga-card/manga-card.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Manga } from '../../models/interface/manga.interface';
import { UserSettings } from '../../models/interface/user.settings';
import { SettingsService } from '../../core/services/settings.service';
import { MangaService } from '../../core/services/manga.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaginationComponent, 
    MangaCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  private settingsService = inject(SettingsService);
  
  private currentLanguage = inject(LanguageService).getDefaultLanguage();
  mangas: Manga[] = [];
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 0;
  noResults = false;
  isLoading: boolean = false;
  searchQuery: string = '';
  
  private subscription = new Subscription();
  private settings: UserSettings = this.settingsService.getSettings();

  constructor(
    private mangaService: MangaService,
    private langugaeService: LanguageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.route.queryParams,
        this.settingsService.settings$,
        this.langugaeService.currentLanguage$
      ]).subscribe(([params, newSettings]) => {
        this.settings = newSettings;
        this.currentLanguage = this.langugaeService.getDefaultLanguage();
        this.searchQuery = params['title'] || '';
        this.currentPage = parseInt(params['page']) || 1;

        if(!this.searchQuery.trim()) 
          this.router.navigate(['/', this.currentLanguage, 'home']);
        else 
          this.fetchMangas();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fetchMangas(): void {
    if(this.isLoading) return;

    this.isLoading = true;
    const offset = (this.currentPage - 1) * this.pageSize;

    this.mangaService.getAllMangas(
      this.searchQuery,
      offset,
      this.pageSize,
      this.settings.nsfw
    ).subscribe({
      next: (response) => {
        this.mangas = response.data;
        this.noResults = this.mangas.length === 0;
        this.totalPages = Math.ceil(response.total / this.pageSize);

        this.updateUrlParams();
      },
      error: () => {
        this.noResults = true;
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchMangas();
  }

  private updateUrlParams(): void {
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { 
        title: this.searchQuery, 
        nsfw: this.settings.nsfw,
        page: this.currentPage 
      }, 
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

}
