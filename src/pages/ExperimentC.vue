<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="20">
          <el-row>
            <el-col :span="24">
              <qinling-map :update-data="showGlyph" ref="qinlingMap"/>
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
      childExperimentNum: 2,
      glyphType: [1, 2],
      experimentType: [],
      curActive: 0,
      randomBegin: 1,
      showGlyph: {
        glyph: 2,
        regionNum: 10,
        isDemo: false,
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
    this.randomBegin = Math.random() > 0.5 ? 1 : 2;
    this.$set(this.showGlyph, 'glyph', this.randomBegin);
    if (this.showGlyph.glyph === 1) {
      this.curExperiment = this.experimentType[0];
    } else {
      this.curExperiment = this.experimentType[1];
    }
  },
  mounted() {
    // console.log(this.$refs.qinlingMap.allGlyph)
    // console.log(this.experimentType)
    // 下一步的时候更新数据
    this.$bus.$on('nextSmallExperimentCPage', () => {
      if (!this.isAllComplete()) {
        this.curActive++;
      } else {
        console.log('没出发')
      }
    });
  },
  methods: {
    isAllComplete() {
      let sum = 0;
      this.experimentType.forEach((item) => {
        sum += item.cur_num;
      });
      return sum >= this.childExperimentNum * this.glyphType.length - 1;
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
        console.log(this.experimentType)
      }
    }
  },
  computed: {
    descriptionCondition() {
      return {
        experiment: 3,
        glyph: this.showGlyph.glyph,
        value: 2,
        max: 40
      };
    },
    taskCondition() {
      return {
        experiment: 3,
        isDemo: this.showGlyph.isDemo,
        active: this.curActive,
        singleExperiment: this.childExperimentNum,
        data: '',
        // 每个单位编码的值
        circleValue: 0
      }
    }
  },
}
</script>

<style scoped>

</style>