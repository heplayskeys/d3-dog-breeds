const showBars = () => {
	if (!document.querySelector('#dog-nav-3').classList.contains('active')) {
		d3.select('svg').remove();
	}

	if (currentPage === 3) {
		return;
	}

	document.querySelector('.active').classList.remove('active');
	document.querySelector('#dog-nav-3').classList.add('active');
	document.querySelector('#dog-nav-prev').classList.remove('disabled');
	document.querySelector('#dog-nav-next').classList.remove('disabled');
	document.querySelector('#doggy-details').innerHTML =
		"<p>Of the AKCs top 10 ranked breeds, only 5 can be found in the category for '<strong>Brightest Dogs</strong>'.</p><p>Of those 5, there is a fairly consistent measure of dog height, though their respective weights appear highly variable.</p>";
	let chartTitle = document.querySelector('#chart-title');
	chartTitle.innerHTML =
		'<h1 class="display-6">Top 10 Breeds: Weight & Height</h1><p class="text-muted">Hover over bars to view details.</p>';
	chartTitle.style.marginBottom = '0';

	const margin = { top: 50, right: 200, bottom: 100, left: 125 },
		width = 1260 - margin.left - margin.right,
		height = 960 - margin.top - margin.bottom;

	const div = d3.select('body').append('div').attr('class', 'toolTip');

	const svg = d3
		.select('#chart-container')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	d3.csv('breed_size_info.csv', (err, data) => {
		if (err) throw err;

		const subgroups = data.columns.slice(1);
		const groups = d3.map(data, d => d.breed).keys();
		const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.15]);

		svg
			.append('g')
			.classed('axis-x', true)
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x).tickSize(0))
			.selectAll('text')
			.style('font-size', 12)
			.attr('y', (d, i) => (i % 2 === 0 ? 15 : 45));

		svg
			.select('.axis-x')
			.selectAll('line')
			.data(data)
			.attr('stroke', '#999')
			.attr('y2', (d, i) => (i % 2 === 0 ? 10 : 40));

		const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
		svg.append('g').call(d3.axisLeft(y));

		const z = d3.scaleOrdinal().range(d3.schemeSet2);

		const xSubgroup = d3
			.scaleBand()
			.domain(subgroups)
			.range([0, x.bandwidth()])
			.padding([0.1]);

		const color = d3.scaleOrdinal().domain(subgroups).range(d3.schemeSet2);

		svg
			.append('g')
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.attr('transform', d => 'translate(' + x(d.breed) + ',0)')
			.classed('breed', true)
			.selectAll('rect')
			.data(d =>
				subgroups.map(key => {
					return { key: key, value: d[key] };
				})
			)
			.enter()
			.append('rect')
			.attr('x', d => xSubgroup(d.key))
			.attr('y', d => y(d.value))
			.attr('width', xSubgroup.bandwidth())
			.attr('height', d => height - y(d.value))
			.attr('fill', d => color(d.key));

		const barGroup = svg
			.selectAll('.breed')
			.data(data)
			.attr('class', (d, i) => `barGroup-${i}`)
			.style('opacity', 0.75);

		barGroup.on('mouseover', (d, i) => {
			d3.select(`.barGroup-${i}`)
				.style('opacity', 1)
				.style('transition', 'opacity 0.15s');
			d3.selectAll('rect').style('border', '1px solid black');
		});

		barGroup.on('mousemove', d => {
			div.style('left', d3.event.pageX + 40 + 'px');
			div.style('top', d3.event.pageY - 75 + 'px');
			div.style('display', 'inline-block');
			div.style('background-color', 'rgba(255,255,255,0.9)');
			div.style('padding', '25px 10px 0 10px');
			div.html(`
        <h6 class='tooltip-title'>${d.breed}</h6>
				<hr/>
        <p>Average Weight: <b>${d.average_weight} lbs</b></p>
        <p>Average Height: <b>${d.average_height} in</b></p>
      `);
		});

		barGroup.on('mouseout', (d, i) => {
			d3.select(`.barGroup-${i}`).style('opacity', 0.75);
			div.style('display', 'none');
		});

		const legend = svg
			.append('g')
			.attr('font-family', 'sans-serif')
			.attr('font-size', 10)
			.attr('text-anchor', 'end')
			.selectAll('g')
			.data(subgroups)
			.enter()
			.append('g')
			.attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

		legend
			.append('rect')
			.attr('x', width - 19)
			.attr('width', 19)
			.attr('height', 19)
			.attr('fill', z);

		legend
			.append('text')
			.attr('x', width - 24)
			.attr('y', 9.5)
			.attr('dy', '0.32em')
			.text(d => {
				return d == 'average_weight' ? 'Avg. Weight (lbs)' : 'Avg. Height (in)';
			});
	});
	currentPage = 3;
};
