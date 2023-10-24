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

// Package firestore is used to access GCP firestore.
package firestore

import (
	"context"
	"errors"
	"fmt"
	"log"
	"reflect"
	"time"

	"google/jss/ldsgo/config"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const timeout time.Duration = time.Second * 10

// FileMetaRecord is used to create FileMeta in firestore.
type FileMetaRecord struct {
	Path     string
	Name     string
	FileSize int64
	Tags     []string
	OrderNo  string
}

// Set sets the FileMetaRecord with given map
func (record *FileMetaRecord) Set(data map[string]interface{}) error {
	path, err := getValue(data, config.Config.LDSFirestoreFieldPath, "")
	if err != nil {
		return err
	}
	record.Path = path

	name, err := getValue(data, config.Config.LDSFirestoreFieldName, "")
	if err != nil {
		return err
	}
	record.Name = name

	size, err := getValue(data, config.Config.LDSFirestoreFieldSize, int64(0))
	if err != nil {
		return err
	}
	record.FileSize = size

	orderNo, err := getValue(data, config.Config.LDSFirestoreFieldOrderNo, "")
	if err != nil {
		return err
	}
	record.OrderNo = orderNo

	tags, err := getSliceValue(data, config.Config.LDSFirestoreFieldTags, "")
	if err != nil {
		return err
	}
	record.Tags = tags

	return nil
}

func getValue[T any](mapdata map[string]interface{}, key string, valueType T) (T, error) {
	val, ok := mapdata[key]
	if !ok {
		return valueType, fmt.Errorf("the key %s does not exist", key)
	}
	return toType(val, valueType)
}

func getSliceValue[T any](mapdata map[string]interface{}, key string, elemType T) ([]T, error) {
	val, ok := mapdata[key]
	if !ok {
		return nil, fmt.Errorf("the key %s does not exist", key)
	}
	return toSlice(val, elemType)
}

func toType[T any](data interface{}, valueType T) (T, error) {
	value, ok := data.(T)
	if !ok {
		return valueType, fmt.Errorf("the type of %v is %v, but %v is expected", data, reflect.TypeOf(data), reflect.TypeOf(valueType))
	}
	return value, nil
}

func toSlice[T any](data interface{}, elemType T) ([]T, error) {
	values, ok := data.([]interface{})
	if !ok {
		return nil, fmt.Errorf("%v is not a slice", data)
	}
	var result []T
	for _, elem := range values {
		value, ok := elem.(T)
		if !ok {
			return nil, fmt.Errorf("the type of element %v is %v, but %v is expected", elem, reflect.TypeOf(elem), reflect.TypeOf(elemType))
		}
		result = append(result, value)
	}
	return result, nil
}

// FileMeta is queried from FileMeta collection.
type FileMeta struct {
	ID         string
	CreateTime time.Time
	UpdateTime time.Time
	FileMetaRecord
}

type service interface {
	NewClientWithDatabase(context.Context) (Client, error)
}

// Service used to creates client for firestore handling.
var Service service = new(firestoreService)

type firestoreService struct {
}

// NewClientWithDatabase creates the client for firestore handling.
func (*firestoreService) NewClientWithDatabase(ctx context.Context) (Client, error) {
	client, err := firestore.NewClientWithDatabase(ctx, config.Config.LDSProject, config.Config.LDSFirestoreDatabase)
	if err != nil {
		return nil, err
	}
	return &firestoreClient{client: client}, err
}

// Client is the interface of the firestore client for firestore handling.
type Client interface {
	Get(context.Context, string) (*FileMeta, error)
	ListByTags(context.Context, []string, string, int) ([]*FileMeta, error)
	Create(context.Context, string, map[string]interface{}) (*FileMeta, error)
	Merge(context.Context, string, map[string]interface{}) (*FileMeta, error)
	Delete(context.Context, string) error
	DeleteAll(context.Context) error
	Close() error
}

type firestoreClient struct {
	client *firestore.Client
}

// Close close the underlying client.
func (c *firestoreClient) Close() error {
	return c.client.Close()
}

// Get gets the FileMeta from given ID.
func (c *firestoreClient) Get(ctx context.Context, id string) (*FileMeta, error) {
	doc := c.client.Collection(config.Config.LDSFirestoreCollection).Doc(id)
	return getByDoc(ctx, doc)
}

func getByDoc(ctx context.Context, doc *firestore.DocumentRef) (*FileMeta, error) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	snapshot, err := doc.Get(ctx)
	if err != nil {
		log.Printf("firestore: failed to get document from firestore: %v", err)
		return nil, err
	}
	result, err := newFileMeta(snapshot)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func newFileMeta(snapshot *firestore.DocumentSnapshot) (*FileMeta, error) {
	data := snapshot.Data()

	var result FileMeta
	if err := result.Set(data); err != nil {
		return &result, fmt.Errorf("failed to format result snapshot: %v, err: %w", snapshot, err)
	}

	result.ID = snapshot.Ref.ID
	result.CreateTime = snapshot.CreateTime
	result.UpdateTime = snapshot.UpdateTime
	return &result, nil
}

// ListByTags lists the FileMeta from given tags.
func (c *firestoreClient) ListByTags(ctx context.Context, tags []string, orderNo string, size int) ([]*FileMeta, error) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	files := c.client.Collection(config.Config.LDSFirestoreCollection)
	query := files.OrderBy(config.Config.LDSFirestoreFieldOrderNo, firestore.Desc)
	if len(tags) != 0 {
		query = files.Where(config.Config.LDSFirestoreFieldTags, "array-contains-any", tags)
	}
	if orderNo != "" {
		query = query.StartAfter(orderNo)
	}
	query = query.Limit(size)
	iter := query.Documents(ctx)
	defer iter.Stop()
	var results []*FileMeta
	for {
		snapshot, err := iter.Next()
		if errors.Is(err, iterator.Done) {
			break
		}
		if err != nil {
			log.Printf("firestore: failed to read from firestore, query: %v", query)
			return nil, err
		}
		result, err := newFileMeta(snapshot)
		if err != nil {
			return nil, err
		}
		results = append(results, result)
	}
	return results, nil
}

