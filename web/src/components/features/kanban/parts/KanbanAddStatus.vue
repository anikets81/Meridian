<template>
  <div class="shrink-0 flex flex-col h-full min-h-0 w-[85vw] max-w-[340px] min-w-[272px] sm:w-80 lg:w-72">
    <div class="w-full flex flex-col gap-3">
      <UInput
        v-model="statusName"
        :placeholder="t('kanban.addColumn')"
        icon="i-lucide-plus"
        size="xl"
        variant="soft"
        class="w-full max-w-[340px] min-w-[272px]"
      />

      <UButton
        v-if="statusName.trim()"
        @click="addStatus"
      >
        {{ t('kanban.addColumn') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GoalItem } from 'taskview-api'
import { useKanbanStore } from '@/stores/kanban.store'

const props = defineProps<{ goalId: GoalItem['id'] }>()

const { t } = useI18n()
const kanbanStore = useKanbanStore()
const statusName = ref('')

async function addStatus() {
  await kanbanStore.addStatus({ goalId: props.goalId, name: statusName.value })
  statusName.value = ''
}
</script>
