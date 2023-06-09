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
  ViewChild,
  ElementRef,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../service/main.service';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FileModel } from '../type/file-model';


@Component({
  selector: 'app-update-file',
  templateUrl: './update-file.component.html',
  styleUrls: ['./update-file.component.scss'],
})
export class UpdateFileComponent implements OnChanges {
  fileForm = this.fb.group({
    file: ['', Validators.required],
    tags: ['', Validators.required]
  })

  selectedFiles: File[] = [];
  tagsInput: string = '';
  updateTags: string[] = [];
  uploadInProgress: boolean = false;
  showHint: boolean = false;
  isUpdating: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() updateItem!: FileModel;
  @Output() closeFileUpdate = new EventEmitter<void>();
  @Output() updateImg = new EventEmitter();
  @Output() closePopup = new EventEmitter();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private mainService: MainService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const { currentValue, previousValue } = changes['updateItem'];

    if (changes['updateItem']) {
      this.updateTags = [...currentValue.tags];
      this.selectedFiles = [currentValue];
    }
  }
  readURL(event: Event) {
    const fileInputElement = event.target as HTMLInputElement;
    if (fileInputElement.files && fileInputElement.files[0]) {
      var reader = new FileReader();

      reader.onload = (event:any) => {
       this.updateItem.url = event.target.result;
      }

      reader.readAsDataURL(fileInputElement.files[0]);
    }
  }

  ngAfterViewInit() {
    fromEvent<Event>(this.fileInput.nativeElement, 'change').pipe(
      tap((event) => {
        const fileInputElement = event.target as HTMLInputElement;
        if (fileInputElement.files && fileInputElement.files[0]) {
          this.readURL(event);
          this.updateItem.name = fileInputElement.files[0].name;
        }
      })
    ).subscribe();
  }

  alertBar() {
    this._snackBar.open('You can only select one file.', '', {
      duration: 3000,
      panelClass: 'red-snackbar',
    });
  }

  update(): void {
    const formData = new FormData();
    formData.append('tags', this.updateTags.join(' '));
    this.selectedFiles.forEach((files) => {
      formData.append('file', files);
    });
    this.isUpdating = true;
    this.http.put(`api/files/${this.updateItem.id}`, formData).subscribe(
      res => {
        this.isUpdating = false;
        this.fileForm.reset();
        this.updateImg.emit(res);
        this.closeFileUpdate.emit();
      },
      err => {
        this.isUpdating = false;
        if (err.status === 404) {
          alert('The file you are trying to upload/update does not exist. Please update/upload a correct file.');
        } else if (err.status === 413) {
          alert('Files over 32MB are not supported.');
        }
      }
    );
  }

  checkFileType(fileName: string): string {
    return this.mainService.checkFileType(fileName);
  }
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  addFiles(event: any): void {
    const maxFileSize = 32 * 1024 * 1024; // 32MB
    const fileList = [...event.target.files];
    const totalFileSize = fileList.map(f => f.size).reduce((p, a) => p + a, 0);

    if (totalFileSize > maxFileSize) {
      alert('Files over 32MB are not supported.');
    } else if (event.target.files.length > 1) {
      this.alertBar();
    } else {
      if (event.target.files.length > 0) {
        this.showHint = false;
        const fileList = [...event.target.files];
        this.selectedFiles = [];
        fileList.forEach((files) => {
          this.selectedFiles.push(files);
        });
      }
    }
  }

  addTags(): void {
    const newTags = this.tagsInput.trim().split(/[,\s]+/).map(s => s.toLowerCase());
    this.updateTags = [...this.updateTags, ...newTags];
    this.tagsInput = '';
  }

  closeModal(event: MouseEvent): void {
    if (confirm('Are you sure you want to exit?')) {
      this.closeFileUpdate.emit();
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  removeTag(index: number): void {
    this.updateTags.splice(index, 1);
  }

}
