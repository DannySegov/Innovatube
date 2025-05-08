import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-page.component.html',
  styles: ``
})
export class LoginPageComponent { 
    private router = inject(Router);

   acceder() {
    this.router.navigate(['/home']);  
   }
}
