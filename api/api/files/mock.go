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
	"strconv"
	"time"

	"google/jss/ldsgo/gcp/firestore"

	"github.com/google/uuid"
)

// NewDummyFileMeta creates some fake data for testing.
func NewDummyFileMeta(i int, tags []string) *firestore.FileMeta {
	num := i + 1
	name := "file" + strconv.Itoa(num)
	id := uuid.New().String()
	path := toBucketPath(id)

	return &firestore.FileMeta{
		ID:         uuid.New().String(),
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
		FileMetaRecord: firestore.FileMetaRecord{
			Path:     path,
			Name:     name,
			FileSize: int64(num) * 1000,
			Tags:     tags,
			OrderNo:  getOrderNo(id),
		},
	}
}
