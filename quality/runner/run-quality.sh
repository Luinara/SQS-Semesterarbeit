#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${QUALITY_SOURCE_DIR:-/workspace}"
WORK_DIR="${QUALITY_WORK_DIR:-/work/repo}"
OUTPUT_DIR="${QUALITY_OUTPUT_DIR:-/quality-output}"

mkdir -p "$WORK_DIR" "$OUTPUT_DIR/logs" "$OUTPUT_DIR/artifacts"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

tar \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='target' \
  --exclude='dist' \
  --exclude='coverage' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  --exclude='quality-output' \
  -C "$SOURCE_DIR" \
  -cf - . | tar -C "$WORK_DIR" -xf -

cd "$WORK_DIR"
node /quality/runner/quality-runner.mjs
