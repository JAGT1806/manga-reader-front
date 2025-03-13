import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { redirectGuard } from './core/guards/redirect.guard';
import { languageGuard } from './core/guards/language.guard';
import { SearchComponent } from './pages/search/search.component';
import { MangaComponent } from './pages/manga/manga.component';

export const routes: Routes = [
    {
        path: ':lang',
        canActivate: [languageGuard],
        children: [
            {path: 'home', component: HomeComponent},
            {path: 'search', component: SearchComponent},
            {path: 'manga/:id', component: MangaComponent},
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
