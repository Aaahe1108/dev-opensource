<template>
  <section class="df" aria-label="发行版筛选">
    <div class="df__filters" role="group" aria-label="按家族筛选">
      <button
        v-for="f in families"
        :key="f"
        class="df__btn"
        :class="{ 'df__btn--on': active === f }"
        type="button"
        @click="active = f"
      >
        {{ f }}
      </button>
    </div>
    <div class="df__grid">
      <article v-for="d in list" :key="d.name" class="df__card">
        <h3 class="df__name">{{ d.name }}</h3>
        <span class="df__tag" :data-f="d.family">{{ d.family }}</span>
        <p class="df__desc">{{ d.desc }}</p>
        <p class="df__meta"><span>首发 {{ d.year }}</span><span>包管理 {{ d.pkg }}</span></p>
      </article>
    </div>
    <p v-if="!list.length" class="df__empty">没有匹配的发行版。</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const families = ['全部', 'Debian', 'Red Hat', 'Arch', '独立']
const active = ref('全部')

const distros = [
  { name: 'Debian', family: 'Debian', desc: '以稳定著称的社区发行版，庞大软件仓库的基石。', year: '1993', pkg: 'apt/dpkg' },
  { name: 'Ubuntu', family: 'Debian', desc: '基于 Debian 的桌面友好发行版，Canonical 支持。', year: '2004', pkg: 'apt/dpkg' },
  { name: 'Linux Mint', family: 'Debian', desc: '基于 Ubuntu，开箱即用的桌面体验。', year: '2006', pkg: 'apt/dpkg' },
  { name: 'RHEL', family: 'Red Hat', desc: '企业级标准，Red Hat 商业支持。', year: '1994', pkg: 'dnf/rpm' },
  { name: 'Fedora', family: 'Red Hat', desc: 'RHEL 上游，拥抱最新技术。', year: '2003', pkg: 'dnf/rpm' },
  { name: 'Rocky Linux', family: 'Red Hat', desc: 'CentOS 继任者之一，社区驱动的 RHEL 克隆。', year: '2021', pkg: 'dnf/rpm' },
  { name: 'AlmaLinux', family: 'Red Hat', desc: 'CentOS 继任者之一，AlmaLinux OS 基金会维护。', year: '2021', pkg: 'dnf/rpm' },
  { name: 'Arch Linux', family: 'Arch', desc: '滚动更新、KISS 哲学、用户自己动手。', year: '2002', pkg: 'pacman' },
  { name: 'Manjaro', family: 'Arch', desc: '基于 Arch 的易用发行版。', year: '2011', pkg: 'pacman' },
  { name: 'Gentoo', family: '独立', desc: '源码编译，高度可定制。', year: '2002', pkg: 'portage' },
  { name: 'openSUSE', family: '独立', desc: 'YaST 配置工具，稳重可靠。', year: '2005', pkg: 'zypper/rpm' },
  { name: 'NixOS', family: '独立', desc: '函数式包管理 Nix，可复现的系统配置。', year: '2003', pkg: 'nix' }
]

const list = computed(() =>
  active.value === '全部' ? distros : distros.filter((d) => d.family === active.value)
)
</script>
