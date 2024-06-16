<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import type { CSSProperties } from 'vue';
import { useLeadsStore } from '../stores/LeadsStore';
import { Leads } from '../types/leads';
import { Badge } from 'ant-design-vue';

const leadsStore = useLeadsStore();
const { fetchLeads } = leadsStore;

const contentStyle: CSSProperties = {
  fontFamily: 'Roboto'
};

const columns = [
  {
    title: 'Название',
    dataIndex: 'name',
    sorter: (a: Leads, b: Leads) => a.name.localeCompare(b.name),
  },
  {
    title: 'Бюджет',
    dataIndex: 'price',
    sorter: (a: Leads, b: Leads) => Number(a.price) - Number(b.price),
  },
  {
    title: 'Статус',
    dataIndex: 'status_id',
    customRender: ({ text }: { text: string }) => {
      const statusInfo = leadsStore.statuses[text] || { name: 'Неизвестно', color: '#d9d9d9' };
      return h(Badge, { style: { backgroundColor: statusInfo.color, padding: '5px', borderRadius: '5px' } }, {
        default: () => h('span', { style: { borderRadius: '5px' } }, statusInfo.name)
      });
    }
  },
  {
    title: 'Ответственный',
    dataIndex: 'user_id',
    customRender: ({ text }: { text: string }) => {
      const userInfo = leadsStore.users[text] || { name: 'Неизвестно' };
      return userInfo.name;
    }
  },
  {
  title: 'Дата создания',
  dataIndex: 'created_at',
  customRender: ({ text }: { text: string }) => {
    const createdAtTimestamp = parseInt(text);
    return new Date(createdAtTimestamp * 1000).toLocaleDateString();
  },
  sorter: (a: Leads, b: Leads) => Number(a.created_at) - Number(b.created_at),
},

];

const searchQuery = ref('');
const onSearch = async () => {
  if (searchQuery.value.length >= 3) {
    await fetchLeads(searchQuery.value);
  } else if (!searchQuery.value.length) {
    await fetchLeads();
  }
};

const filteredLeads = computed(() => 
  leadsStore.leads.map((item: Leads) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    status_id: item.status_id,
    user_id: item.responsible_user_id,
    created_at: item.created_at,
  }))
);

const loading = computed(() => leadsStore.loading);

onMounted(() => {
  fetchLeads();
});
</script>

<template>
  <div>
    <a-card title="Amo CRM table" :bordered="false">
      <template #extra>
        <a-input-search 
          placeholder="Поиск по названию" 
          v-model:value="searchQuery" 
          @input="onSearch" 
          style="width: 200px;"
        />
      </template>
      <a-table
        :dataSource="filteredLeads"
        :columns="columns"
        :loading="loading"
        :pagination="false"
        :style="contentStyle"
        row-key="id"
      />
    </a-card>
  </div>
</template>