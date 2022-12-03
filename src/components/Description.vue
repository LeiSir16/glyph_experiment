<template>
  <!--如果是第一个实验-->
  <div v-if="desCondition&&desCondition.experiment === 2" style="padding-bottom: 10px">
    <!--如果是peaglyph-->
    <template v-if="desCondition.glyph === 1">
      <el-row>
        <el-col :span="23" :offset="1" class="title">
          圆圈填充的颜色表示<span class="under_line">数据的类别</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="title">
          每个圆圈表示的值的大小为<span class="under_line">{{ desCondition.value.toFixed(2) }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="title">
          每类数据最多可以通过<span class="under_line">{{ desCondition.max }}</span>个圆圈表示
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="title">
          每类数据表达的值的范围是<span class="under_line">[0,{{ desCondition.value * desCondition.max }}]</span>
        </el-col>
      </el-row>
    </template>
    <!-- 如果是stripeGlyph-->
    <template v-else-if="desCondition.glyph===2">
      <el-row>
        <el-col :span="23" :offset="1" class="text">
          条纹段填充的颜色表达了<span class="under_line">数据的类别</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="text">
          每个条纹段表示的值为<span class="under_line">{{ desCondition.value.toFixed(2) }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="text">
          每类数据最多可以通过<span class="under_line">{{ desCondition.max }}</span>个小条纹编码
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="text">
          每类数据表达的值的范围是<span class="under_line">[0,{{ desCondition.value * desCondition.max }}]</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23" :offset="1" class="text">
          每个扇形区域的<span class="under_line">灰色半透明条纹</span>表达了该区域<span class="under_line">容纳的条纹上限</span>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
export default {
  name: "Description",
  props: ['desCondition'],
  data() {
    return {
      experimentA: {
        encodedValue: '0.5',
        peaGlyph: {
          Circle_Color: 'The category of attribute',
          A_Circle: 'Encoded value is',
          Maximum_Number_of_Circles: 20,
          Maximum_Value_of_Encoding: 20 * 0.5,
        },
        stripeGlyph: {}
      }
    };
  },
}
</script>

<style scoped>
.show_left {
  text-align: left;
}

.show_center {
  text-align: center;
}

.el-row {
  padding: 5px 0;
}
</style>