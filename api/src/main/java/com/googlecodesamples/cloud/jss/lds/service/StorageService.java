/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.googlecodesamples.cloud.jss.lds.service;

import com.google.api.gax.paging.Page;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageBatch;
import com.google.cloud.storage.StorageOptions;
import javax.annotation.PreDestroy;
import org.springframework.stereotype.Service;

/** Backend service controller for CloudStorage */
@Service
public class StorageService {
  private final Storage storage;

  public StorageService() {
    this.storage = StorageOptions.getDefaultInstance().getService();
  }

  /**
   * Save a file to Cloud Storage.
   *
   * @param bucketName name of the bucket
   * @param fileId unique id of the file
   * @param contentType content type of the file
   * @param content content of the file
   */
  public void save(String bucketName, String fileId, String contentType, byte[] content) {
    BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileId).setContentType(contentType).build();
    storage.create(blobInfo, content);
  }

  /**
   * Delete a file with given fileId.
   *
   * @param bucketName name of the bucket
   * @param fileId unique id of a file
   */
  public void delete(String bucketName, String fileId) {
    storage.delete(bucketName, fileId);
  }

  /**
   * Delete all files in the bucket.
   *
   * @param bucketName name of the bucket
   */
  public void batchDelete(String bucketName) {
    Page<Blob> blobs = storage.list(bucketName);
    if (!blobs.getValues().iterator().hasNext()) {
      return;
    }
    StorageBatch batchRequest = storage.batch();
    for (Blob blob : blobs.iterateAll()) {
      batchRequest.delete(blob.getBlobId());
    }
    batchRequest.submit();
  }

  /** Close the channels and release resources. */
  @PreDestroy
  public void close() throws Exception {
    storage.close();
  }
}
