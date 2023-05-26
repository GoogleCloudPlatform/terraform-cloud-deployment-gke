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

package com.googlecodesamples.cloud.jss.lds.model;

import com.googlecodesamples.cloud.jss.lds.util.LdsUtil;

import java.util.List;

/**
 * The FileMeta class represents the file metadata that corresponds to Firestore database schema
 */
public class FileMeta {
  private String id;
  private String path;
  private String name;
  private List<String> tags;
  private String orderNo;
  private long size;

  public FileMeta() {
  }

  public FileMeta(String id, String path, String name, List<String> tags, long size) {
    this.id = id;
    this.path = path;
    this.name = name;
    this.tags = tags;
    this.orderNo = System.currentTimeMillis() + "-" + LdsUtil.getPathId(path);
    this.size = size;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getTags() {
    return tags;
  }

  public void setTags(List<String> tags) {
    this.tags = tags;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getOrderNo() {
    return orderNo;
  }

  public void setOrderNo(String orderNo) {
    this.orderNo = orderNo;
  }

  public long getSize() {
    return size;
  }

  public void setSize(long size) {
    this.size = size;
  }
}
