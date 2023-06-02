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

// Package bucket is used to access GCP storage bucket.
package bucket

import (
	"context"
	"errors"
	"io"
	"log"
	"time"

	"google/jss/ldsgo/config"

	"cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

const timeout time.Duration = time.Second * 10

// Transcoder the function to transcode data from reader to writer.
type Transcoder func(writer io.Writer, reader io.Reader) (int64, error)

type service interface {
	NewClient(context.Context) (Client, error)
}

// Service used to creates client for bucket handling.
var Service service = new(bucketService)

type bucketService struct {
}

// NewClient creates the client for bucket handling.
func (*bucketService) NewClient(ctx context.Context) (Client, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	return &bucketClient{client: client}, err
}

// Client is the interface of the bucket client for bucket handling.
type Client interface {
	TransWrite(context.Context, string, io.Reader, Transcoder) (size int64, err error)
	Delete(context.Context, ...string) error
	DeleteAll(context.Context) error
	Close() error
}

type bucketClient struct {
	client *storage.Client
}

// Close close the underlying client.
func (c *bucketClient) Close() error {
	return c.client.Close()
}

// TransWrite reads from <reader>, tanscode and write it to <path> of cloud storage bucket.
func (c *bucketClient) TransWrite(ctx context.Context, path string, reader io.Reader, transcoder Transcoder) (size int64, err error) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	writer := c.client.Bucket(config.Config.LDSBucket).Object(path).NewWriter(ctx)
	defer func() {
		err = writer.Close() // Propagate the error if failed to close.
	}()

	if transcoder == nil {
		transcoder = io.Copy
	}
	size, err = transcoder(writer, reader)
	return
}

// Delete deletes the given paths in bucket.
func (c *bucketClient) Delete(ctx context.Context, paths ...string) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	bucketHandler := c.client.Bucket(config.Config.LDSBucket)
	for _, path := range paths {
		o := bucketHandler.Object(path)
		if err := o.Delete(ctx); err != nil {
			if errors.Is(err, storage.ErrObjectNotExist) {
				log.Printf("storage: ignore error, file %s does not exist while deleting", path)
			} else {
				log.Printf("storage: failed to delete file %s in bucket", path)
				return err
			}
		}
	}
	return nil
}

// DeleteAll deletes all files in the bucket.
func (c *bucketClient) DeleteAll(ctx context.Context) error {
	bucketHandler := c.client.Bucket(config.Config.LDSBucket)
	it := bucketHandler.Objects(ctx, nil)
	for {
		attrs, err := it.Next()
		if errors.Is(err, iterator.Done) {
			break
		}
		if err != nil {
			log.Printf("storage: bucket object iteration error: %v", err)
			return err
		}
		if err := c.Delete(ctx, attrs.Name); err != nil {
			return err
		}
	}
	return nil
}
