<template>
  <div ref="map">

  </div>
</template>

<script>
import qinling from '@/assets/js/qinling';
import {drawPeaGlyph} from "@/assets/js/drawNewGlyph";
import * as d3 from 'd3';

export default {
  name: "QinlingMap",
  data() {
    return {
      glyphData: this.$store.state.ExperimentCForm[0],
      mapSize: [
        1350, 800
      ]
    };
  },
  mounted() {
    const vc = this;
    let mapSvg = d3.select(this.$refs.map)
        .append('svg')
        .attr('width', vc.mapSize[0])
        .attr('height', vc.mapSize[1]);

    let projection = d3.geoMercator()
        .fitSize(vc.mapSize, qinling);
    let features = qinling.features;
    let path = d3.geoPath().projection(projection);
    mapSvg.append('g')
        .attr('class', 'show_map')
        .selectAll('.china')
        .data(features)
        .join('path')
        .attr('class', 'china')
        .attr("fill", "#d3d5d6")
        .attr('d', path)
        .attr('stroke', 'black');
    mapSvg.append('g')
        .attr('class', 'test')
        .selectAll('circle')
        .data(features)
        .join('circle')
        .attr('r', 1)
        .attr('cx', (d) => {
          return path.centroid(d)[0]
        })
        .attr('cy', (d) => {
          return path.centroid(d)[1]
        })
        .attr('fill', 'yellow')
    console.log(this.glyphData)
    drawPeaGlyph(mapSvg, {
      size: 100,
      outline_thickness: 1,
      outline_offset: 0,
    }, this.glyphData, path.centroid(features[0]))
    console.log(path.centroid(features[0]))
  }
}
</script>

<style scoped>

</style>