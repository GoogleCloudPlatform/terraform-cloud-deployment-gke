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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { SPACE, ENTER } from '@angular/cdk/keycodes';
import { FormGroup } from '@angular/forms';
import { MainService } from '../service/main.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() clicked: EventEmitter<ClickedEvent> = new EventEmitter();
  @Input() formGroup: FormGroup | undefined;
  tags: string[] = [];
  private tagsSubscription: Subscription = new Subscription;
  readonly separatorKeysCodes: number[] = [SPACE, ENTER];
  constructor(private mainService: MainService) {

  }
  ngOnInit() {
    this.tags = this.mainService.getTags();
    this.tagsSubscription = this.mainService.tagsSubject.subscribe(
      (tags: string[]) => {
        this.tags = tags;
      }
    );
  }
  searchTags() {
    this.clicked.emit({ eventName: "searchTags", tags: this.tags });
  }
  clickSearchTags() {
    const input = this.formGroup?.get('tags');
    const value = (input?.value || '').trim();
    const currentTags = [...this.tags];
    if (this.tags.length && value) {
      this.mainService.updateTags([...currentTags]);
    }
    input?.setValue('');
    this.clicked.emit({ eventName: "searchTags", tags: this.tags });
  }
  clearTag() {

    this.mainService.clearTag();
  }

  addTags(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    const newTags = this.tags.filter(tag => tag !== value);
    if (value) {
      newTags.push(value.toLowerCase());
      this.mainService.updateTags(newTags);
    }

    event.chipInput!.clear();
  }
  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    const currentTags = [...this.tags];
    if (index >= 0) {
      currentTags.splice(index, 1);
      this.mainService.updateTags(currentTags);
    }
  }

}

type ClickedEvent = {
  eventName: string;
  tags: string[];
}
