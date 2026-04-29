import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

/**
 * 1. MUSICBRAINZ → infos officielles
 */
async function getMusicBrainzArtist(name) {
  const res = await axios.get(
    `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json`
  );

  const artist = res.data.artists?.[0];
  if (!artist) return null;

  // On refait un appel pour récupérer les relations (membres du groupe)
  const detailRes = await axios.get(
    `https://musicbrainz.org/ws/2/artist/${artist.id}?inc=artist-rels&fmt=json`
  );

  return detailRes.data;
}

/**
 * 2. LAST.FM → genres + popularité
 */
async function getLastFmArtist(name) {
  const res = await axios.get(
    `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
      name
    )}&api_key=${LASTFM_API_KEY}&format=json`
  );

  return res.data.artist;
}

/**
 * 3. CLEAN + MERGE
 */
export async function getGroupData(name) {
  const [mb, lf] = await Promise.all([
    getMusicBrainzArtist(name),
    getLastFmArtist(name),
  ]);

  const result = {
    name: mb?.name || lf?.name || name,

    country: mb?.country || null,

    creation_year: mb?.["life-span"]?.begin?.slice(0, 4) || null,

    member_count: mb?.type === "Group"
      ? (mb.relations?.filter((r) => r.type === "member of band").length || 0)
      : (mb?.type === "Person" ? 1 : null),

    genres:
      lf?.tags?.tag?.map((t) => t.name) || [],

    popularity: lf?.stats?.listeners
      ? Number(lf.stats.listeners)
      : null,
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * TEST
 */

