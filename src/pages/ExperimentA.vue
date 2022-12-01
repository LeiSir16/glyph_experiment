<template>
  <el-container>
    <el-main>
      <el-container>
        <el-aside style="width: auto">
          <div style="height: 700px; margin-top: 70px">
            <el-steps direction="vertical" :active="curActive" space="25%" process-status="finish"
                      finish-status="success">
              <el-step title="PeaGlyph" description="Demo"></el-step>
              <el-step title="PeaGlyph" description="Formal Experiment"></el-step>
              <el-step title="StripeGlyph" description="Demo"></el-step>
              <el-step title="StripeGlyph" description="Formal Experiment"></el-step>
            </el-steps>
          </div>
        </el-aside>
        <el-main>
          <!--glyph显示区域-->
          <el-row>
            <el-col :span="19">
              <el-row v-for="(item,index) in glyphData" :key="index" :class="isShowGlyph">
                <el-col :span="Math.floor(24/columns)" v-for="city in item" :key="city.index">
                  <template v-if="curActive===0||curActive===1">
                    <PeaGlyph :glyph_data="{type:1,data:city}"
                              :show_condition="glyphCondition"
                              :experiment="taskCondition"/>
                  </template>
                  <template v-else>
                    <StripeGlyph :glyph_data="{type:1,data:city}"
                                 :glyphCondition="glyphCondition"
                                 :experiment="taskCondition"/>
                  </template>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="5">
              <!--颜色图例部分-->
              <el-row>
                <el-col :span="24" class="A_legend">
                  <el-row type="flex" align="middle">
                    <el-col :span="19" :offset="5">
                      <div class="title color_title">Color Legend</div>
                    </el-col>
                  </el-row>
                  <!--颜色图例部分-->
                  <ColorLegend/>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" class="A_description">
                  <el-row type="flex" align="middle">
                    <el-col :span="18" :offset="6">
                      <div class="title color_title">Description</div>
                    </el-col>
                  </el-row>
                  <Description :des-condition="descriptionCondition"/>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" class="A_task">
                  <el-row type="flex" align="middle">
                    <el-col :span="15" :offset="9">
                      <div class="title color_title">Task</div>
                    </el-col>
                  </el-row>
                  <Task :task-condition="taskCondition"/>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
</template>

<script>
import ColorLegend from "@/components/ColorLegend";
import PeaGlyph from "@/components/PeaGlyph";
import StripeGlyph from "@/components/StripeGlyph";
import Description from "@/components/Description";
import Task from "@/components/Task";

