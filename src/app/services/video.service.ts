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
    private apiUrl = 'http://localhost:5000'; // Backend API URL

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
        console.log(`Intentando agregar video a favoritos: ${video.title}`);
        console.log('Detalles del video:', {
            videoId: video.videoId,
            title: video.title,
            thumbnailUrl: video.thumbnails.medium.url,
            channelTitle: video.channelTitle
        });

        // Send to backend
        const token = localStorage.getItem('token');
        console.log('Token de autenticación:', token ? 'Presente' : 'No encontrado');

        if (!token) {
            console.error('No se encontró token de autenticación');
            return;
        }

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        this.http.post(`${this.apiUrl}/favorites/add`, {
            videoId: video.videoId,
            title: video.title,
            thumbnailUrl: video.thumbnails.medium.url,
            channelTitle: video.channelTitle
        }, { headers }).subscribe({
            next: (response) => {
                console.log(`Video agregado exitosamente a favoritos: ${video.title}`);
                console.log('Respuesta del servidor:', response);
                // Only add to local list if backend succeeds
                if (!this.favoriteVideos.some(v => v.videoId === video.videoId)) {
                    this.favoriteVideos.push(video);
                    this.saveFavorites();
                    console.log(`Video añadido a la lista local de favoritos: ${video.title}`);
                } else {
                    console.log(`El video ya estaba en favoritos: ${video.title}`);
                }
            },
            error: (err) => {
                console.error(`Error al agregar video a favoritos: ${video.title}`, err);
                console.error('Detalles del error:', {
                    videoId: video.videoId,
                    title: video.title,
                    errorStatus: err.status,
                    errorMessage: err.message,
                    errorBody: err.error
                });

                // Manejar errores específicos
                if (err.status === 401) {
                    console.error('Token de autenticación inválido o expirado');
                    // Aquí podrías agregar lógica para redirigir al login
                } else if (err.status === 400) {
                    console.error('Error en los datos enviados');
                } else if (err.status === 0) {
                    console.error('No se pudo conectar con el servidor');
                }
            },
            complete: () => {
                console.log('Solicitud de agregar a favoritos completada');
            }
        });
    }

    removeFromFavorites(video: Video): void {
        // Send to backend
        this.http.delete(`${this.apiUrl}/favorites/remove`, { 
            body: { videoId: video.videoId } 
        }).subscribe({
            next: () => {
                this.favoriteVideos = this.favoriteVideos.filter(v => v.videoId !== video.videoId);
                this.saveFavorites();
            },
            error: (err) => {
                console.error('Failed to remove from favorites', err);
            }
        });
    }

    private saveFavorites(): void {
        localStorage.setItem('favoriteVideos', JSON.stringify(this.favoriteVideos));
    }

    loadBackendFavorites(): void {
        this.http.get<Video[]>(`${this.apiUrl}/favorites`).subscribe({
            next: (favorites) => {
                this.favoriteVideos = favorites;
                this.saveFavorites();
            },
            error: (err) => {
                console.error('Failed to load favorites', err);
            }
        });
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