#!/bin/bash

# 设置变量
WORK_DIR="/opt/shiori/kibou/kibou"
SERVICE_NAME="docusaurus.service"
BUILD_FILE="./build/index.html"
LOG_FILE="/var/log/kibou/deployment.log"
NVM_DIR="/root/.nvm"  # NVM 目录
NODE_VERSION="v20.8.0"

# 开启严格模式
set -euo pipefail

# 确保日志目录存在
mkdir -p "$(dirname "$LOG_FILE")"

# 日志函数
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$message" | tee -a "$LOG_FILE"
}

# 加载 NVM 环境
if [ -s "$NVM_DIR/nvm.sh" ]; then
    log "加载 NVM 环境..."
    export NVM_DIR
    source "$NVM_DIR/nvm.sh"
    nvm use "$NODE_VERSION" >/dev/null 2>&1
    log "已切换到 Node.js $NODE_VERSION。"
else
    log "NVM 未找到，请检查 NVM 配置。"
    exit 1
fi

# 切换到工作目录
log "切换到工作目录: $WORK_DIR"
cd "$WORK_DIR"

# 更新代码
log "开始拉取最新代码..."
if git pull 2>&1 | tee -a "$LOG_FILE" | grep -q "Already up to date"; then
    log "代码已经是最新，无需更新。"
else
    log "代码已更新，继续执行后续操作。"
    
    # 安装依赖
    log "安装依赖..."
    yarn 2>&1 | tee -a "$LOG_FILE"

    # 构建项目
    log "开始构建项目..."
    yarn build 2>&1 | tee -a "$LOG_FILE"

    # 确保 build/index.html 存在
    log "检查并创建 $BUILD_FILE 文件..."
    if [ ! -f "$BUILD_FILE" ]; then
        touch "$BUILD_FILE"
        log "$BUILD_FILE 已创建。"
    else
        log "$BUILD_FILE 已存在，无需创建。"
    fi

    # 重启服务
    log "重启服务 $SERVICE_NAME..."
    systemctl restart "$SERVICE_NAME" 2>&1 | tee -a "$LOG_FILE"
    log "服务 $SERVICE_NAME 已重启。"
fi

log "脚本执行完成！"