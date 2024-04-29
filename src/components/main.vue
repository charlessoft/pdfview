<template>
  <div>

    <el-row>
      <el-col :span="12">
        <el-upload
            class="excel-btn"
            :action="`${path}/v1/uploadFile`"
            :on-success="loadExcel"
            :show-file-list="false"
        >
          <el-button size="small" type="primary" icon="upload">导入</el-button>
        </el-upload>
      </el-col>
      <el-col :span="12">
        <el-card style="width: 100%">
          <div>
<!--            <el-input v-model="highlightText" placeholder="请输入关键字"></el-input>-->
<!--            <el-button @click="btnClick"> test</el-button>-->
            <!--            <VueMarkdownEditor v-model="dict" height="400px"></VueMarkdownEditor>-->
            <v-md-preview :text="dict['analyzeResult']['content']"></v-md-preview>

          </div>

        </el-card>
        <!--        <VueMarkdownEditor v-model="dict" height="400px"></VueMarkdownEditor>-->
      </el-col>
    </el-row>

  </div>
</template>
<script setup >
import {ref} from "vue";
const path = ref(import.meta.env.VITE_BASE_API)

const dict = ref({
  'analyzeResult':{'content':'# sss'}
})


const loadExcel = () => {
  // getTableData(loadExcelData)
}
</script>
<style scoped lang="less">
.pdf-container {
  width: 100%;
  height: 100%;
  overflow: auto; /* 启用滚动条 */
}

canvas {
  width: 100%;
  max-height: 100vh; /* 设置最大高度为视口高度 */
}
</style>
