const xss = require('xss');
const Treeize = require('treeize');

const ItemsService = {
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into('items')
      .returning('*')
      .then(([item]) => item);
  },
  deleteItem(db, id) {
    return db
      .from('items')
      .where({ id })
      .delete();
  }
};

module.exports = ItemsService;