<template>
  <el-container>
    <el-main>
      <qinling-map/>
    </el-main>
  </el-container>
</template>

<script>
// import qinLingMap from '@/assets/js/qinling'
import Task from "@/components/Task";
import Description from "@/components/Description";
import ColorLegend from "@/components/ColorLegend";
import QinlingMap from "@/components/QinlingMap";

export default {
  name: "ExperimentC",
  components: {QinlingMap, Task, Description, ColorLegend},
  data() {
    return {}
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>