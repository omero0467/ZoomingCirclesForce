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
//   const yAccessor = (d, i) => d.total;

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
    .style("background-color", "lightblue");

  const ctr = svg
    .append("g")
    // .attr(
    //   "translate",
    //   `transform(${dimensions.margin.left},${dimensions.margin.top})`
    // )
    // .attr('transform',`translate(${dimensions.width/2},${dimensions.height/2})`)
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

    
    // //label
    // const labelsGroup = ctr.append('g').classed('Labels-Group',true)
    // const label = ctr.append('g')
    // .append('text')
    // .text(longestTitle)
    // .attr('text-anchor','middle')
    // .attr('fill','white')   
    // .attr('y',dimensions.height/2)
    // .attr('x',dimensions.width/2)
    // .style('font-size','24px')
  //
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
    .on('end',getNames)

  //Attach Event Listener
  svg.call(zoomBehavior);

  let newData;

  // simulation.on("tick", () => {

  //   node.attr("cx", d => d.x)
  //     .attr("cy", d => d.y);
  // });

  //============= zoom function =============

  function handleZoom(event) {
    let value = 0;
    value = Math.floor(event.transform.k);

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

        node.property('title',d=>d.map(el=>el.title).reduce((acc,curr)=>acc.length>curr.length?acc:curr))
        

    //       labelsGroup
    //    .selectAll('text')
    //    .data(newData)
    //    .join(enter=>enter.append('text')
    //    .attr('x',d=>xScale(d.x0) + (xScale(d.x1)-xScale(d.x0))/2)
    //    .attr('y', d=> dimensions.ctrHeight)
    //    .text(d=>d.title),
       
    //    update=>update,

    //    exit=>exit
    // //    .transition(exitTransition)
    //    .attr('y',dimensions.ctrHeight)
    //    .remove()
    //    )
          

    
        // node.attr('transform',event.transform)

        // ========== force ==========
        const simulation = d3
          .forceSimulation(newData)
          .force("charge", d3.forceManyBody().strength(-100))
          // .force("charge", d3.forceCollide((d)=>sizeScale((d.length)*0.1)))
          .force(
            "center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
          )
    
        simulation.on("tick", () => {
          node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        });

        simulation.on('end',()=>{
          const circle = d3.select(this)
          console.log(circle);
          node.selectAll('text')
          .remove()
          node.append('text')
          .text(circle.property('title'))
          console.log(node.datum().title);
        })

       
        
      }
}

const node = ctr.selectAll('circle')
function getNames(event){
// console.log(event);

}
}

draw();
