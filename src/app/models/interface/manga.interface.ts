export interface Manga {
    id: number;
    title: string;
    image: string;
    description: string;
    coverId: number;
    fileName: string;
    coverUrl?: string;
}

export interface MangaListResponse {
    data: Manga[];
    limit: number;
    offset: number;
    total: number;
}

export interface MangaResponse {
    data: Manga;
}

export interface FeedMangaResponse {
    data: ChapterFeed[];
    limit: number;
    offset: number;
    total: number;
}

export interface ChapterFeed {
    id: string;
    attributes: ChapterAttributes;
}

export interface ChapterAttributes {
    volume: string;
    chapter: string;
    title: string;
    language: string;
    pages: number;
}

export interface ChapterMangaResponse {
    data: string[];
    dataSaver: string[];
}
