# sai DSH plugins

First-party DeepSeek Harness plugins used by the sai Android shell. Publish this repository with
the exact GitHub topic `dsh-plugin`. Packages are independently versioned and ship prebuilt
JavaScript, so installation never needs a lifecycle build script.

Android is the authority for OS permissions, secrets, microphone capture and foreground services.
Provider and GitHub credentials are never exposed to plugins.

The GitHub repository topic is exactly `dsh-plugin`. A scheduled Action publishes a detached
Ed25519-signed catalog every six hours; an absent signing secret fails closed rather than publishing
an unsigned index. Release tags package every bundle independently, without running third-party
install/prepare/postinstall scripts.
