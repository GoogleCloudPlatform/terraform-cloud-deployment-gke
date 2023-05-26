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
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private tags: string[] = [];
  tagsSubject = new Subject<string[]>();


  updateTags(newTags: string[]) {
    this.tags = [...newTags];
    this.tagsSubject.next(this.tags);
  }

  constructor() { }

  getTags() {
    return this.tags;
  }

  clearTag() {
    this.tags = [];
    this.tagsSubject.next(this.tags);
  }
  checkFileType(singleFilename: string) {
    if (!singleFilename) {
      return 'unknown';
    }
    const fileExtension = (singleFilename.toLowerCase().split('.').pop() ?? '');

    switch(fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
      case 'gif':
        return 'photo';
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'flv':
      case 'wmv':
      case 'mov':
        return 'video';
      case 'pdf':
        return 'pdf';
      default:
        return 'unknown';
    }
  }
}
