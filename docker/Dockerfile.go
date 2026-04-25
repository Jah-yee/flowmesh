# Standard multi-stage Dockerfile for the Go Delivery service.
# Copy this file to apps/delivery/Dockerfile.

# ── Builder ───────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /delivery ./cmd/server

# ── Development ───────────────────────────────────────────────
FROM golang:1.22-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
COPY . .
EXPOSE 3003
CMD ["air", "-c", ".air.toml"]

# ── Production ────────────────────────────────────────────────
FROM alpine:3.19 AS production
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

COPY --from=builder /delivery .

RUN addgroup -S flowmesh && adduser -S flowmesh -G flowmesh
USER flowmesh

EXPOSE 3003
CMD ["./delivery"]
