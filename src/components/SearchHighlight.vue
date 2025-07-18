<template>
  <span v-html="highlightedText"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  keyword: string
  caseSensitive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  caseSensitive: false
})

const highlightedText = computed(() => {
  if (!props.keyword || !props.text) {
    return props.text
  }

  const flags = props.caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`(${escapeRegExp(props.keyword)})`, flags)
  
  return props.text.replace(regex, '<mark class="search-highlight">$1</mark>')
})

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.search-highlight {
  background-color: #ffd04b;
  color: #000;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}
</style> 