<template>
  <h2>{{ props.parameters.length }} Parameter</h2>
  <table class="table">
    <tr>
      <th>Name</th>
      <th>Bezeichnung</th>
      <th>Einheit</th>
      <th>Beschreibung</th>
    </tr>
    <ParameterRow v-for="parameter in parameters" :parameter="parameter" />
  </table>
</template>

<script setup lang="ts">
import type { ParameterMetadataModel } from "./openapi";
import ParameterRow from "./ParameterRow.vue";
const props = defineProps<{
  parameters: ParameterMetadataModel[];
}>();
</script>
