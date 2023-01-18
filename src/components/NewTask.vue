<template>
  <el-container>
    <div class="outer" v-if="taskCondition && taskCondition.experiment === 2">
      <!-- 问题描述-->
      <el-row type="flex" align="middle">
        <el-col :span="22" :offset="1" class="task_description">
          请估算左侧A和B两个图标中<span class="under_line">{{
            $store.state.ssiColorName[taskCondition.data.attrAlias]
          }}</span>的差值
        </el-col>
      </el-row>
      <!--说明-->
      <el-row type="flex" align="middle" class="text shuoming">
        <el-col :span="22" :offset="1">
          <span class="under_line">说明：</span>请在下方直接输入或长按<span class="under_line">【- / +】</span>提交您估算的结果(小数点后两位)，<span
            class="under_line">并点击【保存结果】按钮保存</span>。保存后即可点击<span
            v-show="isNext" class="under_line">【下一步】按钮进行后续实验</span><span
            v-show="!isNext" class="under_line">提交结果按钮导出结果</span>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" class="text under_line">
        <el-col :span="4" :offset="1">
          差值
        </el-col>
        <el-col :span="17" :offset="2">
          <el-input-number v-model="differenceSlider"
                           :precision="2"
                           :step="0.01"
                           :min="0"
                           :max="taskCondition.dataMax">

          </el-input-number>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" style="padding-top: 10px">
        <el-col :span="6" :offset="4">
          <el-button type="primary"
                     size="medium"
                     class="text"
                     @click="showSaveConfirm">
            保存结果
          </el-button>
        </el-col>
        <el-col :span="5" :offset="3">
          <el-button type="success"
                     size="medium"
                     class="text"
                     v-show="isNext"
                     :disabled="!isSave"
                     @click="nextStep">
            下一步
            <i class="el-icon-arrow-right el-icon--right"></i>
          </el-button>
          <el-button type="danger"
                     size="medium"
                     class="text"
                     v-show="!isNext"
                     :disabled="!isSave"
                     @click="saveExperimentResult">
            提交结果
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="outer" v-else-if="taskCondition && taskCondition.experiment === 3">
      <!-- 问题描述-->
      <el-row type="flex" align="middle">
        <el-col :span="23" :offset="1" class="task_description">
          请从左侧地图上展示的一系列圆形图标中选择具有<span class="under_line"><span style="color: red">第二大</span>{{
            taskCondition.data.chineseName
          }}值</span>的图标
        </el-col>
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="23" :offset="1" class="task_description" style="font-size: medium;color:red;text-align: center">
          <span class="under_line">(也即寻找{{ taskCondition.data.chineseName }}的第二大值)</span>
        </el-col>
      </el-row>
      <!--说明-->
      <el-row type="flex" align="middle" class="text shuoming">
        <el-col :span="23" :offset="1">
          <span class="under_line">说明：</span>请根据任务在地图上<span
            class="under_line">点击选择图标</span>，并点击<span class="under_line">【保存结果】</span>按钮保存结果，如需重新选择请点击<span
            class="under_line">【重新选择】</span>按钮，保存结果后点击<span class="under_line">【下一步】</span>进行后续实验
        </el-col>
      </el-row>
      <el-row style="text-align: center">
        <el-col :span="24">
          <el-button-group>
            <el-button plain
                       size="small"
                       icon="el-icon-refresh-left"
                       @click="newResetGlyphChoose">
              重新选择
            </el-button>
            <el-button type="primary"
                       size="small"
                       @click="showSaveConfirm">
              保存结果
            </el-button>
            <el-button type="success"
                       size="small"
                       v-show="isNext"
                       :disabled="!isSave"
                       @click="nextStep">
              下一步<i class="el-icon-arrow-right el-icon--right"></i>
            </el-button>
            <el-button type="danger"
                       size="small"
                       v-show="!isNext"
                       :disabled="!isSave"
                       @click="saveExperimentResult">
              提交结果
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>
  </el-container>
