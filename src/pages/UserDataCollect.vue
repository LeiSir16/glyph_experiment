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
            <el-form label-position="right" :rules="rules" ref="formUser" label-width="80px" :model="userInfor">
              <el-form-item label="实验编号">
                <el-input v-model="userInfor.sId" readonly></el-input>
              </el-form-item>
              <el-form-item label="姓名" prop="name">
                <el-input v-model="userInfor.name" placeholder="请输入您的姓名" clearable></el-input>
              </el-form-item>
              <el-form-item label="年龄" prop="age">
                <el-input v-model.number="userInfor.age" placeholder="请输入您的年龄" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="StartExperiment('formUser')">开始实验</el-button>
              </el-form-item>
            </el-form>
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
      userInfor: {
        sId: '',
        name: '',
        age: 0
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
  mounted() {
    // 自动生成编号
    this.$set(this.userInfor, 'sId', getId());
  },
  methods: {
    StartExperiment(fN) {
      this.$refs[fN].validate((valid) => {
        if (valid) {
          this.isShow = false;
          // 将用户信息存储到会话缓存中
          sessionStorage.setItem('userInfor', JSON.stringify(this.userInfor));
          // 读取数据并将数据传递至第一个实验
          this.$store.dispatch('readExperimentData', {
            type: 1,
            success: (d) => {
              this.$bus.$emit('ExperimentAUpdate', d);
            }
          });
          // 读取第二个实验的数据并传递至第二个实验
          this.$store.dispatch('readExperimentData', {
            type: 2,
            success: (d) => {
              this.$bus.$emit('ExperimentBUpdate', d);
            }
          });
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