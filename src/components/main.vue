<template>
  <div>
    <el-row>
      <el-col>
        <el-button :loading="loading" @click="test" type="primary">LR段落分析</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="pdf-container">
        <div>
          <canvas v-for="pdfIndex in pdfPages" :id="`pdf-canvas-${pdfIndex}`" :key="pdfIndex" />
        </div>
      </el-col>
      <el-col :span="12">
        <el-card style="margin-top:20px;" v-for="item in final_summary">
          <template #header>
            <div class="card-header">
              <span style="text-transform: lowercase;" >index:{{item.id}}</span>
            </div>
          </template>
          <span style="font-size: 12px; " >{{item.content}}</span>
          <el-button :loading="loading" @click="btnSummary(item)" type="primary">总结</el-button>

          <div>
          <el-tag v-if="item.summary!==undefined" style="font-size: 14px;">总结:</el-tag><span style="font-size: 12px; color: blue " >{{item.summary}}</span>
          </div>
        </el-card>

      </el-col>
    </el-row>

  </div>
</template>
<script setup lang="ts">
import * as PDFJS from '/public/pdf.mjs'
import * as PdfWorker from '/public/pdf.worker.mjs'
import { nextTick, ref, Ref, watch } from 'vue'
import { isEmpty, debounce } from 'lodash-es'
// import {analysepdf_byurl} from "@/api/api/pdf_analyse";
import {
  analysepdf_byurl,
  summaryParagraph
} from '@/api/api'
import {l} from "vite/dist/node/types.d-aGj9QkWt";
// const pdf_url = ref("https://pdfdemo1.happygogo.site/k.pdf")
const props: any = defineProps({
  pdf: {
    required: true
  }
})
const final_summary=ref([])
const loading = ref(false)
const btnSummary = (item: any) => {
  // console.log(content)
  loading.value=true
  summaryParagraph({'content':item.content}).then((res: any) => {
    item.summary = res.data
    console.log(item)
    loading.value=false
  })
}
const test = async () => {
  loading.value = true
  let data =
      {"url": props.pdf}
  let ret = await analysepdf_byurl(data)
  loading.value=false
  pdf_info.value = ret.data
  final_summary.value = []
  pdf_info.value['paragraphs'].forEach((item: any) => {
    // 只做第1页
    if (item.page_index !== 0) return
    if (item.content.length < 50 || item.rect.height < 30) return
    final_summary.value.push(item)
    // loading.value=true
    // summaryParagraph({'content':item.content}).then((res: any) => {
    //   console.log(res)
    //   item.summary=res.data
    //   final_summary.value.push(item)
    //   renderPage(1)
    //   loading.value=false
    // })
  })
  renderPage(1)

  // final_summary.value.forEach(item=>{
  //   summaryParagraph({'content':item.content}).then((res: any) => {
  //     console.log(res)
  //     item.summary=res.data
  //     final_summary.value.push(item)
  //     renderPage(1)
  //     loading.value=false
  //   })
  // })


  console.log(ret.data)
}
let pdfDoc: any = null
const pdfPages: Ref = ref(0)
const pdfScale: Ref = ref(1)
const loadFile = async (url: any) => {
  // 设定pdfjs的 workerSrc 参数
  PDFJS.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.1.392/build/pdf.worker.min.mjs"
  const loadingTask = PDFJS.getDocument(
      {url:url,
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/",
      cMapPacked: true}
  )
  loadingTask.promise.then(async (pdf: any) => {
    pdfDoc = pdf // 保存加载的pdf文件流
    pdfPages.value = 1;//pdfDoc.numPages // 获取pdf文件的总页数
    await nextTick(() => {
      renderPage(1) // 将pdf文件内容渲染到canvas
    })
  }).catch((error: any) => {
    //可以用自己组件库弹出提示框
    console.log(error)
  })
}

const renderPage = (num: any) => {
  const scale = 1;

  const canvas: any = document.getElementById(`pdf-canvas-${num}`)
  if (canvas === null) return
  const context = canvas.getContext("2d");
  pdfDoc.getPage(num).then((page: any) => {
    const viewport = page.getViewport({ scale });
    console.log(viewport)
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    page.render(renderContext).promise.then(()=>{
      if (Object.keys(pdf_info.value).length == 0) {
        console.log('pdf_info.value 不为空');
        return
      }
            final_summary.value.forEach((item: any) => {
            if (item.page_index !== num-1) return
            if (item.content.length < 50 || item.rect.height < 30) return
            context.beginPath();
            context.rect(item.rect.left, item.rect.top, item.rect.width, item.rect.height);
            context.strokeStyle = 'red';
            context.stroke();

            // 设置文本样式
            context.font = '16px Arial'; // 你可以根据需要调整字体大小和样式
            context.fillStyle = 'red'; // 文本颜色

            // 计算文本的宽度（这里假设文本的高度大约等于字体的大小，对于简单的用途通常足够）
            const textWidth = context.measureText(item.id).width;
            const textHeight = 16; // 这里假设字体大小为16px

            // 计算文本的起始位置，以便将其居中放置在矩形内
            const textX = item.rect.left + (item.rect.width - textWidth) / 2;
            const textY = item.rect.top + (item.rect.height - textHeight) / 2 + textHeight; // 加上textHeight以垂直居中

            // 绘制文本
            context.fillText(item.id, textX, textY);
          })
    })
  })

}

