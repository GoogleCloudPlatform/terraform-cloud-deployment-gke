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

import { SearchBarComponent } from './search-bar.component';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { HeroIconModule, allIcons } from 'ng-heroicon';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBarComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        HeroIconModule.forRoot({ ...allIcons }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      tags: new FormControl()
    });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should search tags', () => {
    spyOn(component.clicked, 'emit');
    component.searchTags();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should click on search tags', () => {
    spyOn(component.clicked, 'emit');
    component.clickSearchTags();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should add tags', () => {
    const inputElement: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const event = { input: inputElement, value: 'test', chipInput: { clear: () => {} } } as MatChipInputEvent;
    component.addTags(event);
    expect(component.tags).toEqual(['test']);
  });

  it('should remove tags', () => {
    component.tags = ['test'];
    component.removeTag('test');
    expect(component.tags).toEqual([]);
  });
});
