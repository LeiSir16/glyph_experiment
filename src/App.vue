<template>
  <div id="app">
    <!--    <MainPage/>-->
    <!--    <UserDataCollect/>-->
    <router-view></router-view>
  </div>
</template>

<script>
// import MainPage from "@/pages/MainPage";
// import UserDataCollect from "@/pages/UserDataCollect";

export default {
  name: 'App',
  components: {
    // MainPage
    // UserDataCollect
  },
  mounted() {
    this.$bus.$on('EnterExperiment', () => {
      this.$router.push({
        name: 'MainPage'
      })
    })
  }
}
</script>

<style>
.navigation {
  font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
  font-size: x-large;
  font-weight: bolder;
}

.title {
  font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
}

.text {
  font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
}

.under_line {
  font-weight: 1000;
}

.B_legend {
  border: 3px solid black;
  border-radius: 5px 5px 0 0;
}

.B_description {
  border-left: 3px solid black;
  border-right: 3px solid black;
}

.B_task {
  border: 3px solid black;
  border-radius: 0 0 5px 5px;
}

.color_title {
  font-size: x-large;
  font-weight: bolder;
  margin: 8px 0;
}

.bianhao {
  text-align: center;
  padding-left: 8%;
  padding-top: 1%;
  font-family: "Gotham Black", serif;
  font-size: xxx-large;
}

.put_center {
  text-align: center;
}
</style>
