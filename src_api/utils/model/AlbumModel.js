// eslint-disable-next-line camelcase,max-len
const concatenateSongsToAlbumModel = ({ cover_url, ...album }, songs) => ({ ...album, coverUrl: cover_url, songs });

module.exports = concatenateSongsToAlbumModel;
