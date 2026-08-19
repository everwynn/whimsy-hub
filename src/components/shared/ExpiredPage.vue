<template>
  <div class="expired-page">
    <div class="expired-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4"/>
        <path d="M12 16h.01"/>
      </svg>
    </div>
    <h1 class="expired-title">链接已过期</h1>
    <p class="expired-desc">这条分享链接已超过有效期限，无法继续访问。</p>
    <p class="expired-hint">请让分享者重新生成链接</p>
    <a :href="withBase('/')" class="expired-home-btn">返回首页</a>
  </div>
</template>

<script setup>
import { withBase } from '../../utils/baseUrl';
</script>

<style scoped>
.expired-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0a0a1a;
  color: rgba(255, 255, 255, 0.7);
  z-index: 10000;
  text-align: center;
  padding: 2rem;
}

.expired-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.expired-icon svg {
  color: rgba(255, 255, 255, 0.4);
}

.expired-title {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem;
}

.expired-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 0.5rem;
  line-height: 1.6;
}

.expired-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 2rem;
}

.expired-home-btn {
  display: inline-block;
  padding: 0.6rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.expired-home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.9);
}
</style>
