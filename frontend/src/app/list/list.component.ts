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
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of, map, tap, Subject, take, takeUntil, throttleTime, fromEvent, catchError, EMPTY } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Validators, FormBuilder } from '@angular/forms';
import { SessionStorageService } from '../service/session-storage.service';
import { FileModel } from '../type/file-model';
import { MainService } from '../service/main.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent {
  tags: string[] = [];
  private tagsSubscription: Subscription = new Subscription;
  showUpdate: boolean = false;
  updateItem: FileModel | null = null; 
  deleteId: string = '';
  private fileSubject = new Subject<FileModel[]>();
  list$: Observable<FileModel[]> = of([]);
  listArr: FileModel[] = [];
  fileForm = this.fb.group({
    files: ['', Validators.required],
    tags: ['', Validators.required]
  })
  showLoader: boolean = false;
  showConfirmDialog: boolean = false;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  onUploadFile: boolean = false;
  lastUpdateTime: string = '';
  showScrollTop: boolean = false;
  session = inject(SessionStorageService);
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private mainService: MainService
  ) { }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.list$ = this.fileSubject.asObservable();
    this.tags = this.mainService.getTags();
    this.tagsSubscription = this.mainService.tagsSubject.subscribe(
      (tags: string[]) => {
        this.tags = tags;
      }
    );
    this.activatedRoute.params.pipe(take(1)).subscribe((paramMap: any) => {
      if (paramMap.tags.length > 0) {
        this.mainService.updateTags(paramMap.tags.split(' '));
      } else {
        this.mainService.clearTag();
      }
    });
    this.searchTags();
    fromEvent(window, 'scroll').pipe(
      throttleTime(50),
      takeUntil(this.destroy$)
    ).subscribe(() => this.onScroll());
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onScroll() {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;
    window.pageYOffset > windowHeight ? (this.showScrollTop = true) : (this.showScrollTop = false);
    if (windowBottom >= (docHeight - 50) && !this.showLoader && window.pageYOffset >= windowHeight) {
      this.searchTags(true, false);
    }
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  checkFileType(fileName: string): string {
    return this.mainService.checkFileType(fileName);
  }

  toggleUploadFile(uploadSucess?: boolean): void {
    this.onUploadFile = !this.onUploadFile;
    this.onUploadFile ? document.body.style.overflow = "hidden" : document.body.style.overflow = "auto";
    if (uploadSucess) {
      // clear ${this.tags} and refresh homePage if upload is suscess
      this.refreshHome();
    }
  }
  refreshHome(): void {
    this.clearTag();
    this.searchTags();
  }
  selectUpdate(item: FileModel) {
    this.updateItem = item;
    this.showUpdate = true;
  }
  searchTags(showMore: boolean = false, clear: boolean = true) {
    this.showLoader = true;
    const orderNo = showMore ? this.lastUpdateTime : '';
    const size = 50;
    this.http.get(`/api/files?tags=${this.tags.join(' ')}&orderNo=${orderNo}&size=${size}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.showLoader = false;
        return EMPTY;
      }),
      map((res: any) => res?.files),
      tap((files: FileModel[]) => {
        if (!files) {
          this.showLoader = false;
          return;
        }
        if (clear) {
          this.listArr = [];
          this.list$ = of([]);
        }
        if (showMore) {
          this.listArr = [...this.listArr, ...files];
          this.list$ = of([...this.listArr]);
        } else {
          this.listArr = files;
          this.list$ = of([...this.listArr]);
          this.fileSubject.next(this.listArr);
        }
        this.showLoader = false;
        if (files.length > 0) {
          const foundFile = files[files.length - 1];
          const index = foundFile.updateTime.indexOf('.') + 1;
          this.lastUpdateTime = `${foundFile.orderNo}`;
        }
        this.router.navigate(['list/', this.tags.join(' ')]);
      })
    ).subscribe();
  }

  showConfirm(id: string) {
    this.deleteId = id;
    this.showConfirmDialog = true;
  }
  cancel() {
    this.showConfirmDialog = false;
    this.deleteId = '';
  }
  delete() {
    const id = this.deleteId;
    if (!!id) {
      this.http.delete(`/api/files/${id}`).subscribe(res => {
        this.showConfirmDialog = false;
        this.deleteId = '';
        const newFileArr = this.listArr;
        const index = newFileArr.findIndex((file) => file.id === id);
        if (index >= 0) {
          newFileArr.splice(index, 1);
          this.list$ = of([...newFileArr]);
          this.fileSubject.next([...newFileArr]);
        }
      },
        err => {
          if (err.status === 404) {
            alert('The file you are trying to upload/update does not exist. Please update/upload a correct file.');
          }
        }
      )
    }

  }
  closePopup() {
    this.showUpdate = false;
  }
  clearTag() {
    this.mainService.clearTag();
  }
  handleSearchEvent(event: any) {
    if (event.eventName === "searchTags") {
      this.searchTags();
    } else if (event.eventName === "clearTag") {
      this.clearTag();
    }
  }
  updateImg(updaeFile: any) {
    const newFileArr = this.listArr;
    const index = newFileArr.findIndex((file) => file.id === updaeFile?.file?.id);
    if (index >= 0) {
      newFileArr[index] = { ...updaeFile.file };
      this.fileSubject.next([...newFileArr]);
      this.list$ = of([...newFileArr]);
    }
    this.closePopup();
  }

  view(ebo: any) {
    this.session.saveImageData(ebo);
    this.router.navigate(['view/', ebo.id]);
  }

}
