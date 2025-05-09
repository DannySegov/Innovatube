import { Component, OnInit } from '@angular/core';
import { SectionVideoComponent } from '../section-video/section-video.component';
import { VideoService } from '../../services/video.service';
import { Video } from '../../interfaces/video.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [SectionVideoComponent, CommonModule],
  templateUrl: './favorites.component.html',
  styles: ``
})
export class FavoritesComponent implements OnInit {
  favoriteVideos: Video[] = [];

  constructor(private videoService: VideoService) {}

  ngOnInit() {
    this.loadFavoriteVideos();
  }

  loadFavoriteVideos() {
    this.favoriteVideos = this.videoService.getFavoriteVideos();
  }

  onDeleteVideo(video: Video) {
    this.videoService.removeFromFavorites(video);
    this.loadFavoriteVideos();
  }
}
