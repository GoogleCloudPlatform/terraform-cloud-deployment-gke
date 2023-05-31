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

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { ErrorInterceptor } from './error-interceptor';
import { NavigationEnd, Router, Routes } from '@angular/router';
import { ErrorComponent } from '../error/error.component';

const routes: Routes = [
  { path: 'error', component: ErrorComponent }
];

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [ErrorComponent],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptor,
        multi: true
      }]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should navigate to /error when the server responds with a 500 error', (done) => {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        expect(router.url).toBe('/error');
        done();
      }
    });
    const errorMessage = 'Internal Server Error';
    httpClient.get('/api/test').subscribe(
      () => fail('expected an error, not data'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    );
    const req = httpTestingController.expectOne('/api/test');
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });
});
