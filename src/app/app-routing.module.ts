import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'my-first-page',
    loadChildren: () => import('./pages/my-first-page/my-first-page.module').then( m => m.MyFirstPagePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'cam-test',
    loadChildren: () => import('./cam-test/cam-test.module').then( m => m.CamTestPageModule)
  },
  {
    path: 'vid',
    loadChildren: () => import('./vid/vid.module').then( m => m.VidPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
