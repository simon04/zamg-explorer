<template>
  <footer class="mt-5 mb-3">
    Quelle: {{ props.url }},
    <a href="https://data.hub.geosphere.at/">GeoSphere Austria Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </footer>
</template>

<script setup lang="ts">
const props = defineProps<{ url: string }>();
</script>
