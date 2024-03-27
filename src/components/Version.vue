<template>
  <p>
    Version:
    <time :datetime="buildDate">{{ buildDate }}</time
    >,
    <a :href="href">
      <code>{{ buildVersion }}</code>
    </a>
  </p>
</template>

<script async setup lang="ts">
const buildDate = import.meta.env.VUE_APP_BUILD_DATE;
const buildVersion = import.meta.env.VUE_APP_BUILD_VERSION;
const href = `https://github.com/simon04/zamg-explorer/commit/${buildVersion}`;
</script>
