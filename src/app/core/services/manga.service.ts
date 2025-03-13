import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChapterFeed, ChapterMangaResponse, FeedMangaResponse, Manga, MangaListResponse, MangaResponse } from '../../models/interface/manga.interface';
import { EMPTY, expand, map, Observable, reduce } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = environment.apiUrl;
  private mangaDexCoverUrl = environment.mangaDexCoverUrl;
  private readonly MAX_OFFSET = 9976;

  constructor(private http: HttpClient) { }

  getCoverUrl(manga: Manga): string {
    return `${this.mangaDexCoverUrl}/${manga.id}/${manga.fileName}`;
  }

  getAllMangas(
    title: string = '',
    offset: number = 0,
    limit: number = 12,
    nsfw: boolean = false
  ): Observable<MangaListResponse> {
    let params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit)
      .set('nsfw', nsfw);

    if(title) {
      params = params.set('title', title);
    }

    return this.http.get<MangaListResponse>(`${this.apiUrl}/manga`, { params }).pipe(
      map(response => ({
        ...response,
        total: response.total > this.MAX_OFFSET + limit ? 
          this.MAX_OFFSET + limit : 
          response.total,
        data: response.data.map(manga => ({
          ...manga,
          coverUrl: this.getCoverUrl(manga)
        }))
      }))
    );
  };

  getMangaById(id: string): Observable<MangaResponse> {
    return this.http.get<MangaResponse>(`${this.apiUrl}/manga/${id}`).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          coverUrl: this.getCoverUrl(response.data)
        }
      }))
    );
  }

  getFeed(id: string, nsfw: boolean): Observable<ChapterFeed[]> {
    return this.getFeedRecursive(id, 0, nsfw);
  }

  getChapter(id: string): Observable<ChapterMangaResponse> {
    return this.http.get<ChapterMangaResponse>(`${this.apiUrl}/manga/${id}`);
  }

  private getFeedRecursive(id: string, offset: number = 0, nsfw: boolean = false): Observable<ChapterFeed[]> {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', 100)
      .set('nsfw', nsfw);

    return this.http.get<FeedMangaResponse>(`${this.apiUrl}/manga/${id}/feed`, { params }).pipe(
      expand(response => {
        const nextOffset = response.offset + response.limit;
        if(nextOffset >= response.total) return EMPTY;

        const nextParams = new HttpParams()
          .set('offset', nextOffset)
          .set('limit', 100)
          .set('nsfw', nsfw);

        return this.http.get<FeedMangaResponse>(`${this.apiUrl}/manga/${id}/feed`, { params: nextParams });
      }),
      map(response => response.data),
      reduce((acc, val) => [...acc, ...val], [] as ChapterFeed[])
    );
  };
}
