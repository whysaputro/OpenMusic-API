// eslint-disable-next-line camelcase,max-len
const mapDBToAlbumModel = ({ cover_url, ...album }) => ({ ...album, coverUrl: cover_url });

module.exports = mapDBToAlbumModel;
