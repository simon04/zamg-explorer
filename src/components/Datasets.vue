<template>
  <h2>Datasets</h2>
  <table class="table">
    <tr v-for="[dataset, k] in datasets">
      <th>{{ dataset }}</th>
      <td>{{ k.type }}</td>
      <td>{{ k.mode }}</td>
      <td>{{ k.response_formats.join(", ") }}</td>
    </tr>
  </table>
  <SourceFooter :url="url" />
</template>

<script setup lang="ts">
import { API, Dataset } from "./openapi";
import SourceFooter from "./SourceFooter.vue";
const url = API + "/datasets";
const response = await fetch(url);
const record: Record<string, Dataset> = await response.json();
const datasets = Object.entries(record);
datasets.sort(([d1], [d2]) => d1.localeCompare(d2));
</script>
