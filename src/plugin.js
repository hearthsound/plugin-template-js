// Hello catalog: a minimal Hearthsound catalog plugin.
//
// The plugin answers every search with a single greeting track, plus a
// matching album and artist. The only configuration is `greeting`, which
// prefixes the track title.

import { log } from 'hearthsound:plugin/host-log@0.3.0';
import { serverConfig } from 'hearthsound:plugin/host-config@0.3.0';

const DEFAULT_GREETING = 'Hello';

// Parses the server-scoped configuration JSON. The document must be a JSON
// object; `greeting` is optional and must be a string when present. Throws on
// any violation.
function parseConfig(raw) {
  const value = JSON.parse(raw);
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('expected a JSON object');
  }
  let greeting = DEFAULT_GREETING;
  if (value.greeting !== undefined) {
    if (typeof value.greeting !== 'string') {
      throw new Error('greeting: expected a string');
    }
    greeting = value.greeting;
  }
  return { greeting };
}

function ok(val) {
  return { tag: 'ok', val };
}

function err(val) {
  return { tag: 'err', val };
}

const NOT_FOUND = { tag: 'not-found' };

// Reads the instance configuration through the host. Parse failures map to the
// `invalid-config` provider error, the same shape the SDK helper produces.
function readConfig() {
  try {
    return ok(parseConfig(serverConfig()));
  } catch (error) {
    return err({ tag: 'invalid-config', val: `server config: ${error.message}` });
  }
}

function helloAlbumRef() {
  return {
    id: 'hello-album-1',
    title: 'Hello Album',
    artists: [{ name: 'Hello Artist', ids: [] }],
    year: 2026,
    images: [],
  };
}

function helloArtist() {
  return {
    id: 'hello-artist-1',
    name: 'Hello Artist',
    images: [],
    ids: [],
  };
}

function helloTrack(greeting, text) {
  return {
    id: 'hello-track-1',
    title: `${greeting}, ${text}`,
    artists: [{ name: 'Hello Artist', ids: [] }],
    album: helloAlbumRef(),
    durationMs: 180000,
    discNumber: 1,
    trackNumber: 1,
    isrc: undefined,
    explicit: false,
    ids: [{ namespace: 'hello', value: 'hello-track-1' }],
  };
}

// An empty `kinds` list means every kind was requested.
function wants(kinds, wanted) {
  return kinds.length === 0 || kinds.includes(wanted);
}

export const lifecycle = {
  validateConfig(serverConfigJson) {
    try {
      parseConfig(serverConfigJson);
      return ok(undefined);
    } catch (error) {
      return err([error.message]);
    }
  },

  health() {
    return ok('hello-catalog ready');
  },
};

export const catalog = {
  search(query) {
    log('info', `search: ${query.text}`);

    if (query.limit === 0 || query.offset > 0) {
      return ok({ tracks: [], albums: [], artists: [] });
    }

    const config = readConfig();
    if (config.tag === 'err') {
      return config;
    }
    const { greeting } = config.val;

    return ok({
      tracks: wants(query.kinds, 'track') ? [helloTrack(greeting, query.text)] : [],
      albums: wants(query.kinds, 'album') ? [helloAlbumRef()] : [],
      artists: wants(query.kinds, 'artist') ? [helloArtist()] : [],
    });
  },

  getTrack(id) {
    if (id !== 'hello-track-1') {
      return err(NOT_FOUND);
    }
    const config = readConfig();
    if (config.tag === 'err') {
      return config;
    }
    return ok(helloTrack(config.val.greeting, 'world'));
  },

  getAlbum(id) {
    if (id !== 'hello-album-1') {
      return err(NOT_FOUND);
    }
    const config = readConfig();
    if (config.tag === 'err') {
      return config;
    }
    return ok({
      id: 'hello-album-1',
      title: 'Hello Album',
      artists: [{ name: 'Hello Artist', ids: [] }],
      releaseDate: '2026-01-01',
      albumType: 'album',
      upc: undefined,
      genres: [],
      images: [],
      tracks: [helloTrack(config.val.greeting, 'world')],
      ids: [],
    });
  },

  getArtist(id) {
    if (id !== 'hello-artist-1') {
      return err(NOT_FOUND);
    }
    return ok(helloArtist());
  },

  artistAlbums(id, limit, offset) {
    if (id !== 'hello-artist-1') {
      return err(NOT_FOUND);
    }
    return ok([helloAlbumRef()].slice(offset, offset + limit));
  },

  artistTopTracks(id, limit) {
    if (id !== 'hello-artist-1') {
      return err(NOT_FOUND);
    }
    const config = readConfig();
    if (config.tag === 'err') {
      return config;
    }
    return ok([helloTrack(config.val.greeting, 'world')].slice(0, limit));
  },

  lookupIsrc(_isrc) {
    return ok([]);
  },
};
