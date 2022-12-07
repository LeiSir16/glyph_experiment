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
    <el-col :span="19" :offset="experiment === 2 ? 0 : 1">
      {{ encodingName }}<span class="under_line max_des" v-show="experiment === 2">    (最大为{{ showMax }})</span>
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
  props: ['colorName', 'experiment'],
  mounted() {
  },
  computed: {
    encodingName() {
      let chineseName = '';
      if (this.experiment === 1) {
        chineseName = this.$store.state.ssiColorName;
      } else {
        // 2
        chineseName = this.$store.state.qinlingColorName;
      }
      let englishName = this.colorName.name;
      return chineseName[englishName];
    },
    showMax() {
      let show = '';
      if (this.experiment === 2) {
        let qinlingMax = this.$store.state.qinlingDataMax;
        let englishName = this.colorName.name;
        let value = 0;
        // 小数转化为百分比
        if (englishName === 'sw_40' || englishName === 'sw_200') {
          value = qinlingMax[englishName].max * 100;
        } else {
          value = qinlingMax[englishName].max;
        }
        show = value.toFixed(2) + qinlingMax[englishName].units;
      }

      return show;
    }
  },
}
</script>

<style scoped>
.max_des {
  font-size: small;
}
</style>