</template>
<script>
import {getCurrentTime} from "@/assets/js/tool";

export default {
  name: "NewTask",
  props: ["taskCondition"],
  data() {
    return {
      differenceSlider: 0,
      isSave: true,
    }
  },
  mounted() {
    this.$bus.$on('resetSlider', () => {
      this.differenceSlider = 0;
      this.isSave = false;
    });
    if (this.taskCondition.experiment === 3) {
      console.log(this.taskCondition);
    }
  },
  computed: {
    // 是否显示提交结果按钮
    isNext() {
      return this.taskCondition.curExperiment !== this.taskCondition.totalExperiment;
    }
  },
  methods: {
    // 下一步按钮事件
    nextStep() {
      let eventName = "";
      if (this.taskCondition.experiment === 2) {
        if (this.taskCondition.isDemo) {
          eventName = "newExperimentBNextStepTraining";
        } else {
          eventName = "newExperimentBNextStep";
        }
      } else if (this.taskCondition.experiment === 3) {
        if (this.taskCondition.isDemo) {
          eventName = "newExperimentCNextStepTraining";
        } else {
          eventName = "newExperimentCNextStep";
        }
      }
      this.$bus.$emit(eventName, {
        experiment: this.taskCondition.experiment,
        isDemo: this.taskCondition.isDemo
      });
    },
    // 点击保存结果按钮后显示确定框
    showSaveConfirm() {
      if (this.taskCondition.experiment === 2) {
        this.$confirm('是否确定保存您的估算结果?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 保存结果之后可以进行下一步
          this.isSave = true;
          if (!this.taskCondition.isDemo) {
            // 保存结果
            this.$bus.$emit("newExperimentBSaveChoose", {
              experiment: this.taskCondition.experiment,
              isDemo: this.taskCondition.isDemo,
              chooseValue: this.differenceSlider,
              submitTime: getCurrentTime()
            });
          }
        }).catch(() => {
          console.log("已取消保存");
        });
      } else if (this.taskCondition.experiment === 3) {
        this.$confirm('是否确定保存您的选择结果?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.taskCondition.isChoose) {
            // 保存结果之后可以进行下一步
            this.isSave = true;
            if (!this.taskCondition.isDemo) {
              this.$bus.$emit("newExperimentCSaveChoose", {
                experiment: this.taskCondition.experiment,
                isDemo: this.taskCondition.isDemo
              });
            }
          } else {
            this.$message({
              message: '请选择数据之后再保存!',
              type: 'warning',
              duration: 1500
            });
          }
        }).catch(() => {
          console.log("已取消保存");
        });
      }
    },
    saveExperimentResult() {
      let eventName = "";
      if (this.taskCondition.experiment === 2) {
        if (this.taskCondition.isDemo) {
          eventName = "newSaveExperimentResultTraining";
        } else {
          eventName = "newSaveExperimentResult";
        }
      } else if (this.taskCondition.experiment === 3) {
        if (this.taskCondition.isDemo) {
          eventName = "newSaveExperimentCResultTraining";
        } else {
          eventName = "newSaveExperimentCResult";
        }
      }
      this.$bus.$emit(eventName, {
        experiment: this.taskCondition.experiment,
        isDemo: this.taskCondition.isDemo,
        endTime: getCurrentTime()
      });
    },
    // 重置地图上的选择glyph
    newResetGlyphChoose() {
      this.$bus.$emit("newResetGlyphChoose");
    }
  },
  watch: {
    // 只需要监听实验编号变化就行
    "taskCondition.curExperiment": {
      immediate: true,
      handler(newVal, oldVal) {
        // 每次实验切换，一开始的时候都不能进行下一步
        this.isSave = false;
        // 同时还要将选择框内容归零
        this.differenceSlider = 0;
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

.outer {
  margin-bottom: 5px;
}
</style>