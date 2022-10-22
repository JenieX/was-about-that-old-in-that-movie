// ==UserScript==
// @name           Was about that old in that movie
// @namespace      https://github.com/FlowerForWar/was-about-that-old-in-that-movie
// @description    IMDb movies - hovering actors avatars would show how old they were when that movie was released
// @version        0.08
// @author         FlowrForWar
// @include        /https:\/\/www\.imdb\.com\/title\/tt\d+\/($|\?.+)/
// @include        /https:\/\/www\.imdb\.com\/name\/nm\d+\/($|\?.+|#.+)/
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

// Gifs showing examples
// https://thumbs4.redgifs.com/NavyDistinctZigzagsalamander.mp4?expires=1666425600&signature=b306a1fbf6fdef99cea6449310d5ec6667e45d59bb6acb976bd849bdfa210774&for=74.82.60.27
// https://raw.githubusercontent.com/FlowerForWar/was-about-that-old-in-that-movie/main/example-2.gif

let zodiac_signs_disabled;
let movieFirstRelease;
let globalActorBirthDate;
// console.log(await getStorageKeys());
// console.log('zodiac-signs-disabled: ', zodiac_signs_disabled);

(async function () {
  zodiac_signs_disabled = (await getStorageValue('zodiac-signs-disabled')) || !1;

  if (location.href.startsWith('https://www.imdb.com/name/nm')) {
    const timeTag = document.querySelector('#name-born-info > time[datetime]');
    if (!timeTag || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(timeTag.dateTime)) {
      // alert('No birth date available');
      return;
    }

    const [, month, day] = timeTag.dateTime.split('-').map((string) => Number(string));
    if (month === 0 || day === 0) {
      // alert('Incomplete birth date');
      return;
    }

    globalActorBirthDate = timeTag.dateTime;

    const moviesNodes = [
      ...(
        document.getElementById('filmo-head-actor') ||
        document.getElementById('filmo-head-actorMovie') ||
        document.getElementById('filmo-head-actress') ||
        document.getElementById('filmo-head-actressMovie')
      ).nextElementSibling.querySelectorAll('.filmo-row'),
    ].map((element) => {
      return element.querySelector('span.year_column');
    });
    for (let index = 0; index < moviesNodes.length; index++) {
      const movieNode = moviesNodes[index];
      movieNode.style.setProperty('cursor', 'default', 'important');
      movieNode.addEventListener('mouseenter', moviesNodesHandler);
    }

    const age = Math.floor((new Date() - new Date(globalActorBirthDate)) / 31536000000);
    const dead = !!document.getElementById('name-death-info');
    if (zodiac_signs_disabled && dead) {
      return;
    }
    const age_sign_string = [
      //
      '(',
      !dead && `age ${age}`,
      !dead && !zodiac_signs_disabled && ', ',
      !zodiac_signs_disabled && getZodiacSign(month, day),
      ')',
    ]
      .filter(Boolean)
      .join('');
    timeTag.insertAdjacentText('afterend', age_sign_string);
    // timeTag.insertAdjacentText('afterend', '(' + (!dead ? `age ${age}, ` : '') + tropicalZodiac(month, day) + ')');

    return;
  }

  /* if (document.querySelector('.ipc-inline-list.ipc-inline-list--show-dividers[data-testid="hero-title-block__metadata"]').textContent.startsWith('TV')) {
		// alert('TV Series are not supported!');
		return;
	} */
  if (/\((TV|Podcast|Music|Video|Short) /.test(document.title) && !document.title.includes('Movie')) return;
  // Short || TV Short | Video Game | Video | Music Video | TV Series | Podcast Series | TV Mini Series

  const releaseDates = await getMovieReleaseDates(location.origin, location.pathname);
  if (!releaseDates.length) return void alert('No valid release date');

  movieFirstRelease = releaseDates.sort((first, second) => Date.parse(first) - Date.parse(second))[0];
  console.log(`Movie first release: ${movieFirstRelease}`);

  // const avatarSelector = 'section.ipc-page-section.ipc-page-section--base[cel_widget_id="StaticFeature_Cast"] .ipc-lockup-overlay';
  const avatarSelector = 'section.ipc-page-section.ipc-page-section--base[cel_widget_id="StaticFeature_Cast"] div[data-testid="title-cast-item"]';
  // const avatarsNodes = [...document.querySelectorAll(avatarSelector)];
  const avatarsNodes = document.querySelectorAll(avatarSelector);
  for (let index = 0; index < avatarsNodes.length; index++) {
    const [avatarsNode, nameNode] = [...avatarsNodes[index].querySelectorAll('a[href*="/name/"]')];
    avatarsNode.addEventListener('mouseenter', avatarsNodesHandler);
    nameNode.addEventListener('mouseenter', avatarsNodesHandler);
  }
})();

async function moviesNodesHandler() {
  let cursor_under_element = !0;
  this.removeEventListener('mouseenter', moviesNodesHandler);
  const aElement = this.closest('.filmo-row').querySelector('a[href*="/title/"]');
  const movie = aElement.textContent;
  this.addEventListener('mouseleave', function () {
    aElement.textContent = movie;
    cursor_under_element = !1;
  });
  // aElement.textContent += '..';

  const { origin, pathname } = new URL(aElement.href);
  const releaseDates = await getMovieReleaseDates(origin, pathname);

  if (!releaseDates.length) {
    aElement.textContent = movie;
    this.setAttribute('title', 'No valid release date | or not supported');
    return;
  }
  movieFirstRelease = releaseDates.sort((first, second) => Date.parse(first) - Date.parse(second))[0];

  const info = {
    // movie: this.textContent,
    name: document.querySelector('.name-overview-widget__section h1.header span.itemprop').textContent,
    'age-when-the-movie-first-released': Math.floor((new Date(movieFirstRelease) - new Date(globalActorBirthDate)) / 31536000000),
    'movie-is-not-released': new Date() - new Date(movieFirstRelease) < 0,
  };

  const deathElement = document.querySelector('#name-death-info > time[datetime]');
  const yearElementTitle = [
    //
    movieFirstRelease,
    !deathElement && `\n\nNow, ${info.name} is ${Math.floor((new Date() - new Date(globalActorBirthDate)) / 31536000000)} years old`,
    deathElement && `\n\n${info.name}, died at the age of ${Math.floor((new Date(deathElement.dateTime) - new Date(globalActorBirthDate)) / 31536000000)}`,
  ]
    .filter(Boolean)
    .join('');
  this.setAttribute('title', yearElementTitle);

  const hover_string = `${movie} (${info['movie-is-not-released'] ? 'will be' : 'was'} about ${info['age-when-the-movie-first-released']} years old)`;
  if (cursor_under_element) {
    aElement.textContent = hover_string;
  }
  // const autoHide = setTimeout(() => (aElement.textContent = movie), 5000);

  this.addEventListener('mouseenter', function () {
    // clearTimeout(autoHide);
    aElement.textContent = hover_string;
  });
}

async function avatarsNodesHandler() {
  this.removeEventListener('mouseenter', avatarsNodesHandler);

  const parentNode = this.closest('div[data-testid="title-cast-item"]');
  if (parentNode.dataset.processed) {
    return;
  }

  parentNode.dataset.processed = !0;

  const siblingElement = parentNode.lastChild;

  const a = document.createElement('a');
  a.setAttribute('class', 'title-cast-item__eps-toggle');
  a.style.setProperty('cursor', 'default');
  const span = document.createElement('span');
  span.innerHTML = 'Loading data..';
  a.appendChild(span);
  siblingElement.appendChild(a);

  const response = await fetch(siblingElement.firstElementChild.href.split('?')[0].replace(/\/$/, '') + '/bio');
  const responseText = await response.text();
  const actorDates = [];
  responseText.replace(/datetime="(\d{4}-\d{1,2}-\d{1,2})"/g, (match, date) => actorDates.push(date));
  const [actorBirthDate, actorDeathDate] = actorDates;

  // https://www.imdb.com/title/tt1155076/
  const [, month, day] = (actorBirthDate || '').split('-').map((string) => Number(string));
  if (!actorBirthDate || month === 0 || day === 0) {
    span.style.setProperty('text-decoration-line', 'line-through', 'important');
    span.innerHTML = 'No birth date available';
    return;
  }
  const actorInfo = {
    name: siblingElement.firstElementChild.innerText,
    'age-when-the-movie-first-released': Math.floor((new Date(movieFirstRelease) - new Date(actorBirthDate)) / 31536000000),
    'age-now': Math.floor((new Date() - new Date(actorBirthDate)) / 31536000000),
    'age-at-death': !!actorDeathDate && Math.floor((new Date(actorDeathDate) - new Date(actorBirthDate)) / 31536000000),
    'movie-is-not-released': new Date() - new Date(movieFirstRelease) < 0,
  };

  if (actorDeathDate) span.style.setProperty('color', 'crimson', 'important');
  const age_sign_string = [
    //
    actorInfo['movie-is-not-released'] ? 'Will be' : 'Was',
    ' about ',
    actorInfo['age-when-the-movie-first-released'],
    ' years old',
    !zodiac_signs_disabled && `<br>(${getZodiacSign(month, day)})`,
  ]
    .filter(Boolean)
    .join('');
  span.innerHTML = age_sign_string;

  if (actorDeathDate) {
    a.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
    this.setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
    parentNode.querySelector('a[href*="/name/"]:not([title])').setAttribute('title', `${actorInfo.name}, died at the age of ${actorInfo['age-at-death']}`);
  } else {
    a.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
    this.setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
    parentNode.querySelector('a[href*="/name/"]:not([title])').setAttribute('title', `Now, ${actorInfo.name} is ${actorInfo['age-now']} years old`);
  }
}

async function getMovieReleaseDates(origin, pathname) {
  const response = await fetch(origin + pathname + 'releaseinfo');
  const responseText = await response.text();
  const TV_Series = /<title>.+?\((TV|Podcast|Music|Video|Short) .+?<\/title>/.test(responseText);
  // alert(TV_Series);
  if (TV_Series) return [];

  const regex = /class="release-date-item__date" align="right">(\d{1,2} [a-zA-Z0-9_]+ \d{4})<\/td>/g;
  const releaseDates = [];
  responseText.replace(regex, (match, date) => releaseDates.push(date));
  // console.log(releaseDates);
  return releaseDates;
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
  return await (typeof GM !== 'undefined' ? GM.getValue : GM_getValue)(key);
}
/* async function getStorageKeys() {
	return await (typeof GM !== 'undefined' ? GM.listValues : GM_listValues)();
} */

window.addEventListener('keydown', async ({ key, shiftKey, altKey }) => {
  if (!(key === 'O' && shiftKey && altKey)) return;

  let dialog_confirmation;
  const zodiac_signs_disabled_fresh = (await getStorageValue('zodiac-signs-disabled')) || !1;
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
