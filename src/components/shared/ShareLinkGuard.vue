<template>
  <div class="guard-root">
    <!-- 星空背景（始终显示） -->
    <div class="bg-stars" aria-hidden="true">
      <span v-for="i in 80" :key="'star-'+i" class="star" :style="cachedStarStyles[i - 1]"></span>
    </div>

    <!-- 链接已过期 → 只显示星空 + 优雅提示 -->
    <div v-if="isExpired" class="expired-overlay">
      <h1 class="expired-title">{{ titleText }}</h1>
      <p class="expired-desc">{{ descText }}</p>
      <p class="expired-hint">{{ hintText }}</p>
    </div>

    <!-- 链接有效 → 渲染子组件 -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { decodeRoseSharePayload, decodeSharePayload } from '../../utils/shareCodec';
import { isSharePayloadExpired } from '../../utils/shareConfig';

const props = defineProps<{
  /** 页面类型：'rose' 或 'blessing' */
  pageType: 'rose' | 'blessing';
}>();

const isExpired = ref(false);
const titleText = ref('');
const descText = ref('');
const hintText = ref('');

// 预计算星空样式（避免 re-render 时重新随机）
const cachedStarStyles = shallowRef(Array.from({ length: 80 }, () => {
  const size = 0.5 + Math.random() * 2.5;
  return {
    width: `${size}px`, height: `${size}px`,
    left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  };
}));

// 在 setup 阶段检测分享链接是否过期
(function checkExpiry() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');
  if (!encoded) return; // 非分享模式，不过期

  let ts: number | undefined;
  if (props.pageType === 'rose') {
    const payload = decodeRoseSharePayload(encoded);
    ts = payload?.ts;
  } else {
    const payload = decodeSharePayload(encoded);
    ts = payload?.ts;
  }

  if (isSharePayloadExpired(ts)) {
    isExpired.value = true;
    // 根据页面类型设置优雅的文案
    if (props.pageType === 'rose') {
      titleText.value = '花期有时，芬芳无尽';
      descText.value = '这条玫瑰绽放的分享链接已超过有效期限';
      hintText.value = '请让分享者重新为你送上一朵玫瑰';
    } else {
      titleText.value = '鹊桥有期，情意绵长';
      descText.value = '这条七夕祝福的分享链接已超过有效期限';
      hintText.value = '请让分享者重新为你送上一份祝福';
    }
  }
})();
</script>

<style scoped>
.guard-root {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0e0828 40%, #080418 80%, #03020a 100%);
  overflow: hidden;
}

.bg-stars {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.expired-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 300;
  letter-spacing: 6px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 1.2rem;
}

.expired-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 0.6rem;
  line-height: 1.8;
  letter-spacing: 1px;
}

.expired-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
  letter-spacing: 1px;
}
</style>
