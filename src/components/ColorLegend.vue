<template>
  <div style="padding-bottom: 10px">
    <ColorItem v-for="item in colorLegend" :key="item.id" :colorName="item" :experiment="experiment"/>
  </div>
</template>

<script>
import ColorItem from "@/components/ColorItem";

export default {
  name: "ColorLegend",
  components: {ColorItem},
  props: ['experiment'],
  data() {
    return {
      // colorLegend: this.$store.state.ssiColorEncoding,
    };
  },
  mounted() {
    // console.log(this.colorLegend)
  },
  computed: {
    colorLegend() {
      if (this.experiment === 1) {
        return this.$store.state.ssiColorEncoding;
      } else {
        return this.$store.state.qinlingColorEncoding;
      }
    }
  }
}
</script>

<style scoped>
</style>