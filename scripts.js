$(document).ready(function () {
	loadTestimonials();
	loadVideos('https://smileschool-api.hbtn.info/popular-tutorials', 'popular');
	loadVideos('https://smileschool-api.hbtn.info/latest-videos', 'latest');
	loadCourses();
});

function loadTestimonials() {
  //Loads the testimonials dynamically
	$.ajax({
		type: 'GET',
		url: 'https://smileschool-api.hbtn.info/quotes',
		beforeSend: (()=> displayLoading(true, '.testimonals')),
		success: (data) => (data.forEach(addTestimonial)),
		error: (() => console.log('Unable to load data')),
		complete: (() => {
			$('.testimonals').slick({
				autoplay: true,
				infinite: true,
				arrows: true,
				prevArrow: `<img class="a-left control-c slick-prev" src="images/arrow_white_left.png" aria-hidden="true" alt="prev">`,
				nextArrow: `<img class="a-right control-c slick-next" src="images/arrow_white_right.png" aria-hidden="true" alt="next">`
			});
			displayLoading(false, '.testimonals');
		})
	});
}

function addTestimonial(data) {
  //Creates a new Testimonial
	$('.testimonals').prepend(`<div>
		<div class="row align-items-center justify-content-center">
			<div class="col-md-4 text-center">
				<img class="rounded-circle w-50 mx-auto" src="${data['pic_url']}" alt="">
			</div>
			<div class="col-md-6">
				<div class="card-body">
					<h1 class="lead">${data.text}</h1>
					<p>
						<span class="font-weight-bold">${data.name}</span>
						<br><span class="font-italic">${data.title}</span>
					</p>
				</div>
			</div>
		</div>
	</div>`);
}

function loadVideos(url, id) {
  //Loads video dynamically
	$.ajax({
		type: 'GET',
		url: url,
		beforeSend: (()=> displayLoading(1, `.${id}`)),
		success: (videos) => {
			for (let video of videos) {
				addTutorial(video, id);
				addStars(video, id);
			}
		},
		error: (() => console.log('Unable to load data')),
		complete: (() => {
			$(`#${id}`).slick({
				autoplay: true,
				infinite: true,
				slidesToShow: 4,
				slidesToScroll: 1,
				arrows: true,
				prevArrow: `<img class="a-left control-c slick-prev" src="images/arrow_black_left.png" aria-hidden="true" alt="prev">`,
				nextArrow: `<img class="a-right control-c slick-next" src="images/arrow_black_right.png" aria-hidden="true" alt="next">`,
				responsive: [
					{
						breakpoint: 992,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 1,
						}
					},
					{
						breakpoint: 768,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 1
						}
					},
					{
						breakpoint: 576,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1
						}
					}
				]
			});
			displayLoading(0, `.${id}`);
		})
	});
}

function addTutorial(video, id) {
  //Adds a new tutorial video
	$(`#${id}`).prepend(`<div class="mx-2" id="${id}${video.id}">
			<img class="card-img-top" src="${video.thumb_url}" alt="">
			<div class="card-body mx-0">
				<h1 class="card-title lead font-weight-bold">${video.title}</h1>
				<p class="card-text text-secondary">${video["sub-title"]}</p>
				<div class="row">
					<img class="rounded-circle ml-2" src="${video.author_pic_url}" height="35px" width="35px" alt="">
					<p class="ml-3 mt-1 purple">${video.author}</p>
				</div>
				<div class="row align-items-center justify-content-between px-4">
					<div class="row" id="star${video.id}"></div>
					<p class="purple ml-2 pt-3">${video.duration}</p>
				</div>
			</div>
		</div>`);
}

function addStars(video, id) {
  //Adds a new star to the review
	for (let on = 0; on < video.star; on++) {
		$(`#${id} #star${video.id}`).append('<img src="images/star_on.png" height="25px" width="25px" alt="">');
	}
	for (let off = 5; off > video.star; off--) {
		$(`#${id} #star${video.id}`).append('<img src="images/star_off.png" height="25px" width="25px" alt="">');
	}
}


function displayLoading(loading, tag) {
  //Dynamic Loading
	if (loading) {
		$(tag).wrap('<div class="loader"></div>');
	} else {
		$(tag).unwrap();
	}
}

function loadCourses() {
  //dynamically loads the available courses
	$('.holberton_school-icon-search_1').click(() => {
		$('#form').empty();

		const search_terms = {
			"search": $('#search').val().toLowerCase(),
			"topic": $('#topic').find(':selected').attr('value'),
			"sort": $('#sort').find(':selected').attr('value')
		}
		compareFormData(search_terms);
	});

	$('#search').keypress(function (e) {
		if (e.which === 13) {
			$('.holberton_school-icon-search_1').click();
		}
	});

	$('#sort').change(() => $('.holberton_school-icon-search_1').click());
	$('#topic').change(() => $('.holberton_school-icon-search_1').click());
}

function compareFormData(search) {
  //Checks forms against themselves
	let videos = [];
	$.ajax({
		type: 'GET',
		url: 'https://smileschool-api.hbtn.info/courses',
		beforeSend: (()=> displayLoading(1, '#form')),
		success: (allVideos) => {
			for (let video of allVideos.courses) {
				const arr = video.keywords.map(v => v.toLowerCase());
				if ((arr.includes(search.search) || (search.search == '')) && (search.topic === '1')) {
					videos.push(video);
				} else if ((arr.includes(search.search) || (search.search == '')) && (search.topic === video.topic)) {
					videos.push(video);
				}
			}
			sortFormData(videos, search.sort);
			num = videos.length;
		},
		error: (() => console.log('Unable to load data')),
		complete: (() => {
			$('#number').html(`${num} videos`);
			displayLoading(0, '#form');
		})
	})
}

function sortFormData(videos, search) {
  //Sorts forms by rating, time published, and # of views
	if (search === '1') {
		videos.sort((a, b)=> b.star - a.star)
	} else if (search === '2') {
		videos.sort((a, b)=> b.published_at - a.published_at)
	} else {
		videos.sort((a, b)=> b.views - a.views)
	}

	for (let video of videos) {
		addFormData(video);
		addStars(video, `form${video.id}`);
	}
}

function addFormData(data) {
  //Adds new form data
	$('#form').append(`<div class="col my-3" id="form${data.id}">
		<img class="card-img-top" src="${data.thumb_url}" alt="">
		<div class="card-body">
			<h1 class="card-title lead font-weight-bold text-dark">${data.title}</h1>
			<p class="card-text text-secondary">${data["sub-title"]}</p>
			<div class="row">
				<img class="rounded-circle ml-3" src="${data.author_pic_url}" height="25px" width="25px" alt="">
				<p class="ml-3 purple">${data.author}</p>
			</div>
			<div class="row align-items-center justify-content-between px-4">
				<div class="row" id="star${data.id}"></div>
				<p class="purple ml-2 pt-3">${data.duration}</p>
			</div>
			</div>
		</div>
	</div>`);
}