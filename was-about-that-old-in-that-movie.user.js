// ==UserScript==
// @name           Was about that old in that movie
// @namespace      https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @description    IMDb movies - hovering actors avatars would show how old they were when that movie was released
// @version        0.03
// @author         FlowrForWar
// @include        /https:\/\/www\.imdb\.com\/title\/tt\d+\/($|\?.+)/
// @grant          GM.getValue
// @grant          GM.setValue
// @grant          GM.listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_listValues
// @compatible     edge Tampermonkey or Violentmonkey
// @compatible     firefox Greasemonkey, Tampermonkey or Violentmonkey
// @compatible     chrome Tampermonkey or Violentmonkey
// @compatible     opera Tampermonkey or Violentmonkey
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

	let zodiac_signs_disabled = await getStorageValue('zodiac-signs-disabled');
	// console.log(await getStorageKeys());
	// console.log('zodiac-signs-disabled: ', zodiac_signs_disabled);

	const response = await fetch(location.origin + location.pathname + 'releaseinfo');
	const responseText = await response.text();

	const regex = /class="release-date-item__date" align="right">(\d{1,2} [a-zA-Z0-9_]+ \d{4})<\/td>/g;
	const releaseDates = [];
	responseText.replace(regex, (match, date) => releaseDates.push(date));

	if (!releaseDates.length) return void alert('No valid release date');

	const movieFirstRelease = releaseDates.sort((first, second) => Date.parse(first) - Date.parse(second))[0];
	console.log(`Movie first release: ${movieFirstRelease}`);

	const avatarSelector = 'section.ipc-page-section.ipc-page-section--base[cel_widget_id="StaticFeature_Cast"] .ipc-lockup-overlay';
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
		span.innerHTML = `Was about ${actorInfo['age-when-the-movie-first-released']} years old` + (zodiac_signs_disabled ? '' : ` <br>(${getZodiacSign(month, day)})`);

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
		// let sign_symbol;
		switch (!0) {
			case (month == 3 && day >= 21) || (month === 4 && day <= 19):
				sign = 'Aries';
				// sign_symbol = '♈︎';
				break;
			case (month == 4 && day >= 20) || (month === 5 && day <= 20):
				sign = 'Taurus';
				// sign_symbol = '♉︎';
				break;
			case (month == 5 && day >= 21) || (month === 6 && day <= 20):
				sign = 'Gemini';
				// sign_symbol = '♊︎';
				break;
			case (month == 6 && day >= 21) || (month === 7 && day <= 22):
				sign = 'Cancer';
				// sign_symbol = '♋︎';
				break;
			case (month == 7 && day >= 23) || (month === 8 && day <= 22):
				sign = 'Leo';
				// sign_symbol = '♌︎';
				break;
			case (month == 8 && day >= 23) || (month === 9 && day <= 22):
				sign = 'Virgo';
				// sign_symbol = '♍︎';
				break;
			case (month == 9 && day >= 23) || (month === 10 && day <= 22):
				sign = 'Libra';
				// sign_symbol = '♎︎';
				break;
			case (month == 10 && day >= 23) || (month === 11 && day <= 21):
				sign = 'Scorpio';
				// sign_symbol = '♏︎';
				break;
			case (month == 11 && day >= 22) || (month === 12 && day <= 21):
				sign = 'Sagittarius';
				// sign_symbol = '♐︎';
				break;
			case (month == 12 && day >= 22) || (month === 1 && day <= 19):
				sign = 'Capricorn';
				// sign_symbol = '♑︎';
				break;
			case (month == 1 && day >= 20) || (month === 2 && day <= 18):
				sign = 'Aquarius';
				// sign_symbol = '♒︎';
				break;
			case (month == 2 && day >= 19) || (month === 3 && day <= 20):
				sign = 'Pisces';
				// sign_symbol = '♓︎';
				break;
		}
		return sign;
	}

	async function setStorageValue(key, value) {
		await (typeof GM !== 'undefined' ? GM.setValue : GM_setValue)(key, value);
	}
	async function getStorageValue(key) {
		return (await (typeof GM !== 'undefined' ? GM.getValue : GM_getValue)(key)) || !1;
	}
	/* async function getStorageKeys() {
		return await (typeof GM !== 'undefined' ? GM.listValues : GM_listValues)();
	} */

	window.addEventListener('keydown', async ({ key, shiftKey, altKey }) => {
		if (!(key === 'O' && shiftKey && altKey)) return;

		let dialog_confirmation;
		const zodiac_signs_disabled_fresh = await getStorageValue('zodiac-signs-disabled');
		if (zodiac_signs_disabled_fresh === !1) {
			dialog_confirmation = confirm('User script  |  was about that old in that movie\n\nDisable zodiac signs?');
			if (dialog_confirmation) {
				await setStorageValue('zodiac-signs-disabled', !0);
				zodiac_signs_disabled = !0;
			}
		} else {
			dialog_confirmation = confirm('User script  |  was about that old in that movie\n\nEnable zodiac signs?');
			if (dialog_confirmation) {
				await setStorageValue('zodiac-signs-disabled', !1);
				zodiac_signs_disabled = !1;
			}
		}
		// alert(`New options will be applied next time you open the page\n\nzodiac_signs_disabled: ${await getStorageValue('zodiac-signs-disabled')}`);
	});
})();
