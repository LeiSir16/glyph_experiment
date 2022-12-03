<template>
  <div style="padding-bottom: 15px">
    <!--第二个实验-->
    <template v-if="taskCondition&&(taskCondition.experiment === 2||taskCondition.experiment === -2)">
      <!-- 问题描述-->
      <el-row type="flex" align="middle">
        <el-col :span="23" :offset="1" class="task_description">
          请估算左侧A和B两个图形中<span class="under_line">{{ $store.state.ssiColorName[experimentBChoose] }}</span>的差值
        </el-col>
      </el-row>
      <!--说明-->
      <el-row type="flex" align="middle" class="text shuoming">
        <el-col :span="23" :offset="1">
          <span class="under_line">说明：</span>请在下方输入或长按+/-提交您估算的结果(小数点后两位)，<span
            class="under_line">并点击【保存结果】按钮保存</span>。保存后即可点击<span
            v-show="isNext">下一步按钮进行后续实验</span><span v-show="!isNext">提交结果按钮导出结果</span>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" class="text under_line">
        <el-col :span="4" :offset="1">
          差值
        </el-col>
        <el-col :span="17" :offset="1">
          <el-input-number v-model="differenceSlider" :precision="2" :step="0.01" :min="0" :max="10"></el-input-number>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" style="padding-top: 10px">
        <el-col :span="6" :offset="4">
          <el-button type="primary" size="medium" class="text" @click="submitDifference">保存结果</el-button>
        </el-col>
        <el-col :span="5" :offset="3">
          <el-button type="success" size="medium" class="text" @click="nextStep" v-show="isNext" :disabled="!isSave">下一步<i
              class="el-icon-arrow-right el-icon--right"></i></el-button>
          <el-button type="danger" size="medium" class="text" @click="submitResult" v-show="!isNext"
                     :disabled="!isSave">提交结果
          </el-button>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
import {getCurrentTime} from "@/assets/js/tool";

export default {
  name: "Task",
  props: ['taskCondition'],
  data() {
    return {
      isNext: true,
      differenceSlider: 0,
      experimentBChoose: "",
      isSave: false
    };
  },
  methods: {
    nextStep(e) {
      if (this.taskCondition.experiment === -2) {
        // 第一个实验的训练实验
        this.$bus.$emit('nextStepExperimentBTraining');
      } else if (this.taskCondition.experiment === 2) {
        this.$bus.$emit('nextSmallExperimentBPage');
      }
    },
    // 将实验的结果存在Cookie中
    submitResult() {
      if (this.taskCondition.experiment === 2) {
        this.$bus.$emit('experimentBResultLocal', getCurrentTime());
      } else if (this.taskCondition.experiment === -2) {
        this.$bus.$emit('experimentBTrainingResultLocal');
      }
    },
    /**
     * 找出两个数据中差值在阈值的属性
     * @param data_1    数据二
     * @param data_2    数据一
     * @param threshold 阈值
     */
    findDifference(data_1, data_2, threshold) {
      let attr = [];
      let d_1 = data_1.data;
      let d_2 = data_2.data;
      d_1.forEach((item, index) => {
        if (Math.abs(item.value - d_2[index].value) >= threshold) {
          attr.push(item.name);
        }
      });
      return attr;
    },
    // 查找数据中某个属性的值
    findValue(d, attr) {
      for (const dElement of d.data) {
        if (dElement.name === attr) {
          return dElement.value;
        }
      }
    },
    // 计算指定属性之间的差值
    calculateDifference(d_1, d_2, attr) {
      return Math.abs(this.findValue(d_1, attr) - this.findValue(d_2, attr));
    },
    // 提交差值结果
    submitDifference() {
      // 计算正确的值
      if (this.taskCondition.experiment === 2) {
        let rightScore = this.calculateDifference(this.taskCondition.data[0], this.taskCondition.data[1], this.experimentBChoose.split('_').join(" "))
        let result = {
          rightValue: rightScore.toFixed(2),  // 直接保留两位小数
          chooseValue: this.differenceSlider,
          cityOne: this.taskCondition.data[0],
          cityTwo: this.taskCondition.data[1],
          attr: this.experimentBChoose
        };
        this.$bus.$emit('submitChoose', result);
      } else if (this.taskCondition.experiment === -2) {
        // 实验一的训练就只是弹窗
        this.$bus.$emit('experimentBTrainingSubmit');
      }
    },
    // 重新生成一种属性
    randomShowAttributes(value) {
      let attrs = this.findDifference(value.data[0], value.data[1], value.circleValue / 2);
      let index = Math.floor(Math.random() * attrs.length);
      return attrs[index].split(" ").join("_");
    }
  },
  mounted() {
    this.$bus.$on('resetValue', () => {
      // 重置示例同时也再随机生成一种属性
      this.differenceSlider = 0;
      this.experimentBChoose = this.randomShowAttributes(this.taskCondition);
    });
    this.$bus.$on('enableNextStep', () => {
      this.isSave = true;
    });
  },
  watch: {
    taskCondition: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal && (newVal.experiment === 2 || newVal.experiment === -2)) {
          // 找出大于等于阈值的属性
          this.experimentBChoose = this.randomShowAttributes(newVal);
          if (newVal.active === newVal.singleExperiment * 2 - 1) {
            this.isNext = false;
          } else {
            this.isNext = true;
          }
          // 当进入到一个新的小实验时要禁用下一步按钮并将数值选择框的值归零
          if (newVal.active !== oldVal.active) {
            this.isSave = false;
            this.differenceSlider = 0;
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.task_description {
  font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
  font-size: larger;
}

.shuoming {
  padding: 10px 0;
  line-height: 1.5;
}
</style>