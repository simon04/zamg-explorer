<template>
  <h2>Datasets</h2>
  <p>
    Quelle: {{ url }}, <a href="https://data.hub.zamg.ac.at/">ZAMG Data Hub</a>,
    <a href="https://opendefinition.org/licenses/cc-by/">CC BY</a>
  </p>
  <table class="table">
    <tr v-for="[dataset, k] in datasets">
      <th>{{ dataset }}</th>
      <td>{{ k.type }}</td>
      <td>{{ k.mode }}</td>
      <td>{{ k.response_formats.join(", ") }}</td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import type { Dataset } from "./openapi";
const url = "https://dataset.api.hub.zamg.ac.at/v1/datasets";
const response = await fetch(url);
const record: Record<string, Dataset> = await response.json();
const datasets = Object.entries(record);
datasets.sort(([d1], [d2]) => d1.localeCompare(d2));
</script>
