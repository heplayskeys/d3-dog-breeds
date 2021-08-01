const showPie = () => {
	if (!document.querySelector('#dog-nav-1').classList.contains('active')) {
		d3.select('svg').remove();
	}

	if (currentPage === 1) {
		return;
	}

	document.querySelector('.active').classList.remove('active');
	document.querySelector('#dog-nav-1').classList.add('active');
	document.querySelector('#dog-nav-1').classList.add('active-disabled');
	document.querySelector('#dog-nav-prev').classList.add('disabled');
	document.querySelector('#dog-nav-next').classList.remove('disabled');
	document.querySelector('#doggy-details').innerHTML =
		"<p>Research on canine psychology by Stanley Coren, a professor at Univ. of BC, was conducted to determine if a breed's intelligence was correlated to its size.</p><p>Breeds were tested and grouped into categories to describe their intelligence. The criteria for which was measured by the number of repetitions it took for a dog to understand a new command, as well as the rate at which a breed would respond to a known command the first time it was given.</p>";
	let chartTitle = document.querySelector('#chart-title');
	chartTitle.innerHTML =
		'<h1 class="display-6">Breed Intelligence by Group</h1><p class="text-muted">Hover over pie slices to view additional information.</p>';
	chartTitle.style.marginBottom = '-50px';

	const width = 1260,
		height = 960,
		radius = 350,
		legendRectSize = radius * 0.05,
		legendSpacing = radius * 0.02;

	const div = d3.select('body').append('div').attr('class', 'toolTip');

	const svg = d3
		.select('#chart-container')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

	d3.csv('dog_intelligence.csv', (err, data) => {
		if (err) throw err;

		const ordScale = d3
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
		const pie = d3.pie().value(() => data.length);
		const arc = svg.selectAll('arc').data(pie(data)).enter();
		const path = d3.arc().outerRadius(radius).innerRadius(200);
		arc
			.append('path')
			.attr('d', path)
			.attr('fill', d => ordScale(d.data.classification))
			.attr('stroke', 'white')
			.style('stroke-width', '0.15px')
			.style('opacity', '0.55');

		const slice = svg
			.selectAll('path')
			.data(pie(data))
			.attr('class', (d, i) => `slice-${i}`);

		slice.on('mouseover', (d, i) => {
			d3.select(`.slice-${i}`)
				.style('opacity', '1')
				.style('transform', 'scale(1.05)');
		});

		slice.on('mousemove', d => {
			div.style('left', d3.event.pageX + 40 + 'px');
			div.style('top', d3.event.pageY - 75 + 'px');
			div.style('display', 'inline-block');
			div.style('background-color', 'rgba(255,255,255,0.9)');
			div.style('padding', '25px 10px 0 10px');
			div.html(`
        <h6 class='tooltip-title'>${d.data.breed}</h6>
				<hr/>
        <p>Responds to first command with <b>${
					d.data.obey * 100
				}%</b> probability.</p>
        <p><b>${d.data.reps_lower}</b> to <b>${
				d.data.reps_upper
			}</b> repetitions to understand a new command.</p>
      `);
		});

		slice.on('mouseout', (d, i) => {
			d3.select(`.slice-${i}`)
				.style('opacity', '0.55')
				.style('transform', 'scale(1)');
			div.style('display', 'none');
		});

		slice.exit().remove();

		const legend = svg
			.selectAll('.legend')
			.data(ordScale.domain())
			.enter()
			.append('g')
			.attr('class', 'legend')
			.attr('transform', (d, i) => {
				let height = legendRectSize + legendSpacing;
				let offset = (height * ordScale.domain().length) / 2;
				let horizontal = -6 * legendRectSize;
				let vertical = i * height - offset;
				return `translate(${horizontal}, ${vertical})`;
			});

		legend
			.append('rect')
			.attr('width', legendRectSize)
			.attr('height', legendRectSize)
			.style('fill', ordScale)
			.style('opacity', '0.55')
			.style('stroke', ordScale);

		legend
			.append('text')
			.attr('x', legendRectSize + legendSpacing)
			.attr('y', legendRectSize - legendSpacing)
			.text(d => d);
	});
	currentPage = 1;
};

showPie();
