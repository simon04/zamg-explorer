<template>
  <h2>
    <template v-if="params.filter">{{ stations.length }}÷</template
    >{{ props.stations.length }} Stationen
  </h2>
  <div class="input-group mb-3">
    <span class="input-group-text">Suche</span>
    <input type="text" class="form-control" v-model="params.filter" />
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="cursor: pointer" @click="sortBy('id')">ID</th>
        <th style="cursor: pointer" @click="sortBy('name')">Name</th>
        <th style="cursor: pointer" @click="sortBy('state')">Bundesland</th>
        <th style="cursor: pointer" @click="sortBy('altitude')">Höhe</th>
        <th style="cursor: pointer" @click="sortBy('lon')">Lage</th>
        <th style="cursor: pointer" @click="sortBy('valid_from')">Daten von</th>
        <th style="cursor: pointer" @click="sortBy('valid_to')">Daten bis</th>
      </tr>
    </thead>
    <tbody>
      <StationRow
        v-for="station in stations"
        v-show="matchesFilter(station)"
        :dataset="props.dataset"
        :station="station"
      />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { useUrlSearchParams } from "@vueuse/core";
import { ref } from "vue";
import type { StationMetadata } from "./openapi";
import StationRow from "./StationRow.vue";

const props = defineProps<{
  dataset: string;
  stations: StationMetadata[];
}>();

const params = useUrlSearchParams<{ filter: string }>("history");

function matchesFilter(station: StationMetadata) {
  return new RegExp(params.filter, "i").test(Object.values(station).join());
}

const sortKey = ref<keyof StationMetadata>("name");
const sortAscDesc = ref(1);
function sortBy(key: keyof StationMetadata) {
  if (key === sortKey.value) {
    sortAscDesc.value *= -1;
  } else {
    sortKey.value = key;
    sortAscDesc.value = 1;
  }
}

const stations = computed(() =>
  props.stations
    .filter((station) => matchesFilter(station))
    .sort((s1, s2) => {
      const v1 = s1[sortKey.value];
      const v2 = s2[sortKey.value];
      return (
        sortAscDesc.value *
        (typeof v1 === "string" && typeof v2 === "string"
          ? v1.localeCompare(v2)
          : typeof v1 === "number" && typeof v2 === "number"
          ? v1 - v2
          : 0)
      );
    })
);
</script>
