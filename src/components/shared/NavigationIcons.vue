<template>
  <div class="nav-icons">
    <!-- 玫瑰花图标 -->
    <div class="icon-wrapper" @mouseenter="showTooltip('rose')" @mouseleave="hideTooltip">
      <a href="/rose" class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- 简洁的玫瑰花图标 -->
          <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /> <!-- 花心 -->
          <path d="M12 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /> <!-- 内花瓣 -->
          <path d="M12 2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" /> <!-- 外花瓣 -->
          <path d="M8 14l-2 4" /> <!-- 花茎 -->
          <path d="M16 14l2 4" /> <!-- 花茎 -->
          <path d="M10 16l-2 4" /> <!-- 花茎 -->
          <path d="M14 16l2 4" /> <!-- 花茎 -->
          <path d="M10 16c0 1 1.5 2 2 2s2-1 2-2" /> <!-- 叶子 -->
        </svg>
      </a>
      <div v-show="tooltip === 'rose'" class="tooltip">玫瑰花</div>
    </div>

    <!-- 摇签筒图标 -->
    <div class="icon-wrapper" @mouseenter="showTooltip('fortune')" @mouseleave="hideTooltip">
      <a href="/blessing/qixi" class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- 简洁的摇签筒图标 -->
          <path d="M8 3h8v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V3z" /> <!-- 筒身 -->
          <path d="M10 3L8 1" /> <!-- 顶部装饰 -->
          <path d="M14 3L16 1" /> <!-- 顶部装饰 -->
          <path d="M12 5v4" /> <!-- 筒内签条 -->
          <path d="M12 10v4" /> <!-- 筒内签条 -->
          <path d="M12 15v4" /> <!-- 筒内签条 -->
        </svg>
      </a>
      <div v-show="tooltip === 'fortune'" class="tooltip">摇签</div>
    </div>

    <!-- 分享图标 -->
    <div class="icon-wrapper" @mouseenter="showTooltip('share')" @mouseleave="hideTooltip">
      <button @click="shareContent" class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- 简洁的分享图标 -->
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98" />
          <path d="M15.41 6.51l-6.82 3.98" />
        </svg>
      </button>
      <div v-show="tooltip === 'share'" class="tooltip">分享</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tooltip = ref('');

function showTooltip(iconType) {
  tooltip.value = iconType;
}

function hideTooltip() {
  tooltip.value = '';
}

// 分享功能
function shareContent() {
  // 如果浏览器支持 Web Share API
  if (navigator.share) {
    navigator.share({
      title: '七夕鹊桥相会',
      text: '欣赏牛郎织女鹊桥相会的浪漫场景',
      url: window.location.href
    }).catch(console.error);
  } else {
    // 否则复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  }
}
</script>

<style scoped>
.nav-icons {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  outline: none;
}

.nav-icon:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.75);
}
</style>