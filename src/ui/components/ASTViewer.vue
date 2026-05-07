<template>
  <div class="ast-viewer">
    <div class="ast-header">
      <h3>AST树结构</h3>
      <button @click="$emit('close')">×</button>
    </div>
    <div class="ast-content">
      <div v-if="astData" class="ast-tree">
        <ASTNode 
          v-for="(node, index) in nodes" 
          :key="index"
          :node="node"
          :depth="0"
        />
      </div>
      <div v-else class="empty">
        无AST数据
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import ASTNode from './ASTNode.vue';

export default {
  name: 'ASTViewer',
  components: {
    ASTNode
  },
  props: {
    astData: Object
  },
  emits: ['close'],
  setup(props) {
    const nodes = computed(() => {
      if (!props.astData || !props.astData.symbols) {
        return [];
      }
      
      return props.astData.symbols.map(symbol => ({
        type: symbol.type || symbol.symbol_type,
        name: symbol.name || symbol.symbol_name,
        position: symbol.startPosition || { row: symbol.start_row, column: symbol.start_column },
        children: []
      }));
    });

    return {
      nodes
    };
  }
};
</script>

<style scoped>
.ast-viewer {
  position: absolute;
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
  background: #252526;
  border-left: 1px solid #3c3c3c;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.ast-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3c3c3c;
}

.ast-header h3 {
  font-size: 14px;
  font-weight: 500;
}

.ast-header button {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #858585;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.ast-header button:hover {
  background: #3c3c3c;
  color: #d4d4d4;
}

.ast-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ast-tree {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.empty {
  text-align: center;
  color: #858585;
  padding: 20px;
}
</style>
