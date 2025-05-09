import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { VideoResponse, Item } from "../interfaces/youtube.interface";
import { Video } from "../interfaces/video.interface";
import { environment } from "../../environments/environment.development";
import { VideoMapper } from "../mapper/video.mapper";
import { map, catchError, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class VideoService {

    private http: HttpClient = inject(HttpClient);
    private resultVideos = signal<VideoResponse[]>([]);
    private pageTokens: { [key: number]: string } = {};
    private favoriteVideos: Video[] = [];

    constructor() { 
        // Load favorites from localStorage on service initialization
        const storedFavorites = localStorage.getItem('favoriteVideos');
        if (storedFavorites) {
            this.favoriteVideos = JSON.parse(storedFavorites);
        }
    }

    getFavoriteVideos(): Video[] {
        return this.favoriteVideos;
    }

    addToFavorites(video: Video): void {
        // Check if video is not already in favorites
        if (!this.favoriteVideos.some(v => v.videoId === video.videoId)) {
            this.favoriteVideos.push(video);
            this.saveFavorites();
        }
    }

    removeFromFavorites(video: Video): void {
        this.favoriteVideos = this.favoriteVideos.filter(v => v.videoId !== video.videoId);
        this.saveFavorites();
    }

    private saveFavorites(): void {
        localStorage.setItem('favoriteVideos', JSON.stringify(this.favoriteVideos));
    }

    searchVideos(query: string, pageNumber: number = 1) {
        return this.http.get<VideoResponse>(`${environment.apiUrl}/search`, {
            params: {
                key: environment.apiKey,
                q: query,
                type: 'video',
                part: 'snippet',
                maxResults: '50',  // Increase max results
                pageToken: this.pageTokens[pageNumber] || '',
            },
        }).pipe(
            map((response) => {
                const mappedVideos = VideoMapper.mapVideoList(response.items);
                // Store page token with the page number
                if (response.nextPageToken) {
                    this.pageTokens[pageNumber + 1] = response.nextPageToken;
                }
                console.log('Mapped Videos:', mappedVideos);
                return mappedVideos;
            }),
            catchError((error: Error) => {
                console.error('Error searching videos:', error);
                return throwError(() => new Error('Failed to search videos'));
            })
        );
    }
}