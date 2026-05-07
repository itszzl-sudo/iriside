<template>
  <div class="ast-node" :style="{ paddingLeft: depth * 16 + 'px' }">
    <div class="node-header" @click="toggle">
      <span class="toggle">{{ expanded ? '▼' : '▶' }}</span>
      
      <!-- HTML元素显示 -->
      <template v-if="node.type === 'element'">
        <span class="node-tag">&lt;{{ node.tagName || 'element' }}</span>
        <span v-if="node.name" class="node-id"> #{{ node.name }}</span>
        <span v-if="hasAttributes" class="node-attrs">{{ attrsPreview }}</span>
        <span class="node-tag">&gt;</span>
      </template>
      
      <!-- 其他类型显示 -->
      <template v-else>
        <span class="node-type">{{ node.type }}</span>
        <span v-if="node.name" class="node-name">{{ node.name }}</span>
      </template>
      
      <span class="node-position">[{{ node.position.row }}, {{ node.position.column }}]</span>
    </div>
    
    <!-- 展开显示源码 -->
    <div v-if="expanded" class="node-expanded">
      <div class="node-info">
        <div v-if="node.type === 'element'" class="info-row">
          <span class="info-label">标签:</span>
          <span class="info-value">{{ node.tagName }}</span>
        </div>
        <div v-if="node.name" class="info-row">
          <span class="info-label">ID:</span>
          <span class="info-value">{{ node.name }}</span>
        </div>
        <div v-if="hasAttributes" class="info-row">
          <span class="info-label">属性:</span>
          <div class="attrs-list">
            <div v-for="(value, key) in node.attributes" :key="key" class="attr-item">
              {{ key }} = "{{ value }}"
            </div>
          </div>
        </div>
        <div class="info-row">
          <span class="info-label">位置:</span>
          <span class="info-value">行 {{ node.position.row }} - {{ node.endPosition.row }}</span>
        </div>
      </div>
      
      <div v-if="node.code" class="node-code">
        <div class="code-header">源码:</div>
        <pre class="code-content">{{ node.code }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ASTNode',
  props: {
    node: Object,
    depth: Number,
    sourceCode: String
  },
  setup(props) {
    const expanded = ref(false);

    const toggle = () => {
      expanded.value = !expanded.value;
    };

    const hasAttributes = computed(() => {
      return props.node.attributes && Object.keys(props.node.attributes).length > 0;
    });

    const attrsPreview = computed(() => {
      if (!hasAttributes.value) return '';
      const keys = Object.keys(props.node.attributes);
      if (keys.length <= 2) {
        return ' ' + keys.map(k => `${k}="${props.node.attributes[k]}"`).join(' ');
      }
      return ` ${keys.slice(0, 2).map(k => `${k}="${props.node.attributes[k]}"`).join(' ')} ...`;
    });

    return {
      expanded,
      toggle,
      hasAttributes,
      attrsPreview
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
  gap: 6px;
  padding: 6px 8px;
  border-radius: 3px;
  cursor: pointer;
  flex-wrap: wrap;
}

.node-header:hover {
  background: #2d2d30;
}

.toggle {
  width: 12px;
  font-size: 10px;
  color: #858585;
  flex-shrink: 0;
}

.node-tag {
  color: #569cd6;
  font-weight: 500;
}

.node-id {
  color: #dcdcaa;
  font-weight: 600;
}

.node-attrs {
  color: #9cdcfe;
  font-size: 11px;
}

.node-type {
  color: #4ec9b0;
  font-weight: 500;
}

.node-name {
  color: #ce9178;
}

.node-position {
  color: #858585;
  font-size: 11px;
  margin-left: auto;
}

.node-expanded {
  margin-top: 8px;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 4px;
  border-left: 3px solid #007acc;
}

.node-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  margin-bottom: 6px;
  font-size: 12px;
}

.info-label {
  color: #858585;
  width: 50px;
  flex-shrink: 0;
}

.info-value {
  color: #d4d4d4;
}

.attrs-list {
  flex: 1;
}

.attr-item {
  color: #9cdcfe;
  margin-bottom: 2px;
}

.node-code {
  margin-top: 8px;
}

.code-header {
  color: #858585;
  font-size: 11px;
  margin-bottom: 4px;
}

.code-content {
  background: #252526;
  padding: 8px;
  border-radius: 3px;
  color: #d4d4d4;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
