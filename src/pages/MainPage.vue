<template>
  <el-container>
    <el-main>
      <el-tabs v-model="activeTab" :before-leave="changeExperiment">
        <el-tab-pane name="GlyphIntroduction">
          <span slot="label" class="navigation">图形介绍</span>
          <GlyphIntroduction/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentBIntroduction">
          <span slot="label" class="navigation">实验一介绍</span>
          <ExperimentBIntroduction/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentB">
          <span slot="label" class="navigation">实验一</span>
          <ExperimentB :child-experiment-num="1"/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentCIntroduction">
          <span slot="label" class="navigation">实验二介绍</span>
          实验二介绍
        </el-tab-pane>
        <el-tab-pane name="ExperimentC">
          <span slot="label" class="navigation">实验二</span>
          <ExperimentC/>
        </el-tab-pane>
        <el-tab-pane name="Test">
          <span slot="label" class="navigation">测试</span>
          <Test/>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import ExperimentB from "@/pages/ExperimentB";
import Test from "@/pages/Test";
import ExperimentC from "@/pages/ExperimentC";
import GlyphIntroduction from "@/pages/GlyphIntroduction";
import ExperimentBIntroduction from "@/pages/ExperimentBIntroduction";

export default {
  name: "MainPage",
  components: {ExperimentBIntroduction, GlyphIntroduction, ExperimentC, Test, ExperimentB},
  data() {
    return {
      activeTab: 'GlyphIntroduction'
    };
  },
  mounted() {
    this.updateTime(this.activeTab);
  },
  methods: {
    updateTime(experiment) {
      switch (experiment) {
        case 'ExperimentB':
          this.$bus.$emit('saveBStartTime');
          break;
        case 'ExperimentC':
          break;
      }
    },
    changeExperiment(newVal, oldVal) {
      this.updateTime(newVal);
      return true;
    }
  }
}
</script>

<style scoped>
#el-tabs_header {
  font-family: "Gotham", "Arial", "Microsoft YaHei", sans-serif;
  font-size: x-large;
}
</style>