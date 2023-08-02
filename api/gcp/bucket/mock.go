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

package bucket

import (
	"context"
	"errors"
	"io"

	"github.com/stretchr/testify/mock"
)

// MockService mocks the service for unit test.
// Test case can use the returned MockedClient to mock test data.
func MockService() (*MockedService, *MockedClient) {
	var client = new(MockedClient)
	client.On("Close").Return(nil)

	svc := &MockedService{originalService: Service}
	svc.On("NewClient", mock.Anything).Return(client, nil)
	Service = svc
	return svc, client
}

// MockedService is the mocked service for unit test.
type MockedService struct {
	mock.Mock
	originalService service
}

// NewClient returns the mocked client for unit test.
func (m *MockedService) NewClient(ctx context.Context) (Client, error) {
	result := m.Called(ctx)
	client, ok := result.Get(0).(*MockedClient)
	if !ok {
		return nil, errors.New("not a client")
	}
	return client, result.Error(1)
}

// Stop stops the mock and restores to original service.
func (m *MockedService) Stop() {
	Service = m.originalService
}

// MockedClient is the mocked client for unit test.
type MockedClient struct {
	mock.Mock
}

// TransWrite mocks the original TransWrite function.
func (m *MockedClient) TransWrite(ctx context.Context, path string, reader io.Reader, transcoder Transcoder) (size int64, err error) {
	result := m.Called(ctx, path, reader, transcoder)
	return int64(result.Int(0)), result.Error(1)
}

// Delete mocks the original Delete function.
func (m *MockedClient) Delete(ctx context.Context, paths ...string) error {
	result := m.Called(ctx, paths)
	return result.Error(0)
}

// DeleteAll mocks the original DeleteAll function.
func (m *MockedClient) DeleteAll(ctx context.Context) error {
	result := m.Called(ctx)
	return result.Error(0)
}

// Close mocks the original Close function.
func (m *MockedClient) Close() error {
	result := m.Called()
	return result.Error(0)
}
