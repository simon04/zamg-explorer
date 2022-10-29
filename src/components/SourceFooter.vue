<template>
  <p>
    Quelle: {{ props.url }},
    <a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{ url: string }>();
</script>
