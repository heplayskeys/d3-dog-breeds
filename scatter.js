const showScatter = () => {
	if (!document.querySelector('#dog-nav-4').classList.contains('active')) {
		d3.select('svg').remove();
	}

	if (currentPage === 4) {
		return;
	}

	document.querySelector('.active').classList.remove('active');
	document.querySelector('#dog-nav-4').classList.add('active');
	document.querySelector('#dog-nav-prev').classList.remove('disabled');
	document.querySelector('#dog-nav-next').classList.add('disabled');
	document.querySelector('#doggy-details').innerHTML =
		"<p>After analysis, while the professor's hypothesis was initially rejected, it was later accepted as potentially having significance.</p><p>That said, through visualizing the data points collected and displayed through this series of charts, it does not seem apparently clear whether or not there is, in fact, a correlation between breed size and breed intelligence.</p><p>As such... it would appear size <strong>DOES NOT</strong> matter.</p>";
	let chartTitle = document.querySelector('#chart-title');
	chartTitle.innerHTML =
		'<h1 class="display-6">Breed Size vs Breed Intelligence</h1><p class="text-muted">Click and drag regions to zoom and view breeds. Double-click to reset.</p>';
	chartTitle.style.marginBottom = '0';

	const margin = { top: 50, right: 200, bottom: 100, left: 125 };

	const width = 1260 - margin.left - margin.right,
		height = 960 - margin.top - margin.bottom;

	const svg = d3
		.select('#chart-container')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	d3.csv('breed_size_and_intelligence.csv', data => {
		const x = d3.scaleLinear().domain([0, 110]).range([0, width]).nice();
		const y = d3.scaleLinear().domain([0, 40]).range([height, 0]);

		const xAxis = d3.axisBottom(x),
			yAxis = d3.axisLeft(y);

		let brush = d3
				.brush()
				.extent([
					[0, 0],
					[width, height],
				])
				.on('end', brushended),
			idleTimeout,
			idleDelay = 350;

		const clip = svg
			.append('defs')
			.append('svg:clipPath')
			.attr('id', 'clip')
			.append('svg:rect')
			.attr('width', width)
			.attr('height', height)
			.attr('x', 0)
			.attr('y', 0);

		const color = d3
			.scaleOrdinal()
			.domain([
				'Brightest Dogs',
				'Excellent Working Dogs',
				'Above Average Working Dogs',
				'Average Working Dogs',
				'Fair Working Dogs',
				'Lowest Degree of Working Dogs',
			])
			.range(d3.schemePaired);

		const scatter = svg
			.append('g')
			.attr('id', 'scatterplot')
			.attr('clip-path', 'url(#clip)');

		scatter
			.selectAll('.dot')
			.data(data)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('r', 4)
			.attr('cx', d => x(d.reps))
			.attr('cy', d => y(d.height))
			.attr('r', 6)
			.attr('opacity', 0.5)
			.style('fill', d => color(d.classification));

		scatter
			.selectAll('.dot-label')
			.data(data)
			.enter()
			.append('text')
			.text(d => d.breed)
			.attr('x', d => x(d.reps) + 10)
			.attr('y', d => y(d.height) + 5)
			.style('opacity', 0)
			.style('transition', 'opacity 0.25s')
			.style('transition-delay', '0.25s');

		svg
			.append('g')
			.attr('id', 'axis--x')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x));

		svg
			.append('text')
			.style('text-anchor', 'end')
			.attr('x', width)
			.attr('y', height - 8)
			.text('Repetitions');

		svg.append('g').attr('id', 'axis--y').call(d3.axisLeft(y));

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '1em')
			.style('text-anchor', 'end')
			.text('Height');

		scatter.append('g').attr('class', 'brush').call(brush);

		function brushended() {
			var s = d3.event.selection;
			if (!s) {
				if (!idleTimeout) return (idleTimeout = setTimeout(idled, idleDelay));
				x.domain([0, 110]);
				y.domain([0, 40]);
				scatter.selectAll('text').style('opacity', 0);
				legend.style('opacity', 1);
			} else {
				x.domain([s[0][0], s[1][0]].map(x.invert, x));
				y.domain([s[1][1], s[0][1]].map(y.invert, y));
				scatter.selectAll('text').style('opacity', 1);
				scatter.select('.brush').call(brush.move, null);
				legend
					.style('opacity', 0)
					.style('transition', 'opacity 0.75s')
					.style('transition-delay', '0.25s');
			}
			zoom();
		}

		function idled() {
			idleTimeout = null;
		}

		function zoom() {
			var t = scatter.transition().duration(750);
			svg.select('#axis--x').transition(t).call(xAxis);
			svg.select('#axis--y').transition(t).call(yAxis);
			scatter
				.selectAll('circle')
				.transition(t)
				.attr('cx', d => x(d.reps))
				.attr('cy', d => y(d.height));
			scatter
				.selectAll('text')
				.transition(t)
				.attr('x', d => x(d.reps) + 10)
				.attr('y', d => y(d.height) + 5);
		}

		const legend = svg
			.append('g')
			.attr('font-family', 'sans-serif')
			.attr('font-size', 10)
			.attr('text-anchor', 'end')
			.selectAll('g')
			.data(color.domain())
			.enter()
			.append('g')
			.attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

		legend
			.append('rect')
			.attr('x', width - 19)
			.attr('width', 19)
			.attr('height', 19)
			.attr('fill', color);

		legend
			.append('text')
			.attr('x', width - 24)
			.attr('y', 9.5)
			.attr('dy', '0.32em')
			.text(d => d);
	});
	currentPage = 4;
};
