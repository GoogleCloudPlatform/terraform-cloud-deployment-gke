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

// Package api the REST API of group "/api".
package api

import (
	"context"
	"log"
	"net/http"

	"google/jss/ldsgo/gcp/bucket"
	"google/jss/ldsgo/gcp/firestore"

	"github.com/gin-gonic/gin"
)

// Response composes the http Response.
func Response(c *gin.Context, code int, body interface{}) {
	if body == nil {
		c.String(code, "")
	} else {
		c.JSON(code, body)
	}
}

func ResponseServerError(c *gin.Context, err error) {
	log.Printf("encounter server error %v", err)
	Response(c, http.StatusInternalServerError, "")
}

// Healthcheck is function for /api/healthchecker GET endpoint.
// This API is provided for Cloud Run to check the health of the server.
func Healthcheck(c *gin.Context) {
	c.String(http.StatusNoContent, "")
}

// Reset is function for /api/reset DELETE endpoint.
// This API resets the server, deleting all files in the system.
func Reset(c *gin.Context) {
	log.Println("start to reset server")
	ctx := context.Background()

	dbClient, err := firestore.Service.NewClientWithDatabase(ctx)
	if err != nil {
		ResponseServerError(c, err)
		return
	}
	defer dbClient.Close() // nolint: errcheck

	if err := dbClient.DeleteAll(ctx); err != nil {
		ResponseServerError(c, err)
		return
	}

	client, err := bucket.Service.NewClient(ctx)
	if err != nil {
		ResponseServerError(c, err)
		return
	}
	defer client.Close() // nolint: errcheck

	if err := client.DeleteAll(ctx); err != nil {
		ResponseServerError(c, err)
		return
	}
	c.String(http.StatusNoContent, "success")
}
