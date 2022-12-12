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
import Task from "@/components/Task";
import Description from "@/components/Description";
import ColorLegend from "@/components/ColorLegend";
import QinlingMap from "@/components/QinlingMap";
import {getCurrentTime, saveAsJson} from "@/assets/js/tool";

export default {
  name: "ExperimentC",
  components: {QinlingMap, Task, Description, ColorLegend},
  data() {
    return {
      childExperimentNum: 3,
      glyphType: [1, 2],
      circleNum: [10, 40],
      experimentType: [],
      curActive: 0,
      randomBegin: 1,
      showGlyph: {
        glyph: 2,
        circleNum: 10,
        regionNum: 10,
        isDemo: false,
        active: 0,
      },
      curExperiment: {},
      ExperimentCData: {
        startTime: '',
        endTime: '',
        childExperiment: [],
      },
      curShowData: [],
      startTime: '',
      endTime: '',
      stripeNum: 40,
      findAttr: '',
      submitResultTime: '',
      correctRegion: {},
      chooseRegion: {},
      isRight: false,
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
    this.$bus.$on('nextSmallExperimentCPage', () => {
      if (this.curActive < this.childExperimentNum * this.glyphType.length * this.circleNum.length - 1) {
        this.curActive++;
        if (!this.showGlyph.isDemo) {
          // 下一步的时候记录结束时间
          this.endTime = getCurrentTime();

        }
        if (this.curActive === this.childExperimentNum * this.circleNum.length) {
          let m = this.showGlyph.glyph === 1 ? 'PeaGlyph实验已完成！' : 'StripeGlyph实验已完成!';
          this.$notify({
            title: '提示',
            message: m,
            type: 'success',
            duration: 2000
          });
        }
        // 点击下一步之后就保存当前小实验的数据
        this.saveCurrentSmallExperiment();
        // 每次实验重新开始要重置显示的数据
        this.curShowData = [];
        this.chooseRegion = {};
        this.correctRegion = {};
      } else {
        console.log('没出发');
      }
    });
    // 记录整个实验开始时间
    this.$bus.$on('saveCStartTime', () => {
      if (!this.showGlyph.isDemo) {
        this.$set(this.ExperimentCData, 'startTime', getCurrentTime());
        // 第一个实验的开始时间在切换到这个页面时就记录了
        this.startTime = getCurrentTime();
      }
    });
    // 提交结果的时候保存该实验结束时间
    this.$bus.$on('experimentCResultLocal', () => {
      if (!this.showGlyph.isDemo) {
        // 提交结果的时候记录最后一个实验的结束时间
        this.endTime = getCurrentTime();
        this.$set(this.ExperimentCData, 'endTime', getCurrentTime());
        this.saveCurrentSmallExperiment();
        sessionStorage.setItem('ExperimentC', JSON.stringify(this.ExperimentCData));
        // console.log(JSON.stringify(this.ExperimentCData))
        // 判断是否存储成功
        if (JSON.parse(sessionStorage.getItem('ExperimentC')).startTime === this.ExperimentCData.startTime) {
          saveAsJson(JSON.parse(sessionStorage.getItem('ExperimentC')), 3, () => {
            this.$message({
              message: '感谢您的参与，数据已保存成功!',
              type: 'success',
              duration: 1000
            });
          });
        } else {
          this.$message({
            message: '数据保存失败！',
            type: 'error'
          });
        }
      }
    })
    // console.log(this.$refs.qinlingMap.regionInfo)
    this.$bus.$on('updateExperimentCShowData', (d) => {
      this.curShowData = d;
      if (!this.showGlyph.isDemo) {
        // 每次数据更新的时候记录开始时间
        this.startTime = getCurrentTime();
      }
    });

    // 记录下当前任务需要寻找的属性
    this.$bus.$on('updateExperimentCRandomChooseAttr', (d) => {
      if (!this.showGlyph.isDemo) {
        this.findAttr = d.attr;
      }
      // console.log('属性是', d);
    });

    // 保存当前选择的结果
    this.$bus.$on('saveExperimentCData', () => {
      if (!this.showGlyph.isDemo) {
        this.curShowData.sort(this.compare(this.findAttr));
        // 存储第二大数据
        this.correctRegion = this.curShowData[1];
        // 在保存数据的时候一定保证用户选择了区域
        if (this.chooseRegion.data) {
          this.isRight = this.correctRegion.index === this.chooseRegion.index;
          this.submitResultTime = getCurrentTime();
          this.$bus.$emit('enableNextStepExperimentC');
          this.$message({
            message: '保存成功!',
            type: 'success',
            duration: 1000
          });
        } else {
          this.$message({
            message: '请根据任务选择区域后再保存数据！',
            type: 'warning'
          });
        }
      }
    });
    // 当用户点击选择的时候会更新保存的数据，重新选择会覆盖数据
    this.$bus.$on('clickChooseData', (d) => {
      if (!this.showGlyph.isDemo) {
        this.chooseRegion = d;
      }
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
          // console.log(this.curExperiment.child_experiment)
        } else {
          let index = Math.floor(Math.random() * childExperiment.length);
          this.curExperiment = childExperiment[index];
          // 将选中的实验的index加一
          childExperiment[index].cur_num++;
          this.$set(this.showGlyph, 'circleNum', this.curExperiment.child_experiment);
          // console.log(childExperiment)
        }
        this.stripeNum = this.curExperiment.child_experiment;
      }
    },
    // 数据排序函数 降序排序
    compare(property) {
      return function (a, b) {
        let value1 = a.data.filter((item) => {
          return item.name === property;
        });
        let value2 = b.data.filter((item) => {
          return item.name === property;
        });
        return value2[0].value - value1[0].value;
      }
    },
    // 保存当前实验的数据
    saveCurrentSmallExperiment() {
      let e = {
        glyphType: this.showGlyph.glyph,
        startTime: this.startTime,
        endTime: this.endTime,
        submitResultTime: this.submitResultTime,
        stripeNum: this.stripeNum,
        findAttr: this.findAttr,
        correctRegion: this.correctRegion,
        chooseRegion: this.chooseRegion,
        isRight: this.isRight,
        showData: this.curShowData
      }
      this.ExperimentCData.childExperiment.push(e);
    }
  },
  watch: {
    curActive: {
      immediate: false,
      handler(newVal) {
        // 随机选择一个实验显示
        this.randomChooseExperiment(this.showGlyph.glyph);
        this.$set(this.showGlyph, 'active', newVal);
      }
    }
  },
  computed: {
    descriptionCondition() {
      return {
        experiment: 3,
        glyph: this.showGlyph.glyph,
        value: 2,
        max: this.showGlyph.circleNum
      };
    },
    taskCondition() {
      return {
        experiment: 3,
        isDemo: this.showGlyph.isDemo,
        active: this.curActive,
        singleExperiment: this.childExperimentNum * this.circleNum.length,
        data: this.curShowData,
        // 每个单位编码的值
        circleValue: 0
      }
    }
  },
}
</script>

<style scoped>

</style>