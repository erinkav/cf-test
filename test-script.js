'use strict';

exports.command = 'test'

exports.describe = 'returns all content entries of a given content model'

exports.builder = argv => {
  argv
    .option('space', {
      requiresArg: true,
      demand: true,
      describe: 'getSpace'
    });
  return argv;
};

const cm = require('contentful-management'),
      util = require('util'),
      Promise = require('bluebird'),
      EntryIterator = require('../entry_iterator'),
      cmu = require('../utils'),
      _ = require('lodash');

class TestCommand {
  constructor(argv) {
    this.token = argv.token;
    this.spaceId = argv.space;
    this.model = argv.model;
  }


  run() {
    return new Promise( (resolve, reject) => {
      if (!this.spaceId) {
        reject('Need to specify a contentful space');
      }
      let id;
      let client = cmu.connect(this.token).getSpace(this.spaceId);
      return client
      .then( space => { return space.getEntries({content_type: 'page'}) })
      .then( pages => {
        id = pages.items[0].sys.id;
        pages.items[0].fields['pageTitle']['en-US'] = "carlos was here"
        return pages.items[0].update();
      })
      .then( (page)=> {
        console.log('page updated', page)
        return client;
      })
      .then(space => space.getEntries({content_type: 'page'}))
      .then(pages => {
        console.log('am i updated? ', pages.items.filter(page => page.sys.id === id));
        return Promise.delay(10000, client);
      })
      .then((space) => {
        return space.getEntries({content_type: 'page'});
      })
      .then(pages => console.log('after delay ', pages.items.filter(page => page.sys.id === id)))
      .catch( err => {
        console.error(err);
        reject(err);
      });
    });
  }
}



exports.handler = argv => {
  let testCMD = new TestCommand(argv);
  return testCMD.run()
  .then( result => {
    console.log(result)
    return result;
  })
  .catch( err => {
    return err;
  });
};
