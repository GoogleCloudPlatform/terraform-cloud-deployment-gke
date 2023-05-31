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
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  selectedFiles: File[] = [];
  tagsInput: string = '';
  tags: string[] = [];
  uploadInProgress: boolean = false;
  showHint: boolean = false;
  showFileExceed = false;
  filesLimit = 100;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() toggleUploadFile = new EventEmitter<boolean | undefined>();

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  addFiles(event: any): void {
    if (event.target.files.length === 0) {
      return;
    }

    const fileList = [...event.target.files];
    const totalFileSize = fileList.map(f => f.size).reduce((p, a) => p + a, 0);

    if (totalFileSize > MAX_FILE_SIZE) {
      alert('Files over 32MB are not supported.');
    } else {
      this.showHint = false;
      this.selectedFiles = [];
      fileList.forEach((files) => {
        this.selectedFiles.push(files);
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  addTags(): void {
    const newTags = this.tagsInput.trim().split(/[,\s]+/).map(s => s.toLowerCase());
    this.tags = [...this.tags, ...newTags];
    this.tagsInput = '';
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.showHint = true;
    } else {
      this.showHint = false;
      this.uploadInProgress = true;

      const formData = new FormData();
      formData.append('tags', this.tags.join(' '));

      this.selectedFiles.forEach((files) => {
        formData.append('files', files);
      });

      this.http.post('api/files', formData).subscribe(
        (res) => {
          this.uploadInProgress = false;
          this.toggleUploadFile.emit(true);
        },
        (err) => {
          this.uploadInProgress = false;
          if (err.status === 413) {
            alert('Files over 32MB are not supported.');
          }
        }
      );
    }
  }

  closeModal(event: MouseEvent): void {
    if (confirm('Are you sure you want to exit?')) {
      this.toggleUploadFile.emit();
    }
  }
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }
}

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB