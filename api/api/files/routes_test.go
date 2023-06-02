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

// Package files defines REST API /api/files.
package files

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"google/jss/ldsgo/config"
	"google/jss/ldsgo/gcp/bucket"
	"google/jss/ldsgo/gcp/firestore"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func init() {
	config.Config.BucketBasePath = "resource/"
	config.Config.ResourceBasePath = "/"
}

func TestGetFileList(t *testing.T) {
	firestoreService, firestoreClient := firestore.MockService()
	defer firestoreService.Stop()

	tags := []string{"tag1", "tag2"}
	orderNo := getOrderNo(uuid.New().String())
	size := 10

	// Setup mocked data
	var fileMetas []*firestore.FileMeta
	for i := 0; i < size; i++ {
		fileMetas = append(fileMetas, NewDummyFileMeta(i, tags))
	}
	firestoreClient.On("ListByTags", mock.Anything, tags, orderNo, size).Return(fileMetas, nil)

	// Setup REST API
	router := gin.Default()
	apiRouter := router.Group("/api")
	apiRouter.GET("/files", GetFileList)

	// Send request
	url := fmt.Sprintf("/api/files?tags=%v&orderNo=%v&size=%v", strings.Join(tags, " "), orderNo, size)
	req, err := http.NewRequest("GET", url, nil)
	assert.Nil(t, err)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	// Close() of client was called
	firestoreClient.AssertCalled(t, "Close")

	// Assert result
	response, err := io.ReadAll(recorder.Body)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, recorder.Code)
	var fileList FileListResponse
	err = json.Unmarshal(response, &fileList)
	assert.Nil(t, err)
	assert.Equal(t, size, len(fileList.Files))
}

func TestDeleteFile(t *testing.T) {
	firestoreService, firestoreClient := firestore.MockService()
	defer firestoreService.Stop()

	bucketService, bucketClient := bucket.MockService()
	defer bucketService.Stop()

	// Setup mocked data
	fileMeta := NewDummyFileMeta(1, []string{})
	firestoreClient.On("Get", mock.Anything, fileMeta.ID).Return(fileMeta, nil)
	firestoreClient.On("Delete", mock.Anything, fileMeta.ID).Return(nil)
	bucketClient.On("Delete", mock.Anything, []string{fileMeta.Path, toThumbnailPath(fileMeta.Path)}).Return(nil)

	// Setup REST API
	router := gin.Default()
	apiRouter := router.Group("/api")
	apiRouter.DELETE("/files/:id", DeleteFile)

	// Send request
	url := fmt.Sprintf("/api/files/%v", fileMeta.ID)
	req, err := http.NewRequest("DELETE", url, nil)
	assert.Nil(t, err)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	// Close() of clients were called
	bucketClient.AssertCalled(t, "Close")
	firestoreClient.AssertCalled(t, "Close")

	// Assert result
	response, err := io.ReadAll(recorder.Body)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusNoContent, recorder.Code)
	assert.Empty(t, "", response)
}
