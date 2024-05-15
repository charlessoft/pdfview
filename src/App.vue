<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Main from './components/main.vue'
import {ref} from "vue";

// const jsPdf = ref("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf")
const jsPdf = ref('https://pdfdemo1.happygogo.site/k.pdf')

const loading=ref(false)
const btnJsLoad = ()=>{
  if(jsPdf.value !== ""){
    loading.value = true
  }

}
</script>

<template>
  <el-row>
    <el-col :span="12">

      <!--        <el-input v-model="pdf_url" style="width: 80%"></el-input>-->
      <!--        <el-button> 段落总结</el-button>-->
      <el-form>
        <el-form-item label="输入pdf地址:">
          <el-input v-model="jsPdf" style="width: 80%" ></el-input>
          <el-button @click="btnJsLoad" type="primary" >加载pdf</el-button>
        </el-form-item>

      </el-form>
    </el-col>
  </el-row>
  <div >
    <Main v-if="loading==true" :pdf="jsPdf" style="margin-top:0px;width: 100%;height:100%;"></Main>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
