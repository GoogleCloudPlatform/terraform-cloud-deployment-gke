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

package com.googlecodesamples.cloud.jss.lds.util;

import java.util.UUID;

import org.springframework.util.StringUtils;

/**
 * Reusable utility functions
 */
public class LdsUtil {
  private static final char URL_SLASH = '/';

  /**
   * Get base path of a file.
   *
   * @param basePath the URL without the file ID
   * @return the base path of the input URL
   */
  public static String getResourceBasePath(String basePath) {
    String bucketBasePath = StringUtils.trimLeadingCharacter(basePath, URL_SLASH);
    return basePath.substring(0, basePath.length() - bucketBasePath.length());
  }

  /**
   * Get relative path of a file from the base.
   *
   * @param basePath the URL without the file ID
   * @param fileId   the ID of the file
   * @return the full URL of the file
   */
  public static String getFileBucketPath(String basePath, String fileId) {
    String bucketBasePath = StringUtils.trimLeadingCharacter(basePath, URL_SLASH);
    return StringUtils.trimTrailingCharacter(bucketBasePath, URL_SLASH) + URL_SLASH + fileId;
  }

  /**
   * Generate UUID.
   *
   * @return the generated UUID
   */
  public static String generateUuid() {
    return UUID.randomUUID().toString();
  }

  /**
   * Get file ID from the path.
   *
   * @return the ID of the file
   */
  public static String getPathId(String path) {
    String[] pathArr = path.split(String.valueOf(URL_SLASH));
    return pathArr[pathArr.length - 1];
  }
}
