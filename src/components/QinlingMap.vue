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
        1450, 780
      ],
      peaGlyphCondition: {
        size: 180,
        outline_thickness: 1,
        outline_offset: 0,
        circle_value: 2,
        circle_num: 10,
        outline_dis: 10,
        center_offset: 4,
        thickness: 0.5
      },
      stripeGlyphCondition: {
        size: 180,
        iRadius: 3,
        maxRadius: 10,
        sectorInterval: 1.5,
        svgEdgeDis: 0,
        outlineThickness: 1,
        divisionColor: 'white',
        divisionOpacity: 1,
        bgOpacity: 0,
        innerOpacity: 1,
        stripe_L_R: .12,
        stripe_B_A: .08,
        stripeProportion: .117,
        layerNum: 4,
        metaphorColor: '#C0C0C0',
        metaphorOpacity: 1,
        encodingValue: 2,
        isEncodingInfor: true,
        encodingInforColor: 'red',
        stripeOpacity: 1
      },
      allGlyph: [],
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
      let spawnPoints = [];
      let tryNum = 30;
      if (this.features) {
        // 先随机选一个区域数据放进去
        let index = Math.floor(Math.random() * this.features.length);
        let region = this.features[index].properties.省C[0];
        let data = this.glyphData[region];
        let centerPosition = this.path.centroid(this.features[index]);
        let regionInfo = {
          centerPosition: centerPosition,
          data: data
        }
        spawnPoints.push(regionInfo);
        while (result.length < num) {
          let spawnIndex = Math.floor(Math.random() * spawnPoints.length);
          let spawnCentre = spawnPoints[spawnIndex];
          let candidateAccepted = false;
          for (let i = 0; i < tryNum; i++) {
            index = Math.floor(Math.random() * this.features.length);
            region = this.features[index].properties.省C[0];
            data = this.glyphData[region];
            centerPosition = this.path.centroid(this.features[index]);
            regionInfo = {
              centerPosition: centerPosition,
              data: data
            }
            if (this.IsValid(result, regionInfo, threshold)) {
              result.push(regionInfo);
              spawnPoints.push(regionInfo);
              candidateAccepted = true;
              break;
            }
          }
          if (!candidateAccepted) {
            spawnPoints.pop(spawnIndex);
          }
        }
      }
      return result;
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
          let g = drawStripeGlyph(this.mapSvg, this.stripeGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding)
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
  },
  watch: {
    updateData: {
      deep: true,
      handler(newVal, oldVal) {
        this.createGlyph(newVal);
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