<script setup>
import MarkdownPreview from '@uivjs/vue-markdown-preview';
import '@uivjs/vue-markdown-preview/markdown.css';
import Markdown from 'vue3-markdown-it';
import 'highlight.js/styles/monokai.css';

// Определяем пропс
const props = defineProps({
  mark: {
    type: String,
    required: true,
  }
});


</script>

<template>
  <markdown-preview :source="props.mark" />
</template>

<style>

.markdown-body {
  background-color: #212121 !important;
  color: white !important;
  margin: 0 !important;
  padding: 0 !important;
}
.markdown-body pre tt {
  color: white !important;
}
.markdown-body pre code {
  background-color: #272729 !important;
}

.markdown-body pre .copied {
  background-color: #212121 !important;
}

.markdown-body code[class*="language-"] {
  color: white;
}

.markdown-body pre code {
  background-color: #272729 !important;
}

.token.operator {
  background-color: inherit !important;
  color: inherit !important;
}

.token.keyword {
  color: #2e95d3 !important;
}

.token.string {
  color: #00a67d !important;
}

.token.property{
  color: #df3079 !important;
}

.markdown-body table{
  border-radius: 10px;
  /*background-color: #212121 !important;
  color: red !important;*/
}
.markdown-body table tr{
  background-color: #2f2f2f !important;
}
.markdown-body thead{
  /*background-color: green;*/
}
</style>
