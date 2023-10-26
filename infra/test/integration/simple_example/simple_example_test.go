// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package simple_example

import (
	"fmt"
	"testing"

	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/gcloud"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/golden"
	"github.com/GoogleCloudPlatform/cloud-foundation-toolkit/infra/blueprint-test/pkg/tft"
	"github.com/stretchr/testify/assert"
)

func TestSimpleExample(t *testing.T) {

	example := tft.NewTFBlueprintTest(t)

	example.DefineVerify(func(assert *assert.Assertions) {
		projectID := example.GetTFSetupStringOutput("project_id")
		gcloudArgs := gcloud.WithCommonArgs([]string{"--project", projectID})

		// Check if the resource bucket exists
		resourceBucketName := example.GetStringOutput("bucket_name")
		resourceStorage := gcloud.Run(t, fmt.Sprintf("storage buckets describe gs://%s --format=json", resourceBucketName), gcloudArgs)
		assert.NotEmpty(resourceStorage)

		// Check k8s cluster configs
		clusterName := example.GetStringOutput("cluster_name")
		clusterLocation := example.GetStringOutput("cluster_location")

		op := gcloud.Runf(t, "container clusters describe %s --zone %s --project %s", clusterName, clusterLocation, projectID)
		g := golden.NewOrUpdate(t, op.String(),
			golden.WithSanitizer(golden.StringSanitizer(clusterName, "CLUSTER_NAME")),
			golden.WithSanitizer(golden.StringSanitizer(clusterLocation, "CLUSTER_LOCATION")),
		)
		validateJSONPaths := []string{
			"name",
			"location",
			"autopilot.enabled",
		}
		for _, pth := range validateJSONPaths {
			g.JSONEq(assert, op, pth)
		}
		assert.Contains([]string{"RUNNING", "RECONCILING"}, op.Get("status").String())

		// Check if the resource load balancer exists
		resourceLoadBalancerName := example.GetStringOutput("load_balancer_name")
		resourceLoadBalancer := gcloud.Run(t, fmt.Sprintf("compute url-maps describe %s --format=json", resourceLoadBalancerName), gcloudArgs)
		assert.NotEmpty(resourceLoadBalancer)

		// Check if the resource backend service exists
		backendServiceName := example.GetStringOutput("backend_service_name")
		backendService := gcloud.Run(t, fmt.Sprintf("compute forwarding-rules list --filter='%s' --format=json", backendServiceName), gcloudArgs)
		assert.NotEmpty(backendService)

		// Check if a new Firestors database exists
		firestoreDbName := example.GetStringOutput("db_name")
		firestoreDb := gcloud.Run(t, fmt.Sprintf("firestore databases describe --database=%s --format=json", firestoreDbName), gcloudArgs)
		assert.NotEmpty(firestoreDb)

	})
	example.Test()
}
