# Was about that old in that movie

[Github](https://github.com/FlowerForWar/was-about-that-old-in-that-movie), [Greasy Fork](https://greasyfork.org/en/scripts/445300-was-about-that-old-in-that-movie)

A user script that works on IMDb movies and actors pages, to show how old actors were when that movie was released.  
By default, it would show the zodiac signs for actors as well, `shift+alt+o` to toggle that, ON or OFF.

## Preview

#### 1. Hovering actors avatars on a movie page

<img src="https://raw.githubusercontent.com/FlowerForWar/was-about-that-old-in-that-movie/main/example.gif"/>

#### 2. Hovering the movie year on an actor page

<img src="https://raw.githubusercontent.com/FlowerForWar/was-about-that-old-in-that-movie/main/example-2.gif"/>

## Contributors

- [Procyon-b](https://github.com/Procyon-b)

## Changelog

#### 0.06 (22-09-30)

- In a movie page, now hovering the name of the actor would trigger the retrieval of data, just like hovering the avatar

#### 0.05 (22-06-05)

- Prevent the addition of movies in the "Recently Viewed" list, when fetching data, thanks to [Procyon-b](https://github.com/FlowerForWar/was-about-that-old-in-that-movie/issues/3)
- Update the exception method and added more exceptions, like video games and podcast series
- Removed the auto-hide and the ".." that indicates loading, in the actor page
- Update the yearElement tooltip to include the actor age

#### 0.04 (22-06-04)

- Fix checking for TV Series condition, thanks to [Procyon-b](https://github.com/FlowerForWar/was-about-that-old-in-that-movie/issues/1)
- Fix wrong age when birth day/month equals zero
- Add support for movies on actors pages, see the second gif
- Show the age of the actors in their pages, and zodiac signs if enabled
- Replace "was" with "Will be" when the movie has not been released

#### 0.03 (22-05-22)

- Add a shortcut to toggle zodiac signs (shift+alt+o), zodiac signs are enabled by default
- Fix to support [Procyon-b](https://greasyfork.org/en/users/435938-achernar)'s [userstyle](https://userstyles.world/style/852/imdb-fix-title-page)

#### 0.02 (22-05-21)

- Show actor's zodiac sign
- Highlight dead actors

## License

[MIT](https://github.com/FlowerForWar/was-about-that-old-in-that-movie/blob/main/LICENSE)
