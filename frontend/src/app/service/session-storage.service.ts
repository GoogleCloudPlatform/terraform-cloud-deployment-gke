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
import { Injectable } from '@angular/core';
import { FileModel } from '../type/file-model';

const IMG_DATA = 'imgData';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  constructor() { }

  clearImageData(): void {
    window.sessionStorage.clear();
  }

  saveImageData(imgData: FileModel): void {
    window.sessionStorage.removeItem(IMG_DATA);
    window.sessionStorage.setItem(IMG_DATA, JSON.stringify(imgData));
  }

  getImageData(): FileModel {
    const image = window.sessionStorage.getItem(IMG_DATA);
    if (image) {
      return JSON.parse(image);
    }

    return {
      id: '',
      createTime: '',
      name: '',
      path: '',
      tags: [],
      thumbUrl: '',
      url: '',
      updateTime: '',
      orderNo: '',
      size: 0
    };
  }
}
