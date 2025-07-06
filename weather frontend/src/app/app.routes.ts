import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AqiComponent } from './aqi/aqi.component';
import { EmailComponent } from './email/email.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'aqi', component: AqiComponent},
    {path: 'subscribe', component: EmailComponent},
    {path: '**', component: ErrorComponent}
    // {path:'', loadComponent: ()=>import('./home/home.component').then((c) => c.HomeComponent)},
    // {path:'home', loadComponent: ()=> import('./home/home.component').then((c) => c.HomeComponent)},
    // {path:'aqi', loadComponent:()=>import('./aqi/aqi.component').then((c) => c.AqiComponent)},
    // {path:'subscribe', loadComponent: ()=>import('./email/email.component').then((c) => c.EmailComponent)},
    // {path:'**', loadComponent:()=>import('./error/error.component').then((c)=>c.ErrorComponent)}
];
