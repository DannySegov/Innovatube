import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { AuthLayoutComponent } from './auth/layout/auth-layout/auth-layout.component';
import { RegisterPageComponent } from './auth/pages/register-page/register-page.component';
import { SideMenuComponent } from './pages/side-menu/side-menu.component';
import { HomeComponent } from './pages/home/home/home.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'menu',
        component: SideMenuComponent,
    },
    {
        path: 'favorites',
        component: FavoritesComponent
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login',
                component: LoginPageComponent
            },
            {
                path: 'register',
                component: RegisterPageComponent
            }
        ]
    }
];
