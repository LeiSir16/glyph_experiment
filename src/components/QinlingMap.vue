<template>
  <div ref="map">

  </div>
</template>

<script>
import qinling from '@/assets/js/qinling';
import {drawPeaGlyph, drawStripeGlyph} from "@/assets/js/drawNewGlyph";
import * as d3 from 'd3';

export default {
  name: "QinlingMap",
  data() {
    return {
      mapSize: [
        1500, 780
      ],
      peaGlyphCondition: {
        size: 170,
        outline_thickness: 1,
        outline_offset: 0,
        circle_num: 40,
        outline_dis: 10,
        center_offset: 3,
        thickness: 0.5
      },
      stripeGlyphCondition: {
        size: 170,
        iRadius: 2.5,
        maxRadius: 10,
        sectorInterval: 3,
        svgEdgeDis: 0,
        outlineThickness: 0.5,
        divisionColor: 'white',
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
      if (this.features) {
        // 防止无限地查找下去
        let lastLength = 0, times = 0, totalNum = 0, tryNum = 30;
        while (result.length < num && totalNum < 100) {
          if (times > 100) {
            // 如果找了100次还没找到就置空result重新查找
            result = [];
            // 如果置空了30次还没找到就表示找不到了
            totalNum++;
            // console.log('totalNum', totalNum)
            continue;
          }
          for (let i = 0; i < tryNum; i++) {
            let index = Math.floor(Math.random() * this.features.length);
            let region = this.features[index].properties.省C[0];
            let data = this.glyphData[region];
            let centerPosition = this.path.centroid(this.features[index]);
            let regionInfo = {
              centerPosition: centerPosition,
              data: data
            }
            if (this.IsValid(result, regionInfo, threshold)) {
              result.push(regionInfo);
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
        console.log('找不到')
      }
      // console.log(result)
      return result
    },
    glyphClick(outline, data) {
      this.curClickGlyph = outline;
      this.curClickGlyphData = data;
    },
    createGlyph(value) {
      if (this.allGlyph.length !== 0) {
        for (let allGlyphElement of this.allGlyph) {
          allGlyphElement.remove();
        }
        this.allGlyph = [];
      }
      if (value.glyph === 1) {
        let regionInfo = this.randomGetRegion(value.regionNum, this.peaGlyphCondition.size);
        for (const regionInfoElement of regionInfo) {
          let g = drawPeaGlyph(this.mapSvg, this.peaGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding)
          this.allGlyph.push(g);
        }
      } else {
        let regionInfo = this.randomGetRegion(value.regionNum, this.stripeGlyphCondition.size);
        for (const regionInfoElement of regionInfo) {
          let g = drawStripeGlyph(this.mapSvg, this.stripeGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding, this.glyphClick)
          this.allGlyph.push(g);
        }
      }
    }
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
        .attr('fill', '#2d3b39')
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
        .attr("fill", "#2d3b38")
        .attr('d', vc.path)
        .attr('stroke', 'grey');
    this.createGlyph(this.updateData);

    // console.log(this.glyphData)
    // console.log(vc.path.centroid(vc.features[0]))
    // console.log(vc.randomGetRegion(10, 150));
    this.$bus.$on('resetGlyphChoose', () => {
      if (this.curClickGlyph && this.curClickGlyphData) {
        this.curClickGlyph.select('rect').attr('stroke-opacity', 0);
        this.curClickGlyph = '';
        this.curClickGlyphData = {};
      }
    });
    this.$bus.$on('updateMapShowData', () => {
      this.createGlyph(this.updateData);
    })
  },
  watch: {
    updateData: {
      deep: true,
      handler(newVal, oldVal) {
        this.createGlyph(newVal);
        console.log('更新')
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
    }
  }
}
</script>

<style scoped>

</style>