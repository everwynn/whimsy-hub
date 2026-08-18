<template>
  <div class="action-icons">
    <!-- 暂停/播放图标 -->
    <div class="icon-wrapper">
      <button @click="onTogglePlay" class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" v-if="isPlayingValue"/>
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" v-else/>
        </svg>
      </button>
    </div>

    <!-- 重播图标 -->
    <div class="icon-wrapper">
      <button @click="onReplay" class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4l4-4 4 4H6c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isPlayingValue: {
    type: Boolean,
    default: false
  },
  onTogglePlay: {
    type: Function,
    default: () => {}
  },
  onReplay: {
    type: Function,
    default: () => {}
  }
});
</script>

<style scoped>
.action-icons {
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
</style>