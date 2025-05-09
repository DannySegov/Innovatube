import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SectionVideoComponent } from '../section-video/section-video.component';
import { FavoritesComponent } from '../favorites/favorites.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './side-menu.component.html',
  styles: ``
})
export class SideMenuComponent implements OnInit {
  @Output() viewSelected = new EventEmitter<'videos' | 'favorites'>(); 

  isMenuVisible: boolean = false;
  currentComponent: any = SectionVideoComponent;
  activeRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveRoute();
    });
    this.updateActiveRoute();
  }

  updateActiveRoute(): void {
    const currentUrl = this.router.url;
    this.activeRoute = currentUrl;
  }

  toggleMenu(): void {
    this.isMenuVisible = !this.isMenuVisible;
  }

  showFavorites(): void {
    this.viewSelected.emit('favorites');
  }

  showVideos(): void {
    this.viewSelected.emit('videos');
  }

  isRouteActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }
}
