# @sai/dsh-proot-shell

Android adapter for the DeepSeek Harness shell seam. It avoids native sandbox
addons that cannot run inside Android PRoot, blocks shell execution in Read
Only mode, and keeps DSH permission/approval projection active for the other
modes. PRoot is not a kernel security sandbox.
