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