export default {
  name: "ExperimentA",
  data() {
    return {
      curActive: 0,
      glyphData: [],
      columns: 4,
      descriptionCondition: {
        experiment: 1,
        glyph: 1,
        value: 0.5,
        max: 20,
      },
      taskCondition: {
        // 实验A固定就是1
        experiment: 1,
        isDemo: true,
        active: 0
      },
      isShowGlyph: 'hid',
      // 记录的数据
      experimentAInfor: {
        startTime: '',
        endTime: '',
        peaGlyph: {
          startTime: '',
          endTime: '',
          chooseData: '',
        },
        stripeGlyph: {
          startTime: '',
          endTime: '',
          chooseData: '',
        }
      }
    };
  },
  components: {Task, Description, StripeGlyph, PeaGlyph, ColorLegend},
  methods: {
    /**
     * 格式化数据
     * @param d 数据
     * @constructor
     */
    FormatData(d) {
      let lenth = d.length;
      let j = 0;
      let result = [];
      while (j < lenth) {
        let tmp = [];
        for (let i = 0; i < this.columns; i++) {
          if (j >= lenth) {
            break;
          }
          tmp.push(d[j]);
          j++;
        }
        if (tmp.length !== 0) {
          result.push(tmp);
        }
      }
      return result;
    },
    // 根据激活的加载数据
    loadDataBaseActive(active) {
      if (this.$store.state.ExperimentAData) {
        if (active === 0 || active === 2) {
          this.glyphData = this.FormatData(this.$store.state.ExperimentAData.Demo);
        } else if (active === 1) {
          let p_d = this.$store.state.ExperimentAData.peaGlyph;
          this.glyphData = this.FormatData(p_d.sort((a, b) => {
            return Math.random() > 0.5 ? -1 : 1;
          }));
        } else {
          let s_d = this.$store.state.ExperimentAData.stripeGlyph;
          this.glyphData = this.FormatData(s_d.sort((a, b) => {
            return Math.random() > 0.5 ? -1 : 1;
          }));
        }
      }
    }
  },
  mounted() {
    // 记录下实验开始的时间
    let date = new Date();
    this.$set(this.experimentAInfor, 'startTime', date.toLocaleString());

    // 页面刚开始的加载数据
    this.$bus.$on('ExperimentAUpdate', (d) => {
      if (d.Type === 1) {
        if (this.curActive === 0 || this.curActive === 2) {
          this.glyphData = this.FormatData(d.ExperimentData.Demo);
        } else if (this.curActive === 1) {
          this.glyphData = this.FormatData(this.curActive, d.ExperimentData.peaGlyph);
        } else {
          this.glyphData = this.FormatData(this.curActive, d.ExperimentData.stripeGlyph);
        }
      }
    });
    // 初始化说明界面  1表示peaGlyph 2表示StripeGlyph
    this.$set(this.descriptionCondition, 'glyph', this.curActive === 0 || this.curActive === 1 ? 1 : 2);
    // 初始化任务条件
    this.$set(this.taskCondition, 'isDemo', this.curActive === 0 || this.curActive === 2);
    this.$set(this.taskCondition, 'active', this.curActive);
    // 显示glyph的操作
    this.$bus.$on('ShowGlyph', () => {
      this.isShowGlyph = 'show';

      // 记录下每次显示Glyph开始的时间
      let date = new Date();
      // peaGlyph的开始时间
      if (this.curActive === 1) {
        this.$set(this.experimentAInfor.peaGlyph, 'startTime', date.toLocaleString());
      }
      // stripeGlyph的开始时间
      if (this.curActive === 3) {
        this.$set(this.experimentAInfor.stripeGlyph, 'startTime', date.toLocaleString());
      }
    });
    // 下一个小实验
    this.$bus.$on('nextSmallPage', () => {
      if (this.curActive < 3) {
        // 切换到下一个实验的时候刚开始隐藏Glyph
        this.isShowGlyph = 'hid';
        this.curActive++;
      }
    });

    // 当用户选择了一个peaGlyph之后就记录下这个Glyph的相关信息
    this.$bus.$on('ExperimentAPeaGlyphRemember', (d) => {
      this.$set(this.experimentAInfor.peaGlyph, 'endTime', d.time);
      this.$set(this.experimentAInfor.peaGlyph, 'chooseData', d.data);
    });
    // 当用户选择了一个StripeGlyph之后就记录下这个Glyph的相关信息
    this.$bus.$on('ExperimentAStripeGlyphRemember', (d) => {
      this.$set(this.experimentAInfor.stripeGlyph, 'endTime', d.time);
      this.$set(this.experimentAInfor.stripeGlyph, 'chooseData', d.data);
    });
    // 第一个实验结束将实验结果先存储在Cookie中
    this.$bus.$on('experimentAResultLocal', (d) => {
      this.$set(this.experimentAInfor, 'endTime', d);
      sessionStorage.setItem('experimentA', JSON.stringify(this.experimentAInfor));
      // 判断是否存储成功
      if (JSON.parse(sessionStorage.getItem('experimentA')).startTime === this.experimentAInfor.startTime) {
        this.$message({
          message: 'Thanks, data submitted successfully!',
          type: 'success'
        });
      } else {
        this.$message({
          message: 'Sorry, data submission failed.',
          type: 'error'
        });
      }
    })
  },
  watch: {
    curActive(newVal) {
      // 激活的实验发生变化时读取不同的数据 虽然数据一致，但是每次都需要打乱 demo不需要打乱
      this.loadDataBaseActive(newVal);
      // 激活的实验变化时更新任务条件
      this.$set(this.taskCondition, 'isDemo', newVal === 0 || newVal === 2);
      this.$set(this.taskCondition, 'active', newVal);

      // 实验变化说明也要变
      this.$set(this.descriptionCondition, 'glyph', newVal === 0 || newVal === 1 ? 1 : 2);
    }
  },
  computed: {
    glyphCondition() {
      let peaGlyphCondition = {
        circleNum: 20,
        circleValue: 0.5,
        glyphSize: 270,
        centerDis: 3,
        outlineDis: 0.5,
        outlineOffset: 1,
        outlineThickness: 1,
        circleThickness: 0.5
      };
      let stripeGlyphCondition = {
        layer_out: 2,
        is_encoding_infor: true,
        glyph_size: 270,
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
      if (this.curActive === 0 || this.curActive === 1) {
        return peaGlyphCondition;
      } else {
        return stripeGlyphCondition;
      }
    },
  }
}
</script>

<style scoped>
.A_legend {
  border: 3px solid black;
  border-radius: 5px 5px 0 0;
  /*position: relative;*/
  /*right: 0;*/
}

.A_description {
  border-left: 3px solid black;
  border-right: 3px solid black;
}

.A_task {
  border: 3px solid black;
  border-radius: 0 0 5px 5px;
}

.color_title {
  font-size: x-large;
  margin: 8px 0;
}

.hid {
  opacity: 0;
}

.show {
  opacity: 1;
}
</style>