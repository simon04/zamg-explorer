<template>
  <h2>{{ props.datasets.length }} Datasets</h2>
  <table class="table">
    <tr v-for="[dataset, k] in datasets">
      <th v-if="dataset.includes('tawes-v1-10min')">
        <a href="/stations/">{{ dataset }}</a>
      </th>
      <th v-else>{{ dataset }}</th>
      <td>{{ k.type }}</td>
      <td>{{ k.mode }}</td>
      <td>{{ k.response_formats.join(", ") }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import type { Dataset } from "./openapi";
const props = defineProps<{
  datasets: [string, Dataset][];
}>();
</script>
