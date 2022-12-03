<template>
  <el-container>
    <el-main>
      <!--glyph显示区域-->
      <el-row>
        <el-col :span="19">
          <el-row style="margin-top: 3%">
            <!-- key一定要保证唯一，不然可能会出现两个Glyph一个更新一个没更新-->
            <el-col :span="Math.floor(22 / glyphData.length)" v-for="(city,index) in glyphData" :key="city.id"
                    :offset="index===0 ? 1 : 0" style="text-align: center">
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
          <el-row type="flex" align="middle" style="margin-top: 3%">
            <el-col :span="3" :offset="9" v-show="curActive === 1">
              <el-button type="primary" plain icon="el-icon-refresh-left" class="title under_line" @click="resetDemo">
                重新练习
              </el-button>
            </el-col>
            <el-col :span="3" :offset="curActive === 1 ? 0 : 11">
              <el-button plain icon="el-icon-refresh-left" class="title under_line" @click="resetGlyph">重置该示例
              </el-button>
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
import PeaGlyph from "@/components/PeaGlyph";
import StripeGlyph from "@/components/StripeGlyph";
import ColorLegend from "@/components/ColorLegend";
import Description from "@/components/Description";
import Task from "@/components/Task";

export default {
  name: "ExperimentBTraining",
  components: {PeaGlyph, StripeGlyph, ColorLegend, Description, Task},
  data() {
    return {
      glyphData: this.$store.state.ExperimentBData.Demo,
      maxValue: this.$store.state.default_max_radius,
      curShowGlyph: 1,
      curActive: 0,
      // 示例中Glyph都是10
      peaGlyphCondition: {
        circleNum: 10,
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
      }
    };
  },
  created() {
    // 初始化PeaGlyph的一些参数
    this.$set(this.peaGlyphCondition, 'circleNum', 10);
    this.$set(this.peaGlyphCondition, 'circleValue', this.maxValue / this.peaGlyphCondition.circleNum);
    this.$set(this.peaGlyphCondition, 'centerDis', 12);
    // 初始化stripeGlyph的一些参数
    this.$set(this.stripeGlyphCondition, 'layer_num', 4);
    this.$set(this.stripeGlyphCondition, 'stripe_proportion', .117);
    this.$set(this.stripeGlyphCondition, 'stripe_B_A', .08);
    this.$set(this.stripeGlyphCondition, 'stripe_L_R', .12);

  },
  mounted() {
    // 结果保存事件
    this.$bus.$on('experimentBTrainingSubmit', () => {
      this.$confirm('是否确定保存您的估算结果?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '保存成功!',
          type: 'success'
        });
        this.$bus.$emit('enableNextStep');
      }).catch(() => {
        console.log("已取消保存");
      });
    });
    // 下一步事件
    this.$bus.$on('nextStepExperimentBTraining', () => {
      if (this.curActive < 1) {
        this.curActive++;
      }
    });
    // 提交结果按钮 仅弹窗
    this.$bus.$on('experimentBTrainingResultLocal', () => {
      this.$message({
        message: '感谢您的参与，数据已保存成功!',
        type: 'success'
      });
    })
  },
  methods: {
    resetGlyph() {
      // 重置任务栏中数据输入框的值
      this.$bus.$emit('resetValue');
    },
    resetDemo() {
      this.curActive = 0;
    }
  },
  watch: {
    curActive: {
      immediate: true,
      handler(newVal) {
        if (newVal === 0) {
          this.curShowGlyph = 1;
        } else {
          this.curShowGlyph = 2;
        }
      }
    }
  },
  computed: {
    taskCondition() {
      return {
        experiment: -2,
        isDemo: true,
        active: this.curActive,
        singleExperiment: 1,
        data: this.glyphData,
        // 每个单位编码的值
        circleValue: this.curShowGlyph === 1 ? this.peaGlyphCondition.circleValue : this.stripeGlyphCondition.encoding_value
      }
    },
    descriptionCondition() {
      return {
        experiment: -2,
        glyph: this.curShowGlyph,
        value: this.curShowGlyph === 1 ? this.peaGlyphCondition.circleValue : this.stripeGlyphCondition.encoding_value,
        max: 10
      };
    },
  }
}
</script>

<style scoped>
.put_center {
  text-align: center;
}
</style>