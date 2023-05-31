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
import { ComponentFixture, TestBed, fakeAsync, inject } from '@angular/core/testing';

import { ListComponent } from './list.component';
import { HttpClientModule  } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '../header/header.component';
import { HeroIconModule, allIcons } from 'ng-heroicon';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MainService } from '../service/main.service';
import { of } from 'rxjs';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  const id = "08f612cf-a88f-421a-a117-15a90df21a10";
  const ebo = {
    "id": id,
    "name": "file1",
    "tags": [
        "tag1",
        "tag2"
    ],
    "path": "test/file1",
    "url": "/resource/3425e838-c58b-4d22-8a9a-400dfb3f1406",
    "thumbUrl": "",
    "orderNo": "1682661978696-3425e838-c58b-4d22-8a9a-400dfb3f1406",
    "size": 1000,
    "createTime": "2023-04-28T06:06:18.696Z",
    "updateTime": "2023-04-28T06:06:18.696Z"
  };
  const failEbo = {
    "id": "",
    "name": "file1",
    "tags": [
        "tag1",
        "tag2"
    ],
    "path": "test/file1",
    "url": "/resource/3425e838-c58b-4d22-8a9a-400dfb3f1406",
    "thumbUrl": "",
    "orderNo": "1682661978696-3425e838-c58b-4d22-8a9a-400dfb3f1406",
    "size": 1000,
    "createTime": "2023-04-28T06:06:18.696Z",
    "updateTime": "2023-04-28T06:06:18.696Z"
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListComponent,
        HeaderComponent,
        SearchBarComponent ],
      imports: [ HttpClientModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatChipsModule,
        HeroIconModule.forRoot({
          ...allIcons
        }), ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to the top', () => {
    window.scroll(0, 100);
    component.scrollToTop();
    expect(window.scrollY).toBe(0);
  });

  it('should scroll to the bottom', () => {
    const expectLength = component.listArr.length;
    window.scrollTo({ top: 1080, behavior: 'smooth' });
    expect(component.listArr.length).toBeGreaterThanOrEqual(expectLength);
  });

  it('should search by tags', () => {
    component.searchTags();
    expect(component.listArr.length).toBeGreaterThanOrEqual(0);
  });

  it('should clear search tags', () => {
    component.searchTags(false, true);
    expect(component.tags.length).toBe(0);
  });

  it('should search by tags and throws error', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const req = httpMock.expectOne('/api/files?tags=&orderNo=&size=50');
    expect(req.request.method).toEqual('GET');
    req.flush(null);
    httpMock.verify();
    expect(component.listArr.length).toBe(0);
  }));

  it('should not see tags in metadata', inject([MainService], (mainService: MainService) => {
    mainService.updateTags(['tag1', 'tag2']);
    component.searchTags();
    const except = component.listArr.some(e => e.tags.includes('tag1') || e.tags.includes('tag2'));
    expect(except).toBe(false);
  }));

  it('should not see tags in metadata', inject([MainService], (mainService: MainService) => {
    mainService.updateTags(['tag1', 'tag2']);
    component.searchTags();
    const except = component.listArr.some(e => e.tags.includes('tag3'));
    expect(except).toBe(false);
  }));

  it('should toggle the upload file component', () => {
    component.toggleUploadFile();
    expect(component.onUploadFile).toBe(true);
  });

  it('should upload the file successfully', () => {
    component.toggleUploadFile(true);
    expect(component.onUploadFile).toBe(true);
    expect(component.tags.length).toBe(0);
  })

  it('should refresh the home page', () => {
    component.refreshHome();
    expect(component.onUploadFile).toBe(false);
  });

  it('should select the update component', () => {
    component.selectUpdate(ebo);
    expect(component.showUpdate).toBe(true);
  });

  it('should display the confirm dialog', () => {
    component.showConfirm(id);
    expect(component.showConfirmDialog).toBe(true);
  })

  it('should dismiss the confirm dialog', () => {
    component.cancel();
    expect(component.showConfirmDialog).toBe(false);
  });

  it('should execute the delete function', fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    component.deleteId = id;
    component.delete();
    const req = httpMock.expectOne(`/api/files/${id}`);
    req.flush(null);
    expect(req.request.method).toEqual('DELETE');
    const req2 = httpMock.expectOne(`/api/files?tags=&orderNo=&size=50`).flush(of({}));
    httpMock.verify();
  })));

  it('should fail to execute the delete function', fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    component.deleteId = 'a';
    component.delete();
    const req = httpMock.expectOne(`/api/files/${component.deleteId}`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    const req2 = httpMock.expectOne(`/api/files?tags=&orderNo=&size=50`).flush(of([]));
    expect(req.request.method).toEqual('DELETE');
    httpMock.verify();
  })));

  it('should search by handling the search event', () => {
    component.handleSearchEvent({ eventName: 'searchTags' });
    expect(component.listArr.length).toBeGreaterThanOrEqual(0);
  });

  it('should clear by handling the search event', () => {
    component.handleSearchEvent({ eventName: 'clearTag' });
    expect(component.tags.length).toBe(0);
  });

  it('should update the image successfully', () => {
    component.updateImg(ebo);
    expect(component.showUpdate).toBe(false);
  });

  it('should fail to update the image', () => {
    component.updateImg(failEbo);
    expect(component.showUpdate).toBe(false);
  });

  it('should view the image', inject([Router], (mockRouter: Router) => {
    const spy = spyOn(mockRouter, 'navigate').and.stub();
    component.view(ebo);
    expect(spy).toHaveBeenCalledWith(['view/', ebo.id]);
  }));
});
