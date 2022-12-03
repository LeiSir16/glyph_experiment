<template>
  <el-container>
    <el-main>
      <el-row style="text-align: center">
        <el-col :span="24">
          <el-image
              style="width: 1400px; height: auto"
              :src="curUrl"
              :preview-src-list="urls"
              fit="cover">
          </el-image>
        </el-col>
      </el-row>
      <el-row style="text-align: center">
        <el-col :span="24">
          <el-button type="warning" class="text" @click="nextStep">下一个<i
              class="el-icon-arrow-right el-icon--right"></i></el-button>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "ExperimentBIntroduction",
  data() {
    return {
      urls: [require('@/assets/images/peaglyph_intro.png'), require('@/assets/images/stripeGlyph_intro.png')],
      curUrl: '',
      curIndex: 0,
    };
  },
  methods: {
    nextStep() {
      if (this.curIndex < this.urls.length - 1) {
        this.curIndex++;
      } else {
        this.curIndex = 0;
      }
    }
  },
  mounted() {

  },
  watch: {
    curIndex: {
      immediate: true,
      handler(newVal, oldVal) {
        this.curUrl = this.urls[newVal];
      }
    }
  }
}
</script>

<style scoped>

</style>