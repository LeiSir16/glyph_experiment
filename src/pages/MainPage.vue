<template>
  <el-container>
    <el-main>
      <el-tabs v-model="activeTab" :before-leave="changeExperiment">
        <el-tab-pane name="ExperimentBGlyphIntroduction">
          <span slot="label" class="navigation">实验一(可视化介绍)</span>
          <GlyphIntroduction/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentBTraining">
          <span slot="label" class="navigation">实验一(实验练习)</span>
          <ExperimentBTraining :child-experiment-num="1"/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentB">
          <span slot="label" class="navigation">实验一(正式实验)</span>
          <ExperimentB :child-experiment-num="1"/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentCTraining">
          <span slot="label" class="navigation">实验二(实验练习)</span>
          <ExperimentCTraining/>
        </el-tab-pane>
        <el-tab-pane name="ExperimentC">
          <span slot="label" class="navigation">实验二(正式实验)</span>
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
import ExperimentBTraining from "@/pages/ExperimentBTraining";
import ExperimentCTraining from "@/pages/ExperimentCTraining";

export default {
  name: "MainPage",
  components: {
    ExperimentCTraining,
    ExperimentBTraining,
    ExperimentBIntroduction,
    GlyphIntroduction,
    ExperimentC,
    Test,
    ExperimentB
  },
  data() {
    return {
      activeTab: 'ExperimentBGlyphIntroduction'
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
          this.$bus.$emit('saveCStartTime');
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