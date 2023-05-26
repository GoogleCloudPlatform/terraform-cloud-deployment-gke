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

import org.junit.Test;

import static com.google.common.truth.Truth.assertThat;

/**
 * Unit test for LdsUtil class
 */
public class LdsUtilTest {

  @Test
  public void testGetResourceBasePath() {
    String rootPath = LdsUtil.getResourceBasePath("/test/1/2/resource");
    assertThat(rootPath).isNotEmpty();
    assertThat(rootPath).isEqualTo("/");

    rootPath = LdsUtil.getResourceBasePath("test/1/2/resource");
    assertThat(rootPath).isEmpty();

    rootPath = LdsUtil.getResourceBasePath("test");
    assertThat(rootPath).isEmpty();
  }

  @Test
  public void testGetFileBucketPath() {
    String basePath = "192.168.0.1/resource";
    String fileId = "test";
    String fileBucketPath = LdsUtil.getFileBucketPath(basePath, fileId);
    assertThat(fileBucketPath).isEqualTo("192.168.0.1/resource/test");
  }

  @Test
  public void testGetPathId() {
    String id = LdsUtil.getPathId("192.168.0.1/resource/test");
    assertThat(id).isEqualTo("test");

    id = LdsUtil.getPathId("192.168.0.1/resource/1/2/3/test");
    assertThat(id).isEqualTo("test");

    id = LdsUtil.getPathId("/resource");
    assertThat(id).isEqualTo("resource");

    id = LdsUtil.getPathId("/resource/test");
    assertThat(id).isEqualTo("test");
  }

  @Test
  public void testGenerateUuid() {
    String uuid = LdsUtil.generateUuid();
    assertThat(uuid.length()).isEqualTo(36);
  }
}
