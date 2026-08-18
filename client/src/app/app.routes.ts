import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { ColorsComponent } from './pages/colors/colors.component';
import { UploadComponent } from './pages/upload/upload.component';
import { EditorComponent } from './pages/editor/editor.component';
import { VisualizerComponent } from './pages/visualizer/visualizer.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'colors', component: ColorsComponent },
  { path: 'upload', component: UploadComponent, canActivate: [authGuard] },
  { path: 'editor', component: EditorComponent, canActivate: [authGuard] },
  { path: 'visualizer', component: VisualizerComponent } // visualizer is public, but saving is protected
];
