#!/bin/bash
# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -euo pipefail

BUCKET_NAME=$1
ARCHIVE_FILE_NAME=$2
LDS_CLIENT_URL=$3

echo "bucket name is $BUCKET_NAME"
echo "archive file name is $ARCHIVE_FILE_NAME"
gsutil cp gs://$BUCKET_NAME/$ARCHIVE_FILE_NAME .
if [[ "$ARCHIVE_FILE_NAME" == *.tar.gz ]]; then
  name=$(basename $ARCHIVE_FILE_NAME .tar.gz)
  mkdir $name
  tar -zxvpf "$ARCHIVE_FILE_NAME" -C $name 
  folders=($(find $name -type d | awk -F/ '{print $NF}'))
  for folder in "${folders[@]}"
  do
      bash upload.sh $LDS_CLIENT_URL $name/$folder
  done
else
  echo "Unknown file type: $ARCHIVE_FILE_NAME"
  exit 1
fi
