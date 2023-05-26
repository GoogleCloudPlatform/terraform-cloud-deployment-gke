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
import com.googlecodesamples.cloud.jss.lds.model.FileMeta;
import com.googlecodesamples.cloud.jss.lds.util.LdsUtil;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Backend service controller for Firestore and CloudStorage */
@Service
public class FileService {
  private static final Logger log = LoggerFactory.getLogger(FirestoreService.class);
  private static final int THUMBNAIL_SIZE = 300;
  private final FirestoreService firestoreService;
  private final StorageService storageService;

  @Value("${resource.path}")
  private String basePath;

  @Value("${storage.bucket.name}")
  private String bucketName;

  public FileService(FirestoreService firestoreService, StorageService storageService) {
    this.firestoreService = firestoreService;
    this.storageService = storageService;
  }

  /**
   * Upload files to Firestore and Cloud Storage.
   *
   * @param files list of files upload to the server
   * @param tags list of tags label the files
   * @return list of uploaded files
   */
  public List<BaseFile> uploadFiles(List<MultipartFile> files, List<String> tags)
      throws InterruptedException, ExecutionException, IOException {
    log.info("entering uploadFiles()");
    List<BaseFile> fileList = new ArrayList<>();
    for (MultipartFile file : files) {
      String fileId = LdsUtil.generateUuid();
      BaseFile newFile = createOrUpdateFile(file, tags, fileId, fileId, file.getSize());
      fileList.add(newFile);
    }
    return fileList;
  }

  /**
   * Update a file to Firestore and Cloud Storage.
   *
   * @param newFile new file upload to the server
   * @param tags list of tags label the new file
   * @param file previously uploaded file
   * @return the updated file
   */
  public BaseFile updateFile(MultipartFile newFile, List<String> tags, BaseFile file)
      throws InterruptedException, ExecutionException, IOException {
    log.info("entering updateFile()");
    String fileId = file.getId();
    if (newFile == null) {
      String pathId = LdsUtil.getPathId(file.getPath());
      return createOrUpdateFileMeta(tags, fileId, pathId, file.getName(), file.getSize());
    }
    storageService.delete(bucketName, file.getPath());
    storageService.delete(bucketName, file.genThumbnailPath());
    String newFileId = LdsUtil.generateUuid();
    return createOrUpdateFile(newFile, tags, fileId, newFileId, newFile.getSize());
  }

  /**
   * Delete a file from Firestore and Cloud Storage.
   *
   * @param file the uploaded file
   */
  public void deleteFile(BaseFile file) throws InterruptedException, ExecutionException {
    log.info("entering deleteFile()");
    firestoreService.delete(file.getId());
    storageService.delete(bucketName, file.getPath());
    storageService.delete(bucketName, file.genThumbnailPath());
  }

  /**
   * Search files with given tags.
   *
   * @param tags list of tags label the files
   * @param orderNo application defined column for referencing order
   * @param size number of files return
   * @return list of uploaded files
   */
  public List<BaseFile> getFilesByTag(List<String> tags, String orderNo, int size)
      throws InterruptedException, ExecutionException {
    log.info("entering getFilesByTag()");
    return firestoreService.getFilesByTag(tags, orderNo, size);
  }

  /**
   * Search a single file with given fileId.
   *
   * @param fileId unique id of the file
   * @return the uploaded file
   */
  public BaseFile getFileById(String fileId) throws InterruptedException, ExecutionException {
    log.info("entering getFileById()");
    return firestoreService.getFileById(fileId);
  }

  /** Delete all files from Firestore and Cloud Storage. */
  public void resetFile() throws InterruptedException, ExecutionException {
    log.info("entering resetFile()");
    firestoreService.deleteCollection();
    storageService.batchDelete(bucketName);
  }

  /**
   * Create or update a file in Cloud Storage with the given fileId.
   *
   * @param file file upload to the server
   * @param tags list of tags label the file
   * @param fileId unique ID of the file
   * @param newFileId unique ID of the new file (for referencing Cloud Storage)
   * @param size size of the file
   * @return file data
   */
  private BaseFile createOrUpdateFile(
      MultipartFile file, List<String> tags, String fileId, String newFileId, long size)
      throws InterruptedException, ExecutionException, IOException {
    BaseFile newFile =
        createOrUpdateFileMeta(tags, fileId, newFileId, file.getOriginalFilename(), size);
    storageService.save(bucketName, newFile.getPath(), file.getContentType(), file.getBytes());
    if (newFile.checkImageFileType()) {
      createThumbnail(file, newFile.genThumbnailPath());
    }
    return newFile;
  }

  /**
   * Create or update the metadata of a file in Firestore with the given fileId.
   *
   * @param tags list of tags label the file
   * @param fileId unique id of the file
   * @param newFileId unique id of the new file (for referencing Cloud Storage)
   * @param fileName name of the file
   * @param size size of the file
   * @return file data
   */
  private BaseFile createOrUpdateFileMeta(
      List<String> tags, String fileId, String newFileId, String fileName, long size)
      throws InterruptedException, ExecutionException {
    String fileBucketPath = LdsUtil.getFileBucketPath(basePath, newFileId);
    FileMeta fileMeta = new FileMeta(fileId, fileBucketPath, fileName, tags, size);
    firestoreService.save(fileMeta);
    return getFileById(fileId);
  }

  /**
   * Create a thumbnail of the given file.
   *
   * @param file file to create thumbnail
   * @param thumbnailId unique id of the thumbnail file
   */
  private void createThumbnail(MultipartFile file, String thumbnailId) throws IOException {
    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
    Thumbnails.of(file.getInputStream())
        .size(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
        .keepAspectRatio(false)
        .toOutputStream(byteArrayOutputStream);
    storageService.save(
        bucketName, thumbnailId, file.getContentType(), byteArrayOutputStream.toByteArray());
  }
}