const debouncedLoadFile = debounce((pdf: any) => loadFile(pdf), 1000)
watch(() => props.pdf, (newValue: any) => {

  !isEmpty(newValue) && debouncedLoadFile(newValue)
}, {
  immediate: true
})
const pdf_info= ref({})
// const pdf_info= ref({"paragraphs": [{"content": "K-means 聚类算法在入侵检测中的应用", "id": 1, "page_index": 0, "pdf_rect": {"bottom": 694.1201782226562, "left": 111.60000610351562, "right": 488.51422119140625, "top": 723.4728393554688 }, "type": 3, "rect": {"left": 111.60000610351562, "top": 118.52716064453125, "right": 488.51422119140625, "bottom": 147.87982177734375, "width": 376.9142150878906, "height": 29.3526611328125 } }, {"content": "李洋", "id": 2, "page_index": 0, "pdf_rect": {"bottom": 676.4782104492188, "left": 289.97998046875, "right": 317.1600341796875, "top": 688.4031982421875 }, "type": 1, "rect": {"left": 289.97998046875, "top": 153.5968017578125, "right": 317.1600341796875, "bottom": 165.52178955078125, "width": 27.1800537109375, "height": 11.92498779296875 } }, {"content": "(长沙理工大学计算机与通信工程学院，长沙410076)", "id": 3, "page_index": 0, "pdf_rect": {"bottom": 662.5826416015625, "left": 207.6000213623047, "right": 392.5986022949219, "top": 673.1561889648438 }, "type": 1, "rect": {"left": 207.6000213623047, "top": 168.84381103515625, "right": 392.5986022949219, "bottom": 179.4173583984375, "width": 184.9985809326172, "height": 10.57354736328125 } }, {"content": "摘要：提出了一种基于聚类分析方法构建入侵检测库的模型，实现了按K-平均值方法建立入侵检测库并据此划分安全等级的思想。该检测系统的建立不依赖于经验数据，能自动依据原有数据对入侵行为进行重新划分。仿真实验表明，该方法具有较强的实用性和自适应功能。关键词：网络安全；入侵检测；数据挖掘；聚类分析；K-平均值", "id": 4, "page_index": 0, "pdf_rect": {"bottom": 617.4022216796875, "left": 60.720149993896484, "right": 543.4788818359375, "top": 653.956298828125 }, "type": 1, "rect": {"left": 60.720149993896484, "top": 188.043701171875, "right": 543.4788818359375, "bottom": 224.5977783203125, "width": 482.758731842041, "height": 36.5540771484375 } }, {"content": "Application of K-means Clustering Algorithm in Intrusion Detection", "id": 5, "page_index": 0, "pdf_rect": {"bottom": 566.0626831054688, "left": 143.40000915527344, "right": 456.84771728515625, "top": 607.456787109375 }, "type": 4, "rect": {"left": 143.40000915527344, "top": 234.543212890625, "right": 456.84771728515625, "bottom": 275.93731689453125, "width": 313.4477081298828, "height": 41.39410400390625 } }, {"content": "LI Yang", "id": 6, "page_index": 0, "pdf_rect": {"bottom": 545.71728515625, "left": 284.70001220703125, "right": 315.54827880859375, "top": 557.7142944335938 }, "type": 1, "rect": {"left": 284.70001220703125, "top": 284.28570556640625, "right": 315.54827880859375, "bottom": 296.28271484375, "width": 30.8482666015625, "height": 11.99700927734375 } }, {"content": "(Institute of Computer &Communication Engineering, Changsha Universityof Science &Technology, Changsha 410076)", "id": 7, "page_index": 0, "pdf_rect": {"bottom": 531.7503662109375, "left": 103.9800033569336, "right": 496.15484619140625, "top": 542.2361450195312 }, "type": 1, "rect": {"left": 103.9800033569336, "top": 299.76385498046875, "right": 496.15484619140625, "bottom": 310.2496337890625, "width": 392.17484283447266, "height": 10.48577880859375 } }, {"content": "【Abstract】This paperintroduces an intrusion detection model based on clustering analysis and realizes an algorithmofK-means which can set up a database of intrusion detection and classify safe levels. Experiential data are not required to set up this detection system, which is capable of re-classifying intrusion behaviors in terms of related data automatically. Simulation experiments show that the technique possesses strong applicability and self-adaptability.", "id": 8, "page_index": 0, "pdf_rect": {"bottom": 473.5504150390625, "left": 60.720001220703125, "right": 540.3511352539062, "top": 523.1878051757812 }, "type": 1, "rect": {"left": 60.720001220703125, "top": 318.81219482421875, "right": 540.3511352539062, "bottom": 368.4495849609375, "width": 479.6311340332031, "height": 49.63739013671875 } }, {"content": "【Key words】network security; intrusion detection; data mining; clustering analysis; K-means", "id": 9, "page_index": 0, "pdf_rect": {"bottom": 460.502685546875, "left": 60.720001220703125, "right": 369.4386291503906, "top": 471.227783203125 }, "type": 1, "rect": {"left": 60.720001220703125, "top": 370.772216796875, "right": 369.4386291503906, "bottom": 381.497314453125, "width": 308.7186279296875, "height": 10.72509765625 } }, {"content": "随着网络的迅速发展和广泛使用，人们得益于网络的同时，网上的数据也频繁地受到黑客的攻击和篡改，网络安全变得越来越重要。目前常用的安全技术如信息加密、防火墙等可以作为保护网络的第1 道防线，但仅有上述技术是不够的，比如目前广泛使用的防火墙技术不能阻止内部攻击，不能提供实时检测等，人们由此提出了网络安全的第2 道防线——入侵检测技术。入侵检测用于识别非授权使用计算机系统的个体(如黑客)和虽有合法授权但滥用其权限的用户(如内部攻击)。现有的入侵检测系统大都采用专家系统或基于统计的方法，这需要较多的经验，而数据挖掘(data mining)方法的优势在于它能从大量数据中提取人们感兴趣的、事先未知的知识和规律，而不依赖经验[1]。本文运用数据挖掘中的聚类分析方法，建立入侵检测模型数据库。它的优点是能高度自动化地分析原有数据，作出归纳性推理，从中挖掘出潜在的模式，预测出客户的行为，更重要的是它能够优化或完全抛弃既有的模型，对入侵行为重新划分并用显示或隐式的方法进行描述。仿真实验表明该方法具有较强的实用性和自适应功能。本文的聚类分析方法是基于距离的K-平均值(K-means) 方法，利用此技术实现网络安全目前在国内外都是一种新的尝试。", "id": 10, "page_index": 0, "pdf_rect": {"bottom": 173.9183349609375, "left": 56.631752014160156, "right": 289.7029113769531, "top": 438.7432861328125 }, "type": 1, "rect": {"left": 56.631752014160156, "top": 403.2567138671875, "right": 289.7029113769531, "bottom": 668.0816650390625, "width": 233.07115936279297, "height": 264.824951171875 } }, {"content": "入侵检测是对入侵行为的发觉。入侵检测系统将收集到的信息加以分析，判断网络中是否有违反安全策略的行为和遭到攻击的迹象，若找到入侵痕迹，认为与正常行为相符合的行为是正常行为，与攻击行为相符合的是入侵行为，二者都不符合的，则认为是异常数据，将其加入到数据仓库中作进一步分析。", "id": 12, "page_index": 0, "pdf_rect": {"bottom": 79.47847747802734, "left": 56.699737548828125, "right": 289.54888916015625, "top": 158.00328063964844 }, "type": 1, "rect": {"left": 56.699737548828125, "top": 683.9967193603516, "right": 289.54888916015625, "bottom": 762.5215225219727, "width": 232.84915161132812, "height": 78.5248031616211 } }, {"content": "入侵检测系统的基本框架如图1 所示[2]。—154—", "id": 13, "page_index": 0, "pdf_rect": {"bottom": 48.25762939453125, "left": 56.70001220703125, "right": 232.3964080810547, "top": 79.14229583740234 }, "type": 1, "rect": {"left": 56.70001220703125, "top": 762.8577041625977, "right": 232.3964080810547, "bottom": 793.7423706054688, "width": 175.69639587402344, "height": 30.884666442871094 } }, {"content": "原始数据", "id": 14, "page_index": 0, "pdf_rect": {"bottom": 381.9908752441406, "left": 347.7684326171875, "right": 354.36810302734375, "top": 414.3760070800781 }, "type": 1, "rect": {"left": 347.7684326171875, "top": 427.6239929199219, "right": 354.36810302734375, "bottom": 460.0091247558594, "width": 6.59967041015625, "height": 32.3851318359375 } }, {"content": "引擎格式数据", "id": 15, "page_index": 0, "pdf_rect": {"bottom": 421.50946044921875, "left": 369.66448974609375, "right": 417.65643310546875, "top": 436.821533203125 }, "type": 1, "rect": {"left": 369.66448974609375, "top": 405.178466796875, "right": 417.65643310546875, "bottom": 420.49053955078125, "width": 47.991943359375, "height": 15.31207275390625 } }, {"content": "检测器", "id": 16, "page_index": 0, "pdf_rect": {"bottom": 380.3692932128906, "left": 366.607421875, "right": 385.56683349609375, "top": 389.11383056640625 }, "type": 1, "rect": {"left": 366.607421875, "top": 452.88616943359375, "right": 385.56683349609375, "bottom": 461.6307067871094, "width": 18.95941162109375, "height": 8.744537353515625 } }, {"content": "模型", "id": 17, "page_index": 0, "pdf_rect": {"bottom": 377.2385559082031, "left": 400.7343444824219, "right": 416.1000671386719, "top": 391.40875244140625 }, "type": 1, "rect": {"left": 400.7343444824219, "top": 450.59124755859375, "right": 416.1000671386719, "bottom": 464.7614440917969, "width": 15.36572265625, "height": 14.170196533203125 } }, {"content": "数据仓库", "id": 18, "page_index": 0, "pdf_rect": {"bottom": 395.912841796875, "left": 427.2720947265625, "right": 439.9917297363281, "top": 412.51763916015625 }, "type": 1, "rect": {"left": 427.2720947265625, "top": 429.48236083984375, "right": 439.9917297363281, "bottom": 446.087158203125, "width": 12.719635009765625, "height": 16.60479736328125 } }, {"content": "格式数据模型", "id": 19, "page_index": 0, "pdf_rect": {"bottom": 393.5032653808594, "left": 449.4635925292969, "right": 474.5426330566406, "top": 423.189453125 }, "type": 1, "rect": {"left": 449.4635925292969, "top": 418.810546875, "right": 474.5426330566406, "bottom": 448.4967346191406, "width": 25.07904052734375, "height": 29.686187744140625 } }, {"content": "自适应检测模型产生", "id": 20, "page_index": 0, "pdf_rect": {"bottom": 400.3497619628906, "left": 485.0498046875, "right": 516.3089599609375, "top": 416.95440673828125 }, "type": 1, "rect": {"left": 485.0498046875, "top": 425.04559326171875, "right": 516.3089599609375, "bottom": 441.6502380371094, "width": 31.2591552734375, "height": 16.604644775390625 } }, {"content": "图1 入侵检测框架", "id": 21, "page_index": 0, "pdf_rect": {"bottom": 356.8399353027344, "left": 392.4790344238281, "right": 462.26287841796875, "top": 367.5655517578125 }, "type": 1, "rect": {"left": 392.4790344238281, "top": 474.4344482421875, "right": 462.26287841796875, "bottom": 485.1600646972656, "width": 69.78384399414062, "height": 10.725616455078125 } }, {"content": "图1 中引擎观察原始数据并计算用于模型评估的特征； 检测器获取引擎的数据并利用检测模型评估它是否是一个攻击；数据仓库被用作数据和模型的中心存储地；自适应检测模型实时产生，送至检测器实时检测入侵行为。在整个检测系统中，自适应检测模型的产生无疑对入侵行为的辨识起着决定作用。如何快速准确地产生检测模型库显得至关重要。", "id": 22, "page_index": 0, "pdf_rect": {"bottom": 272.3916931152344, "left": 310.934814453125, "right": 547.6668090820312, "top": 350.9202880859375 }, "type": 1, "rect": {"left": 310.934814453125, "top": 491.0797119140625, "right": 547.6668090820312, "bottom": 569.6083068847656, "width": 236.73199462890625, "height": 78.52859497070312 } }, {"content": "入侵检测模型能否高效、准确地辨析海量的用户行为数据，并尽可能降低误判率、漏判率是判断一个入侵检测系统成功与否的标志。数据挖掘技术是一种决策支持过程，它主要基于人工智能(AI)、机器学习统计等技术，能从大量数据中提取或挖掘知识。其中的聚类分析方法具有可伸缩性、高维性、能处理不同类型属性、可按各种约束聚类等优点，尤其适用大型数据库的模式分类[4]。", "id": 24, "page_index": 0, "pdf_rect": {"bottom": 164.68626403808594, "left": 310.934814453125, "right": 543.8914184570312, "top": 256.4757080078125 }, "type": 1, "rect": {"left": 310.934814453125, "top": 585.5242919921875, "right": 543.8914184570312, "bottom": 677.3137359619141, "width": 232.95660400390625, "height": 91.78944396972656 } }, {"content": "聚类按照“最大化类内相似性，最小化类间相似性”的原则，将数据对象分组为多个类或簇(cluster)，同一个簇中的对象具有较高相似度，而不同簇间的对象差别较大，对象间", "id": 26, "page_index": 0, "pdf_rect": {"bottom": 111.76375579833984, "left": 310.93438720703125, "right": 543.7939453125, "top": 150.2705841064453 }, "type": 1, "rect": {"left": 310.93438720703125, "top": 691.7294158935547, "right": 543.7939453125, "bottom": 730.2362442016602, "width": 232.85955810546875, "height": 38.50682830810547 } }, {"content": "作者简介：李洋(1974－)，男，硕士研究生，主研方向：数据挖掘， 智能控制，Petri网理论及应用", "id": 27, "page_index": 0, "pdf_rect": {"bottom": 78.1264419555664, "left": 310.0950622558594, "right": 547.4659423828125, "top": 101.66107177734375 }, "type": 1, "rect": {"left": 310.0950622558594, "top": 740.3389282226562, "right": 547.4659423828125, "bottom": 763.8735580444336, "width": 237.37088012695312, "height": 23.534629821777344 } }, {"content": "收稿日期：2006-08-27", "id": 28, "page_index": 0, "pdf_rect": {"bottom": 65.16580200195312, "left": 310.0950622558594, "right": 387.71063232421875, "top": 75.73981475830078 }, "type": 1, "rect": {"left": 310.0950622558594, "top": 766.2601852416992, "right": 387.71063232421875, "bottom": 776.8341979980469, "width": 77.61557006835938, "height": 10.574012756347656 } }, {"content": "E-mail：liyangpeace@sina.com", "id": 29, "page_index": 0, "pdf_rect": {"bottom": 65.16580200195312, "left": 403.5796203613281, "right": 508.7788391113281, "top": 75.89144134521484 }, "type": 1, "rect": {"left": 403.5796203613281, "top": 766.1085586547852, "right": 508.7788391113281, "bottom": 776.8341979980469, "width": 105.19921875, "height": 10.725639343261719 } }, {"content": "f", "id": 0, "page_index": 1, "pdf_rect": {"bottom": 281.5011901855469, "left": 63.13408660888672, "right": 65.98527526855469, "top": 287.3895263671875 }, "type": 1 }, {"content": "的相异度根据对象的属性值计算。聚类分析属观察式学习， 不依赖预先定义的类和训练实例，由此形成的每个簇，可从中导出相应规则。聚类分析算法包括划分法(patitioning method)、层次法(hierarchical method)、密度法(density method) 等，其中划分法最常用。", "id": 1, "page_index": 1, "pdf_rect": {"bottom": 716.67822265625, "left": 56.69983673095703, "right": 289.7514953613281, "top": 781.8232421875 }, "type": 1 }, {"content": "给定一个有N个对象或元组的数据库，用聚类划分法构建数据的K 个划分，每个划分表示一个聚簇，并且K≤N， 即将数据划分为K个组时，必须满足如下要求：(1)每个组至少包含一个对象；(2)每个对象必须属于且只属于一个组。划分法首先创建一个初始划分，然后采用一种迭代的重新定位技术，通过对象在划分间的移动改进划分效果。一个好划分的一般准则是：同一类中的对象间尽可能“接近”或相关， 不同类中的对象间尽可能“远离”或不同。当然，还有许多其它评判划分质量的准则。", "id": 3, "page_index": 1, "pdf_rect": {"bottom": 583.8987426757812, "left": 56.69915771484375, "right": 289.6391296386719, "top": 702.4672241210938 }, "type": 1 }, {"content": "为了达到全局最优，基于划分的聚类要求穷举所有可能的划分。在聚类划分中，基于距离的分类采用度量方式，例如K-means、K-medoids 等。当前比较流行的启发式方法首推K-means 算法，本文采用此算法对已知用户行为数据库进行聚类划分，检测入侵行为。", "id": 4, "page_index": 1, "pdf_rect": {"bottom": 517.358642578125, "left": 56.6995964050293, "right": 289.579833984375, "top": 582.5032958984375 }, "type": 1 }, {"content": "K-means 算法以K为参数，把N个对象分为K个簇，以使簇内具有较高的相似度，而簇间的相似度较低。相似度的计算根据一个簇中的平均值(视为簇重心)进行。K-means 算法的处理过程为：(1)随机选择K个对象，每个对象初始代表一个簇的平均值或中心。对剩余的每个对象，根据其与各个簇中心的距离，将它赋给最近的簇。(2)重新计算每个簇的平均值。这个过程不断重复，直至准则函数收敛到期望值。由于实际应用中对象数据选用的度量单位将直接影响聚类分析结果，不同度量单位可能产生迥异的聚类结构，因此为避免对度量单位选择的依赖，实际中应先对数据进行标准化处理。标准化的步骤如下：", "id": 6, "page_index": 1, "pdf_rect": {"bottom": 357.8785095214844, "left": 56.699127197265625, "right": 289.6379699707031, "top": 503.0872802734375 }, "type": 1 }, {"content": "给定一个变量f的度量值， (1)计算平均绝对误差(mean absolute deviation)sf sf = p 1 (yf1 −mf + yf2 −mf +...+ yfp −mf )", "id": 7, "page_index": 1, "pdf_rect": {"bottom": 311.2568359375, "left": 74.57936096191406, "right": 256.3541259765625, "top": 356.6872863769531 }, "type": 1 }, {"content": "其中， y 1 f ,...,yfp 是变量f的p个度量值；mf是f的平均值，即", "id": 8, "page_index": 1, "pdf_rect": {"bottom": 297.1170349121094, "left": 56.70000076293945, "right": 289.5778503417969, "top": 311.9629211425781 }, "type": 4 }, {"content": "1", "id": 9, "page_index": 1, "pdf_rect": {"bottom": 287.2893981933594, "left": 75.60000610351562, "right": 79.42900848388672, "top": 297.3520202636719 }, "type": 5 }, {"content": "fp", "id": 10, "page_index": 1, "pdf_rect": {"bottom": 280.734619140625, "left": 131.2955322265625, "right": 135.5253448486328, "top": 287.3895263671875 }, "type": 1 }, {"content": "fi", "id": 11, "page_index": 1, "pdf_rect": {"bottom": 251.9667510986328, "left": 95.87431335449219, "right": 99.01214599609375, "top": 258.3531494140625 }, "type": 1 }, {"content": "f", "id": 12, "page_index": 1, "pdf_rect": {"bottom": 241.43202209472656, "left": 104.09404754638672, "right": 106.79646301269531, "top": 247.0131072998047 }, "type": 1 }, {"content": "fi", "id": 13, "page_index": 1, "pdf_rect": {"bottom": 246.14651489257812, "left": 78.95437622070312, "right": 82.0920639038086, "top": 252.53329467773438 }, "type": 1 }, {"content": "1 f", "id": 14, "page_index": 1, "pdf_rect": {"bottom": 280.734619140625, "left": 88.39454650878906, "right": 91.84535217285156, "top": 287.3895263671875 }, "type": 1 }, {"content": "f2", "id": 15, "page_index": 1, "pdf_rect": {"bottom": 280.734619140625, "left": 103.75504302978516, "right": 107.56521606445312, "top": 287.3895263671875 }, "type": 1 }, {"content": "m = (y +y +...+y )。", "id": 16, "page_index": 1, "pdf_rect": {"bottom": 281.0182800292969, "left": 57.84000015258789, "right": 149.41641235351562, "top": 292.9432678222656 }, "type": 5 }, {"content": "p", "id": 17, "page_index": 1, "pdf_rect": {"bottom": 276.4892883300781, "left": 75.24515533447266, "right": 79.90888214111328, "top": 286.6744384765625 }, "type": 5 }, {"content": "x = y −mf ，i=1,2,…,p", "id": 19, "page_index": 1, "pdf_rect": {"bottom": 247.3583984375, "left": 75.18216705322266, "right": 164.335205078125, "top": 262.9547119140625 }, "type": 1 }, {"content": "s", "id": 20, "page_index": 1, "pdf_rect": {"bottom": 242.31320190429688, "left": 100.80404663085938, "right": 103.5805892944336, "top": 251.61495971679688 }, "type": 5 }, {"content": "用于判断的准则函数通常采用均方误差和，其定义如式(1)所示：", "id": 21, "page_index": 1, "pdf_rect": {"bottom": 214.4182891845703, "left": 56.70000076293945, "right": 289.5175476074219, "top": 239.66331481933594 }, "type": 4 }, {"content": "E = ∑i k =1 ∑p∈Ci p − mi 2 (1)", "id": 22, "page_index": 1, "pdf_rect": {"bottom": 198.7257843017578, "left": 85.40164947509766, "right": 289.770751953125, "top": 212.99905395507812 }, "type": 1 }, {"content": "d(, i j)= xi1 −xj2 2 + xi2 −xj2 2 +...+ xip −xjp 2 (2)", "id": 23, "page_index": 1, "pdf_rect": {"bottom": 178.0200958251953, "left": 84.1195297241211, "right": 289.7706298828125, "top": 192.9083251953125 }, "type": 1 }, {"content": "其中，E是数据库中所有对象的均方误差总和；p表示给定的数据对象；mi是簇ci中数据对象的加权平均值(p和mi都是多维的)；簇ci的数目取决待划分类数。每个对象与簇中心的距离采用欧几里德距离， 其定义如式(2)所示，其中i =(xi1 ,xi2 ,...,xip )和j =(xj1 ,xj2 ,...,xjp )是2 个P维的数据对象。该算法试图找出使均方误差函数值最小的K个划分，令生成的结果尽量紧凑、独立。下面给出了K-means算法的流程，从中可以得到，算法的复杂度为O(nkt) ，远小于O(n2)，其中，n", "id": 24, "page_index": 1, "pdf_rect": {"bottom": 67.95767974853516, "left": 56.6985969543457, "right": 289.673583984375, "top": 173.746337890625 }, "type": 4 }, {"content": "是所有对象的数目；k是簇的数目；t是迭代次数(一般k和t 均小于n)。鉴于待划分的数据库通常比较大，这种性能还是比较优良的。", "id": 25, "page_index": 1, "pdf_rect": {"bottom": 743.314208984375, "left": 310.91827392578125, "right": 544.0928955078125, "top": 781.9629516601562 }, "type": 4 }, {"content": "K-means 算法流程如下。", "id": 26, "page_index": 1, "pdf_rect": {"bottom": 729.994140625, "left": 328.7984313964844, "right": 424.8765869140625, "top": 741.919189453125 }, "type": 1 }, {"content": "算法K-means 基于簇中对象平均值输入簇的数目K和N 个对象的数据库", "id": 27, "page_index": 1, "pdf_rect": {"bottom": 703.3543701171875, "left": 328.7981872558594, "right": 478.5762634277344, "top": 728.5991821289062 }, "type": 1 }, {"content": "输出K 个簇，满足均方误差函数值最小步骤：", "id": 28, "page_index": 1, "pdf_rect": {"bottom": 676.83447265625, "left": 328.7981872558594, "right": 483.79925537109375, "top": 701.9593505859375 }, "type": 1 }, {"content": "限于篇幅，本文利用上述K-means算法只对一个小型用户行为数据库进行实例分类[1]，表1(除Class栏)列出了20 条网络级连接记录的特征数据[5]。须指出的是，入侵检测很大程度上依赖于收集信息的可靠性和正确性，选择哪些数据表现用户行为是首要问题。黑客们经常在系统和网络日志文件中留下踪迹，充分利用这些信息是检测入侵的必要条件。所选择的特征数据应能充分反映用户行为特征全貌，数据量应尽量小，提取难度不可太大，还要考虑学习过程的时间、用户行为的时效性等。此例中，特征参数的含义如表2 所示[6]。", "id": 31, "page_index": 1, "pdf_rect": {"bottom": 468.6956787109375, "left": 310.9170837402344, "right": 548.2333984375, "top": 587.1200561523438 }, "type": 4 }, {"content": "参数", "id": 32, "page_index": 1, "pdf_rect": {"bottom": 438.59722900390625, "left": 313.85821533203125, "right": 326.4354553222656, "top": 447.1831970214844 }, "type": 1 }, {"content": "序号1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20", "id": 33, "page_index": 1, "pdf_rect": {"bottom": 227.3496856689453, "left": 313.85821533203125, "right": 326.4354553222656, "top": 437.16326904296875 }, "type": 1 }, {"content": "网络连接记录及分类", "id": 34, "page_index": 1, "pdf_rect": {"bottom": 450.5401611328125, "left": 402.77777099609375, "right": 474.1773986816406, "top": 461.1136169433594 }, "type": 5 }, {"content": "表1", "id": 35, "page_index": 1, "pdf_rect": {"bottom": 450.5401611328125, "left": 380.4578552246094, "right": 394.2138366699219, "top": 461.2652282714844 }, "type": 5 }, {"content": "—155—", "id": 38, "page_index": 1, "pdf_rect": {"bottom": 48.257362365722656, "left": 512.6974487304688, "right": 544.197265625, "top": 60.08329772949219 }, "type": 4 }, {"content": "此算法用C++编程实现，实验数据均取自PIII566 微机。按上述流程及所选择的特征数据，程序经过8 次迭代即识别出攻击、异常和安全3 种类型的记录(也可根据需要设定其它分类数)，均方误差和为57.004 327。将该算法用于不同大小数据集，实验表明，迭代次数总是一个小于数据集的整数， 并与之保持近似线性关系，这无疑对满足适时应用需要有实际作用。此例中，聚类分析后识别出的结果如表2 的Class 栏所示。从中可以看出，运行K-means 聚类后，记录3 是唯一具有攻击倾向的记录；而记录4~6、12、13、19、20 是具有异常行为模式的7 条记录，需要进一步观察；剩下的记录1、2、7~11、14~18 则是安全的。K-means 算法按特征参数的性质，把该网络级行为数据集归为3 类。", "id": 0, "page_index": 2, "pdf_rect": {"bottom": 623.4983520507812, "left": 56.698909759521484, "right": 293.8964538574219, "top": 781.8232421875 }, "type": 1 }, {"content": "图2 是运行算法前后，聚类结果的对照。从图2(b)中可以看出，具有异常或攻击行为模式的记录，同正常行为记录有效隔离开来。对K-means 聚类结果进行分析后，总结出如表3 所示的3 类规则及其含义，这些规则中的正常与攻击行为模式可作为入侵检测模式保留在数据仓库中，用以预测和判断用户行为合法性的依据。", "id": 1, "page_index": 2, "pdf_rect": {"bottom": 543.6383666992188, "left": 56.699127197265625, "right": 289.57659912109375, "top": 622.1032104492188 }, "type": 1 }, {"content": "规则", "id": 3, "page_index": 2, "pdf_rect": {"bottom": 217.91966247558594, "left": 71.8800048828125, "right": 84.45732116699219, "top": 226.5056610107422 }, "type": 1 }, {"content": "表3 聚类检测规则", "id": 4, "page_index": 2, "pdf_rect": {"bottom": 230.70265197753906, "left": 138.239990234375, "right": 208.0203857421875, "top": 241.4277801513672 }, "type": 1 }, {"content": "含义", "id": 5, "page_index": 2, "pdf_rect": {"bottom": 217.91966247558594, "left": 182.5800018310547, "right": 195.15731811523438, "top": 226.5056610107422 }, "type": 1 }, {"content": "在一个时间窗口内，目标主机与当前连接相同的次数大于等于", "id": 6, "page_index": 2, "pdf_rect": {"bottom": 205.4396514892578, "left": 99.60000610351562, "right": 278.1404724121094, "top": 214.02565002441406 }, "type": 1 }, {"content": "攻击", "id": 7, "page_index": 2, "pdf_rect": {"bottom": 193.4396514892578, "left": 71.8800048828125, "right": 84.45732116699219, "top": 202.02565002441406 }, "type": 1 }, {"content": "15；同一主机的连接中出现SYN错误的百分比大于等于88%， 且目标端口与当前连接相同次数大于等于25", "id": 8, "page_index": 2, "pdf_rect": {"bottom": 181.43936157226562, "left": 99.60000610351562, "right": 279.9375, "top": 202.02565002441406 }, "type": 1 }, {"content": "异常", "id": 9, "page_index": 2, "pdf_rect": {"bottom": 157.379638671875, "left": 67.9800033569336, "right": 80.55731964111328, "top": 165.96563720703125 }, "type": 1 }, {"content": "正常", "id": 10, "page_index": 2, "pdf_rect": {"bottom": 133.379638671875, "left": 67.9800033569336, "right": 80.55731964111328, "top": 141.96563720703125 }, "type": 1 }, {"content": "在一个时间窗口内，目标主机与当前连接相同次数大于等于6； 同一主机连接中出现SYN错误的百分比大于75%，且目标端口与当前连接相同次数大于等于6", "id": 11, "page_index": 2, "pdf_rect": {"bottom": 145.3793487548828, "left": 99.59972381591797, "right": 281.37750244140625, "top": 177.96563720703125 }, "type": 1 }, {"content": "如果不满足上述条件", "id": 12, "page_index": 2, "pdf_rect": {"bottom": 133.379638671875, "left": 99.60000610351562, "right": 157.5360107421875, "top": 141.96563720703125 }, "type": 1 }, {"content": "—156—", "id": 13, "page_index": 2, "pdf_rect": {"bottom": 48.25762939453125, "left": 56.70001220703125, "right": 88.20000457763672, "top": 60.0836296081543 }, "type": 1 }, {"content": "00 ..2", "id": 14, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 368.39996337890625, "right": 379.84686279296875, "top": 535.0547485351562 }, "type": 1 }, {"content": "2", "id": 15, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 373.7996826171875, "right": 377.3619384765625, "top": 535.0547485351562 }, "type": 1 }, {"content": "00. .33", "id": 16, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 401.6373596191406, "right": 413.5068054199219, "top": 535.0547485351562 }, "type": 1 }, {"content": "00.. 44", "id": 17, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 435.7745666503906, "right": 447.2268981933594, "top": 535.0547485351562 }, "type": 1 }, {"content": "00 ..5", "id": 18, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 468.352294921875, "right": 480.88690185546875, "top": 535.0547485351562 }, "type": 1 }, {"content": "5", "id": 19, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 474.5926818847656, "right": 478.1549377441406, "top": 535.0547485351562 }, "type": 1 }, {"content": "00.", "id": 20, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 500.7503662109375, "right": 511.5467529296875, "top": 535.0547485351562 }, "type": 1 }, {"content": ".66", "id": 21, "page_index": 2, "pdf_rect": {"bottom": 525.4842529296875, "left": 505.0707092285156, "right": 514.3668823242188, "top": 535.0547485351562 }, "type": 1 }, {"content": "对其中的异常行为记录作进一步分析，可再次运用K-means 算法进行二次识别，程序只经过4 次迭代，划归出2 类，分别是记录4、6、12、13、20 和记录5、19，均方误差和为18.055 98。图3 是再次应用聚类算法识别异常行为记录后，分类出的结果。对分类的记录数据进行合理性分析， 可以得出记录4、6、12、13、20 的用户行为不具备攻击特性， 可提高其安全等级； 而记录5、19 相同服务的连接中出现SYN 错误达60%，同一主机连接中出现SYN 错误超过90%，应予以重点监控。", "id": 22, "page_index": 2, "pdf_rect": {"bottom": 663.4583129882812, "left": 310.91900634765625, "right": 548.2385864257812, "top": 781.8232421875 }, "type": 1 }, {"content": "图3 二次分类结果", "id": 24, "page_index": 2, "pdf_rect": {"bottom": 509.28265380859375, "left": 392.4599609375, "right": 462.2403869628906, "top": 520.0077514648438 }, "type": 1 }, {"content": "本文运用聚类分析中的K-means 算法分析用户行为数据库，从中筛选出不安全的用户，也可以凭借该算法分列安全等级，构建入侵检测库。", "id": 26, "page_index": 2, "pdf_rect": {"bottom": 454.898681640625, "left": 310.9194641113281, "right": 543.738037109375, "top": 493.4032897949219 }, "type": 1 }, {"content": "与传统方法相比，基于聚类的K-means 算法在检测的精确度上可能略有不足，但其应用便捷，对训练数据集的要求低，特别是它可以优化或完全抛弃既有模型，对用户行为重新划分，从中不断挖掘新的潜在模式，使该方法在入侵检测领域有广泛的应用前景。", "id": 27, "page_index": 2, "pdf_rect": {"bottom": 388.3587341308594, "left": 310.9195556640625, "right": 543.73779296875, "top": 453.5032958984375 }, "type": 1 }, {"content": "该算法适用于对入侵检测库构建时的初选，为降低误判率和漏判率，还可对初选后的结果再次分类或配合其它算法进行合法性分析，提高辨析精度。但是K-means 方法不适合发现非凸面形状的簇，或大小差别很大的簇，而且它对“噪声”和孤立点数据较敏感，少量该类数据可能对平均值产生较大影响，因此，如何“降噪”和“脱敏”是下一步工作需要继续研究的问题。", "id": 28, "page_index": 2, "pdf_rect": {"bottom": 295.1787414550781, "left": 310.9192810058594, "right": 543.8577880859375, "top": 386.9632873535156 }, "type": 1 }, {"content": "参考文献", "id": 29, "page_index": 2, "pdf_rect": {"bottom": 267.3384094238281, "left": 409.4402770996094, "right": 445.6211853027344, "top": 279.2633972167969 }, "type": 1 } ] })
</script>
<style scoped lang="less">
.pdf-container {
  width: 100%;
  height: 100%;
  overflow: auto; /* 启用滚动条 */
}

canvas {
  width: 100%;
  //max-height: 100vh; /* 设置最大高度为视口高度 */
}
</style>
