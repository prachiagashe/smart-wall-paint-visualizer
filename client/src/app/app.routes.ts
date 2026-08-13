import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { ColorsComponent } from './pages/colors/colors.component';
import { UploadComponent } from './pages/upload/upload.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'colors', component: ColorsComponent },
  { path: 'upload', component: UploadComponent },
];
