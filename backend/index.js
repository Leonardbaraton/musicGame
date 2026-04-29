import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Configuration globale Axios pour éviter les requêtes qui tournent à l'infini
axios.defaults.timeout = 8000;
// MusicBrainz exige un User-Agent personnalisé sous peine de bloquer la connexion
axios.defaults.headers.common['User-Agent'] = 'MusicGameOniti/1.0 ( leonard@example.com )';

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

/**
 * 1. MUSICBRAINZ → infos officielles
 */
async function getMusicBrainzArtist(name) {
  try {
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
  } catch (err) {
    console.error("MusicBrainz Error:", err.message);
    return null;
  }
}

/**
 * 2. LAST.FM → genres + popularité
 */
async function getLastFmArtist(name) {
  try {
    const res = await axios.get(
      `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
        name
      )}&api_key=${LASTFM_API_KEY}&format=json`
    );

    return res.data.artist;
  } catch (err) {
    console.error("LastFM Error:", err.message);
    return null;
  }
}

/**
 * 3. CLEAN + MERGE
 */
export async function getGroupData(name) {
  const [mb, lf] = await Promise.all([
    getMusicBrainzArtist(name),
    getLastFmArtist(name),
  ]);

  let genres = [];
  if (lf?.tags?.tag) {
    genres = Array.isArray(lf.tags.tag) 
      ? lf.tags.tag.map((t) => t.name) 
      : (lf.tags.tag.name ? [lf.tags.tag.name] : []);
  }

  const result = {
    name: mb?.name || lf?.name || name,

    country: mb?.country || null,

    creation_year: mb?.["life-span"]?.begin?.slice(0, 4) || null,

    member_count: mb?.type === "Group"
      ? (mb.relations?.filter((r) => r.type === "member of band").length || 0)
      : (mb?.type === "Person" ? 1 : null),

    genres: genres,

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

