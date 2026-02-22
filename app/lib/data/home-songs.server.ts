import goodbyeLyrics from "./lyrics/Goodbye.lrc?raw";
import momentsLyrics from "./lyrics/Moments.lrc?raw";
import ninePointEightLyrics from "./lyrics/Nine Point Eight.lrc?raw";
import shineLyrics from "./lyrics/You're the Shine(Night Butterflies).lrc?raw";
import mashiroLyrics from "./lyrics/まっしろな雪.lrc?raw";
import connectLyrics from "./lyrics/コネクト.lrc?raw";

export interface HomeSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  lrcFile: string;
  lyrics: string;
}

export const HOME_SONGS: HomeSong[] = [
  {
    id: "28921695",
    title: "Nine Point Eight",
    artist: "Mili",
    url: "https://music.163.com/song/media/outer/url?id=28921695.mp3",
    lrcFile: "Nine Point Eight.lrc",
    lyrics: ninePointEightLyrics,
  },
  {
    id: "30841657",
    title: "まっしろな雪",
    artist: "水瀬ましろ",
    url: "https://music.163.com/song/media/outer/url?id=30841657.mp3",
    lrcFile: "まっしろな雪.lrc",
    lyrics: mashiroLyrics,
  },
  {
    id: "705331",
    title: "コネクト",
    artist: "ClariS",
    url: "https://whylookthis.wangjiajun.asia/4244581413.mp3",
    lrcFile: "コネクト.lrc",
    lyrics: connectLyrics,
  },
  {
    id: "729877",
    title: "You're the Shine(Night Butterflies)",
    artist: "FELT",
    url: "https://music.163.com/song/media/outer/url?id=729877.mp3",
    lrcFile: "You're the Shine(Night Butterflies).lrc",
    lyrics: shineLyrics,
  },
  {
    id: "29848676",
    title: "Moments",
    artist: "FELT",
    url: "https://music.163.com/song/media/outer/url?id=29848676.mp3",
    lrcFile: "Moments.lrc",
    lyrics: momentsLyrics,
  },
  {
    id: "425280603",
    title: "Goodbye",
    artist: "Vivienne",
    url: "https://music.163.com/song/media/outer/url?id=425280603.mp3",
    lrcFile: "Goodbye.lrc",
    lyrics: goodbyeLyrics,
  },
];