// Create creates the FileMeta associated with the given ID.
func (c *firestoreClient) Create(ctx context.Context, id string, fields map[string]interface{}) (*FileMeta, error) {
	return c.set(ctx, id, fields)
}

// Merge updates the FileMeta identified by given ID, it only updates the given fields and leaves others untouched.
func (c *firestoreClient) Merge(ctx context.Context, id string, fields map[string]interface{}) (*FileMeta, error) {
	return c.set(ctx, id, fields, firestore.MergeAll)
}

func (c *firestoreClient) set(ctx context.Context, id string, record interface{}, opt ...firestore.SetOption) (*FileMeta, error) {
	ctxSet, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	doc := c.client.Collection(config.Config.LDSFirestoreCollection).Doc(id)
	if _, err := doc.Set(ctxSet, record, opt...); err != nil {
		log.Printf("firestore: failed to write to firestore, error:%v", err)
		return nil, err
	}
	return getByDoc(ctx, doc)
}

// Delete deletes the document identified by the given id.
func (c *firestoreClient) Delete(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	if _, err := c.client.Collection(config.Config.LDSFirestoreCollection).Doc(id).Delete(ctx); err != nil {
		log.Printf("firestore: failed to delete document from firestore: %v", err)
		return err
	}
	return nil
}

// DeleteAll deletes all the documents in the colletion
func (c *firestoreClient) DeleteAll(ctx context.Context) error {
	col := c.client.Collection(config.Config.LDSFirestoreCollection)
	bulkwriter := c.client.BulkWriter(ctx)
	for {
		// Delete 50 documents each time.
		iter := col.Limit(50).Documents(ctx)
		numDeleted := 0

		for {
			doc, err := iter.Next()
			if errors.Is(err, iterator.Done) {
				break
			}
			if err != nil {
				log.Printf("firestore: document iteration error: %v", err)
				return err
			}

			_, err = bulkwriter.Delete(doc.Ref)
			if err != nil {
				log.Printf("firestore: document deleted %v error: %v", doc.Ref.ID, err)
				return err
			}
			numDeleted++
		}

		if numDeleted == 0 {
			bulkwriter.End()
			break
		}
		bulkwriter.Flush()
	}
	return nil
}
