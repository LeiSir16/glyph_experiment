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
          <el-row>
            <el-col :span="2" :offset="9" v-show="isEnd">
              <el-button type="primary" icon="el-icon-refresh-left" @click="resetTraining">重新练习</el-button>
            </el-col>
            <el-col :span="2" :offset="isEnd ? 2 : 11">
              <el-button icon="el-icon-refresh-left" @click="resetCurrent">重置实验</el-button>
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
              <el-col :span="23" :offset="1">
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
              <el-col :span="24">
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
                <Task :task-condition="taskCondition"/>
              </el-col>
            </el-row>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import Task from "@/components/Task";
import Description from "@/components/Description";
import ColorLegend from "@/components/ColorLegend";
import QinlingMap from "@/components/QinlingMap";
import {getCurrentTime, saveAsJson} from "@/assets/js/tool";

export default {
  name: "ExperimentCTraining",
  components: {QinlingMap, Task, Description, ColorLegend},
  data() {
    return {
      childExperimentNum: 1,
      glyphType: [1, 2],
      experimentType: [],
      curActive: 0,
      randomBegin: 1,
      showGlyph: {
        glyph: 2,
        regionNum: 10,
        isDemo: true,
        active: 0,
      },
      curExperiment: {},
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
    // 随机以一种glyph开始
    this.randomBegin = Math.random() > 0.5 ? 1 : 2;
    this.$set(this.showGlyph, 'glyph', this.randomBegin);
    if (this.showGlyph.glyph === 1) {
      this.curExperiment = this.experimentType[0];
    } else {
      this.curExperiment = this.experimentType[1];
    }
  },
  mounted() {
    // 下一步的时候更新数据
    this.$bus.$on('nextSmallExperimentCTrainingPage', () => {
      if (this.curActive < this.childExperimentNum * this.glyphType.length) {
        this.curActive++;
        if (this.curActive === this.childExperimentNum) {
          let m = this.showGlyph.glyph === 1 ? 'PeaGlyph实验已完成！' : 'StripeGlyph实验已完成!';
          this.$notify({
            title: '提示',
            message: m,
            type: 'success',
            duration: 2000
          });
        }
      } else {
        console.log('没出发');
      }
    });
    // 提交结果只提示保存成功
    this.$bus.$on('experimentCTrainingResultLocal', () => {
      this.$message({
        message: '感谢您的参与，数据已保存成功!',
        type: 'success',
        duration: 1000
      });
    });
    // 保存当前选择的结果这里只提示信息
    this.$bus.$on('saveExperimentCTrainingData', () => {
      this.$bus.$emit('enableNextStepExperimentCTraining');
    });
  },
  methods: {
    isAllComplete() {
      let sum = 0;
      this.experimentType.forEach((item) => {
        sum += item.cur_num;
      });
      console.log(this.experimentType)
      console.log(sum)
      return sum >= this.childExperimentNum * this.glyphType.length - 1;
    },
    resetCurrent() {
      this.$bus.$emit('resetCurrentExperimentC');
    },
    resetTraining() {
      this.curActive = 0;
      this.randomBegin = Math.random() > 0.5 ? 1 : 2;
      this.$set(this.showGlyph, 'glyph', this.randomBegin);
      if (this.showGlyph.glyph === 1) {
        this.curExperiment = this.experimentType[0];
      } else {
        this.curExperiment = this.experimentType[1];
      }
      this.$set(this.experimentType[0], 'cur_num', 0);
      this.$set(this.experimentType[1], 'cur_num', 0);
      console.log(this.experimentType)
    }
  },
  watch: {
    curActive: {
      immediate: false,
      handler(newVal) {
        if (this.showGlyph.glyph === 1) {
          this.curExperiment = this.experimentType[0];
        } else {
          this.curExperiment = this.experimentType[1];
        }
        if (this.curExperiment.cur_num < this.curExperiment.max_num - 1) {
          // 需要切换glyph
          this.$set(this.showGlyph, 'active', newVal);
        } else {
          let nextGlyphType = this.curExperiment.glyph === 1 ? 2 : 1;
          this.$set(this.showGlyph, 'active', newVal);
          this.$set(this.showGlyph, 'glyph', nextGlyphType);
        }
        for (let i = 0; i < this.experimentType.length; i++) {
          if (this.experimentType[i].glyph === this.curExperiment.glyph) {
            let tmp = this.experimentType[i].cur_num + 1;
            this.$set(this.experimentType[i], 'cur_num', tmp);
            break;
          }
        }
      }
    }
  },
  computed: {
    descriptionCondition() {
      return {
        experiment: -3,
        glyph: this.showGlyph.glyph,
        value: 2,
        max: 40
      };
    },
    taskCondition() {
      return {
        experiment: -3,
        isDemo: this.showGlyph.isDemo,
        active: this.curActive,
        singleExperiment: this.childExperimentNum,
        data: '',
        // 每个单位编码的值
        circleValue: 0
      }
    },
    isEnd() {
      return this.curActive === this.childExperimentNum * this.glyphType.length - 1;
    }
  },
}
</script>

<style scoped>

</style>