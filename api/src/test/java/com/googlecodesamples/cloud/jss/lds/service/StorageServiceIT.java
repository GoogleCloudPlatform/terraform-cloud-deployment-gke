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

import static com.google.common.truth.Truth.assertThat;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.cloud.storage.BucketInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.testing.RemoteStorageHelper;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class StorageServiceIT {

  private static final String BUCKET_NAME = RemoteStorageHelper.generateBucketName();
  private static final String FILE_ID = "test-id";
  private static final String CONTENT_TYPE = "application/octet-stream";
  private static final String STRING_CONTENT = "test";
  private static final byte[] CONTENT = STRING_CONTENT.getBytes(UTF_8);
  private static Storage storage;

  @Autowired
  StorageService storageService;

  @BeforeClass
  public static void beforeClass() {
    RemoteStorageHelper helper = RemoteStorageHelper.create();
    storage = helper.getOptions().getService();
    storage.create(BucketInfo.of(BUCKET_NAME));
  }

  @AfterClass
  public static void afterClass() {
    if (storage != null) {
      RemoteStorageHelper.forceDelete(storage, BUCKET_NAME);
    }
  }

  @Test
  public void testSaveBlob() {
    try {
      storageService.save(BUCKET_NAME, FILE_ID, CONTENT_TYPE, CONTENT);
      assertThat(storage.get(BUCKET_NAME, FILE_ID)).isNotNull();
    } finally {
      storage.delete(BUCKET_NAME, FILE_ID);
    }
  }

  @Test
  public void testDeleteBlob() {
    storageService.save(BUCKET_NAME, FILE_ID, CONTENT_TYPE, CONTENT);
    storageService.delete(BUCKET_NAME, FILE_ID);
    assertThat(storage.get(BUCKET_NAME, FILE_ID)).isNull();
  }

  @Test
  public void testBatchDeleteBlob() {
    storageService.save(BUCKET_NAME, FILE_ID, CONTENT_TYPE, CONTENT);
    storageService.batchDelete(BUCKET_NAME);
    assertThat(storage.get(BUCKET_NAME, FILE_ID)).isNull();
  }
}
