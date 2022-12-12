<template>
  <div ref="map">

  </div>
</template>

<script>
import qinling from '@/assets/js/qinling';
import {drawPeaGlyph, drawStripeGlyph} from "@/assets/js/drawNewGlyph";
import * as d3 from 'd3';
import {getCurrentTime} from "@/assets/js/tool";

export default {
  name: "QinlingMap",
  data() {
    return {
      mapSize: [
        1500, 780
      ],
      peaGlyphCondition: {
        size: 180,
        outline_thickness: 1,
        outline_offset: 0,
        circle_num: 40,
        outline_dis: 10,
        center_offset: 3,
        thickness: 0.2
      },
      stripeGlyphCondition: {
        size: 180,
        iRadius: 2.5,
        maxRadius: 10,
        sectorInterval: 3,
        svgEdgeDis: 0,
        outlineThickness: 0.7,
        divisionColor: 'black',
        divisionOpacity: 1,
        bgOpacity: 0,
        innerOpacity: 1,
        stripe_L_R: .1,
        stripe_B_A: .02,
        stripeProportion: .072,
        layerNum: 10,
        metaphorColor: '#C0C0C0',
        metaphorOpacity: 1,
        // 这个值现在传递的是编码的条纹的数量
        stripeNum: 40,
        isEncodingInfor: true,
        encodingInforColor: 'red',
        stripeOpacity: 1
      },
      allGlyph: [],
      curClickGlyph: '',
      curClickGlyphData: {},
      regionInfo: [],
      isExperimentC: false,
      stripeNum: 10,
    };
  },
  props: ['updateData'],
  methods: {
    IsValid(result, candidate, threshold) {
      for (const resultElement of result) {
        if (Math.abs(resultElement.centerPosition[0] - candidate.centerPosition[0]) < threshold && Math.abs(resultElement.centerPosition[1] - candidate.centerPosition[1]) < threshold) {
          return false;
        }
      }
      return true;
    },
    randomGetRegion(num, threshold) {
      let result = [];
      let f = this.features;
      if (this.features) {
        // 防止无限地查找下去
        let lastLength = 0, times = 0, totalNum = 0, tryNum = 30;
        while (result.length < num && totalNum < 20) {
          if (times > 20) {
            // 如果找了100次还没找到就置空result重新查找
            result = [];
            f = this.features;
            // 如果置空了30次还没找到就表示找不到了
            totalNum++;
            // console.log('totalNum', totalNum)
            continue;
          }
          for (let i = 0; i < tryNum; i++) {
            let index = Math.floor(Math.random() * f.length);
            let region = f[index].properties.省C[0];
            let data = this.glyphData[region];
            let centerPosition = this.path.centroid(f[index]);
            let regionInfo = {
              centerPosition: centerPosition,
              data: data
            }
            if (this.IsValid(result, regionInfo, threshold)) {
              result.push(regionInfo);
              // 每次都从剩下的区域中选择
              // 直接pop的话会修改this.features数组
              f = f.slice(0, index).concat(f.slice(index + 1, f.length));
              break;
            }
          }
          if (lastLength !== result.length) {
            lastLength = result.length;
            times = 0;
          } else {
            times++;
          }
          // console.log('times', times)
        }
      }
      if (result.length < num) {
        console.log('找不到');
        let index = Math.floor(Math.random() * this.presetGlyphData.length);
        result = this.presetGlyphData[index];
      }
      // console.log(result)
      return result
    },
    // 点击获取到它的数据
    glyphClick(outline, data) {
      this.curClickGlyph = outline;
      this.curClickGlyphData = data;
    },
    // 设置glyph布局参数
    changeLayerOut(glyph, childExperiment) {
      // peaGlyph
      if (glyph === 1) {
        this.$set(this.peaGlyphCondition, 'circle_num', childExperiment);
        if (childExperiment === 20) {
          this.$set(this.peaGlyphCondition, 'center_offset', 4);
        } else if (childExperiment === 40) {
          this.$set(this.peaGlyphCondition, 'center_offset', 3);
        } else if (childExperiment === 10) {
          this.$set(this.peaGlyphCondition, 'center_offset', 5);
        }
      } else {
        this.$set(this.stripeGlyphCondition, 'stripeNum', childExperiment);
        if (childExperiment === 20) {
          this.$set(this.stripeGlyphCondition, 'layerNum', 6);
          this.$set(this.stripeGlyphCondition, 'stripeProportion', .083);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', .07);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', .15);
        } else if (childExperiment === 40) {
          this.$set(this.stripeGlyphCondition, 'layerNum', 10);
          this.$set(this.stripeGlyphCondition, 'stripeProportion', 0.072);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', 0.02);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', 0.1);
        } else if (childExperiment === 10) {
          this.$set(this.stripeGlyphCondition, 'layerNum', 4);
          this.$set(this.stripeGlyphCondition, 'stripeProportion', 0.117);
          this.$set(this.stripeGlyphCondition, 'stripe_B_A', 0.08);
          this.$set(this.stripeGlyphCondition, 'stripe_L_R', 0.12);
        }
      }
      this.stripeNum = childExperiment;
    },
    createGlyph(value) {
      if (this.allGlyph.length !== 0) {
        for (let allGlyphElement of this.allGlyph) {
          allGlyphElement.remove();
        }
        this.allGlyph = [];
      }
      this.changeLayerOut(value.glyph, value.circleNum);
      if (value.glyph === 1) {
        // console.log(this.peaGlyphCondition);
        this.regionInfo = this.randomGetRegion(value.regionNum, this.peaGlyphCondition.size);
        for (const regionInfoElement of this.regionInfo) {
          let g = drawPeaGlyph(this.mapSvg, this.peaGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding, this.glyphClick)
          this.allGlyph.push(g);
        }
      } else {
        // console.log(this.stripeGlyphCondition)
        this.regionInfo = this.randomGetRegion(value.regionNum, this.stripeGlyphCondition.size);
        for (const regionInfoElement of this.regionInfo) {
          let g = drawStripeGlyph(this.mapSvg, this.stripeGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding, this.glyphClick)
          this.allGlyph.push(g);
        }
      }
    },
  },
  mounted() {
    const vc = this;
    vc.mapSvg = d3.select(this.$refs.map)
        .append('svg')
        .attr('width', vc.mapSize[0])
        .attr('height', vc.mapSize[1]);
    vc.mapSvg.append('g')
        .append('rect')
        .attr('width', vc.mapSize[0])
        .attr('height', vc.mapSize[1])
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', '#FAF0E6')
        .attr('fill-opacity', .5)

    // let projection = d3.geoMercator()
    //     .fitSize(vc.mapSize, qinling);
    let projection = d3.geoMercator()
        .center([112, 33])
        .scale(13500)
        .translate([vc.mapSize[0] + 150, vc.mapSize[1] - 230]);
    vc.features = qinling.features;
    vc.path = d3.geoPath().projection(projection);
    vc.mapSvg.append('g')
        .attr('class', 'show_map')
        .selectAll('.china')
        .data(vc.features)
        .join('path')
        .attr('class', 'china')
        .attr("fill", "#FAF0E6")
        .attr('d', vc.path)
        .attr('stroke', 'grey');
    this.createGlyph(this.updateData);
    this.$bus.$on('resetGlyphChoose', () => {
      if (this.curClickGlyph && this.curClickGlyphData) {
        this.curClickGlyph.select('rect').attr('stroke-opacity', 0);
        this.curClickGlyph = '';
        this.curClickGlyphData = {};
      }
    });
    // 重新生成Glyph
    this.$bus.$on('resetCurrentExperimentC', () => {
      this.createGlyph(this.updateData)
    });
    // 判断是否切换到实验二页面
    this.$bus.$on('saveCStartTime', () => {
      this.isExperimentC = true;
      // 切换到这个页面的时候保存一下生成的数据
      let d = [];
      this.regionInfo.forEach((item) => {
        d.push(item.data);
      });
      this.$bus.$emit('updateExperimentCShowData', d);
    });
  },
  watch: {
    updateData: {
      deep: true,
      handler(newVal, oldVal) {
        this.createGlyph(newVal);
        console.log(newVal);
      }
    },
    regionInfo: {
      deep: true,
      handler(newVal, oldVal) {
        // 每次数据更新的时候也在experimenC中更新数据并记录该实验开始时间
        if (newVal.length !== 0) {
          let d = [];
          newVal.forEach((item) => {
            d.push(item.data);
          });
          if (this.isExperimentC) {
            this.$bus.$emit('updateExperimentCShowData', d);
          }
        }
      }
    },
    curClickGlyphData: {
      deep: true,
      handler(newVal) {
        if (newVal && this.updateData.isDemo === false) {
          this.$bus.$emit('clickChooseData', newVal);
        }
      }
    }
  },
  computed: {
    glyphData() {
      if (this.updateData.isDemo) {
        return this.$store.state.ExperimentCDemo;
      } else {
        return this.$store.state.ExperimentCForm;
      }
    },
    presetGlyphData() {
      if (this.updateData.isDemo) {
        return this.$store.state.ExperimentCDemoPreset;
      } else {
        return this.$store.state.ExperimentCFormPreset;
      }
    }
  }
}
</script>

<style scoped>

</style>