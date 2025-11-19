import React, { Component } from "react";
import * as d3 from "d3";

class InteractiveStreamGraph extends Component {
    componentDidUpdate(){
    const chartData = this.props.csvData;
    console.log("Rendering chart with data:", chartData);
    // Don't render if data is empty
    if (!chartData || chartData.length === 0) {
        return;
    }
    
    // Define the LLM model names to visualize
    const llmModels = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];

    // Write the D3.js code to create the interactive streamgraph visualization here
    
    const width = 600;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //color palette provided for models 
    const colors = { "GPT-4": "#e41a1c", "Gemini": "#377eb8", "PaLM-2": "#4daf4a", "Claude": "#984ea3", "LLaMA-3.1": "#ff7f00" };

    const svg = d3.select(".svg_parent");
    svg.selectAll("*").remove();


    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  
    const x = d3.scaleTime()
      .domain(d3.extent(chartData, (d) => d.Date))
      .range([0, innerWidth]);

    const stack = d3.stack().keys(llmModels).offset(d3.stackOffsetWiggle);
    const stackedData = stack(chartData);

    const y = d3.scaleLinear()
      .domain([
        d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])),
        d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))
      ])
      .range([innerHeight, 0]);

    const area = d3.area()
      .x((d) => x(d.data.Date))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    let tooltip = d3.select("#d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("id", "d3-tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "white")
        .style("border", "1px solid #aaa")
        .style("padding", "10px")
        .style("opacity", 0);
    }

    let miniChart = tooltip.select("#mini-chart");
    if (miniChart.empty()) {
      miniChart = tooltip.append("div").attr("id", "mini-chart");
    }

    g.selectAll("path")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("d", area)
      .attr("fill", (d) => colors[d.key])
      .attr("opacity", 0.85)
      .on("mousemove", (event, d) => {
        const model = d.key;
        tooltip.style("opacity", 1)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 20 + "px");

        this.renderMiniBarChart(miniChart, model, chartData, colors[model]);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
        miniChart.html("");
      });

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    this.renderLegend(svg, llmModels, colors);
  }

  
  renderMiniBarChart(container, model, data, color) {
    container.html(`<div style="font-weight: bold; margin-bottom: 5px;">${model}</div>`);

    const miniChartDims = { width: 180, height: 100, margin: { top: 5, right: 5, bottom: 20, left: 25 } };

    const miniSvg = container.append("svg")
      .attr("width", miniChartDims.width)
      .attr("height", miniChartDims.height);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.Date))
      .range([miniChartDims.margin.left, miniChartDims.width - miniChartDims.margin.right])
      .padding(0.15);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[model])])
      .range([miniChartDims.height - miniChartDims.margin.bottom, miniChartDims.margin.top]);


    miniSvg.selectAll(".mini-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "mini-bar")
      .attr("x", d => xScale(d.Date))
      .attr("y", d => yScale(d[model]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => miniChartDims.height - miniChartDims.margin.bottom - yScale(d[model]))
      .attr("fill", color)
      .attr("rx", 2);


    miniSvg.append("g")
      .attr("transform", `translate(0,${miniChartDims.height - miniChartDims.margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat("%b"))
          .tickSize(0)
      )
      .selectAll("text")
      .style("font-size", "9px");

  
    miniSvg.append("g")
      .attr("transform", `translate(${miniChartDims.margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(3))
      .selectAll("text")
      .style("font-size", "9px");
  }

  
  renderLegend(svg, models, colors) {
    svg.selectAll(".model-legend").remove();

    const legendGroup = svg.append("g")
      .attr("class", "model-legend")
      .attr("transform", "translate(620, 50)");

    models.forEach((model, index) => {
      const legendItem = legendGroup.append("g")
        .attr("transform", `translate(0, ${index * 24})`);

      legendItem.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", colors[model])
        .attr("rx", 3)
        .style("cursor", "pointer");

      legendItem.append("text")
        .text(model)
        .attr("x", 22)
        .attr("y", 11)
        .style("font-size", "12px")
        .style("font-family", "Arial, sans-serif")
        .style("fill", "#333");
    });
  }

  render() {
    return (
      <svg style={{ width: 600, height: 500 }} className="svg_parent">
        
      </svg>
    );
  }
}

export default InteractiveStreamGraph;
