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

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a cancel event when the cancel button is clicked', () => {
    spyOn(component.confirmCancel, 'emit');
    const cancelButton = fixture.nativeElement.querySelector('#confirmCancel');
    cancelButton.click();
    expect(component.confirmCancel.emit).toHaveBeenCalled();
  });

  it('should emit a delete event when the delete button is clicked', () => {
    spyOn(component.confirmDelete, 'emit');
    const deleteButton = fixture.nativeElement.querySelector('#confirmDelete');
    deleteButton.click();
    expect(component.confirmDelete.emit).toHaveBeenCalled();
  });
});
