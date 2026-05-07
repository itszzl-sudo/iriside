<template>
  <div class="ast-node" :style="{ paddingLeft: depth * 20 + 'px' }">
    <div class="node-header" @click="toggle">
      <span class="toggle">{{ expanded ? '▼' : '▶' }}</span>
      <span class="node-type">{{ node.type }}</span>
      <span v-if="node.name" class="node-name">{{ node.name }}</span>
      <span class="node-position">[{{ node.position.row }}, {{ node.position.column }}]</span>
    </div>
    <div v-if="expanded && node.children && node.children.length > 0" class="node-children">
      <ASTNode 
        v-for="(child, index) in node.children" 
        :key="index"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ASTNode',
  props: {
    node: Object,
    depth: Number
  },
  setup() {
    const expanded = ref(false);

    const toggle = () => {
      expanded.value = !expanded.value;
    };

    return {
      expanded,
      toggle
    };
  }
};
</script>

<style scoped>
.ast-node {
  margin: 2px 0;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
}

.node-header:hover {
  background: #2d2d30;
}

.toggle {
  width: 12px;
  font-size: 10px;
  color: #858585;
}

.node-type {
  color: #569cd6;
}

.node-name {
  color: #ce9178;
}

.node-position {
  color: #858585;
  font-size: 11px;
}

.node-children {
  border-left: 1px solid #3c3c3c;
  margin-left: 8px;
}
</style>
