/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TEXT',
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};
