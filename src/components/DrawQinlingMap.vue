<template>
  <div ref="map"></div>
</template>

<script>
import * as d3 from "d3";
import {drawPeaGlyph, drawStripeGlyph} from "@/assets/js/drawNewGlyph";

export default {
  name: "DrawQinlingMap",
  props: ['updateData', 'glyphChoose'],
  data() {
    return {
      peaGlyphCondition: {
        outline_thickness: 1,
        outline_offset: 0,
        circle_num: 40,
        outline_dis: 10,
        center_offset: 3,
        thickness: 0.2
      },
      stripeGlyphCondition: {
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
    };
  },
  methods: {
    /**
     * 修改glyph的参数
     * @param glyph     glyph的类型
     * @param condition 条件10/40
     */
    changeLayerOut(glyph, condition, glyphSize) {
      if (glyph === 1) {
        let centerOffset = 0;
        switch (condition) {
          case 10:
            centerOffset = 5;
            break;
          case 20:
            centerOffset = 4;
            break;
          case 40:
            centerOffset = 3;
            break;
        }
        this.$set(this.peaGlyphCondition, 'center_offset', centerOffset);
        this.$set(this.peaGlyphCondition, 'circle_num', condition);
        this.$set(this.peaGlyphCondition, 'size', glyphSize);
      } else {
        let layerNum = 0, stripeProportion = 0, stripe_B_A = 0, stripe_L_R = 0;
        switch (condition) {
          case 10:
            layerNum = 4;
            stripeProportion = .117;
            stripe_B_A = .08;
            stripe_L_R = .12;
            break;
          case 20:
            layerNum = 6;
            stripeProportion = .083;
            stripe_B_A = .07;
            stripe_L_R = .15;
            break;
          case 40:
            layerNum = 10;
            stripeProportion = .072;
            stripe_B_A = .02;
            stripe_L_R = .1;
            break;
        }
        this.stripeGlyphCondition = {
          ...this.stripeGlyphCondition,
          stripeNum: condition,
          size: glyphSize,
          layerNum,
          stripeProportion,
          stripe_B_A,
          stripe_L_R
        };
      }
    },
    createGlyph(showData) {
      // 首先销毁所有的glyph
      if (this.allGlyph && this.allGlyph.length !== 0) {
        for (let glyph of this.allGlyph) {
          glyph.remove();
        }
        this.allGlyph = [];
      }
      // 根据对应的glyph和条件调整glyph的参数
      this.changeLayerOut(showData.glyph, showData.condition, showData.glyphSize);
      // 将数据拷贝一份
      this.regionInfo = [...showData.data];
      // 根据数据创建每一个glyph
      for (const regionInfoElement of this.regionInfo) {
        let drawGlyphG;
        if (showData.glyph === 1) {
          drawGlyphG = drawPeaGlyph(this.mapSvg, this.peaGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding, this.glyphChoose);
        } else {
          drawGlyphG = drawStripeGlyph(this.mapSvg, this.stripeGlyphCondition, regionInfoElement.data, regionInfoElement.centerPosition, this.$store.state.qinlingColorEncoding, this.glyphChoose);
        }
        this.allGlyph.push(drawGlyphG);
      }
    }
  },
  mounted() {
    const vc = this;
    vc.mapSize = vc.updateData.mapSize;
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
        .attr('fill-opacity', .5);
    vc.features = vc.updateData.features;
    vc.path = vc.updateData.path;
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
  },
  watch: {
    updateData: {
      deep: true,
      handler(newVal, oldVal) {
        this.createGlyph(newVal);
      }
    }
  }
}
</script>

<style scoped>

</style>