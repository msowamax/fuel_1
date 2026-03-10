#!/bin/bash

# 1. Install Flutter
if [ ! -d "flutter" ]; then
  git clone https://github.com/flutter/flutter.git -b stable
fi

export PATH="$PATH:`pwd`/flutter/bin"

# 2. Verify Flutter installation
flutter doctor

# 3. Build Web
flutter build web --release --base-href /

# 4. Success message
echo "Build completed successfully!"
