import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { redirectGuard } from './core/guards/redirect.guard';
import { languageGuard } from './core/guards/language.guard';

export const routes: Routes = [
    {
        path: ':lang',
        canActivate: [languageGuard],
        children: [
            {path: 'home', component: HomeComponent},
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {path: '**', redirectTo: 'home'}
        ]
    },
    {
        path: '',
        canActivate: [redirectGuard],
        children: []
    }
    
];
