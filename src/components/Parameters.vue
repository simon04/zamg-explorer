<template>
  <h2>Parameters</h2>
  <table class="table">
    <tr>
      <th>Name</th>
      <th>Bezeichnung</th>
      <th>Einheit</th>
      <th>Beschreibung</th>
    </tr>
    <ParameterRow v-for="parameter in parameters" :parameter="parameter" />
  </table>
  <SourceFooter :url="url" />
</template>

<script setup lang="ts">
import { API, ParameterMetadataModel } from "./openapi";
import ParameterRow from "./ParameterRow.vue";
import SourceFooter from "./SourceFooter.vue";
const url = API + "/station/current/tawes-v1-10min/metadata";
const response = await fetch(url);
const { parameters }: { parameters: ParameterMetadataModel[] } =
  await response.json();
</script>
