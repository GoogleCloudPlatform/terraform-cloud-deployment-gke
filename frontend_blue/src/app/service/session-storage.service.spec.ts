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

import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);
    service.clearImageData();
  });

  it('should create the serivce', () => {
    expect(service).toBeTruthy();
  });

  const imgData = {
    id: 'id',
    createTime: 'createTime',
    name: 'name',
    path: 'path',
    tags: ['tag1', 'tag2'],
    thumbUrl: 'thumbUrl',
    url: 'url',
    updateTime: 'updateTime',
    orderNo: 'orderNo',
    size: 100
  };
  it('should save the image data correctly', () => {
    service.saveImageData(imgData);
    const imageData = service.getImageData();
    expect(JSON.stringify(imageData)).toEqual(JSON.stringify(imgData));
  });

  it('should retrieve image data correctly', () => {
    service.saveImageData(imgData);
    const imageData = service.getImageData(); 
    expect(JSON.stringify(imageData)).toEqual(JSON.stringify(imgData));
  });
});
