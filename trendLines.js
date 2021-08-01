const showTrendLines = () => {
	if (!document.querySelector('#dog-nav-2').classList.contains('active')) {
		d3.select('svg').remove();
	}

	if (currentPage === 2) {
		return;
	}

	document.querySelector('.active').classList.remove('active');
	document.querySelector('#dog-nav-2').classList.add('active');
	document.querySelector('#dog-nav-prev').classList.remove('disabled');
	document.querySelector('#dog-nav-next').classList.remove('disabled');
	document.querySelector('#doggy-details').innerHTML =
		"<p>The American Kennel Club (AKC) carries out hundreds of breed inspections each year to determine breed rankings.</p><p>These ranks are archived and added, annually, on the AKC website, <a href='https://www.akc.org/' target='_blank'>www.akc.org</a>. The ranks above were tracked from 2014 to 2018.</p>";
	let chartTitle = document.querySelector('#chart-title');
	chartTitle.innerHTML =
		'<h1 class="display-6">Top 10 Breeds</h1><p class="text-muted">Hover over lines to highlight ranks by year.</p>';
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

	d3.csv('dog_breeds_top_10.csv', (err, data) => {
		if (err) throw err;

		const cfg = {
			strokeWidth: 5,
		};

		const color = d3.scaleOrdinal(d3.schemePaired);

		const highlight = [
			'Labrador Retriever',
			'German Shepherd',
			'Golden Retriever',
			'French Bulldog',
			'Bulldog',
		];

		svg
			.append('defs')
			.append('clipPath')
			.attr('id', 'clip')
			.append('rect')
			.attr('width', width)
			.attr('height', height + cfg.strokeWidth);

		const x = d3.scaleLinear().range([0, width]);

		const y = d3.scaleLinear().range([0, height]);

		const voronoi = d3
			.voronoi()
			.x(d => x(d.year))
			.y(d => y(d.rank))
			.extent([
				[-margin.left / 2, -margin.top / 2],
				[width + margin.right / 2, height + margin.bottom / 2],
			]);

		const line = d3
			.line()
			.x(d => x(d.year))
			.y(d => y(d.rank));

		const parsedData = [];
		data.forEach(d => {
			var dObj = { breed: d.breed, ranks: [] };
			for (let year in d) {
				if (year != 'breed') {
					if (d[year] != 0) {
						dObj.ranks.push({
							year: +year,
							rank: +d[year],
							breed: dObj,
						});
					}
				}
			}
			parsedData.push(dObj);
		});

		const xTickNo = parsedData[0].ranks.length;
		x.domain(d3.extent(parsedData[0].ranks, d => d.year));

		color.domain(data.map(d => d.breed));

		var ranks = 10;
		y.domain([0.5, 12.5]);

		const axisMargin = 20;

		var xAxis = d3
			.axisBottom(x)
			.tickFormat(d3.format('d'))
			.ticks(xTickNo)
			.tickSize(0);

		var yAxis = d3.axisLeft(y).ticks(ranks).tickSize(0);

		var xGroup = svg.append('g');
		var xAxisElem = xGroup
			.append('g')
			.attr('transform', 'translate(' + [0, height + axisMargin * 1.2] + ')')
			.attr('class', 'x-axis')
			.call(xAxis);

		xGroup
			.append('g')
			.selectAll('line')
			.data(x.ticks(xTickNo))
			.enter()
			.append('line')
			.attr('class', 'grid-line')
			.attr('y1', 0)
			.attr('y2', height + 10)
			.attr('x1', d => x(d))
			.attr('x2', d => x(d));

		var yGroup = svg.append('g');
		var yAxisElem = yGroup
			.append('g')
			.attr('transform', 'translate(' + [-axisMargin, 0] + ')')
			.attr('class', 'y-axis')
			.call(yAxis);
		yAxisElem
			.append('text')
			.attr('class', 'y-label')
			.attr('text-anchor', 'middle')
			.attr(
				'transform',
				'rotate(-90) translate(' + [-height / 2, -margin.left / 3] + ')'
			)
			.text('Breed Ranking');

		yGroup
			.append('g')
			.selectAll('line')
			.data(y.ticks(ranks))
			.enter()
			.append('line')
			.attr('class', 'grid-line')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', d => y(d))
			.attr('y2', d => y(d));

		var lines = svg
			.append('g')
			.selectAll('path')
			.data(parsedData)
			.enter()
			.append('path')
			.attr('class', 'rank-line')
			.attr('d', function (d) {
				d.line = this;
				return line(d.ranks);
			})
			.attr('clip-path', 'url(#clip)')
			.style('stroke', d => color(d.breed))
			.style('stroke-width', cfg.strokeWidth)
			.style('opacity', 0.1)
			.transition()
			.duration(500)
			.delay(d => (highlight.indexOf(d.breed) + 1) * 500)
			.style('opacity', d => (highlight.includes(d.breed) ? 1 : 0.1));

		var endLabels = svg
			.append('g')
			.attr('class', 'end-labels')
			.selectAll('text')
			.data(parsedData.filter(d => highlight.includes(d.breed)))
			.enter()
			.append('text')
			.attr('class', 'end-label')
			.attr('x', d => x(d.ranks[d.ranks.length - 1].year))
			.attr('y', d => y(d.ranks[d.ranks.length - 1].rank))
			.attr('dx', 20)
			.attr('dy', cfg.strokeWidth / 2)
			.text(d => d.breed)
			.style('opacity', 0)
			.transition()
			.duration(500)
			.delay(d => (highlight.indexOf(d.breed) + 1) * 500)
			.style('opacity', 1);

		var endDots = svg
			.append('g')
			.selectAll('circle')
			.data(parsedData.filter(d => highlight.includes(d.breed)))
			.enter()
			.append('circle')
			.attr('class', 'end-circle')
			.attr('cx', d => x(d.ranks[d.ranks.length - 1].year))
			.attr('cy', d => y(d.ranks[d.ranks.length - 1].rank))
			.attr('r', cfg.strokeWidth + 3)
			.style('fill', d => color(d.breed))
			.style('opacity', 0)
			.transition()
			.duration(500)
			.delay(d => (highlight.indexOf(d.breed) + 1) * 500)
			.style('opacity', 1);

		var tooltip = svg
			.append('g')
			.attr('transform', 'translate(-100, -100)')
			.attr('class', 'tooltip');
		tooltip.append('circle').attr('r', cfg.strokeWidth + 3);
		tooltip.append('text').attr('class', 'name').attr('y', -20);

		var voronoiGroup = svg.append('g').attr('class', 'voronoi');

		voronoiGroup
			.selectAll('path')
			.data(voronoi.polygons(d3.merge(parsedData.map(d => d.ranks))))
			.enter()
			.append('path')
			.attr('d', d => (d ? 'M' + d.join('L') + 'Z' : null))
			.on('mouseover', mouseover)
			.on('mouseout', mouseout);

		svg
			.selectAll('.rank-line')
			.each(d =>
				highlight.includes(d.breed) ? d.line.parentNode.appendChild(d.line) : 0
			);

		svg.select('g.end-labels').raise();

		function mouseover(d) {
			svg.selectAll('.end-label').style('opacity', 0);
			svg.selectAll('.end-circle').style('opacity', 0);

			svg.selectAll('.rank-line').style('opacity', 0.1);
			d3.select(d.data.breed.line).style('opacity', 1);
			d.data.breed.line.parentNode.appendChild(d.data.breed.line);
			tooltip
				.attr(
					'transform',
					'translate(' + x(d.data.year) + ',' + y(d.data.rank) + ')'
				)
				.style('fill', color(d.data.breed.breed))
				.style('opacity', 1);
			tooltip
				.select('text')
				.text(d.data.breed.breed)
				.attr('text-anchor', d.data.year == x.domain()[0] ? 'start' : 'middle')
				.attr('dx', d.data.year == x.domain()[0] ? -10 : 0);
		}

		function mouseout(d) {
			svg
				.selectAll('.rank-line')
				.style('opacity', d => (highlight.includes(d.breed) ? 1 : 0.1));

			svg.selectAll('.end-label').style('opacity', 1);
			svg.selectAll('.end-circle').style('opacity', 1);
			tooltip.attr('transform', 'translate(-100,-100)');
		}
	});
	currentPage = 2;
};

let pieToggled = true;
