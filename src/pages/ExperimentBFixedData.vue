<template>
  <el-container>
    <el-main>
      <!--glyph显示区域-->
      <el-row>
        <el-col :span="19">
          <el-row style="margin-top: 3%">
            <!-- key一定要保证唯一，不然可能会出现两个Glyph一个更新一个没更新-->
            <el-col :span="Math.floor(22 / glyphData.experimentData.length)"
                    v-for="(city,index) in glyphData.experimentData"
                    :key="city.id"
                    :offset="index === 0 ? 1 : 0"
                    style="text-align: center">
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
            <el-col :span="Math.floor(22 / glyphData.experimentData.length)"
                    v-for="(city,index) in glyphData.experimentData"
                    :key="city.id"
                    class="bianhao">
              {{ String.fromCharCode(index + 65) }}
            </el-col>
          </el-row>
          <el-row style="margin-top: 5%">
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
                <ColorLegend :experiment="1"/>
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
import {mixinExperimentBFixedData, mixinPublicFunction} from "@/mixin";
import {getCurrentTime, saveAsJson} from "@/assets/js/tool";

export default {
  name: "ExperimentBFixedData",
  mixins: [mixinExperimentBFixedData, mixinPublicFunction],
  data() {
    return {
      experimentId: 2,
      experimentIsDemo: false,
      // 实验一记录的数据
      experimentBUserData: {
        startTime: '',
        endTime: '',
        childExperiment: [],
      },
      childExperimentRecord: {
        glyphType: 0,
        stripeNum: 0,
        stripeValue: 0,
        startTime: "",
        endTime: "",
        submitResultTime: "",
        chooseValue: 0,
        correctValue: 0,
        countryInfo: "",
        findAttr: ""
      }
    };
  },
  mounted() {
    // 记录下整个大实验开始时间
    this.$bus.$on('saveBStartTime', () => {
      let st = getCurrentTime();
      this.$set(this.experimentBUserData, "startTime", st);
      // 对于第一个实验来说，它的开始事件就是整个大实验的开始时间
      this.$set(this.childExperimentRecord, "startTime", st);
    });

    // 下一个小实验的按钮监听事件
    this.$bus.$on('newExperimentBNextStep', (d) => {
      if (d.experiment === this.experimentId) {
        if (this.curActive < this.totalExperimentNum) {
          // 记录下实验的结束时间
          this.$set(this.childExperimentRecord, "endTime", getCurrentTime());
          // 这个地方必须要用深拷贝，不然后边再次改变数据会影响之前存储的数据
          this.experimentBUserData.childExperiment.push({
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

    // 保存结果按钮事件
    this.$bus.$on('newExperimentBSaveChoose', (d) => {
      if (d.experiment === this.experimentId && d.isDemo === false) {
        // 记录下提交事件和选择的结果
        this.childExperimentRecord = {
          ...this.childExperimentRecord,
          submitResultTime: d.submitTime,
          chooseValue: d.chooseValue
        }
      }
    });

    this.$bus.$on('newSaveExperimentResult', (d) => {
      if (d.experiment === this.experimentId && d.isDemo === false) {
        // 提交结果之前需要将当前实验数据保存
        this.$set(this.childExperimentRecord, "endTime", d.endTime);
        // 这个地方必须要用深拷贝，不然后边再次改变数据会影响之前存储的数据
        this.experimentBUserData.childExperiment.push({
          ...this.childExperimentRecord
        });
        // 最后一个实验的结束时间和整个实验的结束时间一致
        this.$set(this.experimentBUserData, 'endTime', d.endTime);
        // 先将数据存储在session中
        sessionStorage.setItem('ExperimentB', JSON.stringify(this.experimentBUserData));
        // 判断是否存储成功
        if (JSON.parse(sessionStorage.getItem('ExperimentB')).startTime === this.experimentBUserData.startTime) {
          // 将数据保存成json
          saveAsJson(JSON.parse(sessionStorage.getItem('ExperimentB')), 1, () => {
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
    });
  }
}
</script>

<style scoped>

</style>