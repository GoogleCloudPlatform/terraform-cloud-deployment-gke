FROM golang:1.20-alpine3.16 AS builder
WORKDIR /api

COPY . .
ENV GIN_MODE=release
RUN go test ./...
RUN go build -o lds

FROM alpine:latest
WORKDIR /api
COPY --from=builder /api/lds .

ENTRYPOINT [ "./lds" ]
