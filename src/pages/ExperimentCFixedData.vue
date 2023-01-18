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
  name: "ExperimentCFixedData",
  mixins: [mixinExperimentCFixedData, mixinPublicFunction, mixinDrawMapPublicFunction],
  data() {
    return {
      experimentId: 3,
      experimentIsDemo: false,
      // 实验C记录的数据
      ExperimentCData: {
        startTime: '',
        endTime: '',
        childExperiment: [],
      },
      // 单独一个小实验的时间记录
      childExperimentRecord: {
        glyphType: 0,
        startTime: "",
        endTime: "",
        submitResultTime: "",
        stripeNum: "",
        findAttr: "",
        correctRegion: {},
        chooseRegion: {},
        isRight: false,
        showData: []
      }
    };
  },
  mounted() {
    // 记录下整个大实验开始时间
    this.$bus.$on('saveCStartTime', () => {
      let st = getCurrentTime();
      this.$set(this.ExperimentCData, "startTime", st);
      // 对于第一个实验来说，它的开始事件就是整个大实验的开始时间
      this.$set(this.childExperimentRecord, "startTime", st);
    });
    // 下一步事件
    this.$bus.$on('newExperimentCNextStep', (d) => {
      if (d.experiment === this.experimentId) {
        if (this.curActive < this.totalExperimentNum) {
          // 记录下实验的结束时间
          this.$set(this.childExperimentRecord, "endTime", getCurrentTime());
          // 这个地方必须要用深拷贝，不然后边再次改变数据会影响之前存储的数据
          this.ExperimentCData.childExperiment.push({
            ...this.childExperimentRecord
          });
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
    // 数据保存事件
    this.$bus.$on('newExperimentCSaveChoose', (d) => {
      if (d.experiment === this.experimentId && d.isDemo === false) {
        // 记录下当前的选择数据和提交的时间
        if (this.currentChooseData) {
          this.childExperimentRecord = {
            ...this.childExperimentRecord,
            submitResultTime: getCurrentTime(),
            chooseRegion: this.currentChooseData,
            isRight: this.currentChooseData.index === this.curShowData.correctRegion.data.index
          }
        }
      }
    });
    this.$bus.$on('newSaveExperimentCResult', (d) => {
      if (d.experiment === this.experimentId && d.isDemo === false) {
        // 提交结果之前需要将当前实验数据保存
        this.$set(this.childExperimentRecord, "endTime", d.endTime);
        // 这个地方必须要用深拷贝，不然后边再次改变数据会影响之前存储的数据
        this.ExperimentCData.childExperiment.push({
          ...this.childExperimentRecord
        });
        // 最后一个实验的结束时间和整个实验的结束时间一致
        this.$set(this.ExperimentCData, 'endTime', d.endTime);
        // 先将数据存储在session中
        sessionStorage.setItem('ExperimentC', JSON.stringify(this.ExperimentCData));
        // 判断是否存储成功
        if (JSON.parse(sessionStorage.getItem('ExperimentC')).startTime === this.ExperimentCData.startTime) {
          // 将数据保存成json
          saveAsJson(JSON.parse(sessionStorage.getItem('ExperimentC')), 2, () => {
            this.$message({
              message: '感谢您的参与，数据已保存成功!',
              type: 'success',
              duration: 1500
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
  }
}
</script>

<style scoped>

</style>