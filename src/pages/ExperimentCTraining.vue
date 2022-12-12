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
      circleNum: [10, 40],
      experimentType: [],
      curActive: 0,
      randomBegin: 1,
      showGlyph: {
        glyph: 2,
        circleNum: 10,
        regionNum: 10,
        isDemo: true,
        active: 0,
      },
      curExperiment: {},
    }
  },
  created() {
    // 初始化实验数据
    this.initialExperiment();
    // 随机以一种glyph开始
    this.randomBegin = Math.random() > 0.5 ? 1 : 2;
    this.$set(this.showGlyph, 'glyph', this.randomBegin);
    // 随机选择一个实验显示
    this.randomChooseExperiment(this.showGlyph.glyph);
  },
  mounted() {
    // 下一步的时候更新数据
    this.$bus.$on('nextSmallExperimentCTrainingPage', () => {
      if (this.curActive < this.childExperimentNum * this.glyphType.length * this.circleNum.length - 1) {
        this.curActive++;
        if (this.curActive === this.childExperimentNum * this.circleNum.length) {
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
    initialExperiment() {
      // 先判断experiment是不是空，不是空的要置空再push
      let tmp = [];
      this.glyphType.forEach((glyph, index) => {
        this.circleNum.forEach((type, i) => {
          let e = {
            // glyph类型
            glyph: glyph,
            // 实验类型 20 40
            child_experiment: type,
            // 该组实验最大数量
            max_num: this.childExperimentNum,
            // 当前已经进行了几次
            cur_num: 0
          }
          tmp.push(e);
        });
      });
      this.experimentType = tmp;
    },
    randomChooseExperiment(glyph) {
      if (this.experimentType.length) {
        let childExperiment = this.experimentType.filter((item) => {
          return item.glyph === glyph && item.cur_num < item.max_num;
        });
        // 说明这个glyph的实验已经全部完成该切换下一个glyph的实验
        if (childExperiment.length === 0) {
          let nextGlyph = glyph === 1 ? 2 : 1;
          this.$set(this.showGlyph, 'glyph', nextGlyph);
          let nextExperiment = this.experimentType.filter((item) => {
            return item.glyph === nextGlyph && item.cur_num < item.max_num;
          });
          let index = Math.floor(Math.random() * nextExperiment.length);
          this.curExperiment = nextExperiment[index];
          // 将选中的实验的index加一
          nextExperiment[index].cur_num++;
          this.$set(this.showGlyph, 'circleNum', this.curExperiment.child_experiment);
        } else {
          let index = Math.floor(Math.random() * childExperiment.length);
          this.curExperiment = childExperiment[index];
          // 将选中的实验的index加一
          childExperiment[index].cur_num++;
          this.$set(this.showGlyph, 'circleNum', this.curExperiment.child_experiment);
        }
      }
    },
    resetCurrent() {
      this.$bus.$emit('resetCurrentExperimentC');
    },
    resetTraining() {
      // 初始化实验数据
      this.initialExperiment();
      this.curActive = 0;
    }
  },
  watch: {
    curActive: {
      immediate: false,
      handler(newVal) {
        if (newVal === 0) {
          this.randomBegin = Math.random() > 0.5 ? 1 : 2;
          this.$set(this.showGlyph, 'glyph', this.randomBegin);
        }
        // 随机选择一个实验显示
        this.randomChooseExperiment(this.showGlyph.glyph);
        this.$set(this.showGlyph, 'active', newVal);
      }
    }
  },
  computed: {
    descriptionCondition() {
      return {
        experiment: -3,
        glyph: this.showGlyph.glyph,
        value: 2,
        max: this.showGlyph.circleNum
      };
    },
    taskCondition() {
      return {
        experiment: -3,
        isDemo: this.showGlyph.isDemo,
        active: this.curActive,
        singleExperiment: this.childExperimentNum * this.circleNum.length,
        data: '',
        // 每个单位编码的值
        circleValue: 0
      }
    },
    isEnd() {
      return this.curActive === this.childExperimentNum * this.glyphType.length * this.circleNum.length - 1;
    }
  },
}
</script>

<style scoped>

</style>