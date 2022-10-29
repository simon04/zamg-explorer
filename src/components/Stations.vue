<template>
  <h2>{{ props.stations.length }} Stationen</h2>
  <div class="input-group mb-3">
    <span class="input-group-text">Suche</span>
    <input type="text" class="form-control" v-model="filter" />
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
      <tr v-for="station in stations" v-show="matchesFilter(station)">
        <td class="font-monospace">{{ station.id }}</td>
        <th>
          <a :href="data(station)">{{ station.name }}</a>
        </th>
        <td>{{ station.state }}</td>
        <td class="text-end">{{ station.altitude }}&thinsp;m&thinsp;ü.A.</td>
        <td>
          <a :href="osm(station)">osm</a> <a :href="geo(station)">geo:</a>
        </td>
        <td class="font-monospace">
          {{ station.valid_from.slice(0, "2006-01-02".length) }}
        </td>
        <td class="font-monospace">
          {{ station.valid_to.slice(0, "2006-01-02".length) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import type { StationMetadata } from "./openapi";

const props = defineProps<{
  stations: StationMetadata[];
}>();

const filter = ref("");
function matchesFilter(station: StationMetadata) {
  return new RegExp(filter.value, "i").test(Object.values(station).join());
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
  props.stations.sort((s1, s2) => {
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

function data(station: StationMetadata) {
  return `/station/?station=${station.id}&parameter=TL&parameter=RR`;
}
function geo(station: StationMetadata) {
  return `geo:${station.lon},${station.lat},${station.altitude}`;
}
function osm(station: StationMetadata) {
  return `https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lon}`;
}
</script>
