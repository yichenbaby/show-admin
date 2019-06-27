<template>
  <el-row type="flex" class="row-bg" justify="center" align="middle">
    <el-col :xs="14" :sm="12" :md="10" :lg="8">
      <el-form
        :rules="formRules"
        ref="form"
        :model="form"
        label-width="80px"
        label-position="top"
        size="medium"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('form')">登录</el-button>
          <el-button @click="submitForm('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      form: {
        username: "admin",
        password: "123456"
      },
      formRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
          },
          {
            min: 5,
            max: 12,
            message: "用户名必须在5~12位之间",
            trigger: "change"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          },
          {
            min: 6,
            max: 12,
            message: "密码必须在6~12位之间",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // alert("submit!");
          axios({
            url: "http://localhost:8888/api/private/v1/login",
            method: "post",
            data: this.form
          }).then(({ data: { data, meta } }) => {
            // console.log(meta);
            if (meta.status === 200) {
              localStorage.setItem("token", data.token);
              this.$router.push("/home");
            }
          });
        } else {
          // console.log("error submit!!");
          // return false;
        }
      });
    }
    // resetForm(formName) {
    //   this.$refs[formName].resetFields();
    // }
  }
};
</script>
<style>
.row-bg {
  height: 100%;
  background-color: #2d434c;
}
form {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 30px 20px;
  background: #fff;
}
</style>

