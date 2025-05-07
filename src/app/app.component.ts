import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthLayoutComponent } from "./auth/layout/auth-layout/auth-layout.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'innovatube';
}
