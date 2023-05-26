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

import com.googlecodesamples.cloud.jss.lds.model.BaseFile;
import com.googlecodesamples.cloud.jss.lds.model.FileMeta;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class FirestoreServiceIT {
  private static final String FILE_META_ID = "test-id";
  private static final String FILE_META_PATH = "resource/test-id";
  private static final String FILE_META_NAME = "test";
  private static final List<String> FILE_META_TAGS = List.of("test-tag");
  private static final long FILE_META_SIZE = 100;
  private static final int LIST_SIZE = 10;

  @Autowired
  FirestoreService firestoreService;

  @Test
  public void testSaveFileMeta() throws InterruptedException, ExecutionException {
    try {
      firestoreService.save(createFileMeta());
      BaseFile testFile = firestoreService.getFileById(FILE_META_ID);
      assertThat(testFile).isNotNull();
    } finally {
      firestoreService.delete(FILE_META_ID);
    }
  }

  @Test
  public void testGetFileById() throws InterruptedException, ExecutionException {
    try {
      firestoreService.save(createFileMeta());
      BaseFile testFile = firestoreService.getFileById(FILE_META_ID);
      assertThat(testFile.getId()).isEqualTo(FILE_META_ID);
    } finally {
      firestoreService.delete(FILE_META_ID);
    }
  }

  @Test
  public void testDeleteDocument() throws InterruptedException, ExecutionException {
    firestoreService.save(createFileMeta());
    firestoreService.delete(FILE_META_ID);
    BaseFile testFile = firestoreService.getFileById(FILE_META_ID);
    assertThat(testFile).isNull();
  }

  @Test
  public void testDeleteCollection() throws InterruptedException, ExecutionException {
    firestoreService.save(createFileMeta());
    firestoreService.deleteCollection();
    BaseFile testFile = firestoreService.getFileById(FILE_META_ID);
    assertThat(testFile).isNull();
  }

  private FileMeta createFileMeta() {
    return new FileMeta(
        FILE_META_ID, FILE_META_PATH, FILE_META_NAME, FILE_META_TAGS, FILE_META_SIZE);
  }
}
