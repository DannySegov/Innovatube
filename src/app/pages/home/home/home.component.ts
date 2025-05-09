import { Component, inject, signal } from '@angular/core';
import { SideMenuComponent } from "../../side-menu/side-menu.component";
import { VideoService } from '../../../services/video.service';
import { Video } from '../../../interfaces/video.interface';
import { SectionVideoComponent } from '../../section-video/section-video.component';
import { FavoritesComponent } from '../../favorites/favorites.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SideMenuComponent, SectionVideoComponent, FavoritesComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent {
  videoService = inject(VideoService);
  videos = signal<Video[]>([]);
  searchQuery = '';
  selectedView: 'videos' | 'favorites' = 'videos';

  onSearch(query: string) {
    this.searchQuery = query;
    this.videoService.searchVideos(query).subscribe({
      next: (resp) => {
        console.log('Received videos:', resp);
        this.videos.set(resp);
      },
      error: (err) => {
        console.error('Error in home component:', err);
        this.videos.set([]);
      }
    });
  }

  updateSelectedView(view: 'videos' | 'favorites') {
    this.selectedView = view;
  }
}
