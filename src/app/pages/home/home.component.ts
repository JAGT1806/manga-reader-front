import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { MangaCardComponent } from "../../components/manga-card/manga-card.component";
import { Manga } from '../../models/interface/manga.interface';
import { Subscription } from 'rxjs';
import { MangaService } from '../../core/services/manga.service';
import { SettingsService } from '../../core/services/settings.service';
import { UserSettings } from '../../models/interface/user.settings';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PaginationComponent,
    MangaCardComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  mangas: Manga[] = [];
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 0;
  noResults = false;
  isLoading: boolean = false;
  private subscription = new Subscription();
  private settingsService = inject(SettingsService);
  private maxPages = 9988;

  settings: UserSettings = this.settingsService.getSettings();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mangaService: MangaService,
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        let page = parseInt(params['page']);

        if(!page || isNaN(page) || page < 1) {
          this.redirectToPage(1);
        } else if(page > this.maxPages) {
          this.currentPage = page;
          this.noResults = true;
          this.mangas = [];
          this.totalPages = this.maxPages;
        } else {
          this.currentPage = page;
          this.loadMangas();
        }
      })
    );

    this.subscription.add(
      this.settingsService.settings$.subscribe(newSettings => {
        this.settings = newSettings;
        if(this.currentPage <= this.maxPages)
          this.loadMangas();
      })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private redirectToPage(page: number): void {
    const currentLang = this.route.snapshot.params['lang'];
    this.router.navigate(['/', currentLang, 'home'], { queryParams: { page: page } });
  }

  private loadMangas(): void {
    if(this.isLoading) return;

    this.isLoading = true;
    const offset = (this.currentPage - 1);

    this.subscription.add(
      this.mangaService.getAllMangas(
        '',
        offset,
        this.pageSize,
        this.settings.nsfw
      ).subscribe({
        next: (response) => {
          this.mangas = response.data;
          this.noResults = this.mangas.length === 0;
          this.totalPages = response.total;
          this.isLoading = false;
        },
        error: () => {
          this.noResults = true;
        },
        complete: () => {
          this.isLoading = false;
        }
      })
    );
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.redirectToPage(page);
    }
  }
}
