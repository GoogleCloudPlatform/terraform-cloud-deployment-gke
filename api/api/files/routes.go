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
	"context"
	"image"
	"image/color"
	_ "image/gif" // Register gif encoder.
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"google/jss/ldsgo/api"
	"google/jss/ldsgo/config"
	"google/jss/ldsgo/gcp/bucket"
	"google/jss/ldsgo/gcp/firestore"

	"github.com/disintegration/imaging"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/exp/slices"
	_ "golang.org/x/image/webp" // Register webp encoder.
)

const thumbnailWidth int = 300
const thumbnailHeight int = 300
const pageSize int = 50

// FileMeta the response json of FileMeta.
type FileMeta struct {
	ID         string   `json:"id" binding:"required"`
	Name       string   `json:"name" binding:"required"`
	Tags       []string `json:"tags" binding:"required"`
	URL        string   `json:"url" binding:"required"`
	ThumbURL   string   `json:"thumbUrl" binding:"required"`
	OrderNo    string   `json:"orderNo" binding:"required"`
	FileSize   int64    `json:"size" binding:"required"`
	CreateTime string   `json:"createTime" binding:"required"`
	UpdateTime string   `json:"updateTime" binding:"required"`
}

// FileUploadRequest the request form data of file uploading.
type FileUploadRequest struct {
	Files []*multipart.FileHeader `form:"files" binding:"required"`
	Tags  string                  `form:"tags" binding:"required"`
}

// FileUpdateResponse the response json of file updating.
type FileUpdateResponse struct {
	File FileMeta `json:"file" binding:"required"`
}

// FileListResponse the response json of file listing.
type FileListResponse struct {
	Files []FileMeta `json:"files" binding:"required"`
}

var imageTypes = []string{".jpg", ".jpeg", ".png", ".gif"}

func toThumbnailPath(path string) string {
	return path + "_small"
}

func toBucketPath(id string) string {
	return config.Config.BucketBasePath + id
}

func toResourceURL(path string) string {
	return config.Config.ResourceBasePath + path
}

func getOrderNo(id string) string {
	return strconv.FormatInt(time.Now().UnixMilli(), 10) + "-" + id
}

func parseTags(tags string) []string {
	if tags == "" {
		return []string{}
	}
	return strings.Fields(strings.ToLower(tags))
}

func parsePageSize(sizeParam string) (int, error) {
	if sizeParam == "" {
		return pageSize, nil
	}
	return strconv.Atoi(sizeParam)
}

// writeFileToBucket uploads file to cloud storage bucket.
func writeFileToBucket(ctx context.Context, client bucket.Client, path string, file *multipart.FileHeader, transcoder bucket.Transcoder) (size int64, err error) {
	defer func() {
		if err != nil {
			log.Printf("failed to upload file: %s to path: %s error: %v", file.Filename, path, err)
		}
	}()

	f, err := file.Open()
	if err != nil {
		return -1, err
	}
	defer f.Close() // nolint: errcheck

	return client.TransWrite(ctx, path, f, transcoder)
}

// writeThumbnailToBucket uploads thumbnail to bucket.
func writeThumbnailToBucket(ctx context.Context, client bucket.Client, path string, file *multipart.FileHeader) (int64, error) {
	thumbnailPath := toThumbnailPath(path)
	return writeFileToBucket(ctx, client, thumbnailPath, file, thumbnailTranscoder)
}

// thumbnailTranscoder the transcoder to transcode image to thumbnail.
func thumbnailTranscoder(thumbnailWriter io.Writer, imageReader io.Reader) (int64, error) {
	img, err := imaging.Decode(imageReader)
	if err != nil {
		log.Printf("file decoded failed: %s", err)
		return 0, err
	}

	thumbnail := imaging.Thumbnail(img, thumbnailWidth, thumbnailHeight, imaging.CatmullRom)
	dst := imaging.New(thumbnailWidth, thumbnailHeight, color.NRGBA{0, 0, 0, 0})
	dst = imaging.Paste(dst, thumbnail, image.Pt(0, 0))

	if err = imaging.Encode(thumbnailWriter, dst, imaging.PNG); err != nil {
		return 0, nil
	}
	return -1, err // Unknow written size.
}

