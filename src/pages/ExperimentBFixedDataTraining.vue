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
          <el-row>
            <el-col :span="2" :offset="9" v-show="curActive===totalExperimentNum">
              <el-button type="primary" icon="el-icon-refresh-left" @click="resetTraining">重新练习</el-button>
            </el-col>
            <el-col :span="2" :offset="curActive===totalExperimentNum ? 2 : 11">
              <el-button icon="el-icon-refresh-left" @click="resetCurrentExperiment">重置实验</el-button>
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
  name: "ExperimentBFixedDataTraining",
  mixins: [mixinExperimentBFixedData, mixinPublicFunction],
  data() {
    return {
      experimentId: 2,
      experimentIsDemo: true,
    };
  },
  mounted() {
    // 下一个小实验的按钮监听事件
    this.$bus.$on('newExperimentBNextStepTraining', (d) => {
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

    this.$bus.$on('newSaveExperimentResultTraining', (d) => {
      this.$message({
        message: '感谢您的参与，数据已保存成功!',
        type: 'success',
        duration: 1500
      });
    });
  },
  methods: {
    resetCurrentExperiment() {
      // 只需要重置选择数据的值即可
      this.$bus.$emit("resetSlider");
    },
    resetTraining() {
      // 重新生成实验数据
      this.experimentAllData = this.createExperimentData();
      // 实验开始前就确定首先从哪个实验开始
      this.curShowGlyph = Math.random() > 0.5 ? 1 : 2;
      this.resetCurrentExperiment();
      this.curActive = 1;
    }
  }
}
</script>

<style scoped>

</style>