import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, NavigationEnd, Router, Routes } from '@angular/router';
import { ViewComponent } from './view.component';
import { allIcons, HeroIconModule } from 'ng-heroicon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatChipsModule } from '@angular/material/chips';
import { HeaderComponent } from '../header/header.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { UpdateFileComponent } from '../update-file/update-file.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { of } from 'rxjs';
import { SessionStorageService } from '../service/session-storage.service';
import { BrowserModule } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from '../app-routing.module';
import { MainService } from '../service/main.service';
import { ListComponent } from '../list/list.component';

describe('ViewComponent', () => {
  let component: ViewComponent;
  let fixture: ComponentFixture<ViewComponent>;
  let httpTestingController: HttpTestingController;
  let sessionStorageService: SessionStorageService;
  let mainService: MainService;
  let router: Router;

  const routes: Routes = [{ path: 'list/:tags', component: ListComponent }];
  const mockActivatedRoute = {
    params: of({imgId: '08f612cf-a88f-421a-a117-15a90df21a10'}),
  };

  const imageData = {
    id: "08f612cf-a88f-421a-a117-15a90df21a10",
    name: "file1",
    tags: [ "tag1", "tag2" ],
    url: "/resource/3425e838-c58b-4d22-8a9a-400dfb3f1406",
    thumbUrl: "",
    orderNo: "1682661978696-3425e838-c58b-4d22-8a9a-400dfb3f1406",
    size: 1000,
    createTime: "2023-04-28T06:06:18.696Z",
    updateTime: "2023-04-28T06:06:18.696Z",
    path: '',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ViewComponent,
        HeaderComponent,
        SearchBarComponent,
        ConfirmDialogComponent,
        UpdateFileComponent,
        FileUploadComponent,
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        BrowserModule,
        OverlayModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        MatChipsModule,
        HttpClientModule,
        AppRoutingModule,
        HeroIconModule.forRoot({ ...allIcons }),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    sessionStorageService = TestBed.inject(SessionStorageService);
    sessionStorageService.saveImageData(imageData);
    fixture = TestBed.createComponent(ViewComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    mainService = TestBed.inject(MainService);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    component.loadImage = (url: string) => new Promise(resolve => {
      resolve({'Image Height': { value: '50' }, 'Image Width': { value: '50' }})
    });
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
    mainService.clearTag();
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should be false before executing toggleUploadFile', () => {
    fixture.detectChanges();
    expect(component.onUploadFile).toBeFalse();
  });

  it('should be toggled between true and false by executing toggleUploadFile', () => {
    fixture.detectChanges();
    expect(component.onUploadFile).toBeFalse();
    component.toggleUploadFile();
    expect(component.onUploadFile).toBeTrue();
    component.toggleUploadFile();
    expect(component.onUploadFile).toBeFalse();
  });

  it('should navigate to /list/ when executing toggleUploadFile(true)', (done) => {
    fixture.detectChanges();
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        expect(router.url).toBe('/list/');
        done();
      }
    });
    component.toggleUploadFile(true);
  });

  it('should navigate to /list/tag1%20tag2%20tag3 when executing searchTags with tags', (done) => {
    fixture.detectChanges();
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        expect(router.url).toBe('/list/tag1%20tag2%20tag3');
        done();
      }
    });
    mainService.updateTags(['tag1', 'tag2', 'tag3']);
    component.searchTags();
  });

  it('should navigate to /list/ after deleting a file', (done) => {
    fixture.detectChanges();
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        expect(router.url).toBe('/list/');
        done();
      }
    });
    component.deleteId = 'test123';
    component.delete();
    const req = httpTestingController.expectOne(`/api/files/${component.deleteId}`);
    req.flush({});
  });

  it('should display an alert after receiving HTTP 404 from the delete function', () => {
    fixture.detectChanges();
    spyOn(component.snackBar,"open").and.callThrough();
    component.deleteId = 'test123';
    component.delete();
    const req = httpTestingController.expectOne(`/api/files/${component.deleteId}`);
    req.flush('Not found', { status: 404, statusText: 'Not found' });
    expect(component.snackBar.open).toHaveBeenCalled();
  });

  it('should clear the tags when executing handleSearchEvent with { eventName: "clearTag" }', () => {
    fixture.detectChanges();
    const tags = ['tag1', 'tag2', 'tag3'];
    mainService.updateTags(tags);
    expect(mainService.getTags().join(',')).toEqual(tags.join(','));
    component.handleSearchEvent({ eventName: 'clearTag' });
    expect(mainService.getTags().length).toBe(0);
  });

  it('should search the tags when executing handleSearchEvent with { eventName: "searchTags" }', (done) => {
    fixture.detectChanges();
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        expect(router.url).toBe('/list/tag1%20tag2%20tag3');
        done();
      }
    });
    mainService.updateTags(['tag1', 'tag2', 'tag3']);
    component.handleSearchEvent({ eventName: 'searchTags' });
  });

  it('should be equal when executing updateImage(updateFile)', () => {
    fixture.detectChanges();
    const updateFile = {
      file: { ...imageData }
    }
    component.updateImg(updateFile);
    expect(JSON.stringify(sessionStorageService.getImageData())).toEqual(JSON.stringify(updateFile.file));
    expect(JSON.stringify(component.viewData)).toEqual(JSON.stringify(updateFile.file));
  });
});
