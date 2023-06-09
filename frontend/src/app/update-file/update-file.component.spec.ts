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
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { UpdateFileComponent } from './update-file.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HeroIconModule, allIcons } from 'ng-heroicon';
import { FileModel } from '../type/file-model';

describe('UpdateFileComponent', () => {
  let component: UpdateFileComponent;
  let fixture: ComponentFixture<UpdateFileComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UpdateFileComponent,
      ],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatChipsModule,
        HeroIconModule.forRoot({ ...allIcons }),
      ],
    })
    .compileComponents();
    const id = '123';
    const fakeFile: FileModel = {
      id,
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

    // httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UpdateFileComponent);
    component = fixture.componentInstance;
    component.updateItem = fakeFile;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
   
  it('should update successfully', () => {
    httpTestingController = TestBed.inject(HttpTestingController);
    component.update();
    expect(component.isUpdating).toBeTrue()
    const req = httpTestingController.expectOne(`api/files/${component.updateItem.id}`);
    req.flush({ file: component.updateItem });
    expect(component.isUpdating).toBeFalse();
    httpTestingController.verify();
  });

  it('should display alert message after receiving HTTP 404', () => {
    httpTestingController = TestBed.inject(HttpTestingController);
    spyOn(window, 'alert');
    component.update();
    expect(component.isUpdating).toBeTrue()
    const req = httpTestingController.expectOne(`api/files/${component.updateItem.id}`);
    req.flush('Not found', { status: 404, statusText: 'Not found' });
    expect(component.isUpdating).toBeFalse()
    expect(window.alert).toHaveBeenCalledWith('The file you are trying to upload/update does not exist. Please update/upload a correct file.');
    httpTestingController.verify();
  });

  it('should display alert message after receiving HTTP 413', () => {
    httpTestingController = TestBed.inject(HttpTestingController);
    spyOn(window, 'alert');
    component.update();
    expect(component.isUpdating).toBeTrue()
    const req = httpTestingController.expectOne(`api/files/${component.updateItem.id}`);
    req.flush('Not found', { status: 413, statusText: 'Files over 32MB are not supported.' });
    expect(component.isUpdating).toBeFalse()
    expect(window.alert).toHaveBeenCalledWith('Files over 32MB are not supported.');
    httpTestingController.verify();
  });

  it('should not add file if the file size exceeds the limit.', () => {
    spyOn(window, 'alert');
    const fakeFiles = {
      target: {
        files: [
          { size: 16 * 1024 * 1024 },
          { size: 16 * 1024 * 1024 },
          { size: 1 },
        ]
      }
    }
    component.addFiles(fakeFiles);
    expect(window.alert).toHaveBeenCalledWith('Files over 32MB are not supported.');
  });

  it('should not add file if there are more than one file being selected.', fakeAsync(() => {
    const snackBar = TestBed.inject(MatSnackBar);
    const spy = spyOn(snackBar, 'open');
    const fakeFiles = {
      target: {
        files: [
          { size: 16 * 1024 * 1024 },
          { size: 16 * 1024 * 1024 },
        ]
      }
    }
    component.addFiles(fakeFiles);
    expect(spy).toHaveBeenCalledWith('You can only select one file.', '', {
      duration: 3000,
      panelClass: 'red-snackbar',
    });
  }));

  it('should add file if the file size is within the limit', () => {
    const fakeFiles = {
      target: {
        files: [
          new File(['test'], 'filename.txt', { type: 'text/plain' })
        ]
      }
    }
    component.addFiles(fakeFiles);
    expect(component.selectedFiles[0]).toEqual(fakeFiles.target.files[0]);
  });

  it('should add a tag', () => {
    const input = fixture.nativeElement.querySelector('#tags-input');
    input.value = 'tag1';
    const oldTags = component.updateTags.join(' ');
    const newTags = (oldTags.length? oldTags + ' ' : oldTags) + input.value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    expect(component.updateTags.join(' ')).toEqual(newTags);
  })

  it('should add multiple tags', () => {
    const input = fixture.nativeElement.querySelector('#tags-input');
    input.value = 'tag5 tag6 tag7';
    const oldTags = component.updateTags.join(' ');
    const newTags = (oldTags.length? oldTags + ' ' : oldTags) + input.value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    expect(component.updateTags.join(' ')).toEqual(newTags);
  })

  it('should remove tag', () => {
    const input = fixture.nativeElement.querySelector('#tags-input');
    input.value = 'tag1 tag2 tag3';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    component.removeTag(1);
    expect(component.updateTags.join(' ')).toEqual('tag1 tag3');
    component.removeTag(1);
    expect(component.updateTags.join(' ')).toEqual('tag1');
  })

  it('should emit a closeFileUpdate event after clicking on the confirm dialog', () => {
    const spy = spyOn(component.closeFileUpdate, 'emit');
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    fixture.nativeElement.querySelector('.fixed.inset-0.bg-black.bg-opacity-50').click();
    expect(confirmSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
