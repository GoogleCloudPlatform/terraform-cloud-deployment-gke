# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:alpine as builder

WORKDIR /usr/app

COPY ./package*.json ./

RUN npm install --legacy-peer-deps

COPY ./ ./

COPY src src

RUN npm run build --output-path=./dist/frontend --prod


FROM nginx:alpine

COPY --from=builder /usr/app/dist/frontend /usr/share/nginx/html

COPY ./nginx-custom.conf /etc/nginx/

CMD envsubst < /etc/nginx/nginx-custom.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