// uploadToBucket uploads file with thumbnail to bucket.
func uploadToBucket(ctx context.Context, client bucket.Client, path string, file *multipart.FileHeader) (int64, error) {
	size, err := writeFileToBucket(ctx, client, path, file, nil)
	if err != nil {
		return -1, err
	}

	// Upload thumbnail if it's an image.
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if slices.Contains(imageTypes, ext) {
		if _, err := writeThumbnailToBucket(ctx, client, path, file); err != nil {
			return -1, err
		}
	}
	return size, nil
}

// updateBucketFile deletes old file with thumbnail and upload new one to bucket.
func updateBucketFile(ctx context.Context, client bucket.Client, path string, file *multipart.FileHeader) (id string, newPath string, size int64, err error) {
	defer func() {
		if err != nil {
			log.Printf("update bucket path %s failed: %v", path, err)
		}
	}()

	if err = deleteBucketFile(ctx, client, path); err != nil {
		return
	}
	id = uuid.New().String()
	newPath = toBucketPath(id)
	size, err = uploadToBucket(ctx, client, newPath, file)
	return
}

// deleteBucketFile deletes file with thumbnail from cloud storage bucket.
func deleteBucketFile(ctx context.Context, client bucket.Client, path string) error {
	if path == "" {
		log.Println("no path to delete")
		return nil
	}
	thumbnailPath := toThumbnailPath(path)
	// The path order is matter, delete file before thumbnail.
	if err := client.Delete(ctx, path, thumbnailPath); err != nil {
		return err
	}
	return nil
}

// generateFileMeta gets data from <doc> then return a FileMeta instance.
func generateFileMeta(result *firestore.FileMeta) FileMeta {
	var meta FileMeta
	log.Println("result:", result.ID, result.Name, result.Path, result.Tags, result.OrderNo)

	meta.ID = result.ID
	meta.Name = result.Name
	meta.Tags = result.Tags
	meta.OrderNo = result.OrderNo
	meta.FileSize = result.FileSize
	meta.CreateTime = result.CreateTime.Format("2006-01-02T15:04:05.000Z")
	meta.UpdateTime = result.UpdateTime.Format("2006-01-02T15:04:05.000Z")
	meta.URL = toResourceURL(result.Path)
	ext := strings.ToLower(filepath.Ext(meta.Name))
	if slices.Contains(imageTypes, ext) {
		meta.ThumbURL = toResourceURL(toThumbnailPath(result.Path))
	} else {
		meta.ThumbURL = ""
	}
	log.Println("final meta:", meta)
	return meta
}

