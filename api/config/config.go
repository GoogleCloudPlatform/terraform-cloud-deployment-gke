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

// Package config keeps config for used Globally.
package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

type config struct {
	LDSRestPort              string
	LDSProject               string
	LDSBucket                string
	LDSFirestore             string
	LDSFirestoreFieldPath    string
	LDSFirestoreFieldName    string
	LDSFirestoreFieldSize    string
	LDSFirestoreFieldTags    string
	LDSFirestoreFieldOrderNo string
	ResourceBasePath         string
	BucketBasePath           string
	MockFlag                 bool
}

// Config is the global configuration parsed from environment variables.
var Config config

func init() {
	mockFlag, _ := strconv.ParseBool(os.Getenv("MOCK")) // Ignore the error for getting MOCK env
	// Enable mock mode only if it successfully gets the MOCK environment and its value is true.
	if mockFlag {
		log.Println("enable mock mode!")
	}
	resourcePath := os.Getenv("LDS_RESOURCE_PATH")
	bucketBasePath := strings.TrimLeft(resourcePath, "/")
	resourceBasePath := resourcePath[0 : len(resourcePath)-len(bucketBasePath)]
	bucketBasePath = strings.TrimRight(bucketBasePath, "/") + "/" // Make sure the path end with "/".

	Config = config{
		LDSRestPort:              getEnv("LDS_REST_PORT", "8000"),
		LDSProject:               getEnv("LDS_PROJECT", ""),
		LDSBucket:                getEnv("LDS_BUCKET", "lds_data"),
		LDSFirestore:             getEnv("LDS_FIRESTORE", "fileMetadata"),
		LDSFirestoreFieldPath:    getEnv("LDS_FIRESTORE_FIELD_PATH", "path"),
		LDSFirestoreFieldName:    getEnv("LDS_FIRESTORE_FIELD_NAME", "name"),
		LDSFirestoreFieldSize:    getEnv("LDS_FIRESTORE_FIELD_SIZE", "size"),
		LDSFirestoreFieldTags:    getEnv("LDS_FIRESTORE_FIELD_TAGS", "tags"),
		LDSFirestoreFieldOrderNo: getEnv("LDS_FIRESTORE_FIELD_ORDER_NO", "orderNo"),

		ResourceBasePath: resourceBasePath,
		BucketBasePath:   bucketBasePath,
		MockFlag:         mockFlag,
	}
	log.Println("using config:", Config)
}

func getEnv(name string, defaultValue string) string {
	value, exist := os.LookupEnv(name)
	if !exist {
		return defaultValue
	}
	return value
}
