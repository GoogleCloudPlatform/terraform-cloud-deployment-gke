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

/**
 * Object model to describe a file. 
 */
export interface FileModel {
  /**
   * Unique file id from Cloud Storage.
   */
  id: string;
  /**
   * The time file was uploaded .
   */
  createTime: string;
  /**
   * Name of the file.
   */
  name: string;
  /**
   * Path of where the file is stored in Cloud Storage.
   */
  path: string;
  /**
   * A list of tags related to the file.
   */
  tags: Array<string>;
  /**
   * Thumbnail url of the file.
   */
  thumbUrl: string;
  /**
   * URL of the file.
   */
  url: string;
  /**
   * Last time the file was updated.
   */
  updateTime: string;
  /**
   * This is the order number of the file.
   */
  orderNo: string;
  /**
   * File size.
   */
  size: number;
  /**
   * Image file resolution.
   */
  resolution?: string
}
