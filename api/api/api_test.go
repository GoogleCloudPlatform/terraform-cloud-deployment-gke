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

// Package api defines REST API /api.
package api

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHealthCheck(t *testing.T) {
	// Setup REST API
	router := gin.Default()
	apiRouter := router.Group("/api")
	apiRouter.GET("/healthchecker", Healthcheck)

	// Send request
	req, err := http.NewRequest("GET", "/api/healthchecker", nil)
	assert.Nil(t, err)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	// Assert result
	response, err := io.ReadAll(recorder.Body)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusNoContent, recorder.Code)
	assert.Empty(t, "", response)
}
