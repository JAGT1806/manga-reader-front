import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Manga, MangaListResponse } from '../../models/interface/manga.interface';
import { map, Observable } from 'rxjs';

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
  }
}
