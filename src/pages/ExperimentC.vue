<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="20">
          <el-row>
            <el-col :span="24">
              <qinling-map :update-data="showGlyph"/>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="4">
          <!--颜色图例部分-->
          <el-row class="B_legend">
            <el-row>
              <el-col :span="24" class="put_center">
                <div class="title color_title">颜色图例</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="18" :offset="6">
                <ColorLegend :experiment="2"/>
              </el-col>
            </el-row>
          </el-row>
          <!-- 详细阐述部分-->
          <el-row class="B_description">
            <el-row>
              <el-col :span="24" class="put_center">
                <div class="title color_title">可视化解释</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="23" :offset="1">
                <Description :des-condition="descriptionCondition"/>
              </el-col>
            </el-row>
          </el-row>
          <!--任务部分-->
          <el-row class="B_task">
            <el-row>
              <el-col :span="24" class="put_center">
                <div class="title color_title">实验任务</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <!--                <Task :task-condition="taskCondition"/>-->
              </el-col>
            </el-row>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
// import qinLingMap from '@/assets/js/qinling'
import Task from "@/components/Task";
import Description from "@/components/Description";
import ColorLegend from "@/components/ColorLegend";
import QinlingMap from "@/components/QinlingMap";

export default {
  name: "ExperimentC",
  components: {QinlingMap, Task, Description, ColorLegend},
  data() {
    return {
      childExperimentNum: 1,
      glyphType: [1, 2],
      experimentType: [],
      curActive: 0,
      showGlyph: {
        glyph: 2,
        regionNum: 9,
        isDemo: true
      }
    }
  },
  created() {
    // 初始化实验数据
    this.glyphType.forEach((glyph, index) => {
      let e = {
        // glyph类型
        glyph: glyph,
        // 该组实验最大数量
        max_num: this.childExperimentNum,
        // 当前已经进行了几次
        cur_num: 0
      }
      this.experimentType.push(e);
    });
  },
  mounted() {

  },
  computed: {
    descriptionCondition() {
      return {
        experiment: 3,
        glyph: this.showGlyph.glyph,
        value: 2,
        max: 10
      };
    }
  },
}
</script>

<style scoped>

</style>