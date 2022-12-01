<template>
  <el-container>
    <el-row style="margin-top: 10%">
      <el-col :span="Math.floor(22/glyphData.length)" v-for="city in glyphData" :key="city.index">
        <StripeGlyph :glyph_data="{type:1,data:city}"
                     :glyphCondition="stripeGlyphCondition"
                     :experiment="taskCondition"/>
      </el-col>
    </el-row>
    <el-button type="primary" size="small" class="text" @click="showConfirm">加载数据
    </el-button>
  </el-container>
</template>

<script>


import StripeGlyph from "@/components/StripeGlyph";

export default {
  name: "Test",
  components: {StripeGlyph},
  data() {
    return {
      taskCondition: {
        experiment: 2,
        isDemo: true,
        active: 0
      },
      glyphData: {},
      stripeGlyphCondition: {
        layer_out: 2,
        is_encoding_infor: true,
        glyph_size: 500,
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
        layer_num: 10,
        inner_radius: 2.5,
        sector_interval: 3,
        outline_thickness: 0.5,
        division_thickness: 0.5,
        stripe_proportion: 0.072,
        stripe_B_A: 0.02,
        stripe_L_R: 0.1,
        stripe_thickness: 0.07,
        encoding_value: 0.5,
      }
    }
  },
  mounted() {
    this.$bus.$on('ExperimentBUpdate', (d) => {
      let b_d = d.ExperimentData;
      this.glyphData = b_d.Demo;
    });
  },
  methods: {
    showConfirm() {
      this.$store.dispatch('readExperimentData', {
        type: 2,
        success: (d) => {
          this.$bus.$emit('ExperimentBUpdate', d);
        }
      });
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>