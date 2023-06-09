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
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';
import { UpdateFileComponent } from './update-file/update-file.component';
import { ViewComponent } from './view/view.component';
import { AppRoutingModule } from './app-routing.module';
import { allIcons, HeroIconModule } from 'ng-heroicon';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { HeaderComponent } from './header/header.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SessionStorageService } from './service/session-storage.service';
import { ErrorInterceptor } from './interceptors/error-interceptor';
import { ErrorComponent } from './error/error.component';
@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    UpdateFileComponent,
    ViewComponent,
    ConfirmDialogComponent,
    FileUploadComponent,
    HeaderComponent,
    SearchBarComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatChipsModule,
    HttpClientModule,
    AppRoutingModule,
    HeroIconModule.forRoot({
      ...allIcons
    }),
  ],
  providers: [
    SessionStorageService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
