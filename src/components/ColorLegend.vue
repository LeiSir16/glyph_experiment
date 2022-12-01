<template>
  <div style="padding-bottom: 10px">
    <ColorItem v-for="item in colorLegend" :key="item.id" :colorName="item"/>
  </div>
</template>

<script>
import ColorItem from "@/components/ColorItem";

export default {
  name: "ColorLegend",
  components: {ColorItem},
  data() {
    return {
      colorLegend: this.$store.state.ssiColorEncoding,
    };
  },
  mounted() {
    // console.log(this.colorLegend)
  }
}
</script>

<style scoped>
</style>