// ==UserScript==
// @name           Was about that old in that movie
// @namespace      https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @description    IMDb movies - hovering actors avatars would show how old they were when that movie was released
// @version        0.02
// @author         FlowrForWar
// @include        /https:\/\/www\.imdb\.com\/title\/tt\d+\/($|\?.+)/
// @grant          none
// @compatible     edge Violentmonkey
// @supportURL     https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @license        MIT
// ==/UserScript==

// Gif showing an example
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
		span.innerHTML = 'Loading data..';
		a.appendChild(span);
		siblingElement.appendChild(a);

		const response = await fetch(siblingElement.firstElementChild.href);
		const responseText = await response.text();
		const actorDates = [];
		responseText.replace(/datetime="(\d{4}-\d{1,2}-\d{1,2})"/g, (match, date) => actorDates.push(date));
		const [actorBirthDate, actorDeathDate] = actorDates;

		if (!actorBirthDate) {
			span.style.setProperty('text-decoration-line', 'line-through', 'important');
			span.innerHTML = 'No birth date available';
			return;
		}
		const actorInfo = {
			name: siblingElement.firstElementChild.innerText,
			'age-when-the-movie-first-released': Math.floor((new Date(movieFirstRelease) - new Date(actorBirthDate)) / 31536000000),
			'age-now': Math.floor((new Date() - new Date(actorBirthDate)) / 31536000000),
			'age-at-death': !!actorDeathDate && Math.floor((new Date(actorDeathDate) - new Date(actorBirthDate)) / 31536000000),
		};

		const [, month, day] = actorBirthDate.split('-').map(string => Number(string));
		if (actorDeathDate) span.style.setProperty('color', 'crimson', 'important');
		span.innerHTML = `Was about ${actorInfo['age-when-the-movie-first-released']} years old <br>(${getZodiacSign(month, day)})`;

		if (actorDeathDate) {
			a.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
			this.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
		} else {
			a.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
			this.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
		}
	}

	function getZodiacSign(month, day) {
		let sign;
		// let sign_Symbol;
		switch (!0) {
			case (month == 3 && day >= 21) || (month === 4 && day <= 19):
				sign = 'Aries';
				// sign_Symbol = '♈︎';
				break;
			case (month == 4 && day >= 20) || (month === 5 && day <= 20):
				sign = 'Taurus';
				// sign_Symbol = '♉︎';
				break;
			case (month == 5 && day >= 21) || (month === 6 && day <= 20):
				sign = 'Gemini';
				// sign_Symbol = '♊︎';
				break;
			case (month == 6 && day >= 21) || (month === 7 && day <= 22):
				sign = 'Cancer';
				// sign_Symbol = '♋︎';
				break;
			case (month == 7 && day >= 23) || (month === 8 && day <= 22):
				sign = 'Leo';
				// sign_Symbol = '♌︎';
				break;
			case (month == 8 && day >= 23) || (month === 9 && day <= 22):
				sign = 'Virgo';
				// sign_Symbol = '♍︎';
				break;
			case (month == 9 && day >= 23) || (month === 10 && day <= 22):
				sign = 'Libra';
				// sign_Symbol = '♎︎';
				break;
			case (month == 10 && day >= 23) || (month === 11 && day <= 21):
				sign = 'Scorpio';
				// sign_Symbol = '♏︎';
				break;
			case (month == 11 && day >= 22) || (month === 12 && day <= 21):
				sign = 'Sagittarius';
				// sign_Symbol = '♐︎';
				break;
			case (month == 12 && day >= 22) || (month === 1 && day <= 19):
				sign = 'Capricorn';
				// sign_Symbol = '♑︎';
				break;
			case (month == 1 && day >= 20) || (month === 2 && day <= 18):
				sign = 'Aquarius';
				// sign_Symbol = '♒︎';
				break;
			case (month == 2 && day >= 19) || (month === 3 && day <= 20):
				sign = 'Pisces';
				// sign_Symbol = '♓︎';
				break;
		}
		return sign;
	}
})();
