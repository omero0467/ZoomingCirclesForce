async function draw() {
  const dataset = await d3.csv("hierarcial.csv", (d, index, columns) => {
    d3.autoType(d);
    d.total = d3.sum(columns, (c) => d[c]);
    d.title = d[""];
    return d;
  });

  console.log(dataset);

  const dimensions = {
    height: window.innerHeight,
    width: window.innerWidth,
    margin: {
      left: 100,
      right: 100,
      top: 100,
      bottom: 100,
    },
  };
  dimensions.ctrHeight = dimensions.height - dimensions.margin.bottom * 2;
  dimensions.ctrWidth = dimensions.height - dimensions.margin.bottom * 2;

  const xAccessor = (d, i) => i;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .rangeRound([50, dimensions.ctrWidth])
    .clamp(true);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .rangeRound([dimensions.ctrHeight, 0]);

  //Svg setup and container pos ======
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("height", dimensions.height)
    .attr("width", dimensions.width)
    .style("background-color", "#c15dff");

  const ctr = svg
    .append("g")
    .classed("container", true);

  //Scales ==========

  const sizeScale = d3
    .scaleLog()
    .domain([1, dataset.length])
    .range([dimensions.margin.bottom, dimensions.ctrWidth]);

  const inversion = d3
    .scaleLinear()
    .domain([1, dataset.length])
    .range([dataset.length, 1]);

  const spacingScale = d3.scaleLinear([100, dimensions.width]);

  //Intial Group =========

  ctr
    .selectAll("circle")
    .classed('initial',true)
    .data([dataset])
    .join("circle")
    .attr("r", (d) => sizeScale(d.length) * 0.1)
    .attr("cx", dimensions.width / 2)
    .attr("cy", dimensions.height / 2)
    .attr("fill", (d, i) => d3.interpolatePurples(inversion(i) / 56))

    const longestTitle = dataset.map(el=>el.title).reduce((acc,curr)=>acc.length>curr.length?acc:curr)

    const labelsGroup = ctr.append('g')
    .classed('labels',true)

    labelsGroup.append('text')
    .text(longestTitle)
    .attr('x',dimensions.width/2)
    .attr('y',dimensions.height/2)
    .attr('fill','white')
    .attr("text-anchor", "middle")
    .style('font-size','16px')
  //ZoomConfig
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([1, dataset.length - 2])
    // .thresholds(dataset.length-1)
    .extent([
      [0, 0],
      [dimensions.width, dimensions.height],
    ])
    .on("zoom", handleZoom)
    // .on('end',getNames)

  //Attach Event Listener
  svg.call(zoomBehavior);

  let newData;

  const getGroupName = (d) =>{
   const name = d.map(el=>el.title).reduce((acc,curr)=>acc.length>curr.length?acc:curr)
   console.log(name)
  return name}
  //============= zoom function =============

  function handleZoom(event) {
    let value = 0;
    value = Math.floor(event.transform.k);
    // ctr.attr('transform',event.transform)
    // Division to buckets
    if (event.transform.k>1) {
        const bin = d3
          .bin()
          .value((d) => d[value])
          .thresholds(value);
    
        newData = bin(dataset);
    
        const node = ctr
          .selectAll("circle")
          .data(newData)
          .join("circle")
          .attr("r", (d, i) => sizeScale(d.length) * 0.1)
          .attr("fill", (d, i) => d3.interpolatePurples(inversion(i) / 56))
          .style('pointer-events','none')
          
          //Group Labels
          ctr.selectAll('circle')
          .property('title',getGroupName)


    

        // ========== force ==========
        const simulation = d3
          .forceSimulation(newData)
          .force("charge", d3.forceManyBody().strength(-30))
          // .force("charge", d3.forceCollide((d)=>sizeScale((d.length)*0.1)))
          .force(
            "center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
          )
    
        simulation.on("tick", () => {
          node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
          ctr.selectAll('text').remove()

          node.each(function(d) {
            const circle = d3.select(this);
            labelsGroup.append("text")
              .text(circle.property('title'))
              .attr("x", circle.attr("cx"))
              .attr("y", circle.attr("cy"))
              .attr("text-anchor", "middle")
              .attr("font-size", "16px")
              .attr('fill','white')
              .attr('opacity',0.4)
              .raise()

              circle.lower()
            })
            
        });
        
        simulation.on('end',()=>{
          labelsGroup.selectAll('text')
          .transition()
          .attr('opacity',1)
        })
        
      }
}

}

draw();
