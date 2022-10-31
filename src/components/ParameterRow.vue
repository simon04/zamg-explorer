<template>
  <tr>
    <slot></slot>
    <th>{{ parameter.name }}</th>
    <td>{{ parameter.long_name }}</td>
    <td>{{ parameter.unit }}</td>
    <td>{{ parameter.desc }}</td>
  </tr>
</template>

<script setup lang="ts">
import type { ParameterMetadataModel } from "./openapi";

defineProps<{
  parameter: ParameterMetadataModel;
}>();
</script>
