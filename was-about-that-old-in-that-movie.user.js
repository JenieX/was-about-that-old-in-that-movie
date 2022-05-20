// ==UserScript==
// @name           Was about that old in that movie
// @namespace      https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @description    IMDb movies - hovering actors avatars would show how old they were when that movie was released
// @version        0.01
// @author         FlowrForWar
// @include        /https:\/\/www\.imdb\.com\/title\/tt\d+\/($|\?.+)/
// @grant          none
// @compatible     edge Violentmonkey
// @supportURL     https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @license        MIT
// ==/UserScript==

// Gif showing an examle
// https://raw.githubusercontent.com/FlowerForWar/was-about-that-old-in-that-movie/main/example.gif

(async function() {
	if (document.querySelector('.ipc-inline-list.ipc-inline-list--show-dividers').textContent.startsWith('TV')) {
		// alert('TV Series are not supported!');
		return;
	}

	const response = await fetch(location.origin + location.pathname + 'releaseinfo');
	const responseText = await response.text();

	const regex = /class="release-date-item__date" align="right">(\d{1,2} [a-zA-Z0-9_]+ \d{4})<\/td>/g;
	const releaseDates = [];
	responseText.replace(regex, (match, date) => releaseDates.push(date));

	if (!releaseDates.length) return void alert('No valid release date');

	const movieFirstRelease = releaseDates.sort((first, second) => Date.parse(first) - Date.parse(second))[0];

	const avatarSelector = 'section.ipc-page-section.ipc-page-section--base[cel_widget_id="StaticFeature_Cast"] .ipc-lockup-overlay__screen';
	const avatarsNodes = [...document.querySelectorAll(avatarSelector)];
	for (let index = 0; index < avatarsNodes.length; index++) {
		const avatarsNode = avatarsNodes[index];
		avatarsNode.addEventListener('mouseenter', avatarsNodeHandler);
	}

	async function avatarsNodeHandler() {
		this.removeEventListener('mouseenter', avatarsNodeHandler);
		const siblingElement = this.closest('div[data-testid="title-cast-item"]').lastChild;

		const a = document.createElement('a');
		a.setAttribute('class', 'title-cast-item__eps-toggle');
		const span = document.createElement('span');
		span.innerHTML = 'Fetching data..';
		a.appendChild(span);
		siblingElement.appendChild(a);

		const response = await fetch(siblingElement.firstElementChild.href);
		const responseText = await response.text();
		const actorDates = [];
		responseText.replace(/datetime="(\d{4}-\d{1,2}-\d{1,2})"/g, (match, date) => actorDates.push(date));
		const [actorBirthDate, actorDeathDate] = actorDates;

		if (!actorBirthDate) {
			span.innerHTML = "Couldn't tell!";
			return;
		}
		const actorInfo = {
			name: siblingElement.firstElementChild.innerText,
			'age-when-the-movie-first-released': Math.floor((new Date(movieFirstRelease) - new Date(actorBirthDate)) / 31536000000),
			'age-now': Math.floor((new Date() - new Date(actorBirthDate)) / 31536000000),
			'age-at-death': !!actorDeathDate && Math.floor((new Date(actorDeathDate) - new Date(actorBirthDate)) / 31536000000),
		};

		span.innerHTML = `Was about ${actorInfo['age-when-the-movie-first-released']} years old`;

		if (actorDeathDate) {
			a.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
			this.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
		} else {
			a.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
			this.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
		}
	}
})();