// PostFiles is function for /api/files POST endpoint.
// This API uses `multipart/form-data` to upload multiple files along with the relevant tags in a single request.
func PostFiles(c *gin.Context) {
	var req FileUploadRequest
	if err := c.Bind(&req); err != nil {
		api.Response(c, http.StatusBadRequest, nil)
		return
	}
	tags := parseTags(req.Tags)

	ctx := context.Background()
	client, err := bucket.Service.NewClient(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer client.Close() // nolint: errcheck

	dbClient, err := firestore.Service.NewClientWithDatabase(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer dbClient.Close() // nolint: errcheck

	var filesarray []FileMeta
	// Iterate all uploaded files.
	for _, file := range req.Files {
		filename := filepath.Base(file.Filename)
		log.Printf("process uploaded file: %s", filename)

		id := uuid.New().String()
		path := toBucketPath(id)
		size, err := uploadToBucket(ctx, client, path, file)
		if err != nil {
			api.Response(c, http.StatusBadRequest, nil)
			return
		}

		// Add data to firestore.
		record := map[string]interface{}{
			config.Config.LDSFirestoreFieldPath:    path,
			config.Config.LDSFirestoreFieldName:    filename,
			config.Config.LDSFirestoreFieldSize:    size,
			config.Config.LDSFirestoreFieldTags:    tags,
			config.Config.LDSFirestoreFieldOrderNo: getOrderNo(id),
		}
		docSnap, err := dbClient.Create(ctx, id, record)
		if err != nil {
			api.ResponseServerError(c, err)
			return
		}

		// Add data to response.
		item := generateFileMeta(docSnap)
		filesarray = append(filesarray, item)
		log.Printf("uploaded file: %s\n", filename)
	}
	api.Response(c, http.StatusCreated, &FileListResponse{Files: filesarray})
}

// UpdateFile is function for /api/files/{id} UPDATE endpoint.
// This API enables users to modify the file identified by the ID.
func UpdateFile(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	dbClient, err := firestore.Service.NewClientWithDatabase(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer dbClient.Close() // nolint: errcheck

	// Make suer the file exists before updating.
	meta, err := dbClient.Get(ctx, id)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			api.Response(c, http.StatusNotFound, nil)
		} else {
			api.ResponseServerError(c, err)
		}
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		api.Response(c, http.StatusBadRequest, nil)
		return
	}
	var file *multipart.FileHeader
	tags := parseTags(form.Value["tags"][0])
	log.Println("tags:", tags)

	if len(form.File["file"]) != 0 {
		file = form.File["file"][0]
	} else {
		file = nil
	}

	fields := map[string]interface{}{
		config.Config.LDSFirestoreFieldTags:    tags,
		config.Config.LDSFirestoreFieldOrderNo: getOrderNo(id),
	}
	if file != nil {
		log.Println("file:", file.Filename)
		client, err := bucket.Service.NewClient(ctx)
		if err != nil {
			api.ResponseServerError(c, err)
			return
		}
		defer client.Close() // nolint: errcheck

		bucketFileID, newPath, size, err := updateBucketFile(ctx, client, meta.Path, file)
		log.Println("bucketID:", bucketFileID, ", newPath:", newPath, ", err:", err)
		if err != nil {
			api.ResponseServerError(c, err)
			return
		}
		fields[config.Config.LDSFirestoreFieldPath] = newPath
		fields[config.Config.LDSFirestoreFieldName] = filepath.Base(file.Filename)
		fields[config.Config.LDSFirestoreFieldSize] = size
	}
	newMeta, err := dbClient.Merge(ctx, id, fields)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}

	item := generateFileMeta(newMeta)
	api.Response(c, http.StatusOK, &FileUpdateResponse{File: item})
}

// GetFileList is function for /api/files GET endpoint.
// This API offers optional query parameters `tags` and `orderNo` to filter files.
// The files are listed in order of `orderNo` based on last update time with a default page size of 50.
func GetFileList(c *gin.Context) {
	tags := parseTags(c.Query("tags"))
	orderNo := c.Query("orderNo")
	size, err := parsePageSize(c.Query("size"))
	if err != nil {
		api.Response(c, http.StatusBadRequest, nil)
		return
	}

	ctx := context.Background()
	dbClient, err := firestore.Service.NewClientWithDatabase(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer dbClient.Close() // nolint: errcheck

	docs, err := dbClient.ListByTags(ctx, tags, orderNo, size)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}

	var results = []FileMeta{} // An empty slice is intended for the JSON response instead of nil.
	// var results []FileMeta
	for _, doc := range docs {
		item := generateFileMeta(doc)
		results = append(results, item)
	}

	api.Response(c, http.StatusOK, &FileListResponse{Files: results})
}

// DeleteFile is function for /api/files/{id} DELETE endpoint.
// This API enables users to delete the file identified by the ID.
func DeleteFile(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	var err error
	dbClient, err := firestore.Service.NewClientWithDatabase(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer dbClient.Close() // nolint: errcheck

	// Delete data in firestore.
	doc, err := dbClient.Get(ctx, id)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			api.Response(c, http.StatusNotFound, nil)
		} else {
			api.ResponseServerError(c, err)
		}
		return
	}

	client, err := bucket.Service.NewClient(ctx)
	if err != nil {
		api.ResponseServerError(c, err)
		return
	}
	defer client.Close() // nolint: errcheck

	if err := deleteBucketFile(ctx, client, doc.Path); err != nil {
		api.ResponseServerError(c, err)
		return
	}
	if err := dbClient.Delete(ctx, id); err != nil {
		api.ResponseServerError(c, err)
		return
	}

	log.Printf("object %q deleted\n", id)
	api.Response(c, http.StatusNoContent, nil)
}
