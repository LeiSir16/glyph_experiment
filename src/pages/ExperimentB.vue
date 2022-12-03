<template>
  <el-container>
    <el-main>
      <!--glyph显示区域-->
      <el-row>
        <el-col :span="19">
          <template v-if="isDemo">
            <!--demo界面-->
            <el-row type="flex" align="middle">
              <el-col :span="8" :offset="11">
                <h2>实验示例</h2>
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <!--正式实验界面-->
            <el-row type="flex" align="middle">
              <el-col :span="8" :offset="11">
                <h2>正式实验</h2>
              </el-col>
            </el-row>
          </template>
          <el-row style="margin-top: 3%">
            <!-- key一定要保证唯一，不然可能会出现两个Glyph一个更新一个没更新-->
            <el-col :span="Math.floor(22/glyphData.length)" v-for="(city,index) in glyphData" :key="city.id"
                    :offset="index===0?1:0" style="text-align: center">
              <template v-if="curShowGlyph === 1">
                <!-- 这里的type表示数据类型，1是ssi数据，2是秦岭数据-->
                <PeaGlyph :glyph_data="{type:1,data:city}"
                          :show_condition="peaGlyphCondition"
                          :experiment="taskCondition"/>
              </template>
              <template v-else>
                <StripeGlyph :glyph_data="{type:1,data:city}"
                             :glyphCondition="stripeGlyphCondition"
                             :experiment="taskCondition"/>
              </template>
            </el-col>
          </el-row>
          <el-row>
            <!-- key一定要保证唯一，不然可能会出现两个Glyph一个更新一个没更新-->
            <el-col :span="Math.floor(22/glyphData.length)" v-for="(city,index) in glyphData" :key="city.id" class="bianhao">
              {{ String.fromCharCode(index + 65) }}
            </el-col>
          </el-row>
          <template v-if="isDemo">
            <!--demo界面允许重复测试-->
            <el-row type="flex" align="middle" style="margin-top: 3%">
              <el-col :span="8" :offset="11">
                <el-button plain icon="el-icon-refresh-left" class="title under_line" @click="resetGlyph">重置示例
                </el-button>
              </el-col>
            </el-row>
          </template>
        </el-col>
        <el-col :span="5">
          <!--颜色图例部分-->
          <el-row class="B_legend">
            <el-row type="flex" align="middle">
              <el-col :span="19" :offset="9">
                <div class="title color_title">颜色图例</div>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
              <el-col :span="23" :offset="7">
                <ColorLegend/>
              </el-col>
            </el-row>
          </el-row>
          <!-- 详细阐述部分-->
          <el-row class="B_description">
            <el-row type="flex" align="middle">
              <el-col :span="19" :offset="9">
                <div class="title color_title">图形解释</div>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
              <el-col :span="24">
                <Description :des-condition="descriptionCondition"/>
              </el-col>
            </el-row>
          </el-row>
          <!--任务部分-->
          <el-row class="B_task">
            <el-row type="flex" align="middle">
              <el-col :span="19" :offset="9">
                <div class="title color_title">实验任务</div>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
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
import StripeGlyph from "@/components/StripeGlyph";
import PeaGlyph from "@/components/PeaGlyph";
import ColorLegend from "@/components/ColorLegend";
import {nanoid} from "nanoid";
import {getCurrentTime, saveAsJson} from "@/assets/js/tool";

