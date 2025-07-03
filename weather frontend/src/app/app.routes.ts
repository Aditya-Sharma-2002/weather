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
];
