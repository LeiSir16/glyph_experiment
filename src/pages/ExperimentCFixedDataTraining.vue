<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="20">
          <el-row>
            <el-col :span="24">
              <DrawQinlingMap ref="drawMap" :update-data="updateData" :glyph-choose="chooseMethod"/>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="3" :offset="9">
              <el-statistic title="正在进行实验编号">
                <template slot="formatter">
                  {{ curActive }}
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="3">
              <el-statistic title="实验总数">
                <template slot="formatter">
                  {{ totalExperimentNum }}
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="2" :offset="2" v-show="curActive === totalExperimentNum">
              <el-button type="primary" icon="el-icon-refresh-left" @click="resetTraining">重新练习</el-button>
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
                <NewTask :task-condition="taskCondition"/>
              </el-col>
            </el-row>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import {mixinExperimentCFixedData, mixinDrawMapPublicFunction, mixinPublicFunction} from "@/mixin";
import {getCurrentTime, saveAsJson} from "@/assets/js/tool";

export default {
  name: "ExperimentCFixedDataTraining",
  mixins: [mixinExperimentCFixedData, mixinPublicFunction, mixinDrawMapPublicFunction],
  data() {
    return {
      experimentId: 3,
      experimentIsDemo: true,
    };
  },
  mounted() {
    // 下一步事件
    this.$bus.$on('newExperimentCNextStepTraining', (d) => {
      if (d.experiment === this.experimentId) {
        if (this.curActive < this.totalExperimentNum) {
          this.curActive++;
          // 当一个glyph的实验完成之后显示实验完成提示信息
          if (this.curActive === this.totalExperimentNum / 2 + 1) {
            let m = this.curShowGlyph === 1 ? 'PeaGlyph实验已完成！' : 'StripeGlyph实验已完成!';
            this.$notify({
              title: '提示',
              message: m,
              type: 'success',
              duration: 2000
            });
          }
        }
      }
    });
    this.$bus.$on('newSaveExperimentCResultTraining', (d) => {
      this.$message({
        message: '感谢您的参与，数据已保存成功!',
        type: 'success',
        duration: 1500
      });
    })
  },
  methods: {
    resetTraining() {
      this.experimentAllData = this.createGlyphData();
      this.curShowGlyph = Math.random() > 0.5 ? 1 : 2;
      this.curActive = 1;
    }
  }
}
</script>

<style scoped>

</style>