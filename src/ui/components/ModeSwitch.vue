<template>
  <div class="mode-switch">
    <button 
      :class="['mode-btn', { active: mode === 'vibe' }]"
      @click="$emit('change', 'vibe')"
    >
      Vibe模式
    </button>
    <button 
      :class="['mode-btn', { active: mode === 'spec' }]"
      @click="$emit('change', 'spec')"
    >
      Spec模式
    </button>
  </div>
</template>

<script>
export default {
  name: 'ModeSwitch',
  props: {
    mode: String
  },
  emits: ['change']
};
</script>

<style scoped>
.mode-switch {
  display: flex;
  gap: 8px;
}

.mode-btn {
  padding: 6px 16px;
  border: 1px solid #3c3c3c;
  background: transparent;
  color: #858585;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #007acc;
  border-color: #007acc;
  color: white;
}

.mode-btn:hover:not(.active) {
  background: #2d2d30;
  color: #d4d4d4;
}
</style>
