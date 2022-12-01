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

</style>
