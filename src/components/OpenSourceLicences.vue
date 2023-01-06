<template>
  <ul class="list-inline">
    <li v-for="d in dependencies" :key="d.name" class="list-inline-item">
      <a :href="'https://www.npmjs.com/package/' + d.name + '/v/' + d.version" target="_blank" rel="external noopener">
        {{ d.name }}
      </a>
      {{ d.version }}
      <span v-if="d.license"> ({{ d.license }})</span>
    </li>
  </ul>
</template>


<script async setup lang="ts">
import { ref } from 'vue';
const dependencies = ref(JSON.parse(import.meta.env.VUE_APP_DEPENDENCIES) as {
  license: string;
  name: string;
  version: string;
}[])
</script>
