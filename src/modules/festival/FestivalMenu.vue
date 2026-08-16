<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 relative overflow-hidden">
    <!-- 星光背景 -->
    <div class="fixed inset-0 starfield pointer-events-none" />

    <!-- 顶部装饰光晕 -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
         style="background: radial-gradient(ellipse, #e11d48, transparent);" />

    <!-- 主内容 -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
      <!-- 标题区 -->
      <header class="text-center mb-16">
        <h1 class="text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-wider">
          <span class="gradient-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-400">Whimsy Hub</span>
        </h1>
        <p class="text-lg md:text-xl text-rose-200/60 font-serif tracking-widest">
          奇思妙想中心 · 互动祝福体验
        </p>
        <div class="mt-6 w-32 h-px mx-auto bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
      </header>

      <!-- 节日菜单 -->
      <section class="mb-12">
        <h2 class="text-center text-2xl md:text-3xl font-serif text-white/90 mb-10 tracking-wide">
          选择你的节日祝福
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="festival in festivals"
            :key="festival.id"
            :class="[
              'ancient-card p-6 cursor-pointer transition-all duration-500 group',
              festival.active
                ? 'hover:scale-105 hover:shadow-2xl'
                : 'opacity-50 cursor-not-allowed'
            ]"
            @click="handleClick(festival)"
          >
            <!-- 节日图标 -->
            <div class="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
              {{ festival.icon }}
            </div>

            <!-- 节日名称 -->
            <h3 class="text-xl font-serif font-bold text-white mb-1">
              {{ festival.name }}
            </h3>
            <p class="text-sm text-white/50 mb-2">{{ festival.alias }}</p>
            <p class="text-xs text-white/30 mb-3">{{ festival.lunarDate }}</p>

            <!-- 描述 -->
            <p class="text-sm text-white/60 leading-relaxed mb-4">
              {{ festival.description }}
            </p>

            <!-- 底部标签 -->
            <div class="flex items-center justify-between">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :style="{
                  background: festival.active
                    ? `linear-gradient(135deg, ${festival.gradientFrom}33, ${festival.gradientTo}33)`
                    : 'rgba(255,255,255,0.05)',
                  color: festival.active ? festival.gradientTo : 'rgba(255,255,255,0.3)'
                }"
              >
                {{ festival.flower }}
              </span>
              <span v-if="!festival.active" class="text-xs text-white/30 italic">
                敬请期待
              </span>
              <span v-else class="text-xs text-rose-300/80 group-hover:text-rose-300 transition-colors">
                开始体验 →
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="text-center text-white/20 text-sm py-8">
        <p>Whimsy Hub &copy; {{ new Date().getFullYear() }} · 用心传递每一份祝福</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import festivalsData from '../../data/festivals.json';

interface Festival {
  id: string;
  name: string;
  alias: string;
  lunarDate: string;
  description: string;
  flower: string;
  themeColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  active: boolean;
}

const festivals: Festival[] = festivalsData as Festival[];

function handleClick(festival: Festival) {
  if (!festival.active) return;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  window.location.href = `${base}blessing/${festival.id}`;
}
</script>
