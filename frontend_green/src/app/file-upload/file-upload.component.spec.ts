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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadComponent } from './file-upload.component';
import { HttpClientModule } from '@angular/common/http';
import { HeroIconModule, allIcons } from 'ng-heroicon';
import { FormsModule } from '@angular/forms';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadComponent ],
      imports: [ FormsModule,
        HttpClientModule, 
        HeroIconModule.forRoot({
          ...allIcons
        }) ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add files', () => {
    component.addFiles({ target: { files: [new File([], 'test')] } });
    expect(component.selectedFiles.length).toBe(1);
  });

  it('should remove files', () => {
    component.selectedFiles.push(new File([], 'test'));
    component.removeFile(0);
    expect(component.selectedFiles.length).toBe(0);
  });

  it('should add tags', () => {
    component.tagsInput = 'test';
    component.addTags();
    expect(component.tags.length).toBe(1);
  });

  it('should upload files', () => {
    component.selectedFiles.push(new File([], 'test'));
    component.uploadFiles();
    expect(component.uploadInProgress).toBe(true);
  });

  it('should close modal', () => {
    spyOn(component.toggleUploadFile, 'emit');
    component.closeModal(new MouseEvent('mousedown'));
    spyOn(window, 'confirm').and.returnValue(true);
    expect(component.toggleUploadFile.emit).toHaveBeenCalled();
  });

  it('should remove tag', () => {
    component.tags = ['test'];
    component.removeTag(0);
    expect(component.tags.length).toBe(0);
  });
});
