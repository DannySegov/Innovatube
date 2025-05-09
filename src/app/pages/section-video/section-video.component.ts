import { Component, inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../services/video.service';
import { Video } from '../../interfaces/video.interface';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";

@Component({
  selector: 'app-section-video',
  standalone: true,
  imports: [PaginationComponent, CommonModule, FormsModule],
  templateUrl: './section-video.component.html',
  styles: ``
})
export class SectionVideoComponent implements OnChanges {
    @Input() deleteMode: boolean = false;
    @Output() deleteVideo = new EventEmitter<Video>();
  videoService = inject(VideoService); // Injectamos el servicio de video

  @Input() searchQuery: string = '';
  @Input() allVideos: Video[] = [];
  currentPageVideos: Video[] = [];
  currentPage = 1;
  pageSize = 10;
  totalVideos = 0;
  isLoading = false;
  Math = Math;

  ngOnChanges(changes: SimpleChanges) {
    console.log('Search Query Changed:', this.searchQuery);
    if (changes['searchQuery'] && this.searchQuery) {
      this.resetSearch();
      this.fetchVideos(this.searchQuery);
    }
    if (changes['allVideos']) {
      this.resetSearch();
      this.currentPageVideos = this.allVideos.slice(0, this.pageSize);
      this.totalVideos = this.allVideos.length;
    }
  }

  resetSearch() {
    this.allVideos = [];
    this.currentPageVideos = [];
    this.currentPage = 1;
    this.totalVideos = 0;
    this.isLoading = false;
  }

  updateCurrentPageVideos() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.currentPageVideos = this.allVideos.slice(startIndex, startIndex + this.pageSize);
  }

  fetchVideos(query: string, pageNumber: number = 1) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('Fetching videos for query:', query, 'Page:', pageNumber);
    this.videoService.searchVideos(query, pageNumber).subscribe({
      next: (videos: Video[]) => {
        console.log('Received videos:', videos);
        this.allVideos = pageNumber === 1 ? videos : [...this.allVideos, ...videos];
        this.totalVideos = this.allVideos.length;
        this.updateCurrentPageVideos();
        this.isLoading = false;
        console.log('All videos:', this.allVideos);
      },
      error: (error) => {
        console.error('Error fetching videos:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updateCurrentPageVideos();

    // If we're near the end of the current fetched videos and not already loading, try to fetch more
    if (this.currentPage === this.getTotalPages() && !this.isLoading) {
      this.fetchVideos(this.searchQuery, this.currentPage + 1);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalVideos / this.pageSize);
  }
}
