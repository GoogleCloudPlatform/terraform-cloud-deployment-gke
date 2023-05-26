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

import com.googlecodesamples.cloud.jss.lds.model.BaseFile;
import com.googlecodesamples.cloud.jss.lds.model.BaseFileTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.any;

@RunWith(SpringRunner.class)
@SpringBootTest
public class FileServiceTest {

  private static final Integer LIST_SIZE = 2;

  private static final String ORDER_NUM = "";

  private static final String FILE_ID = "test-id";

  private static final List<String> TAGS = List.of("test-tag");

  private static final boolean IS_IMAGE = true;

  private List<MultipartFile> mockMultipartFiles;

  private List<BaseFile> mockFiles;

  @Autowired
  FileService fileService;

  @MockBean
  FirestoreService firestoreService;

  @MockBean
  StorageService storageService;

  @Before
  public void setUpMockService() throws Exception {
    Resource resource = new ClassPathResource("gcp.jpeg");
    mockMultipartFiles = new ArrayList<>();
    mockFiles = new ArrayList<>();

    for (int i = 0; i < LIST_SIZE; i++) {
      mockMultipartFiles.add(new MockMultipartFile("test-image", resource.getInputStream()));
    }
    mockFiles = BaseFileTest.getTestFiles(LIST_SIZE, IS_IMAGE);

    // set up mock service responses
    Mockito.when(firestoreService.getFileById(any())).thenReturn(mockFiles.get(0));
    Mockito.when(firestoreService.getFilesByTag(TAGS, ORDER_NUM, LIST_SIZE)).thenReturn(mockFiles);
    Mockito.doNothing().when(firestoreService).save(any());
    Mockito.doNothing().when(firestoreService).delete(any());
    Mockito.doNothing().when(firestoreService).deleteCollection();

    Mockito.doNothing().when(storageService).save(any(), any(), any(), any());
    Mockito.doNothing().when(storageService).delete(any(), any());
    Mockito.doNothing().when(storageService).batchDelete(any());
  }

  @Test
  public void testUploadFiles() throws InterruptedException, ExecutionException, IOException {
    List<BaseFile> files = fileService.uploadFiles(mockMultipartFiles, TAGS);
    assertThat(files).isNotEmpty();
    assertThat(files.size()).isEqualTo(LIST_SIZE);
    assertThat(files.get(0).checkImageFileType()).isTrue();
    assertThat(files.get(0).getTags()).isEqualTo(TAGS);
  }

  @Test
  public void testUpdateFile() throws InterruptedException, ExecutionException, IOException {
    BaseFile file = fileService.updateFile(mockMultipartFiles.get(0), TAGS, mockFiles.get(0));
    assertThat(file).isNotNull();
    assertThat(file.checkImageFileType()).isTrue();
    assertThat(file.getTags()).isEqualTo(TAGS);
  }

  @Test
  public void testGetFilesByTag() throws InterruptedException, ExecutionException {
    List<BaseFile> files = fileService.getFilesByTag(TAGS, ORDER_NUM, LIST_SIZE);
    assertThat(files).isNotEmpty();
    assertThat(files.size()).isEqualTo(LIST_SIZE);
    assertThat(files.get(0).checkImageFileType()).isTrue();
    assertThat(files.get(0).getTags()).isEqualTo(TAGS);
  }

  @Test
  public void testGetFilesByUnknownTag() throws InterruptedException, ExecutionException {
    List<String> unknownTags = List.of("test", "tag");
    List<BaseFile> files = fileService.getFilesByTag(unknownTags, ORDER_NUM, LIST_SIZE);
    assertThat(files).isEmpty();
  }

  @Test
  public void testGetFileById() throws InterruptedException, ExecutionException {
    BaseFile file = fileService.getFileById(FILE_ID);
    assertThat(file).isNotNull();
    assertThat(file.checkImageFileType()).isTrue();
    assertThat(file.getTags()).isEqualTo(TAGS);
  }
}
