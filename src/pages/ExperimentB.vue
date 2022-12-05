<template>
  <el-container>
    <el-main>
      <!--glyph显示区域-->
      <el-row>
        <el-col :span="19">
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
            <el-col :span="Math.floor(22/glyphData.length)" v-for="(city,index) in glyphData" :key="city.id"
                    class="bianhao">
              {{ String.fromCharCode(index + 65) }}
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="5">
          <!--颜色图例部分-->
          <el-row class="B_legend">
            <el-row>
              <el-col :span="24" class="put_center">
                <div class="title color_title">颜色图例</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="18" :offset="6">
                <ColorLegend/>
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
      // 每个小实验的圆圈的数量
      circleNum: [10, 20, 40],
      // glyph的类型，1 peaGlyph，2 stripeGlyph
      glyphType: [1, 2],
      glyphData: [],
      // 标志首先是做哪一个Glyph实验
      randomFlag: 0,
      // 所要进行的实验类型
      experimentType: [],
      descriptionCondition: {
        experiment: 2,
        glyph: 1,
        value: 0.5,
        max: 10
      },
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
      // 实验一记录的数据
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
    /**
     * 根据实验切换布局
     * @param glyph           glyph类型
     * @param childExperiment 哪一种实验 10 20 40
     */
    changeLayerOut(glyph, childExperiment) {
      let maxValue = this.$store.state.default_max_radius;
      let circleValue = 0;
      if (glyph === 1) {
        circleValue = maxValue / childExperiment;
        this.$set(this.peaGlyphCondition, 'circleNum', childExperiment);
        this.$set(this.peaGlyphCondition, 'circleValue', circleValue);

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
      }

      // 记录下该实验中小球/条纹的数量以及每个小球/条纹的值
      this.stripeNum = childExperiment;
      this.stripeValue = maxValue / childExperiment;
      this.$set(this.descriptionCondition, 'value', maxValue / childExperiment);
      this.$set(this.descriptionCondition, 'max', childExperiment);
    },
    /**
     * 判断某种glyph的实验是否全部完成
     * @param glyph       glyph类型
     * @returns {boolean} 是否完成
     */
    isCompleteExperiment(glyph) {
      let num = 0;
      this.experimentType.forEach((e, index) => {
        if (glyph === e.glyph) {
          num += e.cur_num;
        }
      });
      return num === this.circleNum.length * this.childExperimentNum;
    },
    /**
     * 从初始化的实验数组中随机选择一个实验
     * @returns {{isFind: boolean}|{isFind: boolean, item: *, index: number}}
     */
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
          if (item.glyph === this.curShowGlyph && item.max_num !== item.cur_num) {
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
    /**
     * 从指定数据字段中选择数据
     * @param num     选择数据的数量
     * @param d       指定的数据字段
     * @returns {*[]} 数据数组
     */
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
    // 将当前实验信息存储到整个实验内容里
    storeCurrentExperiment() {
      this.experimentBUserData.childExperiment.push({
        // 1表示peaGlyph，2表示stripeGlyph
        glyphType: this.storageGlyph,
        stripeNum: this.stripeNum,
        stripeValue: this.stripeValue,
        startTime: this.startTime,
        endTime: this.endTime,
        submitResultTime: this.submitResultTime,
        chooseValue: this.chooseValue,
        correctValue: this.correctValue,
        countryInfo: this.differenceCity,
        findAttr: this.findAttr
      });
    },
    curActiveChange(active) {
      let d = this.$store.state.ExperimentBData;
      // 前半部分是peaGlyph 后半部分是stripeGlyph的实验
      if (this.randomFlag < 0.5) {
        if (active < this.circleNum.length * this.childExperimentNum) {
          this.curShowGlyph = 1;
        } else {
          this.curShowGlyph = 2;
        }
      } else {
        if (active < this.circleNum.length * this.childExperimentNum) {
          this.curShowGlyph = 2;
        } else {
          this.curShowGlyph = 1;
        }
      }
      this.$set(this.descriptionCondition, 'glyph', this.curShowGlyph);
      this.storageGlyph = this.curShowGlyph;
      if (active !== 0) {
        // 记录小实验开始的时间
        this.startTime = getCurrentTime();
      }
      // 准备数据
      this.glyphData = this.randomChooseData(2, d.ExperimentB_10);
      // 准备实验
      this.curExperiment = this.randomChooseExperiment();
      if (this.curExperiment.isFind) {
        let tmp = this.experimentType[this.curExperiment.index].cur_num;
        this.$set(this.experimentType[this.curExperiment.index], 'cur_num', tmp + 1);
        // 根据实验内容切换布局
        this.changeLayerOut(this.curExperiment.item.glyph, this.curExperiment.item.child_experiment);
      }
    }
  },
  created() {
    // 初始化实验数据
    this.glyphType.forEach((glyph, index) => {
      this.circleNum.forEach((type, i) => {
        let e = {
          // glyph类型
          glyph: glyph,
          // 实验类型 10 20 40
          child_experiment: type,
          // 该组实验最大数量
          max_num: this.childExperimentNum,
          // 当前已经进行了几次
          cur_num: 0
        }
        this.experimentType.push(e);
      });
    });
    this.randomFlag = Math.random();
    // 刚开始初始化界面数据
    this.curActiveChange(this.curActive);
  },
  mounted() {
    // 记录下整个大实验开始时间
    this.$bus.$on('saveBStartTime', () => {
      this.$set(this.experimentBUserData, 'startTime', getCurrentTime());
      this.startTime = getCurrentTime();
    });
    // 小页面切换事件
    this.$bus.$on('nextSmallExperimentBPage', () => {
      if (this.curActive < this.childExperimentNum * this.circleNum.length * this.glyphType.length - 1) {
        // 记录当前实验的结束时间
        this.endTime = getCurrentTime();
        // 到此记录结束，将其存到整个实验的数据中
        this.storeCurrentExperiment();
        this.curActive++;
        if (this.curActive === this.childExperimentNum * this.circleNum.length) {
          let m = this.curShowGlyph === 1 ? 'PeaGlyph实验已完成！' : 'StripeGlyph实验已完成!';
          this.$notify({
            title: '提示',
            message: m,
            type: 'success',
            duration: 2000
          });
        }
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
          type: 'success',
          duration: 1000,
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
      handler(newVal, oldVal) {
        this.curActiveChange(newVal);
      }
    }
  },
  computed: {
    taskCondition() {
      return {
        experiment: 2,
        isDemo: false,
        active: this.curActive,
        singleExperiment: this.circleNum.length * this.childExperimentNum,
        data: this.glyphData,
        // 每个单位编码的值
        circleValue: this.curShowGlyph === 1 ? this.peaGlyphCondition.circleValue : this.stripeGlyphCondition.encoding_value
      }
    }
  }
}
</script>

<style scoped>

</style>