<template>
  <popper trigger="hover" :options="{ placement: 'bottom' }"
          :disabled="!Boolean(link.title)">
    <div class="popper header-popover">{{link.title}}</div>

    <div slot="reference" class="flame-link" :class="link._class">
      <router-link v-if="link.to" :to="link.to">
        <font-awesome-icon v-if="link.icon" :icon="link.icon" fixed-width/>
        <template v-if="link.text">{{link.text}}</template>
      </router-link>
      <a v-else-if="link.href" :href="link.href">
        <font-awesome-icon v-if="link.icon" :icon="link.icon" fixed-width/>
        <template v-if="link.text">{{link.text}}</template>
      </a>
      <a v-else-if="link.on"
           v-on:click="link.on()"
           :style="link.toggleState ? 'color: #2B2;' : ''">
        <font-awesome-icon v-if="link.icon" :icon="link.icon" fixed-width/>
        <template v-if="link.text">{{link.text}}</template>
      </a>
    </div>
  </popper>
</template>

<script>
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';

export default {
  name: 'XHeaderButton',
  components: { Popper },
  props: {
    link: { required: true, type: Object },
  },
};
</script>

<style>

.flame-link {
  font-family: 'Source Sans Pro',sans-serif;
  vertical-align: top;
  border-left: 1px solid #000;
  line-height: 40px;
  text-align: center;
  text-decoration: none;
  padding: 0 8px;
  color: #000;
  border-radius: 0;
  font-size: 20px;
  justify-content: flex-end;
}

.flame-link a {
  text-decoration: none;
  font-family: 'Source Sans Pro',sans-serif;
  cursor: pointer;
}

a {
  color: #000;

}

a:hover {
  color: #2980ff;
}

.header-popover {
  padding: 3px;
  font-size: 13px;
  line-height: 1em;
  border-color: black;
  border-radius: 0;
  box-shadow: 2px 1px 1px rgb(58, 58, 58);
}

.kill-button {
  color: #900;
}

.kill-button:hover {
  background: #900;
}

.kill-button:hover a {
  color: #fff;
}

</style>
