#!/bin/bash

# Calculate Expo URL based on environment
EXPO_PORT="${EXPO_WEB_PORT:-3000}"

# Only set EXPO_PACKAGER_PROXY_URL if CLACKY_PREVIEW_DOMAIN_BASE is defined
if [ -n "$CLACKY_PREVIEW_DOMAIN_BASE" ]; then
  # Preview domain: http://3000.preview.example.com (no port suffix)
  export EXPO_PACKAGER_PROXY_URL="http://${EXPO_PORT}${CLACKY_PREVIEW_DOMAIN_BASE}"
fi
# Otherwise use default Expo behavior (auto-detect IP for LAN access)

exec expo start "$@" --port "$EXPO_PORT"