export default {
  name: "ExperimentB",
  components: {Task, Description, StripeGlyph, PeaGlyph, ColorLegend},
  props: ['childExperimentNum'],
  data() {
    return {
      // 当前进行实验的编号 一共是childExperimentNum * circleNum.length * glyphType.length个实验
      curActive: 0,
      // 刚开始默认是peaGlyph的实验
      curShowGlyph: 1,
      // 当前进行的实验
      curExperiment: {},
      // 每个小实验的次数
      // childExperimentNum: 0,
      // 每个小实验的圆圈的数量
      circleNum: [10, 20, 40],
      // glyph的类型，1 peaGlyph，2 stripeGlyph
      glyphType: [1, 2],
      glyphData: [],
      descriptionCondition: {
        experiment: 2,
        glyph: 1,
        value: 0.5,
        max: 20
      },
      // 所要进行的实验类型
      experimentType: [],
      peaGlyphCondition: {
        circleNum: 20,
        circleValue: 0.5,
        glyphSize: 550,
        centerDis: 3,
        outlineDis: 0.5,
        outlineOffset: 1,
        outlineThickness: 1,
        circleThickness: 0.5
      },
      stripeGlyphCondition: {
        layer_out: 2,
        is_encoding_infor: true,
        glyph_size: 550,
        metaphor_color: "#878787",
        outline_color: "#000000",
        stripe_encoding: "#E31A1C",
        division_color: "#000000",
        bg_opacity: 0,
        division_opacity: 1,
        metaphor_opacity: 0.3,
        inner_opacity: 1,
        outer_opacity: 1,
        stripe_opacity: 1,
        layer_num: 7,
        inner_radius: 2.5,
        sector_interval: 3,
        outline_thickness: 0.5,
        division_thickness: 0.5,
        stripe_proportion: 0.1,
        stripe_B_A: 0.08,
        stripe_L_R: 0.15,
        stripe_thickness: 0.07,
        encoding_value: 0.5,
      },
      // 实验记录的数据
      experimentBUserData: {
        startTime: '',
        endTime: '',
        childExperiment: [],
      },
      // 1表示peaGlyph，2表示stripeGlyph
      storageGlyph: 1,
      stripeNum: 0,
      stripeValue: 0,
      startTime: '',
      endTime: '',
      submitResultTime: '',
      chooseValue: 0,
      correctValue: 0,
      differenceCity: [],
      findAttr: ''
    }
  },
  methods: {
    // 根据实验条件切换布局
    changeLayerOut(glyph, childExperiment) {
      let maxValue = 10;
      let circleValue = 0;
      if (glyph === 1) {
        circleValue = maxValue / childExperiment;
        this.$set(this.peaGlyphCondition, 'circleNum', childExperiment);
        this.$set(this.peaGlyphCondition, 'circleValue', circleValue);
        // 描述界面参数
        this.$set(this.descriptionCondition, 'max', childExperiment);
        this.$set(this.descriptionCondition, 'value', circleValue);
        if (childExperiment === 10) {
          this.$set(this.peaGlyphCondition, 'centerDis', 12);
        } else if (childExperiment === 20) {
          this.$set(this.peaGlyphCondition, 'centerDis', 6);
        } else if (childExperiment === 40) {
          this.$set(this.peaGlyphCondition, 'centerDis', 3);
        }
      } else {
        if (childExperiment === 10) {
          this.$set(this.stripeGlyphCondition, 'layer_num', 4);
          this.$set(this.stripeGlyphCondition, 'stripe_proportion', .117);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', .08);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', .12);

        } else if (childExperiment === 20) {
          this.$set(this.stripeGlyphCondition, 'layer_num', 6);
          this.$set(this.stripeGlyphCondition, 'stripe_proportion', .083);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', .07);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', .15);
        } else if (childExperiment === 40) {
          this.$set(this.stripeGlyphCondition, 'layer_num', 10);
          this.$set(this.stripeGlyphCondition, 'stripe_proportion', 0.072);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', 0.02);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', 0.1);
        }
        this.$set(this.stripeGlyphCondition, 'encoding_value', maxValue / childExperiment);

        this.$set(this.descriptionCondition, 'max', childExperiment);
        this.$set(this.descriptionCondition, 'value', maxValue / childExperiment);
      }

      // 记录下该实验中小球/条纹的数量以及每个小球/条纹的值
      this.stripeNum = childExperiment;
      this.stripeValue = maxValue / childExperiment;

      // 设置任务界面参数
      this.$set(this.descriptionCondition, 'glyph', glyph);
    },
    // 判断某种Glyph的实验是否全部完成
    isCompleteExperiment(glyph) {
      let num = 0;
      this.experimentType.forEach((e, index) => {
        if (glyph === e.glyph && !e.isDemo) {
          num += e.cur_num;
        }
      });
      return num === this.circleNum.length * this.childExperimentNum;
    },
    // 随机选择一种实验
    randomChooseExperiment() {
      if (this.isCompleteExperiment(this.curShowGlyph)) {
        return {
          isFind: false
        }
      } else {
        let flag = true;
        while (flag) {
          let index = Math.floor(Math.random() * this.experimentType.length);
          let item = this.experimentType[index];
          if (item.glyph === this.curShowGlyph && item.max_num !== item.cur_num && !item.isDemo) {
            flag = false;
            return {
              isFind: true,
              item: item,
              index: index
            };
          }
        }
      }
    },
    // 随机选择两个数据
    randomChooseData(num, d) {
      let result = [];
      let tmp = d;
      while (num--) {
        let index = Math.floor(Math.random() * tmp.length);
        // 添加一个id保证在循环中key值不一样
        let d_tmp = {
          id: nanoid()
        }
        for (let tmpElementKey in tmp[index]) {
          d_tmp[tmpElementKey] = tmp[index][tmpElementKey];
        }
        result.push(d_tmp);
        // 移除一个元素 避免两次选择同一个元素 如果用splice会改变原数组
        tmp = tmp.slice(0, index).concat(tmp.slice(index + 1, tmp.length));
      }
      return result;
    },
    // 重置示例页面
    resetGlyph() {
      // 任务栏重置滑条值
      this.$bus.$emit('resetValue');
    },
    // 将当前实验信息存储到整个实验内容里
    storeCurrentExperiment() {
      this.experimentBUserData.childExperiment.push({
        // 1表示peaGlyph，2表示stripeGlyph
        storageGlyph: this.storageGlyph,
        stripeNum: this.stripeNum,
        stripeValue: this.stripeValue,
        startTime: this.startTime,
        endTime: this.endTime,
        submitResultTime: this.submitResultTime,
        chooseValue: this.chooseValue,
        correctValue: this.correctValue,
        differenceCity: this.differenceCity,
        findAttr: this.findAttr
      });
    }
  },
  beforeMount() {
    // 初始化实验数据
    this.glyphType.forEach((glyph, index) => {
      // 将demo加入到实验列表
      this.experimentType.push({
        isDemo: true,
        glyph: glyph,
        child_experiment: 10,
        max_num: 1,
        cur_num: 0
      });
      this.circleNum.forEach((type, i) => {
        let e = {
          isDemo: false,
          glyph: glyph,
          child_experiment: type,
          max_num: this.childExperimentNum,
          cur_num: 0
        }
        this.experimentType.push(e);
      });
    });
  },
  mounted() {
    // 接收登录页面接收过来的数据
    this.$bus.$on('ExperimentBUpdate', (d) => {
      let b_d = d.ExperimentData;
      if (this.isDemo) {
        this.glyphData = b_d.Demo;
        // demo页面默认是10个
        this.changeLayerOut(this.curShowGlyph, 10);
      } else {
        this.glyphData = this.randomChooseData(2, b_d.ExperimentB_10);
      }
    });
    // 记录下整个大实验开始时间
    this.$bus.$on('saveBStartTime', () => {
      this.$set(this.experimentBUserData, 'startTime', getCurrentTime());
    });
    // 小页面切换事件
    this.$bus.$on('nextSmallExperimentBPage', () => {
      if (this.curActive <= this.childExperimentNum * this.circleNum.length * this.glyphType.length) {
        if (!this.isDemo) {
          // 记录当前实验的结束时间
          this.endTime = getCurrentTime();
          // 到此记录结束，将其存到整个实验的数据中
          this.storeCurrentExperiment();
        }
        this.curActive++;
      }
    });
    // 提交结果
    this.$bus.$on('experimentBResultLocal', (time) => {
      // 提交结果之前要将最后一次实验的内容存储
      this.endTime = time;
      // 到此记录结束，将其存到整个实验的数据中
      this.storeCurrentExperiment();
      // 到此记录结束，将其存到整个实验的数据中
      this.$set(this.experimentBUserData, 'endTime', time);
      sessionStorage.setItem('ExperimentB', JSON.stringify(this.experimentBUserData));
      // 判断是否存储成功
      if (JSON.parse(sessionStorage.getItem('ExperimentB')).startTime === this.experimentBUserData.startTime) {
        saveAsJson(JSON.parse(sessionStorage.getItem('ExperimentB')), 1, () => {
          this.$message({
            message: '感谢您的参与，数据已保存成功!',
            type: 'success'
          });
        });
      } else {
        this.$message({
          message: '数据保存失败！',
          type: 'error'
        });
      }
    });

    this.$bus.$on('submitChoose', (result) => {
      this.$confirm('是否确定保存您的估算结果?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 点击确定之后才记录提交时间
        this.submitResultTime = getCurrentTime();
        this.chooseValue = result.chooseValue;
        this.correctValue = result.rightValue;
        this.differenceCity = [result.cityOne, result.cityTwo];
        this.findAttr = result.attr;
        this.$message({
          message: '保存成功!',
          type: 'success'
        });
        this.$bus.$emit('enableNextStep');
      }).catch(() => {
        console.log("已取消保存");
      });
    });
  },
  watch: {
    // 实验变化时的事件
    curActive: {
      immediate: true,
      handler(newVal) {
        let d = this.$store.state.ExperimentBData;
        // 前半部分是peaGlyph 后半部分是stripeGlyph的实验
        if (newVal <= this.circleNum.length * this.childExperimentNum) {
          this.curShowGlyph = 1;
        } else {
          this.curShowGlyph = 2;
        }
        // 记录当前实验的Glyph类型
        this.storageGlyph = this.curShowGlyph;
        // 根据是否是demo选择两个数据
        if (this.isDemo) {
          this.glyphData = d.Demo;
          this.changeLayerOut(this.curShowGlyph, 10);
        } else {
          // 记录下当前小实验开始的时间
          this.startTime = getCurrentTime();
          this.glyphData = this.randomChooseData(2, d.ExperimentB_10);
          // 随机选择一个实验
          this.curExperiment = this.randomChooseExperiment();
          if (this.curExperiment.isFind) {
            let tmp = this.experimentType[this.curExperiment.index].cur_num;
            this.$set(this.experimentType[this.curExperiment.index], 'cur_num', tmp + 1);
            // 根据实验内容切换布局
            this.changeLayerOut(this.curExperiment.item.glyph, this.curExperiment.item.child_experiment);
          }
        }
      }
    }
  },
  computed: {
    // 是否是Demo
    isDemo() {
      return this.curActive === 0 || this.curActive === this.circleNum.length * this.childExperimentNum + 1;
    },
    taskCondition() {
      return {
        experiment: 2,
        isDemo: this.isDemo,
        active: this.curActive,
        singleExperiment: this.circleNum.length * this.childExperimentNum,
        data: this.glyphData,
        // 每个单位编码的值
        circleValue: this.curShowGlyph === 1 ? this.peaGlyphCondition.circleValue : this.stripeGlyphCondition.encoding_value
      }
    },
  }
}
</script>

<style scoped>
.B_legend {
  border: 3px solid black;
  border-radius: 5px 5px 0 0;
}

.B_description {
  border-left: 3px solid black;
  border-right: 3px solid black;
}

.B_task {
  border: 3px solid black;
  border-radius: 0 0 5px 5px;
}

.color_title {
  font-size: x-large;
  font-weight: bolder;
  margin: 8px 0;
}

.bianhao {
  text-align: center;
  padding-left: 8%;
  padding-top: 1%;
  font-family: "Gotham Black", serif;
  font-size: xxx-large;
}
</style>