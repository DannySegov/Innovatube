import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { AuthLayoutComponent } from './auth/layout/auth-layout/auth-layout.component';
import { RegisterPageComponent } from './auth/pages/register-page/register-page.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login',
                component: LoginPageComponent,
            },
            {
                path: 'register',
                component: RegisterPageComponent,
            },
            {
                path: '**',
                redirectTo: 'login',
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
    },
];
