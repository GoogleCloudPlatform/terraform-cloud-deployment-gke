// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
  {
    path: 'list/:tags',
    component: ListComponent,
  },
  {
    path: 'view/:imgId',
    component: ViewComponent,
  },
  {
    path: '',
    redirectTo: '/list/',
    pathMatch: 'full'
  },
  { path: 'error',
    component: ErrorComponent
  },
  {
    path: '**',
    redirectTo: '/list/',
    pathMatch: 'full'
  },

]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
