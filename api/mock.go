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

// Package main is the entrypoint of the server.
package main

import (
	"google/jss/ldsgo/api/files"
	"google/jss/ldsgo/gcp/bucket"
	"google/jss/ldsgo/gcp/firestore"

	"github.com/stretchr/testify/mock"
)

func mockGcp() {
	mockBucket()
	mockFirestore()
}

func mockFirestore() {
	_, firestoreClient := firestore.MockService()

	tags := []string{"tag1", "tag2"}

	fileMeta := files.NewDummyFileMeta(1, tags)
	firestoreClient.On("Get", mock.Anything, mock.Anything).Return(fileMeta, nil)

	var fileMetas []*firestore.FileMeta
	for i := 0; i < 50; i++ {
		fileMetas = append(fileMetas, files.NewDummyFileMeta(i, tags))
	}
	firestoreClient.On("ListByTags", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fileMetas, nil)

	firestoreClient.On("Create", mock.Anything, mock.Anything, mock.Anything).Return(fileMeta, nil)
	firestoreClient.On("Merge", mock.Anything, mock.Anything, mock.Anything).Return(fileMeta, nil)
	firestoreClient.On("Delete", mock.Anything, mock.Anything).Return(nil)
	firestoreClient.On("DeleteAll", mock.Anything).Return(nil)

}

func mockBucket() {
	_, bucketClient := bucket.MockService()
	bucketClient.On("TransWrite", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(1000, nil)
	bucketClient.On("Delete", mock.Anything, mock.Anything).Return(nil)
	bucketClient.On("DeleteAll", mock.Anything).Return(nil)
}
