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

package com.googlecodesamples.cloud.jss.lds.controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.googlecodesamples.cloud.jss.lds.model.BaseFile;
import com.googlecodesamples.cloud.jss.lds.model.BaseFileTest;
import com.googlecodesamples.cloud.jss.lds.service.FileService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;

import static com.google.common.truth.Truth.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class FileControllerTest {
  private static final Logger log = LoggerFactory.getLogger(FileControllerTest.class);

  @Autowired
  MockMvc mockMvc;

  @MockBean
  FileService fileService;

  @Test
  public void testHealthCheckReturnsNoContent() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.get("/api/healthchecker"))
            .andExpect(MockMvcResultMatchers.status().isNoContent())
            .andExpect(MockMvcResultMatchers.content().string(""));
  }

  @Test
  public void testGetFilesResponse() throws Exception {
    List<String> tags = List.of("test-tag");
    String orderNo = "";
    int size = 2;

    // generate mock object
    List<BaseFile> expectedResp = BaseFileTest.getTestFiles(size, true);

    // set up mock service response
    Mockito.when(fileService.getFilesByTag(tags, orderNo, size)).thenReturn(expectedResp);

    // set up simulated HTTP request to the service
    MockHttpServletRequestBuilder mockHttpReq = MockMvcRequestBuilders.get("/api/files")
            .accept(MediaType.APPLICATION_JSON)
            .contentType(MediaType.APPLICATION_JSON)
            .queryParam("tags", "test-tag")
            .queryParam("orderNo", orderNo)
            .queryParam("size", String.valueOf(size));

    // generate mock response from the simulated request
    String mockResp = mockMvc.perform(mockHttpReq)
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andReturn().getResponse().getContentAsString();
    log.info("mockResp: " + mockResp);

    // convert the mock response to JSON object
    JsonObject convertedObj = new Gson().fromJson(mockResp, JsonObject.class);
    log.info("convertedObj: " + convertedObj);

    assertThat(convertedObj.isJsonObject()).isTrue();
    assertThat(mockResp).isEqualTo(convertedObj.toString());
  }

  @Test
  public void testDeleteFileReturnsNotFound() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.delete("/files/unknown-id"))
            .andExpect(MockMvcResultMatchers.status().isNotFound())
            .andExpect(MockMvcResultMatchers.content().string(""));
  }
}
