<template>
  <el-row type="flex" align="middle" class="text">
    <el-col :span="4">
      <svg :width="svgSize" :height="svgSize">
        <circle :r="svgSize/2-outlineThickness/2"
                :cx="svgSize/2"
                :cy="svgSize/2"
                :fill="colorName.color"
                stroke="#000000"
                :stroke-width="outlineThickness"></circle>
      </svg>
    </el-col>
    <el-col :span="18" :offset="1">
      {{ encodingName }}
    </el-col>
  </el-row>
</template>

<script>

export default {
  name: "ColorItem",
  data() {
    return {
      svgSize: 20,
      outlineThickness: 1
    };
  },
  props: ['colorName'],
  mounted() {
  },
  computed: {
    encodingName() {
      let chineseName = this.$store.state.ssiColorName;
      let englishName = this.colorName.name;
      return chineseName[englishName];
    }
  },
}
</script>

<style scoped>

</style>