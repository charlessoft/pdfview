

<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-card>
<!--          <canvas ref="canvasRef" ></canvas>-->
<!--          <VuePDF-->
<!--              :style="{width: '100%', height: '100%',  top: 0, left: 0}"-->
<!--              :scale="scale"-->
<!--              :pdf="pdf"-->
<!--              text-layer-->
<!--              :highlight-text="highlightText"-->
<!--              :highlight-options="highlightOptions" />-->
          <canvas id="the-canvas" style="border: 1px solid black; direction: ltr;"></canvas>
<!--          https://github.com/rossta/vue-pdfjs-demo/blob/master/src/components/PDFPage.vue-->
<!--          https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html-->
          <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" />
        </el-card>
<!--        <el-card style="position: relative;">-->
<!--          <canvas ref="canvasRef" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>-->
<!--              <VuePDF-->
<!--                  :style="{width: '100%', height: '100%'}"-->
<!--                  :scale="scale"-->
<!--                  :pdf="pdf"-->
<!--                  text-layer-->
<!--                  :highlight-text="highlightText"-->
<!--                  :highlight-options="highlightOptions" />-->
<!--</el-card>-->
      </el-col>
      <el-col :span="12">
        <el-card style="width: 100%">
          <div>
            <el-input v-model="highlightText" placeholder="请输入关键字"></el-input>
            <el-button @click="btnClick"> test</el-button>
<!--            <VueMarkdownEditor v-model="dict" height="400px"></VueMarkdownEditor>-->
            <v-md-preview :text="dict['analyzeResult']['content']"></v-md-preview>

          </div>

        </el-card>
<!--        <VueMarkdownEditor v-model="dict" height="400px"></VueMarkdownEditor>-->
      </el-col>
    </el-row>

  </div>
</template>

<script setup>

import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'
import { ref ,onMounted} from 'vue'
import MyDict from "./mydict.js";
import { fabric } from 'fabric'

import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';

const pdfSrc = ref('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
const numOfPages = ref(0);



// 1. 创建`Canvas`元素
const canvasRef = ref(null)
// const dragX = ref(300)
// const dragY = ref(0)


const str = ref("# sss")

// const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const {pdf} = usePDF('https://pdfdemo1.happygogo.site/layout-pageobject.pdf')
const scale = ref(0.5)
const highlightText = ref('This Is title')
const highlightOptions = ref({
  completeWords: false,
  ignoreCase: true,
})
const dict=ref({})

const btnClick = ()=>{
  highlightText.value= dict.value['analyzeResult']['content'].substring(91, 91+95).replace('\n',' ')
}
const InitDict = () => {
  dict.value=MyDict
}

InitDict()

onMounted(async() => {
  const loadingTask = createLoadingTask(pdfSrc.value);
  loadingTask.promise.then((pdf) => {
    numOfPages.value = pdf.numPages;
  });
  return
  const canvas = new fabric.Canvas(canvasRef.value)
  // canvas.setWidth(500)
  // canvas.setHeight(200)
  canvas.setBackgroundColor('red');

// 将你的 "polygon" 数组转化为点的数组
  const polygonPoints = [];
  const boundingRegion = [
    0.9837,
    3.1176,
    4.0065,
    3.1176,
    4.0065,
    3.7574,
    0.9837,
    3.7574
  ];

  // 计算矩形的宽度和高度
  const width = (boundingRegion[4] - boundingRegion[0]) * 72;
  const height = (boundingRegion[5] - boundingRegion[1]) * 72;

// 创建矩形并添加到画布
  const rect = new fabric.Rect({
    left: boundingRegion[0] ,
    top: boundingRegion[1] ,
    fill: 'blue',
    width: width,
    height: height,
  });

  canvas.add(rect);
  canvas.renderAll();
})

function onHighlight(value) {
  console.log(value)
}
</script>

<style scoped>

</style>