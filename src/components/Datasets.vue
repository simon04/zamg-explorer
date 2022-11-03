<template>
  <h2>{{ props.datasets.length }} Datasets</h2>
  <table class="table">
    <tr v-for="[dataset, k] in datasets">
      <th>
        {{ dataset }}
        <template v-if="dataset.startsWith('/station/historical')">
          <a
            class="ms-2 btn btn-sm btn-outline-secondary"
            :href="href(dataset, 'stations')"
          >
            Stationen
          </a>
          <a
            class="ms-2 btn btn-sm btn-outline-secondary"
            :href="href(dataset, 'parameters')"
          >
            Parameter
          </a>
        </template>
      </th>
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

function href(key: string, page: string): string {
  const dataset = key.slice("/station/historical/".length);
  return `/${dataset}/${page}/`;
}
</script>
