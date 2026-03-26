// 公共工具函数

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 截断文本
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 获取分类标签的中文显示
 */
function getCategoryLabel(category) {
  const labels = {
    'anime': '动漫',
    'internet': '网红',
    'fiction': '小说',
    'real': '现实',
    'self': '自建',
    'other': '其他'
  };
  return labels[category] || '其他';
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==================== Toast通知系统 ====================

/**
 * 显示 Toast 通知
 * @param {string} message - 消息内容
 * @param {string} type - 类型: 'success' | 'error' | 'info'
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'info', duration = 3000) {
  // 确保容器存在
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // 图标
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}

/**
 * 显示成功通知
 */
function showSuccess(message, duration) {
  return showToast(message, 'success', duration);
}

/**
 * 显示错误通知
 */
function showError(message, duration) {
  return showToast(message, 'error', duration);
}

/**
 * 显示信息通知
 */
function showInfo(message, duration) {
  return showToast(message, 'info', duration);
}

// ==================== 页面加载完成后初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 添加页面加载动画
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
