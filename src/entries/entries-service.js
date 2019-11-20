const xss = require('xss');
const Treeize = require('treeize');

const EntriesService = {
  getAllEntries(db, user_id) {
    return db
      .from('entries AS ent')
      .where('user_id', user_id)
      .select(
        'ent.id',
        'ent.date',
        'ent.user_restaurant_id',
        'ent.user_id',
        'itm.name AS items:name',
        'itm.image AS items:image',
        'itm.description AS items:description',
        'itm.entry_id AS items:entry_id'
      )
      .leftJoin(
        'items AS itm',
        'itm.entry_id',
        'ent.id'
      )
      .groupBy('ent.id', 'itm.id');
  },
  insertEntry(db, newEntry) {
    return db
      .insert(newEntry)
      .into('entries')
      .returning('*')
      .then(([entry]) => entry);
  },
  getById(db, id, user_id) {
    return EntriesService.getAllEntries(db, user_id)
      .where('ent.id', id);  
  },
  serializeEntries(entries) {
    const entriesTree = new Treeize();
    const entriesData = entriesTree.grow(entries).getData();
    return entriesData;
  },
  serializeEntry(entry) {
    return this.serializeEntries(entry)[0];
  }
};

module.exports = EntriesService;