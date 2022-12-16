<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="24" class="center" style="margin-top: 30px">
          <div style="font-size: xx-large;font-weight: 800">欢迎参加本次实验</div>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-row>
        <el-row>
          <el-col :span="24" class="center">
            <h4 style="color: grey">请允许我们收集您的一些个人信息</h4>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7" :offset="8">
            <!--:model校验的时候要保证该字段与信息对象变量名一致-->
            <el-form label-position="right" :rules="rules" ref="formUser" label-width="80px" :model="userInfo">
              <el-form-item label="实验编号">
                <el-input v-model="userInfo.sId" readonly></el-input>
              </el-form-item>
              <el-form-item label="姓名" prop="name">
                <el-input v-model="userInfo.name" placeholder="请输入您的姓名" clearable></el-input>
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio label="男"></el-radio>
                  <el-radio label="女"></el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="年龄" prop="age">
                <el-input v-model.number="userInfo.age" placeholder="请输入您的年龄" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="StartExperiment('formUser')">开始实验</el-button>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="center">
            <h3 style="color: red;font-weight: bolder">请在屏幕1920x1080分辨率，100%缩放的环境下完成实验，实验过程中请勿缩放浏览器</h3>
          </el-col>
        </el-row>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import {getId} from "@/assets/js/tool";

export default {
  name: "UserDataCollect",
  data() {
    return {
      userInfo: {
        sId: '',
        gender: '男',
        name: '',
        age: 23
      },
      rules: {
        name: [
          {required: true, message: '请输入您的姓名', trigger: 'blur'}
        ],
        age: [
          {required: true, message: '年龄不能为空'},
          {type: 'number', message: '年龄必须为数字值'}
        ]
      },
    };
  },
  beforeCreate() {
    // 在该页面加载的时候就加载数据
    this.$store.dispatch('readExperimentData', {
      type: 2
    });
    this.$store.dispatch('readExperimentQinLingData', 1);
    this.$store.dispatch('readExperimentQinLingData', 2);
    this.$store.dispatch('readExperimentCPreset', 1);
    this.$store.dispatch('readExperimentCPreset', 2);
  },
  mounted() {
    // 自动生成编号
    this.$set(this.userInfo, 'sId', getId());
  },
  methods: {
    StartExperiment(fN) {
      this.$refs[fN].validate((valid) => {
        if (valid) {
          this.isShow = false;
          // 将用户信息存储到会话缓存中
          sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
          // 进入实验页面 app.vue里跳转到MainPage
          this.$bus.$emit('EnterExperiment');
        } else {
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.center {
  text-align: center;
}

.form {
  margin: 10px 0;
}
</style>