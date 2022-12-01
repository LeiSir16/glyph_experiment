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
          <el-row style="margin-top: 5%">
            <!-- key一定要保证唯一，不然可能会出现两个Glyph一个更新一个没更新-->
            <el-col>

            </el-col>
          </el-row>
          <template v-if="isDemo">
            <!--demo界面允许重复测试-->
            <el-row type="flex" align="middle" style="margin-top: 5%">
              <el-col :span="8" :offset="11">
                <el-button plain icon="el-icon-refresh-left" class="title under_line">重置示例
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
                <div class="title color_title">实验描述</div>
              </el-col>
            </el-row>
            <el-row type="flex" align="middle">
              <el-col :span="24">
                <Description/>
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
                <Task/>
              </el-col>
            </el-row>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
// import qinLingMap from '@/assets/js/qinling'
import Task from "@/components/Task";
import Description from "@/components/Description";
import ColorLegend from "@/components/ColorLegend";

export default {
  name: "ExperimentC",
  components: {Task, Description, ColorLegend},
  data() {
    return {
      isDemo: true,
      // test: qinLingMap.features[0].properties.省C
    }
  },
  mounted() {
    console.log('实验C挂载了')
  },
  activated() {
    console.log('激活了')
  }
}
</script>

<style scoped>

</style>