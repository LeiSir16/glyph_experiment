<template>
  <el-container>
    <el-main>
      <el-row class="summary" style="margin-top: 30px">
        <el-col :span="10" :offset="2">
          <el-image
              style="width: 600px; height: auto"
              :src="peaGlyph"
              fit="cover">
          </el-image>
        </el-col>
        <el-col :span="10">
          <el-image
              style="width: 600px; height: auto"
              :src="stripeGlyph"
              fit="cover">
          </el-image>
        </el-col>
      </el-row>
      <el-row class="summary summary_text">
        <el-col :span="10" :offset="2">
          PeaGlyph
        </el-col>
        <el-col :span="10">
          StripeGlyph
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "GlyphIntroduction",
  data() {
    return {
      peaGlyph: require('@/assets/images/peaGlyph.png'),
      stripeGlyph: require('@/assets/images/stripeGlyph.png'),
    };
  }
}
</script>

<style scoped>
.summary {
  text-align: center;
}

.summary_text {
  font-family: "Gotham Black", "Arial", "Microsoft YaHei", sans-serif;
  font-size: x-large;
  margin-top: 20px;
}
</style>