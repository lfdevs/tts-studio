<template>
  <span
    aria-hidden="true"
    class="wave-bars"
    :style="{ height: `${height}px`, color }"
  >
    <span
      v-for="index in bars"
      :key="index"
      class="wave-bars__bar"
      :class="{ 'wave-bars__bar--active': active }"
      :style="{
        animationDelay: `${(index - 1) * 0.12}s`,
        animationDuration: `${0.9 + (index % 3) * 0.18}s`,
      }"
    />
  </span>
</template>

<script lang="ts" setup>
  withDefaults(defineProps<{
    active?: boolean
    bars?: number
    color?: string
    height?: number
  }>(), {
    active: true,
    bars: 5,
    color: 'currentColor',
    height: 20,
  })
</script>

<style scoped>
  .wave-bars {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .wave-bars__bar {
    width: 3px;
    height: 100%;
    border-radius: 2px;
    background: currentColor;
    transform: scaleY(0.28);
  }

  .wave-bars__bar--active {
    animation: wave-bounce 1s ease-in-out infinite;
  }
</style>
